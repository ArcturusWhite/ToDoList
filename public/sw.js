const CACHE_PREFIX = "todolist-pwa";
const CACHE_VERSION = "2026-05-18-v2";
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const CURRENT_CACHES = new Set([STATIC_CACHE, RUNTIME_CACHE]);

const STATIC_ASSETS = ["/icons/icon-192.svg", "/icons/icon-512.svg", "/icons/apple-touch-icon.svg"];

const OFFLINE_RESPONSE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TodoList Offline</title>
  <style>
    body { align-items: center; background: #f8fafc; color: #111827; display: flex; font-family: Arial, sans-serif; justify-content: center; margin: 0; min-height: 100vh; padding: 24px; text-align: center; }
    main { max-width: 420px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    p { color: #64748b; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <main>
    <h1>TodoList is offline</h1>
    <p>Reconnect to load the latest app version. Your saved tasks remain stored on this device.</p>
  </main>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.has(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  if (isAppAssetRequest(request, url)) {
    event.respondWith(networkFirstAsset(request));
  }
});

function isAppAssetRequest(request, url) {
  return (
    url.pathname.startsWith("/_next/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/sw.js" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "worker"
  );
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request, { cache: "no-store" });
  } catch {
    return new Response(OFFLINE_RESPONSE, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 503,
      statusText: "Offline"
    });
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const networkResponse = await fetch(request, { cache: "no-store" });
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response("Asset unavailable offline", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: 504,
      statusText: "Offline"
    });
  }
}

async function cacheFirstStatic(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request, { cache: "no-store" });
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
