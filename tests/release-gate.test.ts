// @vitest-environment node
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
const { runRelease } = createRequire(import.meta.url)('../scripts/verify-release.cjs') as {
  runRelease: (run: (command: string, args: string[], options: { env: Record<string, string>; stdio: string }) => { status: number | null; error?: Error }, env?: Record<string, string>) => number;
};

describe('deployment checks', () => {
  it.each([0, 1, 2])('prevents the production build when check %s fails', failedStage => {
    let index = 0;
    const run = vi.fn(() => ({ status: index++ === failedStage ? 2 : 0 }));
    expect(runRelease(run, {})).toBe(2);
    expect(run).toHaveBeenCalledTimes(failedStage + 1);
    expect(run.mock.calls).not.toContainEqual(['npm', ['run', 'build'], expect.anything()]);
  });
  it('isolates verification from live application credentials and preserves the build configuration', () => {
    const environment = { NODE_ENV: 'production', ADMIN_PASSWORD: 'fixture-admin', SUPABASE_SERVICE_ROLE_KEY: 'fixture-db',
      TWILIO_AUTH_TOKEN: 'fixture-sms', DEEPSEEK_API_KEY: 'fixture-ai', VERCEL: '1', VERCEL_TOKEN: 'fixture-management',
      MAPBOX_TOKEN: 'fixture-geocoding',
      NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co', HTTPS_PROXY: 'http://fixture-proxy', NODE_EXTRA_CA_CERTS: '/fixture-ca.pem', PATH: '/fixture-path' };
    const run = vi.fn((_command: string, _args: string[], _options: { env: Record<string, string>; stdio: string }) => ({ status: 0 }));
    expect(runRelease(run, environment)).toBe(0);
    for (const call of run.mock.calls.slice(0, 3)) {
      expect(call[2].env).toEqual({ NODE_ENV: 'test', HTTPS_PROXY: environment.HTTPS_PROXY, NODE_EXTRA_CA_CERTS: environment.NODE_EXTRA_CA_CERTS, PATH: environment.PATH });
    }
    expect(run.mock.calls[3]).toEqual(['npm', ['run', 'build'], { env: environment, stdio: 'inherit' }]);
  });
  it('stops before building if a verification process cannot start', () => {
    const run = vi.fn(() => ({ status: null, error: new Error('process unavailable') }));
    expect(runRelease(run, {})).toBe(1);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
