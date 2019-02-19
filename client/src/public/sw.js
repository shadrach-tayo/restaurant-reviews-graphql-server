const staticFileCache = "v2";
const staticCacheNames = [staticFileCache];

const filesToCache = [
  "/",
  "./restaurant.html",
  "./css/styles.css",
  "./js/main.js",
  "./js/restaurant_info.js",
  "./js/idb.js",
  "./img/placeholder.jpg",
  "./img/neighbourhood.svg",
  "./img/networkerror.svg",
  "./img/networksuccess.svg",
  "./img/cuisine.svg",
  "./img/restaurant-icons_192x192.png",
  "./img/restaurant-icons_256x256.png",
  "./img/restaurant-icons_512x512.png",
  "./favicon.png",
  "https://unpkg.com/leaflet@1.3.1/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"
];

self.addEventListener("install", event => {
  console.log("installing [service-worker]");
  event.waitUntil(preCache());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return !staticCacheNames.includes(cacheName);
            })
            .map(cacheName => {
              return caches.delete(cacheName);
            })
        );
      })
      .catch(err => console.log(err.stack))
  );
});

self.addEventListener("fetch", event => {
  let requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === "/restaurant.html") {
      event.respondWith(caches.match("/restaurant.html"));
      console.log(requestUrl.pathname);
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/img/")) {
    event.respondWith(serveImages(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

function preCache() {
  return caches.open(staticFileCache).then(cache => {
    cache
      .addAll(filesToCache)
      .catch(err => console.log(err, "static assets failed to be cached"));
  });
}

serveImages = request => {
  let networkFetch = fetch(request);
  return caches.open(staticFileCache).then(cache => {
    return cache.match(request).then(response => {
      return (
        response ||
        networkFetch.then(networkResponse => {
          if (networkResponse) cache.put(request, networkResponse.clone());
          return networkResponse;
        })
      );
    });
  });
};

self.addEventListener("message", event => {
  if (event.data.action == "skipWaiting") {
    console.log("skipping installation stage");
    self.skipWaiting();
  }
});
