const CACHE = "turnos-v1";
const urlsToCache = ["/home", "/admin", "/clients", "/dashboard", "/services"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => new Response("Sin conexión", { status: 503 })))
  );
});
