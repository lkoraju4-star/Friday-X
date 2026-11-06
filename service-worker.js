const CACHE_NAME = 'hala-cache-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key.startsWith('hala-cache-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);

      if (
        response.ok &&
        response.type === 'basic' &&
        new URL(request.url).origin === self.location.origin
      ) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;

      throw error;
    }
  })());
});
