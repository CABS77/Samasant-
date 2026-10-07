import { EnvHttpProxyAgent, fetch as proxyFetch } from 'undici';

// Preserve the managed proxy and Node CA trust. Ordinary hosting uses native fetch.
let dispatcher: EnvHttpProxyAgent | undefined;
export const serverFetch: typeof globalThis.fetch = async (input, init) => {
  if (!process.env.HTTPS_PROXY && !process.env.HTTP_PROXY
    && !process.env.https_proxy && !process.env.http_proxy) return globalThis.fetch(input, init);
  dispatcher ??= new EnvHttpProxyAgent();
  return proxyFetch(input as Parameters<typeof proxyFetch>[0], { ...init, dispatcher } as Parameters<typeof proxyFetch>[1]) as unknown as Promise<Response>;
};
