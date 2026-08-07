const CACHE = {
  static: "static-v2",
  navigations: "navigations-v2",
  api: "api-v2",
};

const STATIC_URLS = [
  "/",
  "/home",
  "/login",
  "/admin",
  "/dashboard",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE.static)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const allowed = Object.values(CACHE);
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => !allowed.includes(n))
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isNavigation(req) {
  return req.mode === "navigate" || req.destination === "document";
}

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/) ||
    url.pathname.startsWith("/_next/static/")
  );
}

function networkFirst(request, cacheName, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let rejected = false;
    let timer;

    const useCache = () => {
      if (rejected) return;
      rejected = true;
      clearTimeout(timer);
      caches.match(request).then((cached) => {
        resolve(cached || new Response("Offline", { status: 503 }));
      });
    };

    timer = setTimeout(useCache, timeoutMs);

    fetch(request)
      .then((res) => {
        if (rejected) return;
        rejected = true;
        clearTimeout(timer);

        if (res.ok) {
          const clone = res.clone();
          caches.open(cacheName).then((cache) => cache.put(request, clone));
        }

        resolve(res);
      })
      .catch(useCache);
  });
}

function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((res) => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return res;
    });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  if (isApi(url)) {
    event.respondWith(networkFirst(request, CACHE.api));
    return;
  }

  if (isStaticAsset(url)) {
    if (url.pathname === "/sw.js") {
      event.respondWith(networkFirst(request, CACHE.static));
      return;
    }
    event.respondWith(cacheFirst(request, CACHE.static));
    return;
  }

  if (isNavigation(request)) {
    event.respondWith(networkFirst(request, CACHE.navigations));
    return;
  }

  event.respondWith(networkFirst(request, CACHE.navigations));
});
