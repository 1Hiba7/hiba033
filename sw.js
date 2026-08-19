/* المسلم الشامل - Web Push service worker
 * The push event is ready for a real Web Push subscription sent by a server.
 * The page also uses registration.showNotification() for prayer alerts while open.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {
    data = { title: 'المسلم الشامل', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'المسلم الشامل';
  const options = {
    body: data.body || '',
    tag: data.tag || 'muslim-comprehensive',
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
