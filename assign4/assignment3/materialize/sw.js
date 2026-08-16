// Name of new service worker cache
const CACHE_NAME = 'task-manager-v4';

// Files to save for offline use
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'js/ui.js',
  'js/firebaseDB.js',
  'css/img/img/task.png',
  'css/img/img/garden.png',
  'css/img/img/office.png'
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

// Fetch - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
