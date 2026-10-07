/* Run with PGlite installed in NODE_PATH; see docs/secure-care-workflows.md. */
const { PGlite } = require('@electric-sql/pglite');
const { readFileSync } = require('node:fs');
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
    await db.exec(readFileSync(resolve(__dirname, '../supabase/migrations/202610070000_doctor_directory.sql'), 'utf8'));
    await db.exec(readFileSync(resolve(__dirname, '../supabase/migrations/202610070001_appointment_requests.sql'), 'utf8'));
    const insert = (user, doctor, key) => `insert into public.appointment_requests
      (user_id, doctor_id, start_at, motif, phone, request_key)
      values ('${user}', '${doctor}', '2026-10-12T08:00:00Z', 'Test', '+221771234567', '${key}')`;
    await db.exec('set role service_role');
    await db.exec("insert into public.doctor_directory(id,name,specialty,available) values ('dr-1','Dr Fixture','Généraliste',array['Lun'])");
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
    await denied("update public.appointment_requests set status = 'invented'", '23514');
    await db.exec("update public.appointment_requests set status = 'cancelled' where doctor_id = 'dr-1'");
    await db.exec(insert(other, 'dr-1', '00000000-0000-4000-8000-000000000003'));
    const slots = await db.query("select count(*)::int as count from public.appointment_requests where doctor_id = 'dr-1' and status = 'requested'");
    assert.equal(slots.rows[0].count, 1); checks++;
    console.log(`${checks} PostgreSQL checks passed: own-row access, anonymous and patient writes denied, slot uniqueness, idempotency, Auth foreign key and cancellation release.`);
  } finally { await db.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
