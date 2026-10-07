import { headers } from 'next/headers';
import { clientAddress, consumeQuota } from './service-quota';

export async function protectAIRequest(): Promise<void> {
  await consumeQuota('ai', clientAddress(await headers()));
}

/** Provider failures open a per-instance circuit. Shared quotas cap the total spend. */
const circuits = new Map<string, { failures: number; until: number }>();
export async function withAICircuit<T>(provider: string, run: () => Promise<T>): Promise<T> {
  const circuit = circuits.get(provider);
  if (circuit && circuit.until > Date.now()) throw new Error('Assistant momentanément indisponible.');
  const started = Date.now();
  try {
    const result = await run();
    process.stdout.write(JSON.stringify({ service: 'ai', provider, outcome: 'success', durationMs: Date.now() - started }) + '\n');
    circuits.delete(provider);
    return result;
  } catch {
    process.stdout.write(JSON.stringify({ service: 'ai', provider, outcome: 'failed', durationMs: Date.now() - started }) + '\n');
    const failures = (circuit?.failures || 0) + 1;
    circuits.set(provider, { failures, until: failures >= 3 ? Date.now() + 30000 : 0 });
    // Provider exception bodies can contain the request. Never return or log them.
    throw new Error('Assistant momentanément indisponible. Réessayez plus tard.');
  }
}
