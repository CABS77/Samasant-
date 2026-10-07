begin;
create function public.check_care_schema() returns boolean language sql security invoker set search_path = public as $$
  select exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'doctor_directory')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'appointment_requests')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'service_quota')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'sms_notifications')
    and exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'admin_sessions');
$$;
create function public.cleanup_care_data(p_appointment_days integer default 90)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if p_appointment_days is null or p_appointment_days not between 30 and 365 then raise exception 'Invalid retention'; end if;
  delete from public.service_quota where expires_at < now();
  delete from public.admin_sessions where expires_at < now() - interval '7 days';
  delete from public.sms_alerts where created_at < now() - interval '7 days';
  -- A stalled send might already have reached the provider; do not resend it.
  update public.sms_notifications set state = 'unknown', encrypted_payload = null, updated_at = now()
    where state = 'processing' and processing_at < now() - interval '10 minutes';
  update public.sms_notifications set state = 'failed', encrypted_payload = null, updated_at = now()
    where state = 'queued' and created_at < now() - interval '10 minutes';
  delete from public.appointment_requests where start_at < now() - make_interval(days => p_appointment_days);
  delete from public.care_audit_events where created_at < now() - interval '365 days';
end $$;
revoke all on function public.check_care_schema(), public.cleanup_care_data(integer) from public, anon, authenticated;
grant execute on function public.check_care_schema(), public.cleanup_care_data(integer) to service_role;
commit;
