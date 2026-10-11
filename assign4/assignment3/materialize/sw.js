// Name of new service worker cache
const CACHE_NAME = 'task-manager-v5';

// Files to save for offline use
const FILES_TO_CACHE = [
  'index.html',
  'offline.html',
  'manifest.json',
  'pages/about.html',
  'pages/contact.html',
  'css/CSS/materialize.min.css',
  'css/custom.css',
  'js/materialize.min.js',
  'js/ui.js',
  'js/firebaseDB.js',
  'css/img/img/task.png',
  'css/img/img/icons/icon-192x192.png',
  'css/img/img/icons/icon-512x512.png'
];

// Install - save files to cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch - add new fetch handler
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET'){
    return;
  }
  const requestURL = new URL(event.request.url);
  const cacheableExternalOrigins = [
    'https://unpkg.com',
    'https://www.gstatic.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
  if(
    requestURL.origin !== self.location.origin &&
    !cacheableExternalOrigins.includes(requestURL.origin)
  ){
    return;
  }
  if (event.request.mode ==='navigate') {
    event.respondWith(
      fetch(event.request).catch(async () =>{
        const cachedPage = await caches.match(event.request);
        return cachedPage || caches.match('offline.html');
      })
    );
    return;
  }
    event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      const networkResponse = await fetch(event.request);

      if (networkResponse.ok || networkResponse.type === 'opaque') {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
        } catch (error) {
          console.warn(
            'Service Worker: Could not cache resource:',
            event.request.url,
            error
          );
        }
      }

      return networkResponse;
    })
  );
});

