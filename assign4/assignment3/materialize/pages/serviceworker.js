const CACHE_NAME ="task-manager-v2";

const ASSETS_TO_CACHE = [
 "/",
 "/index.html", 
 "/pages/about.html",
 "/pages/contact.html", 
"/css/materialize.min.css", 
 "/js/materialize.min.js",
 "/js/ui.js",
 "/css/img/img/task.png",
 "/css/img/img/garden.png",
 "/css/img/img/office.png",
 ];
 //Install event
  self.addEventListener("install", (event) => {
    console.log("Service worker: Installing...");
     event.waitUntil(
     caches.open(CACHE_NAME).then((cache) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache =>{
         
    
        console.log("Service worker: caching files");
        return cache.addAll(ASSETS_TO_CACHE);
    })
  );



});
//activate event
self.addEventListener("activate",(event) => {}
    console.log('Service Worker: Activating...');
    event.waitUntil(
    caches.keys().then((cachesNames) => {
        return Promise.all(
        cacheNames.map((cache) => {
        if (cache !== CACHE_NAME) {
            console.log("service Worker: Deleting old Cache");
            return caches.delete(cache);
        }
    })
  );
});


// Fetch event
self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
                 
        }
  
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); //Update cache with new response
            return networkResponse;
          });  
      });    
    })
  );
})}:}
