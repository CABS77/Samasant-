/* Public assets only. Patient records, API responses and authenticated HTML are never cached. */
const PUBLIC_CACHE = 'samasante-public-v2';
const ASSET_CACHE = 'samasante-assets-v2';
const KEEP = new Set([PUBLIC_CACHE, ASSET_CACHE]);
const PUBLIC_ASSETS = ['/offline.html', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(PUBLIC_CACHE).then(cache => cache.addAll(PUBLIC_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('samasante-') && !KEEP.has(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(PUBLIC_CACHE);
      return await cache.match('/offline.html') || new Response('Hors ligne : appelez le 1515 en cas d’urgence.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }));
    return;
  }
  if (!url.pathname.startsWith('/_next/static/') && !PUBLIC_ASSETS.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(PUBLIC_ASSETS.includes(url.pathname) ? PUBLIC_CACHE : ASSET_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      const keys = await cache.keys();
      if (keys.length > 100) await cache.delete(keys[0]);
    }
    return response;
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_PRIVATE_DATA') {
    // Clear any legacy private/dynamic caches from earlier application versions.
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('samasante-') && !KEEP.has(key)).map(key => caches.delete(key)))));
  }
});
