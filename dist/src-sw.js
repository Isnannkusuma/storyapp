import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// ...runtimeCaching sesuai kebutuhan...

// Handler push notification
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Cerita Baru!';
  const options = {
    body: data.body || 'Ada cerita baru di Story SPA.',
    icon: '/assets/logo.png', // ganti sesuai path icon kamu
    data: data.url || '/',
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});