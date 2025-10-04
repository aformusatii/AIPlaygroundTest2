/// <reference lib="webworker" />

import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string }> };

setCacheNameDetails({ prefix: 'secretarium' });
clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({ cacheName: 'secretarium-pages', networkTimeoutSeconds: 10 }),
);

registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'secretarium-assets' }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'secretarium-api', networkTimeoutSeconds: 10 }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'secretarium-images' }),
);
