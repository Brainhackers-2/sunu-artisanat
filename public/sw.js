// SUNU ARTISANAT — Service Worker PWA Minimaliste (Mise en cache statique)
const CACHE_NAME = "sunu-artisanat-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/images/logo.png",
  "/favicon.ico",
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  (self as any).clients.claim();
});

self.addEventListener("fetch", (event: any) => {
  // Stratégie Network First avec repli cache statique
  if (event.request.method === "GET") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
