const CACHE = 'pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(
      k.filter(x => x !== CACHE).map(x => caches.delete(x))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let u; try { u = new URL(req.url); } catch { return; }
  if (u.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(res => {
      if (!res || res.status !== 200 || res.type === 'opaque') return res;
      const copy = res.clone();
      caches.open(CACHE).then(cc => cc.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
