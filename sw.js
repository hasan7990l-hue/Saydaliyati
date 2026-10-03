// ============================================
// صيدليتي - Service Worker v1
// يعمل في الخلفية حتى لو التطبيق مغلق
// ============================================

var CACHE_NAME = 'saydaliyati-v1';
var urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('[SW] تثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('[SW] تفعيل...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات (Caching)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// ============================================
// 🔔 استقبال الإشعارات Push
// ============================================
self.addEventListener('push', function(event) {
  console.log('[SW] إشعار جديد وصل');
  
  var data = {
    title: 'صيدليتي',
    body: 'لديك إشعار جديد',
    orderId: null,
    type: 'order'
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
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
      {
        action: 'accept',
        title: '✅ قبول',
        icon: '/accept.png'
      },
      {
        action: 'reject',
        title: '❌ رفض',
        icon: '/reject.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// 👆 عند الضغط على الإشعار
// ============================================
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] تم الضغط على الإشعار');
  event.notification.close();
  
  var action = event.action;
  var data = event.notification.data || {};
  var orderId = data.orderId;
  
  if (action === 'reject') {
    // المستخدم رفض
    console.log('[SW] رفض الطلب #' + orderId);
    return;
  }
  
  // قبول أو ضغط عادي - فتح التطبيق
  var urlToOpen = '/?order=' + orderId + '&action=' + (action || 'open');
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // إذا التطبيق مفتوح - ركّز عليه
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
      // إذا التطبيق مغلق - افتحه
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// 💬 رسائل من التطبيق الرئيسي
// ============================================
self.addEventListener('message', function(event) {
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
      tag: data.tag || 'saydaliyati-' + Date.now(),
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: data.actions || []
    });
  }
});
