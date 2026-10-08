const { spawnSync } = require('node:child_process');

// Verification must never receive the application's production credentials.
// Preserve package-manager authentication and proxy/CA settings for npm audit.
function verificationEnvironment(environment) {
  return Object.fromEntries(Object.entries({ ...environment, NODE_ENV: 'test' })
    .filter(([name]) => !/^(ADMIN_|AI_|ANTHROPIC_|DEEPSEEK_|CLAUDE_|TWILIO_|SUPABASE_|NEXT_PUBLIC_|MAPBOX_|EMERGENCY_|SMS_|CRON_|APPOINTMENT_|VERCEL)/.test(name)));
}

function runRelease(run = spawnSync, environment = process.env) {
  const checksEnvironment = verificationEnvironment(environment);
  const stages = [
    { label: 'Application quality', args: ['run', 'quality'], env: checksEnvironment },
    { label: 'PostgreSQL integrity', args: ['run', 'verify:db'], env: checksEnvironment },
    { label: 'Production dependency security', args: ['audit', '--omit=dev', '--audit-level=high'], env: checksEnvironment },
    { label: 'Production build', args: ['run', 'build'], env: { ...environment, NODE_ENV: 'production' } },
  ];
  for (const stage of stages) {
    console.log(stage.label);
    const result = run('npm', stage.args, { env: stage.env, stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.error(`${stage.label} failed. Release stopped.`);
      return result.status || 1;
    }
  }
  return 0;
}

module.exports = { runRelease };
if (require.main === module) process.exitCode = runRelease();
