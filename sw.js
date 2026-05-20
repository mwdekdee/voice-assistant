const CACHE_NAME = 'voice-assistant-v1';
const urlsToCache = [
  '/voice-assistant/voice-assistant-pwa.html',
  '/voice-assistant/manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache install error:', err))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'complete') {
    // Send message to complete task
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        if (clients && clients.length) {
          clients[0].postMessage({
            action: 'complete',
            taskId: event.notification.data.taskId
          });
        }
      })
    );
  } else if (event.action === 'snooze') {
    // Send message to snooze task
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        if (clients && clients.length) {
          clients[0].postMessage({
            action: 'snooze',
            taskId: event.notification.data.taskId
          });
        }
      })
    );
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/voice-assistant/voice-assistant-pwa.html')
    );
  }
});

// Background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(checkAndShowNotifications());
  }
});

function checkAndShowNotifications() {
  // This will be triggered by periodic background sync
  // Check for any pending notifications
  return Promise.resolve();
}
