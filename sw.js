// ============================================
// توصيل طبي - Service Worker v14
// يعمل في الخلفية حتى لو التطبيق مغلق
// ============================================

var CACHE_NAME = 'saydaliyati-v14';
var urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', function (event) {
  console.log('[SW v14] تثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache).catch(function (err) {
        console.warn('[SW v14] فشل cache بعض الملفات:', err);
      });
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', function (event) {
  console.log('[SW v14] تفعيل...');
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW v14] حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات (Caching)
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // لا تخزن طلبات Firebase أو Google APIs
  if (url.indexOf('firebase') !== -1 ||
      url.indexOf('googleapis.com') !== -1 ||
      url.indexOf('gstatic.com') !== -1 ||
      url.indexOf('unpkg.com') !== -1 ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;

      return fetch(event.request).then(function (networkResponse) {
        // خزّن نسخة من الملفات المحلية فقط
        if (networkResponse && networkResponse.status === 200 && url.indexOf(self.location.origin) !== -1) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function () {
        // إذا فشل الاتصال وكان الطلب لصفحة → ارجع index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ============================================
// 🔔 استقبال الإشعارات Push (FCM-ready)
// ============================================
self.addEventListener('push', function (event) {
  console.log('[SW v14] إشعار جديد وصل');

  var data = {
    title: 'توصيل طبي',
    body: 'لديك إشعار جديد',
    orderId: null,
    type: 'order'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  var options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.type + '-' + (data.orderId || Date.now()),
    requireInteraction: true,
    data: {
      orderId: data.orderId,
      type: data.type,
      url: data.url || '/'
    },
    actions: [
      { action: 'accept', title: '✅ قبول' },
      { action: 'reject', title: '❌ رفض' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// 👆 عند الضغط على الإشعار
// ============================================
self.addEventListener('notificationclick', function (event) {
  console.log('[SW v14] تم الضغط على الإشعار');
  event.notification.close();

  var action = event.action;
  var data = event.notification.data || {};
  var orderId = data.orderId;

  if (action === 'reject') {
    console.log('[SW v14] رفض الطلب #' + orderId);
    return;
  }

  var urlToOpen = '/?order=' + orderId + '&action=' + (action || 'open');

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action: action,
            orderId: orderId
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// 💬 رسائل من التطبيق الرئيسي
// ============================================
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    var data = event.data.payload;
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: data.vibrate || [200, 100, 200],
      tag: data.tag || 'tawseel-tibbi-' + Date.now(),
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: data.actions || []
    });
  }
});
