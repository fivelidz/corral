// Corral Service Worker
// Enables offline use and home screen install (PWA)

const CACHE = 'corral-v1';
const PRECACHE = [
  '/corral/',
  '/corral/index.html',
];

// Install: cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API/assets, cache fallback for navigation
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Navigation requests — serve app shell, let React Router handle routing
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/corral/').then(r => r || fetch(e.request))
      )
    );
    return;
  }

  // Static assets — cache first
  if (url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Everything else — network only
  e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })));
});
