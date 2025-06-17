// Service Worker pour SamaSanté
// Version: 1.0.0

const CACHE_NAME = 'samasante-v1';
const DYNAMIC_CACHE = 'samasante-dynamic-v1';

// Ressources essentielles à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First - pour les assets statiques
  cacheFirst: async (request) => {
    if (request.method !== 'GET') {
      return fetch(request);
    }
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },
  
  // Network First - pour les API calls
  networkFirst: async (request) => {
    if (request.method !== 'GET') {
      return fetch(request);
    }
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  },
  
  // Stale While Revalidate
  staleWhileRevalidate: async (request) => {
    if (request.method !== 'GET') {
      return fetch(request);
    }
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    return cached || fetchPromise;
  }
};

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache des ressources statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('samasante-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes vers des domaines externes (sauf APIs)
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('api.deepseek.com')) {
    return;
  }
  
  // Stratégies par type de ressource
  if (request.destination === 'image') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  } else if (request.destination === 'document') {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
  } else {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
  }
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_REMEDIES') {
    // Mettre en cache les remèdes pour l'utilisation hors ligne
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});
