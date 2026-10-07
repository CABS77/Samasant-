-- New canonical booking table; legacy tables are left untouched.
begin;
create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id text not null,
  start_at timestamptz not null,
  motif text not null check (char_length(motif) between 1 and 1000),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  mode text not null default 'clinic' check (mode = 'clinic'),
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled')),
  request_key uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, request_key)
);
-- Concurrent requests for one doctor/slot cannot both succeed.
create unique index appointment_requests_active_slot
  on public.appointment_requests (doctor_id, start_at)
  where status in ('requested', 'confirmed');
create index appointment_requests_patient on public.appointment_requests(user_id, start_at);

alter table public.appointment_requests enable row level security;
revoke all on public.appointment_requests from anon, authenticated;
grant select on public.appointment_requests to authenticated;
grant all on public.appointment_requests to service_role;
create policy patient_reads_own_requests on public.appointment_requests
  for select to authenticated using ((select auth.uid()) = user_id);
-- No patient write policy: the server verifies Auth identity and availability before insert.
commit;
