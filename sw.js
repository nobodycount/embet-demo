// Improved service worker
const CACHE_NAME = 'embet-cache-v1';
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'embet.umd.min.js?a=6'
];

const RUNTIME_CACHE = 'runtime-cache';
const MAX_RUNTIME_ENTRIES = 60;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Helper: stale-while-revalidate for same-origin static assets, and network-first for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Always try to serve navigation requests (HTML) network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        // Put a copy in cache
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  // For same-origin requests (scripts/styles/images) use cache-first, then network and update cache
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          // update runtime cache
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        }).catch(() => undefined);
        // Return cached if present, otherwise network
        return cached || networkFetch;
      })
    );
    return;
  }

  // For cross-origin (CDN) resources use stale-while-revalidate pattern
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          cache.put(request, response.clone());
          // Trim the runtime cache if necessary
          cache.keys().then((keys) => {
            if (keys.length > MAX_RUNTIME_ENTRIES) {
              cache.delete(keys[0]);
            }
          });
          return response;
        }).catch(() => undefined);
        return cached || networkFetch;
      })
    )
  );
});

// Fallback for images: if fetch fails and no cache, serve a local placeholder
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.destination === 'image') {
    event.respondWith(
      fetch(req).catch(() => caches.match('icons/icon-192.png'))
    );
  }
});