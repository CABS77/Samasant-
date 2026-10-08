begin;

alter table public.care_audit_events add column admin_session_id uuid
  references public.admin_sessions(id) on delete set null;

-- Only a privileged server RPC can enter this context. The lock makes revocation
-- and a concurrent business mutation serialize on the same session row.
create function public.activate_care_admin_session(p_session_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare actor uuid;
begin
  select operator_id into actor from public.admin_sessions
    where id = p_session_id and revoked_at is null and expires_at > now()
    for share;
  if not found then raise exception 'Active individual session required' using errcode = '42501'; end if;
  perform set_config('samasante.care_admin_session', p_session_id::text, true);
  return actor;
end $$;

create or replace function public.record_care_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare before_row jsonb; after_row jsonb; session_id uuid; actor uuid;
begin
  before_row := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  after_row := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  session_id := nullif(current_setting('samasante.care_admin_session', true), '')::uuid;
  if session_id is not null then
    select operator_id into actor from public.admin_sessions where id = session_id;
  elsif tg_table_name = 'admin_sessions' then
    actor := coalesce(after_row->>'operator_id', before_row->>'operator_id')::uuid;
    if tg_op <> 'DELETE' then session_id := (after_row->>'id')::uuid; end if;
  end if;
  -- A transport callback with unchanged state must not manufacture another event.
  if tg_table_name = 'sms_notifications' and tg_op = 'UPDATE'
    and before_row->>'state' is not distinct from after_row->>'state'
    and before_row->>'acknowledged_at' is not distinct from after_row->>'acknowledged_at'
  then return new; end if;
  insert into public.care_audit_events(entity, entity_id, action, from_state, to_state, operator_id, admin_session_id)
  values (tg_table_name, coalesce(after_row->>'id', before_row->>'id'),
    case when tg_table_name = 'sms_notifications' and tg_op = 'UPDATE'
      and before_row->>'acknowledged_at' is distinct from after_row->>'acknowledged_at'
      then 'ACKNOWLEDGE' else tg_op end,
    case when tg_table_name = 'appointment_requests' then before_row->>'status'
      when tg_table_name = 'sms_notifications' then before_row->>'state' end,
    case when tg_table_name = 'appointment_requests' then after_row->>'status'
      when tg_table_name = 'sms_notifications' then after_row->>'state' end,
    actor, session_id);
  return coalesce(new, old);
end $$;
create trigger audit_sms_change after insert or update or delete on public.sms_notifications
  for each row execute function public.record_care_change();

create function public.admin_doctor_write(p_session_id uuid, p_action text, p_id text, p_values jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare existing public.doctor_directory; proposed public.doctor_directory; saved public.doctor_directory;
begin
  perform public.activate_care_admin_session(p_session_id);
  if p_action is null or p_action not in ('create', 'update', 'delete')
    or p_id is null or length(p_id) not between 1 and 200
    or p_values is null or jsonb_typeof(p_values) <> 'object'
    or exists(select 1 from jsonb_object_keys(p_values) k
      where k not in ('name','specialty','location','bio','available','rating','reviews'))
  then raise exception 'Invalid directory mutation' using errcode = '22023'; end if;
  if p_action = 'create' then
    select * into proposed from jsonb_populate_record(null::public.doctor_directory,
      p_values || jsonb_build_object('id', p_id));
    insert into public.doctor_directory(id,name,specialty,location,bio,available,rating,reviews)
      values(proposed.id,proposed.name,proposed.specialty,proposed.location,proposed.bio,
        proposed.available,proposed.rating,proposed.reviews) returning * into saved;
  else
    select * into existing from public.doctor_directory where id = p_id for update;
    if not found then return null; end if;
    if p_action = 'delete' then
      delete from public.doctor_directory where id = p_id returning * into saved;
    else
      select * into proposed from jsonb_populate_record(null::public.doctor_directory,
        to_jsonb(existing) || p_values);
      update public.doctor_directory set name = proposed.name, specialty = proposed.specialty,
        location = proposed.location, bio = proposed.bio, available = proposed.available,
        rating = proposed.rating, reviews = proposed.reviews
        where id = p_id returning * into saved;
    end if;
  end if;
  return to_jsonb(saved);
end $$;

create function public.admin_appointment_write(p_session_id uuid, p_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare saved public.appointment_requests;
begin
  perform public.activate_care_admin_session(p_session_id);
  if p_status is null or p_status not in ('confirmed','cancelled')
  then raise exception 'Invalid appointment state' using errcode = '22023'; end if;
  update public.appointment_requests set status = p_status where id = p_id
    and (status = 'requested' or (p_status = 'cancelled' and status = 'confirmed'))
    returning * into saved;
  if not found then return null; end if;
  return jsonb_build_object('id', saved.id, 'status', saved.status);
end $$;

create function public.admin_acknowledge_notification(p_session_id uuid, p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare actor uuid; changed uuid;
begin
  actor := public.activate_care_admin_session(p_session_id);
  update public.sms_notifications set acknowledged_at = now(), acknowledged_by = actor,
    updated_at = now() where id = p_id and acknowledged_at is null returning id into changed;
  return found;
end $$;

-- The two business tables cannot bypass attribution through a service-role write.
revoke all on public.doctor_directory from service_role;
grant select on public.doctor_directory to service_role;
revoke update, truncate on public.appointment_requests from service_role;
revoke insert, delete on public.care_audit_events from service_role;

-- Retention is the only server operation allowed to remove audit history.
alter function public.cleanup_care_data(integer) security definer;
revoke all on function public.record_care_change(), public.activate_care_admin_session(uuid),
  public.admin_doctor_write(uuid,text,text,jsonb), public.admin_appointment_write(uuid,uuid,text),
  public.admin_acknowledge_notification(uuid,uuid) from public, anon, authenticated;
grant execute on function public.activate_care_admin_session(uuid),
  public.admin_doctor_write(uuid,text,text,jsonb), public.admin_appointment_write(uuid,uuid,text),
  public.admin_acknowledge_notification(uuid,uuid) to service_role;

-- Readiness must reject an old schema when the application requires these RPCs.
create or replace function public.check_care_schema() returns boolean
language sql security invoker set search_path = public as $$
  select exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'doctor_directory')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'appointment_requests')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'service_quota')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'sms_notifications')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'admin_sessions')
    and exists(select 1 from information_schema.columns where table_schema = 'public'
      and table_name = 'care_audit_events' and column_name = 'admin_session_id')
    and to_regprocedure('public.admin_doctor_write(uuid,text,text,jsonb)') is not null
    and to_regprocedure('public.admin_appointment_write(uuid,uuid,text)') is not null
    and to_regprocedure('public.admin_acknowledge_notification(uuid,uuid)') is not null
    and not has_table_privilege('service_role', 'public.doctor_directory', 'INSERT')
    and not has_table_privilege('service_role', 'public.doctor_directory', 'UPDATE')
    and not has_table_privilege('service_role', 'public.doctor_directory', 'DELETE')
    and not has_table_privilege('service_role', 'public.doctor_directory', 'TRUNCATE')
    and not has_table_privilege('service_role', 'public.appointment_requests', 'UPDATE')
    and not has_table_privilege('service_role', 'public.appointment_requests', 'TRUNCATE')
    and not has_table_privilege('service_role', 'public.care_audit_events', 'INSERT')
    and not has_table_privilege('service_role', 'public.care_audit_events', 'DELETE');
$$;

commit;
