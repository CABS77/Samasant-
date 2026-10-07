begin;
create table public.admin_sessions (
  id uuid primary key,
  operator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index admin_sessions_operator on public.admin_sessions(operator_id, expires_at);
alter table public.admin_sessions enable row level security;
revoke all on public.admin_sessions from anon, authenticated;
grant all on public.admin_sessions to service_role;

-- Never duplicate health records or phones in audit events.
create table public.care_audit_events (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);
alter table public.care_audit_events enable row level security;
revoke all on public.care_audit_events from anon, authenticated;
grant select, insert, delete on public.care_audit_events to service_role;
grant usage, select on sequence public.care_audit_events_id_seq to service_role;
create function public.record_care_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.care_audit_events(entity, entity_id, action)
  values (tg_table_name, coalesce(new.id::text, old.id::text), tg_op);
  return coalesce(new, old);
end $$;
revoke all on function public.record_care_change() from public, anon, authenticated;
create trigger audit_doctor_change after insert or update or delete on public.doctor_directory
  for each row execute function public.record_care_change();
create trigger audit_appointment_change after insert or update or delete on public.appointment_requests
  for each row execute function public.record_care_change();
create trigger audit_admin_session after insert or update or delete on public.admin_sessions
  for each row execute function public.record_care_change();
commit;
