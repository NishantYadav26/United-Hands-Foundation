const STATIC_CACHE = 'uhf-static-v2';
const API_CACHE = 'uhf-api-v2';
const STATIC_ASSETS = ['/', '/index.html'];
const CACHEABLE_API_PREFIXES = [
  '/api/stats',
  '/api/locations',
  '/api/pillars',
  '/api/gallery',
  '/api/videos',
  '/api/press-media',
  '/api/site-assets',
  '/api/projects',
  '/api/success-stories'
];

const isCacheableApiRequest = (pathname) => CACHEABLE_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => ![STATIC_CACHE, API_CACHE].includes(key))
      .map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isStaticAsset = ['style', 'script', 'image', 'font'].includes(request.destination);
  const isSameOriginApi = url.origin === self.location.origin && isCacheableApiRequest(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  if (isSameOriginApi) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
