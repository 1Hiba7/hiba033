/* المسلم الشامل - Web Push service worker */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {
    data = { title: 'المسلم الشامل', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'المسلم الشامل';
  const section = data.section || (data.category === 'prayerTimes' ? 'prayer' : 'adhkar');
  const actions = [];
  if(data.category === 'tasbih') actions.push({action:'open-section',title:'📿 تسبيح'});
  if(data.category === 'salawat') actions.push({action:'open-section',title:'💚 الصلاة على النبي ﷺ'});
  if(data.category === 'prayerTimes') actions.push({action:'open-section',title:'🕌 الصلاة'});
  if(data.category === 'planReminders') actions.push({action:'open-section',title:'📚 فتح الخطة'});
  const options = {
    body: data.body || '',
    tag: data.tag || 'muslim-comprehensive',
    dir: 'rtl', lang: 'ar',
    data: { url: data.url || `./?section=${encodeURIComponent(section)}`, section },
    actions
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const section = data.section || (event.action === 'open-section' ? 'adhkar' : null);
  const url = section ? `./?section=${encodeURIComponent(section)}` : (data.url || './');
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      const existing = list.find(c => 'focus' in c);
      if(existing){
        if(existing.postMessage && section) existing.postMessage({type:'open-section',section});
        return existing.focus();
      }
      return clients.openWindow(url);
    })
  );
});
