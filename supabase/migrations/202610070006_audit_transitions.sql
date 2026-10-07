begin;
-- Record state changes without copying appointment motifs, phones or message bodies.
alter table public.care_audit_events add column from_state text;
alter table public.care_audit_events add column to_state text;
alter table public.care_audit_events add column operator_id uuid references auth.users(id) on delete set null;
create or replace function public.record_care_change() returns trigger language plpgsql security definer set search_path = public as $$
declare before_row jsonb; after_row jsonb;
begin
  before_row := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  after_row := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  insert into public.care_audit_events(entity, entity_id, action, from_state, to_state, operator_id)
  values (tg_table_name, coalesce(after_row->>'id',before_row->>'id'), tg_op,
    case when tg_table_name = 'appointment_requests' then before_row->>'status' end,
    case when tg_table_name = 'appointment_requests' then after_row->>'status' end,
    case when tg_table_name = 'admin_sessions' then coalesce(after_row->>'operator_id',before_row->>'operator_id')::uuid end);
  return coalesce(new, old);
end $$;
revoke all on function public.record_care_change() from public, anon, authenticated;
commit;
