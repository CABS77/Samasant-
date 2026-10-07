begin;
create table public.sms_alerts (
  id uuid primary key,
  lookup_hash text not null,
  request_key uuid not null,
  owner_hash text not null,
  payload_hash text not null,
  created_at timestamptz not null default now(),
  unique(owner_hash, request_key)
);
create table public.sms_notifications (
  id uuid primary key,
  alert_id uuid not null references public.sms_alerts(id) on delete cascade,
  partner_id text not null,
  partner_name text not null,
  recipient text not null,
  encrypted_payload text,
  provider_sid text unique,
  state text not null default 'queued' check (state in ('queued','processing','accepted','delivered','failed','unknown')),
  processing_at timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(alert_id, partner_id)
);
create index sms_notifications_queue on public.sms_notifications(state, created_at);
alter table public.sms_alerts enable row level security;
alter table public.sms_notifications enable row level security;
revoke all on public.sms_alerts, public.sms_notifications from anon, authenticated;
grant all on public.sms_alerts, public.sms_notifications to service_role;

create function public.enqueue_notifications(p_id uuid, p_lookup_hash text, p_request_key uuid, p_owner_hash text, p_payload_hash text, p_jobs jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare previous public.sms_alerts; job jsonb;
begin
  if jsonb_typeof(p_jobs) <> 'array' or jsonb_array_length(p_jobs) not between 1 and 3 then raise exception 'Invalid jobs'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_owner_hash || p_request_key::text, 0));
  select * into previous from public.sms_alerts where owner_hash = p_owner_hash and request_key = p_request_key;
  if found then
    if previous.lookup_hash <> p_lookup_hash or previous.payload_hash <> p_payload_hash then raise exception 'Conflicting retry'; end if;
    return previous.id;
  end if;
  insert into public.sms_alerts(id, lookup_hash, request_key, owner_hash, payload_hash)
    values(p_id, p_lookup_hash, p_request_key, p_owner_hash, p_payload_hash);
  for job in select * from jsonb_array_elements(p_jobs) loop
    insert into public.sms_notifications(id, alert_id, partner_id, partner_name, recipient, encrypted_payload)
      values((job->>'id')::uuid, p_id, job->>'partner_id', job->>'partner_name', job->>'recipient', job->>'encrypted_payload');
  end loop;
  return p_id;
end $$;

create function public.claim_sms_notifications(p_alert_id uuid default null, p_limit integer default 3)
returns setof public.sms_notifications language sql security invoker set search_path = public as $$
  update public.sms_notifications set state = 'processing', processing_at = now(), updated_at = now()
  where id in (select id from public.sms_notifications
    where state = 'queued' and created_at > now() - interval '10 minutes' and (p_alert_id is null or alert_id = p_alert_id)
    order by created_at for update skip locked limit least(greatest(p_limit, 1), 10)) returning *;
$$;
create function public.record_sms_status(p_id uuid, p_sid text, p_state text)
returns boolean language plpgsql security invoker set search_path = public as $$
declare row public.sms_notifications;
begin
  if p_state is null or p_sid is null or p_state not in ('accepted','delivered','failed') or p_sid !~ '^SM[0-9a-fA-F]{32}$' then return false; end if;
  select * into row from public.sms_notifications where id = p_id for update;
  if not found or (row.provider_sid is not null and row.provider_sid <> p_sid) then return false; end if;
  if row.state = 'delivered' then return true; end if;
  if row.state = 'failed' and p_state <> 'delivered' then return true; end if;
  update public.sms_notifications set provider_sid = p_sid, state = p_state,
    encrypted_payload = null, updated_at = now() where id = p_id;
  return true;
end $$;
revoke all on function public.enqueue_notifications(uuid,text,uuid,text,text,jsonb), public.claim_sms_notifications(uuid,integer), public.record_sms_status(uuid,text,text) from public, anon, authenticated;
grant execute on function public.enqueue_notifications(uuid,text,uuid,text,text,jsonb), public.claim_sms_notifications(uuid,integer), public.record_sms_status(uuid,text,text) to service_role;
commit;
