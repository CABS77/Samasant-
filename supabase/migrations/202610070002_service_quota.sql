begin;
create table public.service_quota (
  key text not null,
  window_start bigint not null,
  count integer not null check (count >= 0),
  expires_at timestamptz not null,
  primary key (key, window_start)
);
alter table public.service_quota enable row level security;
revoke all on public.service_quota from anon, authenticated;
grant all on public.service_quota to service_role;

create function public.consume_service_quota(p_keys text[], p_limits integer[], p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path = public as $$
declare
  i integer; k text; bucket bigint;
begin
  if coalesce(array_length(p_keys, 1), 0) not between 1 and 5
    or array_length(p_keys, 1) is distinct from array_length(p_limits, 1)
    or p_window_seconds is null or p_window_seconds not between 60 and 86400
    or exists (select 1 from unnest(p_limits) n where n is null or n < 1 or n > 10000)
    or exists (select 1 from unnest(p_keys) v where v is null or length(v) > 160)
    or (select count(distinct v) from unnest(p_keys) v) <> array_length(p_keys, 1)
  then raise exception 'Invalid quota parameters'; end if;
  bucket := floor(extract(epoch from now()) / p_window_seconds)::bigint * p_window_seconds;
  -- Sorted transaction locks keep concurrent requests and global budgets atomic.
  for k in select distinct v from unnest(p_keys) v order by v loop
    perform pg_advisory_xact_lock(hashtextextended(k, 0));
  end loop;
  for i in 1..array_length(p_keys, 1) loop
    if coalesce((select count from public.service_quota where key = p_keys[i] and window_start = bucket), 0) >= p_limits[i]
    then return false; end if;
  end loop;
  for i in 1..array_length(p_keys, 1) loop
    insert into public.service_quota(key, window_start, count, expires_at)
    values (p_keys[i], bucket, 1, to_timestamp(bucket + p_window_seconds))
    on conflict (key, window_start) do update set count = service_quota.count + 1;
  end loop;
  return true;
end $$;
revoke all on function public.consume_service_quota(text[], integer[], integer) from public, anon, authenticated;
grant execute on function public.consume_service_quota(text[], integer[], integer) to service_role;
commit;
