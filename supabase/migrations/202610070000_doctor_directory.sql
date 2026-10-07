-- Shared directory for API routes and Server Actions. No demo practitioners are seeded.
begin;
create table public.doctor_directory (
  id text primary key,
  name text not null check (char_length(name) between 2 and 100),
  specialty text not null check (char_length(specialty) between 1 and 100),
  location text check (char_length(location) <= 100),
  bio text check (char_length(bio) <= 1000),
  available text[] not null check (
    cardinality(available) > 0 and available <@ array['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']::text[]
  ),
  rating double precision check (rating between 0 and 5),
  reviews integer check (reviews >= 0)
);
alter table public.doctor_directory enable row level security;
revoke all on public.doctor_directory from anon, authenticated;
grant select on public.doctor_directory to anon, authenticated;
grant all on public.doctor_directory to service_role;
create policy public_reads_directory on public.doctor_directory
  for select to anon, authenticated using (true);
commit;
