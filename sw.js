const CACHE_NAME = 'marketpulse-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/analysis.html',
  '/pricing.html',
  '/login.html',
  '/profile.html',
  '/css/style.css',
  '/js/app.js',
  '/js/supabase.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Network-first for API calls
  if (url.hostname.includes('coingecko') || url.hostname.includes('binance') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});