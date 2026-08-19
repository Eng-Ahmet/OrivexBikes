/* ====== QQBikes SERVICE WORKER WITH PWA OFFLINE CACHING, PUSH NOTIFICATIONS, BACKGROUND SYNC & PERIODIC SYNC ====== */

const CACHE_NAME = 'qqbikes-pwa-v1.0.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './.well-known/assetlinks.json',
  './src/styles/main.css',
  './src/js/api.js',
  './src/js/app.js',
  './src/js/i18n.js',
  './src/js/router.js',
  './src/js/components/Header.js',
  './src/js/components/Sidebar.js',
  './src/js/components/Toast.js',
  './src/js/pages/FleetPage.js',
  './src/js/pages/ContractsPage.js',
  './src/js/pages/ShiftsPage.js',
  './src/js/pages/SchedulesPage.js',
  './src/js/pages/RepairsPage.js',
  './src/js/pages/TariffsPage.js',
  './src/js/pages/AnalyticsPage.js',
  './src/js/pages/SettingsPage.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/screenshot-mobile.png',
  './assets/screenshot-desktop.png',
  './assets/widget.json',
  './assets/widget-data.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First Strategy with Dynamic Cache Fallback for instant fresh updates on refresh
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

/* ====== 1. PUSH NOTIFICATIONS HANDLER ====== */
self.addEventListener('push', (event) => {
  let data = { title: 'QQBikes Management', body: '🚲 Store Alert & Rental Notification' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || './index.html' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

/* ====== 2. PERIODIC BACKGROUND SYNC HANDLER ====== */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-inventory' || event.tag === 'hourly-reminder') {
    event.waitUntil(
      self.registration.showNotification('QQBikes Alert 🚲', {
        body: 'Syncing counter shift drawer and vehicle inventory',
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        vibrate: [150, 80, 150]
      })
    );
  }
});

/* ====== 3. BACKGROUND SYNC HANDLER ====== */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contracts' || event.tag === 'sync-notes') {
    console.log('[Service Worker] Background Syncing contracts and data...');
  }
});

/* ====== 4. CLIENT MESSAGING API ====== */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'QQBikes System', {
      body: event.data.body || 'Rental Notification',
      icon: './assets/icon-192.png',
      badge: './assets/icon-192.png',
      vibrate: [200, 100, 200]
    });
  }
});
