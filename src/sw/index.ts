const onlineFirstRequest = async (event: FetchEvent, fallbackUrl?: string) => {
  try {
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      return preloadResponse;
    }
    return await fetch(event.request);
  } catch (error) {
    if (isImage(event.request.url) || event.request.url.includes('file/get?item_id=')) {

    }
    const cache = await caches.open(cacheName);
    return await cache.match(fallbackUrl || event.request);
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflinePage());
  self.skipWaiting();
});

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(onlineFirstRequest(event, OFFLINE_FALLBACK_URL));
  } else {
    event.respondWith(onlineFirstRequest(event));
  }
});
