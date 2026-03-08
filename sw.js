const CACHE = 'stayhard-v1';

// Cache the HTML, all images, and the logo on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      const assets = ['./goforit.html', './logo.jpg'];
      // Cache all 13 motivation images
      for (let i = 1; i <= 13; i++) assets.push(`./${i}.jpg`);
      return cache.addAll(assets).catch(() => {
        // If some images don't exist yet, cache what we can
        return Promise.allSettled(assets.map(a => cache.add(a).catch(() => {})));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first: serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // Cache new successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('./goforit.html'))
  );
});
