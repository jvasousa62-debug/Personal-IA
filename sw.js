// IRONFIT Service Worker - Cache First com Network Fallback
const CACHE_VERSION = 'ironfit-v1';
const RUNTIME_CACHE = 'ironfit-runtime';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/src/config.js',
  '/src/chat.js',
  '/src/ui.js',
  '/src/login.js',
  '/src/main.js',
  '/gifs-data.js',
  '/manifest.json'
];

// Install: Cache dos assets principais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Alguns assets não foram cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estratégia por tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Supabase API: Network First
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2. Fonts do Google: Cache First (dura muito tempo)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3. CDNs: Cache First
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com') || url.hostname.includes('api.anthropic.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4. Assets locais (CSS, JS, Images): Stale While Revalidate
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 5. Documentos HTML: Network First
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 6. Padrão: Network First
  event.respondWith(networkFirst(request));
});

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache First - erro:', request.url);
    return new Response('Recurso indisponível offline', {
      status: 503,
      headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
    });
  }
}

// Network First Strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    const mainCache = await caches.open(CACHE_VERSION);
    const mainCached = await mainCache.match(request);
    if (mainCached) {
      return mainCached;
    }

    return new Response('Indisponível - conexão offline', {
      status: 503,
      headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
    });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached || new Response('Offline', { status: 503 }));

  return cached || fetchPromise;
}
