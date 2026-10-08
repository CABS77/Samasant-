/* Run with PGlite installed in NODE_PATH; see docs/secure-care-workflows.md. */
const { PGlite } = require('@electric-sql/pglite');
const { readFileSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');

async function main() {
  const db = new PGlite();
  const patient = '00000000-0000-4000-8000-000000000001';
  const other = '00000000-0000-4000-8000-000000000002';
  let checks = 0;
  const denied = async (sql, code) => {
    await assert.rejects(db.exec(sql), error => error.code === code);
    checks++;
  };
  try {
    // A disposable local analogue of the roles and Auth schema provided by Supabase.
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      grant usage on schema auth to authenticated;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      insert into auth.users values ('${patient}'), ('${other}');
    `);
    for (const file of readdirSync(resolve(__dirname, '../supabase/migrations')).filter(name => name.endsWith('.sql')).sort()) {
      await db.exec(readFileSync(resolve(__dirname, '../supabase/migrations', file), 'utf8'));
    }
    const insert = (user, doctor, key) => `insert into public.appointment_requests
      (user_id, doctor_id, start_at, motif, phone, request_key)
      values ('${user}', '${doctor}', '2026-10-12T08:00:00Z', 'Test', '+221771234567', '${key}')`;
    await db.exec("insert into public.doctor_directory(id,name,specialty,available) values ('dr-1','Dr Fixture','Généraliste',array['Lun'])");
    await db.exec('set role service_role');
    await db.exec(insert(patient, 'dr-1', patient));
    await db.exec(insert(other, 'dr-2', other));
    await db.exec('set role authenticated');
    await db.exec(`set request.jwt.claim.sub = '${patient}'`);
    const own = await db.query('select user_id, status from public.appointment_requests');
    assert.deepEqual(own.rows, [{ user_id: patient, status: 'requested' }]); checks++;
    await db.exec(`set request.jwt.claim.sub = '${other}'`);
    const theirs = await db.query('select user_id from public.appointment_requests');
    assert.deepEqual(theirs.rows, [{ user_id: other }]); checks++;
    await denied(insert(other, 'dr-3', patient), '42501');
    await denied("update public.appointment_requests set status = 'confirmed'", '42501');
    await denied('delete from public.appointment_requests', '42501');
    await db.exec('set role anon');
    assert.equal((await db.query('select count(*)::int as count from public.doctor_directory')).rows[0].count, 1); checks++;
    await denied("insert into public.doctor_directory(id,name,specialty,available) values ('dr-forged','Dr Forged','Généraliste',array['Lun'])", '42501');
    await denied('select * from public.appointment_requests', '42501');
    await db.exec('set role service_role');
    await denied(insert(other, 'dr-1', '00000000-0000-4000-8000-000000000003'), '23505');
    await denied(insert(patient, 'dr-3', patient), '23505');
    await denied(insert('00000000-0000-4000-8000-000000000099', 'dr-3', patient), '23503');
    await denied("update public.appointment_requests set status = 'confirmed'", '42501');
    await db.exec('reset role');
    await denied("update public.appointment_requests set status = 'invented'", '23514');
    await db.exec("update public.appointment_requests set status = 'cancelled' where doctor_id = 'dr-1'");
    await db.exec('set role service_role');
    await db.exec(insert(other, 'dr-1', '00000000-0000-4000-8000-000000000003'));
    const slots = await db.query("select count(*)::int as count from public.appointment_requests where doctor_id = 'dr-1' and status = 'requested'");
    assert.equal(slots.rows[0].count, 1); checks++;
    const scalar = async (sql, expected) => { const result = await db.query(sql); assert.equal(Object.values(result.rows[0])[0], expected); checks++; };
    await scalar("select public.check_care_schema()", true);
    await db.exec('reset role');
    await db.exec('grant update on public.doctor_directory to service_role');
    await db.exec('set role service_role');
    await scalar("select public.check_care_schema()", false);
    await db.exec('reset role');
    await db.exec('revoke update on public.doctor_directory from service_role');
    await db.exec('set role service_role');
    await scalar("select count(*)::int from care_audit_events where entity='appointment_requests' and from_state='requested' and to_state='cancelled'", 1);
    for (let i = 0; i < 7; i++) await scalar("select consume_service_quota(array['global','patient-a'],array[10,7],86400)", true);
    await scalar("select consume_service_quota(array['global','patient-a'],array[10,7],86400)", false);
    await scalar("select count from service_quota where key='global'", 7);
    for (let i = 0; i < 3; i++) await scalar("select consume_service_quota(array['global','patient-b'],array[10,7],86400)", true);
    await scalar("select consume_service_quota(array['global','patient-c'],array[10,7],86400)", false);
    await scalar("select count(*)::int from service_quota where key='patient-c'", 0);
    const alert = '00000000-0000-4000-8000-000000000010';
    const job = '00000000-0000-4000-8000-000000000011';
    const enqueue = (payload = 'hash') => `select enqueue_notifications('${alert}','token','${alert}','owner','${payload}',
      '[{"id":"${job}","partner_id":"fixture","partner_name":"Test Partner","recipient":"+221771234567","encrypted_payload":"ciphertext"}]'::jsonb)`;
    await scalar(enqueue(), alert); await scalar(enqueue(), alert);
    await denied(enqueue('conflict'), 'P0001');
    await scalar("select count(*)::int from sms_notifications", 1);
    await scalar("select count(*)::int from claim_sms_notifications(null,3)", 1);
    await scalar("select count(*)::int from claim_sms_notifications(null,3)", 0);
    const sid = 'SM' + '1'.repeat(32);
    await scalar(`select record_sms_status('${job}',null,'delivered')`, false);
    await scalar(`select record_sms_status('${job}','${sid}','accepted')`, true);
    await scalar(`select encrypted_payload is null from sms_notifications where id='${job}'`, true);
    await scalar(`select record_sms_status('${job}','SM${'2'.repeat(32)}','delivered')`, false);
    await scalar(`select record_sms_status('${job}','${sid}','delivered')`, true);
    await scalar(`select record_sms_status('${job}','${sid}','accepted')`, true);
    await scalar(`select state from sms_notifications where id='${job}'`, 'delivered');
    await db.exec(`insert into admin_sessions(id,operator_id,expires_at) values('${alert}','${patient}',now()+interval '1 hour')`);
    await db.exec(`update admin_sessions set revoked_at=now() where id='${alert}'`);
    await scalar(`select count(*)::int from admin_sessions where id='${alert}' and revoked_at is null`, 0);
    await scalar("select count(*)::int from information_schema.columns where table_schema='public' and table_name='care_audit_events' and column_name in ('phone','motif','symptoms','encrypted_payload')", 0);
    await scalar("select count(*)::int from care_audit_events where entity='admin_sessions'", 2);
    await scalar("select count(*)::int from care_audit_events where entity='admin_sessions' and operator_id='" + patient + "'", 2);
    const sessionA = '00000000-0000-4000-8000-000000000020';
    const sessionB = '00000000-0000-4000-8000-000000000021';
    const sessionExpired = '00000000-0000-4000-8000-000000000022';
    const appointmentId = (await db.query("select id from appointment_requests where doctor_id='dr-1' and status='requested'")).rows[0].id;
    await db.exec(`insert into admin_sessions(id,operator_id,expires_at) values
      ('${sessionA}','${patient}',now()+interval '1 hour'),
      ('${sessionB}','${other}',now()+interval '1 hour'),
      ('${sessionExpired}','${patient}',now()-interval '1 hour')`);
    await denied("insert into doctor_directory(id,name,specialty,available) values('dr-bypass','Dr Bypass','Gen',array['Lun'])", '42501');
    await denied("update doctor_directory set name='Forged' where id='dr-1'", '42501');
    await denied("delete from doctor_directory where id='dr-1'", '42501');
    await denied('truncate doctor_directory', '42501');
    await denied('truncate appointment_requests', '42501');
    await denied("insert into care_audit_events(entity,entity_id,action) values ('doctor_directory','dr-1','FORGED')", '42501');
    await denied('delete from care_audit_events', '42501');
    await denied("select admin_doctor_write(null,'delete','dr-1','{}')", '42501');
    await denied(`select admin_doctor_write('${sessionExpired}','delete','dr-1','{}')`, '42501');
    await denied(`select admin_doctor_write('${alert}','delete','dr-1','{}')`, '42501');
    await scalar(`select admin_doctor_write('${sessionA}','create','dr-attributed','{"name":"Dr Attributed","specialty":"Gen","available":["Lun"]}') ->> 'id'`, 'dr-attributed');
    await scalar(`select admin_doctor_write('${sessionB}','update','dr-attributed','{"name":"Dr Updated"}') ->> 'name'`, 'Dr Updated');
    await scalar(`select operator_id::text from care_audit_events where entity_id='dr-attributed' and action='INSERT'`, patient);
    await scalar(`select admin_session_id::text from care_audit_events where entity_id='dr-attributed' and action='UPDATE'`, sessionB);
    await denied(`select admin_doctor_write('${sessionB}','update','dr-attributed','{"name":"X"}')`, '23514');
    await scalar("select count(*)::int from care_audit_events where entity_id='dr-attributed'", 2);
    await scalar("select name from doctor_directory where id='dr-attributed'", 'Dr Updated');
    // If recording the event fails, the business update must roll back too.
    await db.exec('reset role');
    await db.exec(`create function public.fail_audit_fixture() returns trigger language plpgsql as $$
      begin raise exception 'Fixture audit unavailable'; end $$;
      create trigger fail_audit_fixture before insert on care_audit_events for each row execute function fail_audit_fixture()`);
    await db.exec('set role service_role');
    await denied(`select admin_doctor_write('${sessionB}','update','dr-attributed','{"name":"Dr Unrecorded"}')`, 'P0001');
    await scalar("select name from doctor_directory where id='dr-attributed'", 'Dr Updated');
    await scalar("select count(*)::int from care_audit_events where entity_id='dr-attributed'", 2);
    await db.exec('reset role');
    await db.exec('drop trigger fail_audit_fixture on care_audit_events; drop function fail_audit_fixture()');
    await db.exec('set role service_role');
    await scalar(`select admin_doctor_write('${sessionA}','delete','dr-attributed','{}') ->> 'id'`, 'dr-attributed');
    await scalar(`select operator_id::text from care_audit_events where entity_id='dr-attributed' and action='DELETE'`, patient);
    await scalar(`select admin_appointment_write('${sessionB}','${appointmentId}','confirmed') ->> 'status'`, 'confirmed');
    await scalar(`select operator_id::text from care_audit_events where entity_id='${appointmentId}' and to_state='confirmed'`, other);
    await scalar(`select admin_appointment_write('${sessionB}','${appointmentId}','confirmed') is null`, true);
    await scalar(`select admin_acknowledge_notification('${sessionA}','${job}')`, true);
    await scalar(`select acknowledged_by::text from sms_notifications where id='${job}'`, patient);
    await scalar(`select operator_id::text from care_audit_events where entity_id='${job}' and action='ACKNOWLEDGE'`, patient);
    await scalar(`select admin_acknowledge_notification('${sessionB}','${job}')`, false);
    await scalar(`select acknowledged_by::text from sms_notifications where id='${job}'`, patient);
    await db.exec(`update admin_sessions set revoked_at=now() where id='${sessionB}'`);
    await denied(`select admin_appointment_write('${sessionB}','${appointmentId}','cancelled')`, '42501');
    await scalar(`select status from appointment_requests where id='${appointmentId}'`, 'confirmed');
    await scalar(`select admin_appointment_write('${sessionA}','${appointmentId}','cancelled') ->> 'status'`, 'cancelled');
    await scalar(`select operator_id::text from care_audit_events where entity_id='${appointmentId}' and to_state='cancelled'`, patient);
    // A later maintenance delete must not inherit an administrator's transaction context.
    await scalar(`select nullif(current_setting('samasante.care_admin_session',true),'') is null`, true);
    await db.exec('set role anon');
    for (const table of ['service_quota','sms_alerts','sms_notifications','admin_sessions','care_audit_events']) await denied(`select * from public.${table}`, '42501');
    await denied("select consume_service_quota(array['forged'],array[1],86400)", '42501');
    await denied(`select admin_doctor_write('${sessionA}','delete','dr-1','{}')`, '42501');
    await denied(`select activate_care_admin_session('${sessionA}')`, '42501');
    await denied("select cleanup_care_data(90)", '42501');
    await db.exec('set role authenticated');
    await denied(`select record_sms_status('${job}','${sid}','delivered')`, '42501');
    await denied(`update sms_notifications set acknowledged_at=now()`, '42501');
    await denied(`select admin_appointment_write('${sessionA}','${appointmentId}','confirmed')`, '42501');
    await denied(`select admin_acknowledge_notification('${sessionA}','${job}')`, '42501');
    await db.exec('set role service_role');
    await db.exec(`update sms_alerts set created_at=now()-interval '8 days' where id='${alert}'`);
    await db.exec('select cleanup_care_data(90)');
    await scalar('select count(*)::int from sms_alerts', 0);
    await scalar('select count(*)::int from sms_notifications', 0);
    await scalar(`select operator_id is null from care_audit_events where entity_id='${job}' and action='DELETE'`, true);
    await db.exec(`delete from admin_sessions where id='${sessionA}'`);
    await scalar(`select admin_session_id is null from care_audit_events where entity_id='dr-attributed' and action='INSERT'`, true);
    await scalar(`select operator_id::text from care_audit_events where entity_id='dr-attributed' and action='INSERT'`, patient);
    await db.exec('reset role');
    const backup = await db.dumpDataDir('none');
    const restored = new PGlite({ loadDataDir: backup });
    try { assert.equal((await restored.query('select count(*)::int as n from public.appointment_requests')).rows[0].n, 3); checks++; }
    finally { await restored.close(); }
    console.log(`${checks} PostgreSQL checks passed: RLS, booking collisions, idempotency, atomic shared budgets, encrypted SMS queue lifecycle, delivery callbacks, atomic operator attribution, revocation, retention and disposable backup restoration.`);
  } finally { await db.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
