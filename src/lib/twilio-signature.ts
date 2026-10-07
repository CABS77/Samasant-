import { createHmac, timingSafeEqual } from 'node:crypto';

export function validTwilioSignature(url: string, params: URLSearchParams, signature: string, secret: string): boolean {
  if (!secret || signature.length > 100) return false;
  const keys = Array.from(new Set(params.keys())).sort();
  if (keys.some(key => params.getAll(key).length !== 1)) return false;
  const signed = url + keys.map(key => key + params.get(key)).join('');
  const expected = createHmac('sha1', secret).update(signed).digest();
  const actual = Buffer.from(signature, 'base64');
  return actual.length === expected.length && timingSafeEqual(expected, actual);
}
