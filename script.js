// ============================================
// توصيل طبي - v14
// Firebase-First Architecture + Real-Time
// الجزء 1 من 4: Config + Firestore + Auth + Storage + Theme + Audio + Particles
// ============================================

console.log('توصيل طبي v14 - بدأ التحميل');

// ============================================
// 🔥 Firebase — التهيئة والتصدير العالمي
// ============================================
(function initFirebase() {
  if (typeof window === 'undefined') return;

  // Firebase SDK محمّلة عبر module في index.html
  // هذا المكان فقط نتحقق من الجاهزية

  window.firebaseReady = false;

  window.addEventListener('load', function () {
    var checkInterval = setInterval(function () {
      if (window.firebaseDB && window.firebaseAuth) {
        window.firebaseReady = true;
        console.log('✅ Firebase جاهز للاستخدام');
        clearInterval(checkInterval);
      }
    }, 100);

    setTimeout(function () {
      clearInterval(checkInterval);
      if (!window.firebaseReady) {
        console.warn('⚠️ Firebase لم يجهز خلال 5 ثواني — التطبيق سيعمل بـ LocalStorage');
      }
    }, 5000);
  });
})();

function isFirebaseReady() {
  return !!(window.firebaseDB && window.firebaseAuth && window.firebaseCollection);
}

// ============================================
// 🔥 Firestore — Collections
// ============================================
var COLLECTIONS = {
  USERS: 'users',
  PHARMACIES: 'pharmacies',
  ORDERS: 'orders',
  RATINGS: 'ratings',
  POSTS: 'posts',
  NOTIFICATIONS: 'notifications',
  INVENTORY: 'inventory',
  DELIVERY: 'delivery'
};

// ============================================
// 🔥 Firestore — Users
// ============================================
async function saveUserToFirestore(userData) {
  if (!isFirebaseReady()) return null;

  try {
    var userId = userData.googleId || userData.phone || ('user_' + Date.now());
    var userRef = window.firebaseDoc(window.firebaseDB, COLLECTIONS.USERS, userId);

    await window.firebaseSetDoc(userRef, Object.assign({}, userData, {
      updatedAt: new Date().toISOString()
    }), { merge: true });

    console.log('✅ تم حفظ المستخدم:', userId);
    return userId;
  } catch (error) {
    console.error('❌ خطأ حفظ المستخدم:', error);
    return null;
  }
}

async function getUserFromFirestore(userId) {
  if (!isFirebaseReady()) return null;

  try {
    var userRef = window.firebaseDoc(window.firebaseDB, COLLECTIONS.USERS, userId);
    var snap = await window.firebaseGetDoc(userRef);

    if (snap.exists()) {
      return Object.assign({ id: snap.id }, snap.data());
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ جلب المستخدم:', error);
    return null;
  }
}

async function getAllUsersFromFirestore() {
  if (!isFirebaseReady()) return [];

  try {
    var snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.USERS)
    );

    var users = [];
    snapshot.forEach(function (doc) {
      users.push(Object.assign({ id: doc.id }, doc.data()));
    });
    return users;
  } catch (error) {
    console.error('❌ خطأ جلب المستخدمين:', error);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Pharmacies
// ============================================
async function savePharmacyToFirestore(pharmacyData) {
  if (!isFirebaseReady()) return null;

  try {
    var pharmacyRef = window.firebaseDoc(
      window.firebaseDB,
      COLLECTIONS.PHARMACIES,
      pharmacyData.phone
    );

    await window.firebaseSetDoc(pharmacyRef, {
      name: pharmacyData.name,
      owner: pharmacyData.owner || '',
      phone: pharmacyData.phone,
      address: pharmacyData.address,
      license: pharmacyData.license || '',
      rating: pharmacyData.rating || 5.0,
      logo: pharmacyData.logo || 'ص',
      color: pharmacyData.color || 'green',
      deliveryTime: pharmacyData.deliveryTime || '30 دقيقة',
      lat: pharmacyData.lat || 33.3152,
      lng: pharmacyData.lng || 44.3661,
      active: pharmacyData.active !== undefined ? pharmacyData.active : true,
      createdAt: pharmacyData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ تم حفظ الصيدلية:', pharmacyData.name);
    return pharmacyData.phone;
  } catch (error) {
    console.error('❌ خطأ حفظ الصيدلية:', error);
    return null;
  }
}

async function loadPharmaciesFromFirestore() {
  if (!isFirebaseReady()) {
    console.log('⚠️ Firestore غير جاهز — استخدام LocalStorage');
    return loadPharmaciesFromLocal();
  }

  try {
    var snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.PHARMACIES)
    );

    var pharmacies = [];
    snapshot.forEach(function (doc) {
      var data = doc.data();
      if (data.active !== false) {
        pharmacies.push(Object.assign({ id: doc.id }, data));
      }
    });

    console.log('✅ تم جلب', pharmacies.length, 'صيدلية من Firestore');
    return pharmacies;
  } catch (error) {
    console.error('❌ خطأ جلب الصيدليات:', error);
    return loadPharmaciesFromLocal();
  }
}
function loadPharmaciesFromLocal() {
  try {
    var local = JSON.parse(localStorage.getItem('saydaliyati_pharmacies_cache') || '[]');
    if (local.length > 0) return local;
  } catch (e) {}
  return [];
}
async function loadPharmaciesForPatient() {
  console.log('🔄 loadPharmaciesForPatient...');

  var container = document.getElementById('pharmacyListContainer');
  if (!container) {
    console.error('❌ pharmacyListContainer غير موجود');
    return;
  }

  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">⏳ جاري التحميل...</div>';

  try {
    var pharmacies = await loadPharmaciesFromFirestore();

    // cache
    try {
      localStorage.setItem('saydaliyati_pharmacies_cache', JSON.stringify(pharmacies));
    } catch (e) {}

    if (pharmacies.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">لا توجد صيدليات متاحة حالياً</div>';
      return;
    }

    var html = '';
    pharmacies.forEach(function (p) {
      var color = p.color === 'blue' ? '#2563EB' :
                  p.color === 'orange' ? '#F59E0B' :
                  p.color === 'purple' ? '#8B5CF6' : '#10B981';
      var logo = p.logo || 'ص';
      var rating = p.rating || 5.0;
      var deliveryTime = p.deliveryTime || '30 دقيقة';
      var address = p.address || 'بغداد';
      var name = (p.name || 'صيدلية').replace(/'/g, "\\'");

      html +=
        '<div class="pharmacy-card">' +
          '<div class="pharmacy-logo" style="background:' + color + ';color:white;">' + logo + '</div>' +
          '<div class="pharmacy-info">' +
            '<h4>' + p.name + '</h4>' +
            '<p>' + address + '</p>' +
            '<div class="pharmacy-meta">' +
              '<span class="rating">' + rating + ' ★</span>' +
              '<span class="badge">توصيل ' + deliveryTime + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="btn-order" onclick="orderFromPharmacy(\'' + p.id + '\', \'' + name + '\')">اطلب</button>' +
        '</div>';
    });

    container.innerHTML = html;
    console.log('✅ عرض', pharmacies.length, 'صيدلية');
  } catch (error) {
    console.error('❌ خطأ عرض الصيدليات:', error);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">حدث خطأ: ' + error.message + '</div>';
  }
}

function orderFromPharmacy(pharmacyId, pharmacyName) {
  localStorage.setItem('saydaliyati_selected_pharmacy', JSON.stringify({
    id: pharmacyId,
    name: pharmacyName
  }));

  showToast('🛒 ستنشئ طلباً من: ' + pharmacyName);

  setTimeout(function () {
    openCartScreen();
  }, 500);
}

// ============================================
// 🔥 Firestore — Orders
// ============================================
async function saveOrderToFirestore(orderData) {
  if (!isFirebaseReady()) return null;

  try {
    var orderRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.ORDERS),
      Object.assign({}, orderData, {
        createdAt: new Date().toISOString(),
        status: orderData.status || 'pending'
      })
    );

    console.log('✅ تم حفظ الطلب:', orderRef.id);
    return orderRef.id;
  } catch (error) {
    console.error('❌ خطأ حفظ الطلب:', error);
    return null;
  }
}

async function updateOrderInFirestore(orderId, updates) {
  if (!isFirebaseReady()) return false;

  try {
    var orderRef = window.firebaseDoc(window.firebaseDB, COLLECTIONS.ORDERS, orderId);
    await window.firebaseUpdateDoc(orderRef, Object.assign({}, updates, {
      updatedAt: new Date().toISOString()
    }));
    console.log('✅ تم تحديث الطلب:', orderId);
    return true;
  } catch (error) {
    console.error('❌ خطأ تحديث الطلب:', error);
    return false;
  }
}

async function getUserOrdersFromFirestore(userPhone) {
  if (!isFirebaseReady()) return [];

  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.ORDERS),
      window.firebaseWhere('patientPhone', '==', userPhone)
    );
    var snapshot = await window.firebaseGetDocs(q);

    var orders = [];
    snapshot.forEach(function (doc) {
      orders.push(Object.assign({ id: doc.id }, doc.data()));
    });

    orders.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return orders;
  } catch (error) {
    console.error('❌ خطأ جلب طلبات المستخدم:', error);
    return [];
  }
}

async function getPharmacyOrdersFromFirestore(pharmacyName) {
  if (!isFirebaseReady()) return [];

  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.ORDERS),
      window.firebaseWhere('pharmacy', '==', pharmacyName)
    );
    var snapshot = await window.firebaseGetDocs(q);

    var orders = [];
    snapshot.forEach(function (doc) {
      orders.push(Object.assign({ id: doc.id }, doc.data()));
    });

    orders.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return orders;
  } catch (error) {
    console.error('❌ خطأ جلب طلبات الصيدلية:', error);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Ratings
// ============================================
async function saveRatingToFirestore(ratingData) {
  if (!isFirebaseReady()) return null;

  try {
    var ratingRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.RATINGS),
      Object.assign({}, ratingData, {
        createdAt: new Date().toISOString()
      })
    );

    console.log('✅ تم حفظ التقييم:', ratingRef.id);
    return ratingRef.id;
  } catch (error) {
    console.error('❌ خطأ حفظ التقييم:', error);
    return null;
  }
}

async function getUserRatingsFromFirestore(userPhone) {
  if (!isFirebaseReady()) return [];

  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.RATINGS),
      window.firebaseWhere('fromPhone', '==', userPhone)
    );
    var snapshot = await window.firebaseGetDocs(q);

    var ratings = [];
    snapshot.forEach(function (doc) {
      ratings.push(Object.assign({ id: doc.id }, doc.data()));
    });

    ratings.sort(function (a, b) {
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });

    return ratings;
  } catch (error) {
    console.error('❌ خطأ جلب التقييمات:', error);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Posts (Offers Feed)
// ============================================
async function savePostToFirestore(postData) {
  if (!isFirebaseReady()) return null;

  try {
    var postRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.POSTS),
      postData
    );

    console.log('✅ تم حفظ العرض:', postRef.id);
    return postRef.id;
  } catch (error) {
    console.error('❌ خطأ حفظ العرض:', error);
    return null;
  }
}

async function loadPostsFromFirestore() {
  if (!isFirebaseReady()) {
    return loadPostsFromLocal();
  }

  try {
    var snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.POSTS)
    );

    var posts = [];
    snapshot.forEach(function (doc) {
      var data = doc.data();
      if (data.active !== false) {
        posts.push(Object.assign({ id: doc.id }, data));
      }
    });

    posts.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    console.log('✅ تم جلب', posts.length, 'عرض من Firestore');
    return posts;
  } catch (error) {
    console.error('❌ خطأ جلب العروض:', error);
    return loadPostsFromLocal();
  }
}

function loadPostsFromLocal() {
  try {
    return JSON.parse(localStorage.getItem('saydaliyati_posts') || '[]');
  } catch (e) {
    return [];
  }
}

// ============================================
// 🔥 Firebase Storage — رفع الصور
// ============================================
async function uploadImageToStorage(base64Data, path) {
  if (!window.firebaseStorage || !window.firebaseRef || !window.firebaseUploadBytes || !window.firebaseGetDownloadURL) {
    console.log('⚠️ Firebase Storage غير جاهز — استخدام base64');
    return base64Data;
  }

  try {
    var storageRef = window.firebaseRef(window.firebaseStorage, path);
    var response = await fetch(base64Data);
    var blob = await response.blob();

    await window.firebaseUploadBytes(storageRef, blob);
    var url = await window.firebaseGetDownloadURL(storageRef);

    console.log('✅ تم رفع الصورة:', url);
    return url;
  } catch (error) {
    console.error('❌ خطأ رفع الصورة:', error);
    return base64Data;
  }
}

// ============================================
// 🔥 Firebase Auth — Google Sign-In
// ============================================
async function signInWithGoogleTest() {
  showToast('🔄 جاري الاتصال بـ Google...');

  if (!isFirebaseReady() || !window.firebaseProvider || !window.firebaseSignInWithPopup) {
    showError('Firebase غير جاهز. حاول لاحقاً.');
    return;
  }

  try {
    var result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseProvider);
    var user = result.user;

    console.log('✅ تم تسجيل الدخول:', user);

    var userData = {
      type: 'patient',
      name: user.displayName || 'مستخدم Google',
      phone: user.phoneNumber || '',
      email: user.email || '',
      address: '',
      avatar: user.photoURL || '',
      googleId: user.uid,
      loginMethod: 'google',
      date: new Date().toISOString()
    };

    // حاول جلب بيانات المستخدم من Firestore أولاً
    var existing = await getUserFromFirestore(user.uid);
    if (existing) {
      userData = Object.assign({}, userData, existing);
    } else {
      await saveUserToFirestore(userData);
    }

    localStorage.setItem('saydaliyati_current_user', JSON.stringify(userData));

    playSuccessSound();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    showToast('✅ تم الدخول بنجاح');

    setTimeout(function () {
      goToDashboardByType();
    }, 800);
  } catch (error) {
    console.error('❌ خطأ Google Sign-In:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      showToast('⚠️ تم إغلاق نافذة Google');
    } else if (error.code === 'auth/unauthorized-domain') {
      showError('النطاق غير مصرح به. أضف النطاق في Firebase Console.');
    } else {
      showError('فشل الدخول: ' + error.message);
    }
  }
}

async function signUpWithGoogleTest() {
  showToast('🔄 جاري الاتصال بـ Google...');

  if (!isFirebaseReady() || !window.firebaseProvider || !window.firebaseSignInWithPopup) {
    showError('Firebase غير جاهز. حاول لاحقاً.');
    return;
  }

  try {
    var result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseProvider);
    var user = result.user;

    var userData = {
      type: 'patient',
      name: user.displayName || 'مستخدم Google',
      phone: user.phoneNumber || '',
      email: user.email || '',
      address: '',
      avatar: user.photoURL || '',
      googleId: user.uid,
      loginMethod: 'google',
      date: new Date().toISOString()
    };

    await saveUserToFirestore(userData);
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(userData));

    // احفظ في local أيضاً
    var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    var exists = registrations.some(function (r) { return r.email === userData.email; });
    if (!exists) {
      registrations.push(userData);
      localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
    }

    playSuccessSound();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    showToast('✅ تم التسجيل بنجاح');

    setTimeout(function () {
      goToDashboardByType();
    }, 800);
  } catch (error) {
    console.error('❌ خطأ Google Sign-Up:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      showToast('⚠️ تم إغلاق نافذة Google');
    } else if (error.code === 'auth/popup-blocked') {
      showError('المتصفح منع النافذة المنبثقة.');
    } else if (error.code === 'auth/unauthorized-domain') {
      showError('النطاق غير مصرح به. أضف النطاق في Firebase Console.');
    } else {
      showError('فشل التسجيل: ' + error.message);
    }
  }
}

async function signOutFromFirebase() {
  if (!window.firebaseAuth || !window.firebaseSignOut) return;
  try {
    await window.firebaseSignOut(window.firebaseAuth);
    console.log('✅ تم تسجيل الخروج من Firebase');
  } catch (e) {
    console.warn('⚠️ خطأ تسجيل الخروج من Firebase:', e);
  }
}

// ============================================
// 🌙 نظام الوضع الليلي (Theme)
// ============================================
function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'light';
  var newTheme = current === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('saydaliyati_theme', newTheme);

  var icons = document.querySelectorAll('.theme-icon');
  icons.forEach(function (icon) {
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  var darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = newTheme === 'dark';

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', newTheme === 'dark' ? '#050810' : '#F8FAFC');
  }

  // تحديث خلفية شاشات الـ Hero
  var bodyBg = newTheme === 'dark' ? '#050810' : '#F8FAFC';
  document.body.style.background = bodyBg;

  // أحدّث خريطة Leaflet إن كانت مفتوحة
  if (typeof mainMap !== 'undefined' && mainMap) {
    setTimeout(function () {
      mainMap.invalidateSize();
    }, 300);
  }
  if (typeof trackingMap !== 'undefined' && trackingMap) {
    setTimeout(function () {
      trackingMap.invalidateSize();
    }, 300);
  }
}

function loadTheme() {
  var saved = localStorage.getItem('saydaliyati_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  var icons = document.querySelectorAll('.theme-icon');
  icons.forEach(function (icon) {
    icon.textContent = saved === 'dark' ? '☀️' : '🌙';
  });

  var darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = saved === 'dark';

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', saved === 'dark' ? '#050810' : '#F8FAFC');
  }

  var bodyBg = saved === 'dark' ? '#050810' : '#F8FAFC';
  document.body.style.background = bodyBg;
}

// ============================================
// 🔊 الأصوات (Web Audio API)
// ============================================
var audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('الصوت غير مدعوم');
    }
  }
  return audioCtx;
}

function playSonarPing() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function playAlertDing() {
  try {
    var ctx = initAudio();
    if (!ctx) return;

    var osc1 = ctx.createOscillator();
    var g1 = ctx.createGain();
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.frequency.value = 1200;
    osc1.type = 'triangle';
    g1.gain.setValueAtTime(0.3, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.frequency.value = 1600;
    osc2.type = 'triangle';
    g2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    g2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1);
  } catch (e) {}
}

function playSuccessSound() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var notes = [523, 659, 784];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      var startTime = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.setValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch (e) {}
}

function playRadarActivateSound() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function vibrateDevice(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ============================================
// 🎬 إنشاء الجزيئات
// ============================================
function createSplashParticles() {
  var container = document.getElementById('splashParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 35; i++) {
    var p = document.createElement('div');
    p.className = 'splash-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

function createLoginParticles() {
  var container = document.getElementById('loginParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'login-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

function createRoleParticles() {
  var container = document.getElementById('roleParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'role-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

function createRegParticles(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div');
    p.className = 'reg-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

// ============================================
// 💬 Toast + Errors
// ============================================
function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function () { toast.classList.add('show'); }, 50);
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 300);
  }, 2200);
}

function showError(message) {
  alert('تنبيه: ' + message);
}

// ============================================
// 🎉 نهاية الجزء 1 من script.js
// ============================================
console.log('توصيل طبي v14 — الجزء 1 اكتمل');
// ============================================
// توصيل طبي - v14
// الجزء 2 من 4: Screens + Nav + Forms + Login + Registration
// ============================================

// ============================================
// 🧭 Bottom Sheet — Waze / Google
// ============================================
var pendingOrderDestination = null;

function openNavSheet(lat, lng, destinationType) {
  pendingOrderDestination = {
    lat: lat,
    lng: lng,
    type: destinationType || 'صيدلية'
  };

  var destEl = document.getElementById('navDestination');
  if (destEl) {
    destEl.textContent = '📍 الوجهة: ' + (destinationType || 'صيدلية');
  }

  var sheet = document.getElementById('navSheet');
  var overlay = document.getElementById('navSheetOverlay');

  if (overlay) overlay.classList.add('active');
  if (sheet) sheet.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (navigator.vibrate) navigator.vibrate([50]);
}

function closeNavSheet() {
  var sheet = document.getElementById('navSheet');
  var overlay = document.getElementById('navSheetOverlay');
  if (overlay) overlay.classList.remove('active');
  if (sheet) sheet.classList.remove('active');
  document.body.style.overflow = '';
}

function chooseNavigation(type) {
  if (!pendingOrderDestination) {
    showToast('⚠️ لا توجد وجهة');
    closeNavSheet();
    return;
  }

  var lat = pendingOrderDestination.lat;
  var lng = pendingOrderDestination.lng;

  closeNavSheet();

  setTimeout(function () {
    if (type === 'waze') openWazeDirect(lat, lng);
    else if (type === 'google') openGoogleDirect(lat, lng);
    else if (type === 'map') openMapDirect(lat, lng);
  }, 400);
}

function openWazeDirect(lat, lng) {
  var wazeUrl = 'https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes&zoom=17';
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /android/i.test(ua);

  if (isIOS) {
    window.location.href = 'waze://?ll=' + lat + ',' + lng + '&navigate=yes';
    setTimeout(function () { window.open(wazeUrl, '_blank'); }, 1500);
  } else if (isAndroid) {
    window.location.href = 'intent://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes#Intent;scheme=https;package=com.waze;end';
    setTimeout(function () { window.open(wazeUrl, '_blank'); }, 1500);
  } else {
    window.open(wazeUrl, '_blank');
  }

  showToast('🚗 جارٍ فتح Waze...');
}

function openGoogleDirect(lat, lng) {
  var url = 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '&travelmode=driving';
  window.open(url, '_blank');
  showToast('🗺️ جارٍ فتح Google Maps...');
}

function openMapDirect(lat, lng) {
  openMapScreen();
  setTimeout(function () {
    if (typeof mainMap !== 'undefined' && mainMap) {
      mainMap.setView([lat, lng], 16);
    }
  }, 500);
  showToast('📍 عرض على الخريطة');
}

// ============================================
// 🚀 بدء الطلب (للمندوب) — نسخة Firestore
// ============================================
var orderLocationsCache = {};

async function startOrder(orderId) {
  // حاول جلب الطلب من Firestore أولاً
  var order = orderLocationsCache[orderId];

  if (!order && isFirebaseReady()) {
    try {
      var orderRef = window.firebaseDoc(window.firebaseDB, COLLECTIONS.ORDERS, String(orderId));
      var snap = await window.firebaseGetDoc(orderRef);
      if (snap.exists()) {
        order = snap.data();
        orderLocationsCache[orderId] = order;
      }
    } catch (e) {
      console.warn('⚠️ خطأ جلب الطلب:', e);
    }
  }

  // Fallback — بيانات تجريبية
  if (!order) {
    var demo = {
      1234: { pharmacy: { lat: 33.3000, lng: 44.4000, name: 'صيدلية النور' }, customer: { lat: 33.3152, lng: 44.3661, name: 'أحمد علي - الجادرية' } },
      1235: { pharmacy: { lat: 33.2800, lng: 44.3800, name: 'صيدلية الحياة' }, customer: { lat: 33.3200, lng: 44.3700, name: 'سارة محمد - الكرادة' } },
      1236: { pharmacy: { lat: 33.3300, lng: 44.3500, name: 'صيدلية الشفاء' }, customer: { lat: 33.3100, lng: 44.3900, name: 'علي حسن - الكاظمية' } }
    };
    order = demo[orderId];
  }

  if (!order) {
    showToast('⚠️ الطلب غير موجود');
    return;
  }

  localStorage.setItem('saydaliyati_active_order', JSON.stringify({
    id: orderId,
    pharmacy: order.pharmacy,
    customer: order.customer,
    stage: 'pickup'
  }));

  if (navigator.vibrate) navigator.vibrate([50]);
  openNavSheet(order.pharmacy.lat, order.pharmacy.lng, order.pharmacy.name);
  showToast('📍 الوجهة: ' + order.pharmacy.name);
}

function goToPickup() {
  var activeOrder = JSON.parse(localStorage.getItem('saydaliyati_active_order') || '{}');
  if (!activeOrder.pharmacy) {
    showToast('⚠️ لا يوجد طلب نشط');
    return;
  }
  openNavSheet(activeOrder.pharmacy.lat, activeOrder.pharmacy.lng, activeOrder.pharmacy.name);
}

function goToCustomer() {
  var activeOrder = JSON.parse(localStorage.getItem('saydaliyati_active_order') || '{}');
  if (!activeOrder.customer) {
    showToast('⚠️ لا يوجد طلب نشط');
    return;
  }
  openNavSheet(activeOrder.customer.lat, activeOrder.customer.lng, activeOrder.customer.name);
}

// ============================================
// 📦 نافذة تفاصيل الطلب
// ============================================
var currentOrderDetails = null;

function showOrderDetails(orderId, pharmacy, distance, commission) {
  currentOrderDetails = { orderId: orderId, pharmacy: pharmacy };

  var titleEl = document.getElementById('orderDetailsTitle');
  var pharmacyEl = document.getElementById('orderDetailsPharmacy');
  var distanceEl = document.getElementById('orderDetailsDistance');
  var commissionEl = document.getElementById('orderDetailsCommission');

  if (titleEl) titleEl.textContent = 'تفاصيل الطلب #' + orderId;
  if (pharmacyEl) pharmacyEl.textContent = pharmacy;
  if (distanceEl) distanceEl.textContent = distance + ' كم';
  if (commissionEl) commissionEl.textContent = parseInt(commission).toLocaleString() + ' دينار';

  var modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (navigator.vibrate) navigator.vibrate([30]);
}

function closeOrderDetailsModal() {
  var modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentOrderDetails = null;
}

function acceptOrderFromDetails() {
  if (currentOrderDetails) {
    var orderId = currentOrderDetails.orderId;
    closeOrderDetailsModal();
    setTimeout(function () {
      acceptOrder(orderId);
    }, 300);
  }
}

async function acceptOrder(orderId) {
  playAlertDing();
  showToast('✅ تم قبول الطلب #' + orderId);

  // حدّث Firestore إن أمكن
  if (isFirebaseReady()) {
    await updateOrderInFirestore(String(orderId), {
      status: 'accepted',
      acceptedBy: 'delivery',
      acceptedAt: new Date().toISOString()
    });
  }

  // احفظ محلياً
  var accepted = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
  accepted.unshift({ id: orderId, acceptedAt: new Date().toISOString() });
  localStorage.setItem('saydaliyati_accepted_orders', JSON.stringify(accepted));

  setTimeout(function () {
    goToMyOrders();
  }, 800);
}

// ============================================
// 📱 إدارة الشاشات
// ============================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function (screen) {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'flex';
    window.scrollTo(0, 0);
    updateBottomNav(screenId);

    if (screenId === 'loginScreen') setTimeout(createLoginParticles, 100);
    if (screenId === 'roleScreen') setTimeout(createRoleParticles, 100);
    if (screenId === 'patientScreen') setTimeout(function () { createRegParticles('patientParticles'); }, 100);
    if (screenId === 'pharmacyScreen') setTimeout(function () { createRegParticles('pharmacyParticles'); }, 100);
    if (screenId === 'deliveryScreen') setTimeout(function () { createRegParticles('deliveryParticles'); }, 100);

    console.log('✅ showScreen:', screenId);
  } else {
    console.warn('❌ الشاشة غير موجودة:', screenId);
  }
}

function updateBottomNav(screenId) {
  var nav = document.getElementById('mainBottomNav');
  if (!nav) return;

  var navScreens = [
    'homeScreen',
    'pharmacyDashboard',
    'deliveryDashboard',
    'ordersScreen',
    'myOrdersScreen',
    'notificationsScreen'
  ];

  if (navScreens.indexOf(screenId) !== -1) {
    nav.style.display = 'flex';
  } else {
    nav.style.display = 'none';
  }
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });

  var activeBtn = document.querySelector('.nav-btn[data-tab="' + tab + '"]');
  if (activeBtn) activeBtn.classList.add('active');

  if (tab === 'home') goToDashboardByType();
  else if (tab === 'orders') goToMyOrders();
  else if (tab === 'notifications') openNotifications();
  else if (tab === 'more') openSidebar();
}

// ============================================
// 📋 طلباتي الديناميكية — Firestore First
// ============================================
async function goToMyOrders() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';

  var deliveryContent = document.getElementById('deliveryOrdersContent');
  var patientContent = document.getElementById('patientOrdersContent');
  var pharmacyContent = document.getElementById('pharmacyOrdersContent');

  if (deliveryContent) deliveryContent.style.display = 'none';
  if (patientContent) patientContent.style.display = 'none';
  if (pharmacyContent) pharmacyContent.style.display = 'none';

  var titleEl = document.getElementById('myOrdersTitle');
  var subtitleEl = document.getElementById('myOrdersSubtitle');

  if (userType === 'delivery') {
    if (titleEl) titleEl.textContent = 'طلباتي الذكية';
    if (subtitleEl) subtitleEl.textContent = 'ترتيب تلقائي حسب الأولوية';
    if (deliveryContent) deliveryContent.style.display = 'block';
  } else if (userType === 'pharmacy') {
    if (titleEl) titleEl.textContent = 'الطلبات الواردة';
    if (subtitleEl) subtitleEl.textContent = 'إدارة طلبات المرضى';
    if (pharmacyContent) pharmacyContent.style.display = 'block';
    await loadPharmacyOrdersIntoDOM();
  } else {
    if (titleEl) titleEl.textContent = 'طلباتي';
    if (subtitleEl) subtitleEl.textContent = 'تتبع طلباتك الحالية والسابقة';
    if (patientContent) patientContent.style.display = 'block';
    await loadPatientOrdersIntoDOM();
  }

  showScreen('myOrdersScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var ordersBtn = document.querySelector('.nav-btn[data-tab="orders"]');
  if (ordersBtn) ordersBtn.classList.add('active');
}

async function loadPatientOrdersIntoDOM() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);

  var orders = [];
  if (isFirebaseReady() && user.phone) {
    orders = await getUserOrdersFromFirestore(user.phone);
  } else {
    try {
      orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
    } catch (e) { orders = []; }
  }

  var container = document.getElementById('patientOrdersContent');
  if (!container) return;

  // ابقِ على قسم "الطلب الحالي" إن موجود، وحدّث "السابقة"
  var pastSection = container.querySelector('.order-list');
  if (!pastSection) return;

  if (orders.length === 0) {
    pastSection.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">📦</div><h3>لا توجد طلبات سابقة</h3><p>ابدأ طلبك الأول الآن</p></div>';
    return;
  }

  var html = '';
  orders.forEach(function (o) {
    var status = o.status === 'delivered' ? 'تم التسليم ✓' :
                 o.status === 'accepted' ? 'قيد التوصيل 🚴' :
                 o.status === 'rejected' ? 'مرفوض ✗' : 'قيد المراجعة';
    var statusClass = o.status === 'delivered' ? 'available' : 'new';
    var total = (o.total || 0).toLocaleString();
    var date = o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-IQ') : '-';

    html +=
      '<div class="order-card">' +
        '<div class="order-top">' +
          '<span class="order-id">طلب #' + o.id + '</span>' +
          '<span class="order-status ' + statusClass + '">' + status + '</span>' +
        '</div>' +
        '<div class="order-info">' +
          '<p><strong>الصيدلية:</strong> ' + (o.pharmacy || '-') + '</p>' +
          '<p><strong>التاريخ:</strong> ' + date + '</p>' +
          '<p><strong>الإجمالي:</strong> <span class="price">' + total + '</span> دينار</p>' +
        '</div>' +
      '</div>';
  });

  pastSection.innerHTML = html;
}

async function loadPharmacyOrdersIntoDOM() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);

  var orders = [];
  if (isFirebaseReady() && user.name) {
    orders = await getPharmacyOrdersFromFirestore(user.name);
  } else {
    try {
      orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
    } catch (e) { orders = []; }
  }

  var newSection = document.getElementById('newPharmacyOrders');
  if (!newSection) return;

  if (orders.length === 0) {
    newSection.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">💊</div><h3>لا توجد طلبات جديدة</h3></div>';
    return;
  }

  var html = '<div class="order-list">';
  orders.forEach(function (o) {
    var items = (o.items || []).map(function (i) { return i.name + ' (' + i.quantity + ')'; }).join('، ');
    var total = (o.total || 0).toLocaleString();

    html +=
      '<div class="order-card">' +
        '<div class="order-top">' +
          '<span class="order-id">طلب #' + o.id + '</span>' +
          '<span class="order-status new">جديد</span>' +
        '</div>' +
        '<div class="order-info">' +
          '<p><strong>المريض:</strong> ' + (o.patientName || '-') + '</p>' +
          '<p><strong>الهاتف:</strong> ' + (o.patientPhone || '-') + '</p>' +
          '<p><strong>العنوان:</strong> ' + (o.address || '-') + '</p>' +
          '<p><strong>الأدوية:</strong> ' + (items || '-') + '</p>' +
          '<p><strong>الإجمالي:</strong> <span class="price">' + total + '</span> دينار</p>' +
        '</div>' +
        '<div class="order-actions">' +
          '<button class="btn-accept" onclick="acceptPharmacyOrder(\'' + o.id + '\')">قبول</button>' +
          '<button class="btn-reject" onclick="rejectPharmacyOrder(\'' + o.id + '\')">رفض</button>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';

  newSection.innerHTML = html;
}

// ============================================
// 🏪 قبول / رفض الطلبات (للصيدلية)
// ============================================
async function acceptPharmacyOrder(orderId) {
  playSuccessSound();
  showToast('تم قبول الطلب #' + orderId);

  if (isFirebaseReady()) {
    await updateOrderInFirestore(String(orderId), {
      status: 'accepted',
      acceptedBy: 'pharmacy',
      acceptedAt: new Date().toISOString()
    });
  }

  setTimeout(function () {
    showToast('تم إشعار المندوب لتوصيل الطلب');
  }, 1500);
}

async function rejectPharmacyOrder(orderId) {
  if (!confirm('هل تريد رفض الطلب #' + orderId + '؟')) return;

  if (isFirebaseReady()) {
    await updateOrderInFirestore(String(orderId), {
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    });
  }

  showToast('تم رفض الطلب #' + orderId);
}

function switchPharmacyFilter(filter, btn) {
  document.querySelectorAll('#pharmacyOrdersContent .filter-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  var newSection = document.getElementById('newPharmacyOrders');
  var acceptedSection = document.getElementById('acceptedPharmacyOrders');
  var doneSection = document.getElementById('donePharmacyOrders');

  if (newSection) newSection.style.display = 'none';
  if (acceptedSection) acceptedSection.style.display = 'none';
  if (doneSection) doneSection.style.display = 'none';

  if (filter === 'new' && newSection) newSection.style.display = 'block';
  else if (filter === 'accepted' && acceptedSection) acceptedSection.style.display = 'block';
  else if (filter === 'done' && doneSection) doneSection.style.display = 'block';
}

// ============================================
// 🎯 التوجيه حسب نوع المستخدم
// ============================================
function goToDashboardByType() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};

  updateUserName();

  if (user.type === 'pharmacy') {
    showScreen('pharmacyDashboard');
  } else if (user.type === 'delivery') {
    showScreen('deliveryDashboard');
  } else {
    showScreen('homeScreen');
    setTimeout(function () {
      loadOffers();
      loadPharmaciesForPatient();
      initPostsFeed();

      var addBtn = document.querySelector('.posts-feed-add-btn');
      if (addBtn) {
        addBtn.style.display = (user.type === 'pharmacy') ? 'flex' : 'none';
      }
    }, 100);
  }
}

function updateUserName() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  try {
    var user = JSON.parse(userStr);
    var userName = user.name || 'مستخدم';

    var userGreeting = document.getElementById('userGreeting');
    if (userGreeting) userGreeting.textContent = userName;

    var pharmacyGreeting = document.getElementById('pharmacyGreeting');
    if (pharmacyGreeting) pharmacyGreeting.textContent = userName;

    var deliveryGreeting = document.getElementById('deliveryGreeting');
    if (deliveryGreeting) deliveryGreeting.textContent = userName;
  } catch (e) {
    console.error('خطأ تحديث الاسم:', e);
  }
}

// ============================================
// 🔀 التنقل بين الشاشات
// ============================================
function goToSplash() { showScreen('splashScreen'); }
function goToLogin() { showScreen('loginScreen'); }
function goToRoleSelection() { showScreen('roleScreen'); }
function goToOrdersPage() { showScreen('ordersScreen'); }

function selectRole(role) {
  if (role === 'patient') showScreen('patientScreen');
  else if (role === 'pharmacy') showScreen('pharmacyScreen');
  else if (role === 'delivery') showScreen('deliveryScreen');
}

// ============================================
// 🔐 تسجيل الدخول — Firestore First
// ============================================
async function submitLogin(event) {
  if (event) event.preventDefault();

  var phone = document.getElementById('loginPhone').value.trim();
  var password = document.getElementById('loginPassword').value.trim();

  if (!phone || !password) {
    showError('املأ كل الحقول');
    return;
  }

  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح (07XXXXXXXXX)');
    return;
  }

  var user = null;

  // 1) حاول من Firestore
  if (isFirebaseReady()) {
    try {
      user = await getUserFromFirestore(phone);
    } catch (e) {
      console.log('⚠️ خطأ البحث في Firestore:', e);
    }
  }

  // 2) لو ما لقيته، دوّر في LocalStorage
  if (!user) {
    var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    user = registrations.find(function (r) { return r.phone === phone; });
  }

  if (!user) {
    showError('رقم الهاتف غير مسجل. سجل حساب جديد أولاً.');
    return;
  }

  if (user.password && user.password !== password) {
    showError('كلمة المرور غير صحيحة');
    return;
  }

  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
  playSuccessSound();
  showToast('أهلاً بك ' + (user.name || ''));

  setTimeout(function () {
    goToDashboardByType();
  }, 500);
}

// ============================================
// 🚪 تسجيل الخروج
// ============================================
async function logout() {
  if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;

  localStorage.removeItem('saydaliyati_current_user');

  if (typeof radarActive !== 'undefined' && radarActive) {
    radarActive = false;
    if (typeof radarInterval !== 'undefined' && radarInterval) clearInterval(radarInterval);
    if (typeof orderSimulationInterval !== 'undefined' && orderSimulationInterval) clearInterval(orderSimulationInterval);
  }

  if (typeof stopRadarSystem === 'function') {
    stopRadarSystem();
  }

  await signOutFromFirebase();

  closeSidebar();
  goToSplash();
  showToast('تم تسجيل الخروج');
}

// ============================================
// 📝 إرسال النماذج — Registration Forms
// ============================================
async function submitPatient(event) {
  if (event) event.preventDefault();

  var name = document.getElementById('patientName').value.trim();
  var phone = document.getElementById('patientPhone').value.trim();
  var email = document.getElementById('patientEmail').value.trim();
  var address = document.getElementById('patientAddress').value.trim();
  var password = document.getElementById('patientPassword').value.trim();

  if (!name || !phone || !address || !password) {
    showError('املأ الحقول الإلزامية');
    return;
  }

  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح');
    return;
  }

  if (password.length < 6) {
    showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  var user = {
    type: 'patient',
    name: name,
    phone: phone,
    email: email,
    address: address,
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try {
    await saveUserToFirestore(user);
  } catch (e) {
    console.warn('⚠️ خطأ حفظ المستخدم:', e);
  }

  playSuccessSound();
  showSuccessMessage('تم إنشاء حسابك', 'أهلاً بك في توصيل طبي، ' + name);
}

async function submitPharmacy(event) {
  if (event) event.preventDefault();

  var name = document.getElementById('pharmacyName').value.trim();
  var owner = document.getElementById('ownerName').value.trim();
  var phone = document.getElementById('pharmacyPhone').value.trim();
  var address = document.getElementById('pharmacyAddress').value.trim();
  var license = document.getElementById('licenseNumber').value.trim();
  var password = document.getElementById('pharmacyPassword').value.trim();

  if (!name || !owner || !phone || !address || !license || !password) {
    showError('املأ الحقول الإلزامية');
    return;
  }

  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح');
    return;
  }

  if (password.length < 6) {
    showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  var user = {
    type: 'pharmacy',
    name: name,
    owner: owner,
    phone: phone,
    email: '',
    address: address,
    license: license,
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try {
    await saveUserToFirestore(user);
    await savePharmacyToFirestore({
      name: name,
      owner: owner,
      phone: phone,
      address: address,
      license: license,
      rating: 5.0,
      logo: 'ص',
      color: 'green',
      deliveryTime: '30 دقيقة',
      active: true
    });
  } catch (e) {
    console.warn('⚠️ خطأ حفظ الصيدلية:', e);
  }

  playSuccessSound();
  showSuccessMessage('تم استلام طلبك', 'سنتواصل معك خلال 24 ساعة');
}

async function submitDelivery(event) {
  if (event) event.preventDefault();

  var name = document.getElementById('deliveryName').value.trim();
  var phone = document.getElementById('deliveryPhone').value.trim();
  var email = document.getElementById('deliveryEmail').value.trim();
  var area = document.getElementById('deliveryArea').value.trim();
  var vehicle = document.getElementById('vehicleType').value;
  var password = document.getElementById('deliveryPassword').value.trim();

  if (!name || !phone || !area || !vehicle || !password) {
    showError('املأ الحقول الإلزامية');
    return;
  }

  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح');
    return;
  }

  if (password.length < 6) {
    showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  var user = {
    type: 'delivery',
    name: name,
    phone: phone,
    email: email,
    area: area,
    vehicle: vehicle,
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try {
    await saveUserToFirestore(user);
  } catch (e) {
    console.warn('⚠️ خطأ حفظ المستخدم:', e);
  }

  playSuccessSound();
  showSuccessMessage('مرحباً بك في فريقنا', 'سنتواصل معك قريباً');
}

// ============================================
// 💾 حفظ التسجيلات محلياً
// ============================================
function saveRegistration(data) {
  data.date = data.date || new Date().toISOString();
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');

  // لا تكرر
  var existsIdx = registrations.findIndex(function (r) { return r.phone === data.phone; });
  if (existsIdx !== -1) {
    registrations[existsIdx] = data;
  } else {
    registrations.push(data);
  }

  localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
}

// ============================================
// ✅ التحقق من رقم الهاتف
// ============================================
function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// ============================================
// 👁️ إظهار/إخفاء كلمة المرور
// ============================================
function togglePasswordVisibility(inputId, button) {
  var input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    button.innerHTML = '<span>🙈</span>';
  } else {
    input.type = 'password';
    button.innerHTML = '<span>👁️</span>';
  }
}

// ============================================
// 🔒 فحص قوة كلمة المرور
// ============================================
function checkPasswordStrength(inputId, strengthId) {
  var input = document.getElementById(inputId);
  var strengthEl = document.getElementById(strengthId);
  if (!input || !strengthEl) return;

  var password = input.value;
  var score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  strengthEl.className = 'reg-strength';

  if (password.length === 0) {
    strengthEl.textContent = '';
  } else if (score <= 2) {
    strengthEl.textContent = 'ضعيفة - استخدم 6 أحرف على الأقل';
    strengthEl.classList.add('weak');
  } else if (score <= 4) {
    strengthEl.textContent = 'متوسطة';
    strengthEl.classList.add('medium');
  } else {
    strengthEl.textContent = 'قوية';
    strengthEl.classList.add('strong');
  }
}

// ============================================
// ✅ رسائل النجاح
// ============================================
function showSuccessMessage(title, message) {
  var overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  overlay.innerHTML =
    '<div class="success-box">' +
      '<div class="success-icon">✓</div>' +
      '<h2>' + title + '</h2>' +
      '<p>' + message + '</p>' +
      '<button class="btn-primary" onclick="closeSuccessAndGo()">حسناً</button>' +
    '</div>';
  document.body.appendChild(overlay);

  setTimeout(function () { overlay.classList.add('show'); }, 50);
}

function closeSuccess() {
  var overlay = document.querySelector('.success-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function () { overlay.remove(); }, 300);
  }
}

function closeSuccessAndGo() {
  closeSuccess();
  setTimeout(goToDashboardByType, 300);
}

// ============================================
// 🎉 نهاية الجزء 2 من script.js
// ============================================
console.log('توصيل طبي v14 — الجزء 2 اكتمل');
// ============================================
// توصيل طبي - v14
// الجزء 3 من 4: Profile + Ratings + Notifications + Offers + Prescription + Cart
// ============================================

// ============================================
// 👤 الملف الشخصي
// ============================================
function openProfile() {
  closeSidebar();

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};

  var avatarText = 'م';
  var typeLabel = 'مريض';

  if (user.type === 'pharmacy') { avatarText = 'ص'; typeLabel = 'صيدلية'; }
  else if (user.type === 'delivery') { avatarText = 'د'; typeLabel = 'دليفري'; }

  var avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    if (user.avatar) {
      avatarEl.textContent = '';
      avatarEl.style.backgroundImage = 'url(' + user.avatar + ')';
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.textContent = avatarText;
      avatarEl.style.backgroundImage = '';
    }
  }

  var nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = user.name || 'مستخدم';

  var roleEl = document.getElementById('profileType');
  if (roleEl) {
    if (user.type === 'delivery' && user.vehicle) roleEl.textContent = 'دليفري • ' + user.vehicle;
    else if (user.type === 'pharmacy') roleEl.textContent = 'صيدلية';
    else roleEl.textContent = typeLabel;
  }

  var infoPhone = document.getElementById('infoPhone');
  var infoEmail = document.getElementById('infoEmail');
  var infoAddress = document.getElementById('infoAddress');
  var infoVehicle = document.getElementById('infoVehicle');
  var infoLicense = document.getElementById('infoLicense');
  var infoDate = document.getElementById('infoDate');

  if (infoPhone) infoPhone.textContent = user.phone || '-';
  if (infoEmail) infoEmail.textContent = user.email || 'غير مضاف';

  var addressRow = document.getElementById('addressRow');
  var vehicleRow = document.getElementById('vehicleRow');
  var licenseRow = document.getElementById('licenseRow');
  var emailRow = document.getElementById('emailRow');
  var addressLabel = document.getElementById('addressLabel');

  if (addressRow) addressRow.style.display = 'none';
  if (vehicleRow) vehicleRow.style.display = 'none';
  if (licenseRow) licenseRow.style.display = 'none';
  if (emailRow) emailRow.style.display = 'flex';

  if (user.type === 'patient') {
    if (addressLabel) addressLabel.textContent = 'العنوان';
    if (infoAddress) infoAddress.textContent = user.address || '-';
    if (addressRow) addressRow.style.display = 'flex';
  } else if (user.type === 'pharmacy') {
    if (addressLabel) addressLabel.textContent = 'العنوان';
    if (infoAddress) infoAddress.textContent = user.address || '-';
    if (infoLicense) infoLicense.textContent = user.license || '-';
    if (addressRow) addressRow.style.display = 'flex';
    if (licenseRow) licenseRow.style.display = 'flex';
  } else if (user.type === 'delivery') {
    if (addressLabel) addressLabel.textContent = 'المنطقة';
    if (infoAddress) infoAddress.textContent = user.area || '-';
    if (infoVehicle) infoVehicle.textContent = user.vehicle || '-';
    if (addressRow) addressRow.style.display = 'flex';
    if (vehicleRow) vehicleRow.style.display = 'flex';
  }

  if (infoDate) {
    if (user.date) {
      infoDate.textContent = new Date(user.date).toLocaleDateString('ar-IQ');
    } else {
      infoDate.textContent = '-';
    }
  }

  renderMyRatings();
  showScreen('profileScreen');
}

// ============================================
// 🖼️ تعديل صورة الملف الشخصي
// ============================================
function openImagePicker() {
  var input = document.getElementById('avatarInput');
  if (input) input.click();
}

async function handleAvatarUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showError('حجم الصورة كبير جداً - الحد الأقصى 2MB');
    return;
  }

  var reader = new FileReader();
  reader.onload = async function (e) {
    var imageData = e.target.result;

    var avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) {
      avatarEl.textContent = '';
      avatarEl.style.backgroundImage = 'url(' + imageData + ')';
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    }

    var userStr = localStorage.getItem('saydaliyati_current_user');
    var user = userStr ? JSON.parse(userStr) : {};

    // حاول رفع الصورة إلى Firebase Storage
    var finalAvatar = imageData;
    if (isFirebaseReady() && user.phone) {
      try {
        var path = 'avatars/' + user.phone + '_' + Date.now() + '.jpg';
        finalAvatar = await uploadImageToStorage(imageData, path);
      } catch (err) {
        console.warn('⚠️ خطأ رفع الصورة:', err);
      }
    }

    user.avatar = finalAvatar;
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

    var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    for (var i = 0; i < registrations.length; i++) {
      if (registrations[i].phone === user.phone) {
        registrations[i].avatar = finalAvatar;
        break;
      }
    }
    localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));

    // حدّث Firestore
    if (isFirebaseReady()) {
      try {
        await saveUserToFirestore(user);
      } catch (err) { console.warn('⚠️', err); }
    }

    showToast('✅ تم تحديث الصورة');
  };
  reader.readAsDataURL(file);
}

// ============================================
// ✏️ تعديل البيانات
// ============================================
function openEditProfile() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};

  var editName = document.getElementById('editName');
  var editEmail = document.getElementById('editEmail');

  if (editName) editName.value = user.name || '';
  if (editEmail) editEmail.value = user.email || '';

  var editAddressLabel = document.getElementById('editAddressLabel');
  var editAddress = document.getElementById('editAddress');

  if (user.type === 'delivery') {
    if (editAddressLabel) editAddressLabel.textContent = 'المنطقة';
    if (editAddress) editAddress.value = user.area || '';
  } else {
    if (editAddressLabel) editAddressLabel.textContent = 'العنوان';
    if (editAddress) editAddress.value = user.address || '';
  }

  var modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeEditProfile() {
  var modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function saveProfile(event) {
  if (event) event.preventDefault();

  var name = document.getElementById('editName').value.trim();
  var email = document.getElementById('editEmail').value.trim();
  var address = document.getElementById('editAddress').value.trim();

  if (!name) {
    showError('الاسم مطلوب');
    return;
  }

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};

  user.name = name;
  user.email = email;

  if (user.type === 'delivery') user.area = address;
  else user.address = address;

  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  for (var i = 0; i < registrations.length; i++) {
    if (registrations[i].phone === user.phone) {
      registrations[i] = user;
      break;
    }
  }
  localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));

  if (isFirebaseReady()) {
    try { await saveUserToFirestore(user); } catch (e) { console.warn(e); }
  }

  closeEditProfile();
  openProfile();
  showToast('✅ تم حفظ التعديلات');
}

// ============================================
// ⭐ عرض تقييماتي — Firestore First
// ============================================
async function renderMyRatings() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  var user = JSON.parse(userStr);
  var listEl = document.getElementById('myRatingsList');
  var countEl = document.getElementById('myRatingsCount');
  if (!listEl) return;

  var myRatings = [];

  if (isFirebaseReady() && user.phone) {
    try {
      myRatings = await getUserRatingsFromFirestore(user.phone);
    } catch (e) {
      console.warn('⚠️ خطأ جلب التقييمات:', e);
    }
  }

  if (myRatings.length === 0) {
    try {
      var allRatings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
      myRatings = allRatings.filter(function (r) { return r.fromPhone === user.phone; });
    } catch (e) {}
  }

  if (countEl) countEl.textContent = myRatings.length;

  if (myRatings.length === 0) {
    listEl.innerHTML =
      '<div class="my-ratings-empty">' +
        '<div class="my-ratings-empty-icon">★</div>' +
        '<p>لا توجد تقييمات بعد</p>' +
      '</div>';
    return;
  }

  var html = '';
  myRatings.forEach(function (rating) {
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<span class="my-rating-star' + (i <= rating.rating ? ' filled' : '') + '">★</span>';
    }

    var dateStr = '-';
    var rawDate = rating.date || rating.createdAt;
    if (rawDate) dateStr = new Date(rawDate).toLocaleDateString('ar-IQ');

    var icon = rating.targetType === 'delivery' ? '🚴' : '🏪';

    html +=
      '<div class="my-rating-card">' +
        '<div class="my-rating-header">' +
          '<div class="my-rating-icon">' + icon + '</div>' +
          '<div class="my-rating-info">' +
            '<h4 class="my-rating-name">' + (rating.targetName || '-') + '</h4>' +
            '<p class="my-rating-date">' + dateStr + '</p>' +
          '</div>' +
          '<div class="my-rating-stars">' + starsHtml + '</div>' +
        '</div>' +
        (rating.comment ? '<p class="my-rating-comment">' + rating.comment + '</p>' : '') +
      '</div>';
  });

  listEl.innerHTML = html;
}

// ============================================
// 📋 فتح الطلبات (السجل)
// ============================================
function openOrders() {
  closeSidebar();

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';

  var titleEl = document.getElementById('ordersTitle');
  var subtitleEl = document.getElementById('ordersSubtitle');

  if (titleEl && subtitleEl) {
    if (userType === 'patient') {
      titleEl.textContent = 'طلباتي';
      subtitleEl.textContent = 'سجل طلباتك السابقة';
    } else if (userType === 'pharmacy') {
      titleEl.textContent = 'الطلبات الواردة';
      subtitleEl.textContent = 'الطلبات التي وصلتك';
    } else {
      titleEl.textContent = 'طلباتي';
      subtitleEl.textContent = 'الطلبات التي وصّلتها';
    }
  }

  showScreen('ordersScreen');
}

// ============================================
// 🔔 التنبيهات
// ============================================
function openNotifications() {
  closeSidebar();
  renderNotifications();
  showScreen('notificationsScreen');
}

function renderNotifications() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';

  var listEl = document.getElementById('notificationsList');
  var subtitleEl = document.getElementById('notificationsSubtitle');
  if (!listEl) return;

  var allNotifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  var defaultNotifs = getDefaultNotifications(userType);
  var notifs = allNotifs.length > 0 ? allNotifs : defaultNotifs;

  if (subtitleEl) subtitleEl.textContent = notifs.length + ' إشعارات';

  if (notifs.length === 0) {
    listEl.innerHTML =
      '<div class="my-ratings-empty">' +
        '<div class="my-ratings-empty-icon">🔔</div>' +
        '<p>لا توجد إشعارات</p>' +
      '</div>';
    return;
  }

  var html = '';
  notifs.forEach(function (n) {
    var unreadClass = n.read ? 'read' : 'unread';
    var iconHtml = getNotifIconHtml(n.type, n.read);

    html +=
      '<div class="notif-card-new ' + unreadClass + '">' +
        '<div class="notif-card-icon-new">' + iconHtml + '</div>' +
        '<div class="notif-card-content-new">' +
          '<h4 class="notif-card-title-new">' + n.title + '</h4>' +
          '<p class="notif-card-message-new">' + n.message + '</p>' +
          '<span class="notif-card-time-new">' + (n.time || 'الآن') + '</span>' +
        '</div>' +
      '</div>';
  });

  listEl.innerHTML = html;
}

function getNotifIconHtml(type, read) {
  var color = read ? '#94A3B8' : '#22D3EE';
  var glow = read ? 'rgba(148, 163, 184, 0.3)' : 'rgba(34, 211, 238, 0.6)';

  if (type === 'order' || type === 'order_new') {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
      '<path d="M10.5 20.5a7 7 0 0 1-9.9-9.9l10-10a7 7 0 0 1 9.9 9.9l-10 10z"/>' +
      '<line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>' +
    '</svg>';
  } else if (type === 'stock' || type === 'warning') {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
      '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
      '<line x1="12" y1="9" x2="12" y2="13"/>' +
      '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
    '</svg>';
  } else if (type === 'rating' || type === 'star') {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
    '</svg>';
  } else if (type === 'offer' || type === 'post') {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
      '<path d="M3 11l19-9-9 19-2-8-8-2z"/>' +
    '</svg>';
  }

  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
    '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
  '</svg>';
}
function getDefaultNotifications(userType) {
  return [];
}
// ============================================
// 🔔 التنبيهات الداخلية
// ============================================
function addInternalNotification(type, title, message) {
  var notif = {
    id: 'NOTIF_' + Date.now(),
    type: type,
    title: title,
    message: message,
    icon: getNotifIcon(type),
    read: false,
    date: new Date().toISOString(),
    time: 'الآن'
  };

  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  notifs.unshift(notif);
  if (notifs.length > 50) notifs = notifs.slice(0, 50);
  localStorage.setItem('saydaliyati_notifications', JSON.stringify(notifs));

  updateNotifBadge();
}

function getNotifIcon(type) {
  var icons = {
    'order': '📦', 'accepted': '✅', 'delivered': '🎉',
    'stock': '⚠️', 'offer': '📢', 'wallet': '💰', 'system': '⚙️',
    'rating': '⭐', 'post': '📢'
  };
  return icons[type] || '🔔';
}

function updateNotifBadge() {
  var navBtn = document.querySelector('.nav-btn[data-tab="notifications"]');
  if (!navBtn) return;

  var oldBadge = navBtn.querySelector('.notif-badge');
  if (oldBadge) oldBadge.remove();

  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  var unreadCount = notifs.filter(function (n) { return !n.read; }).length;

  if (unreadCount > 0) {
    var badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    navBtn.appendChild(badge);
  }
}

// ============================================
// 📢 العروض (النظام القديم)
// ============================================
function openAddOfferModal() { openAddPostModal(); }
function closeAddOfferModal() { closeAddPostModal(); }

async function publishOffer(event) {
  if (event) event.preventDefault();

  var title = document.getElementById('offerTitle').value.trim();
  var description = document.getElementById('offerDescription').value.trim();
  var expiry = document.getElementById('offerExpiry').value;

  if (!title || !description) {
    showError('املأ العنوان والتفاصيل');
    return;
  }

  var currentUser = JSON.parse(localStorage.getItem('saydaliyati_current_user') || '{}');

  var offer = {
    id: 'OFFER_' + Date.now(),
    title: title,
    description: description,
    expiry: expiry,
    pharmacy: currentUser.name || 'صيدلية',
    date: new Date().toISOString()
  };

  var offers = JSON.parse(localStorage.getItem('saydaliyati_offers') || '[]');
  offers.unshift(offer);
  localStorage.setItem('saydaliyati_offers', JSON.stringify(offers));

  closeAddOfferModal();
  document.getElementById('offerTitle').value = '';
  document.getElementById('offerDescription').value = '';
  document.getElementById('offerExpiry').value = '';

  playSuccessSound();
  showToast('✅ تم نشر العرض');
  loadOffers();
}

function loadOffers() {
  var offersList = document.getElementById('offersList');
  if (!offersList) return;

  var offers = JSON.parse(localStorage.getItem('saydaliyati_offers') || '[]');

  if (offers.length === 0) {
    offersList.innerHTML = '<div class="offer-empty">لا توجد عروض حالياً - تابعنا قريباً</div>';
    return;
  }

  var html = '';
  offers.forEach(function (offer) {
    html +=
      '<div class="offer-card">' +
        '<h4 class="offer-title">' + offer.title + '</h4>' +
        '<p class="offer-desc">' + offer.description + '</p>' +
        '<p class="offer-pharmacy">من: ' + offer.pharmacy + '</p>' +
      '</div>';
  });

  offersList.innerHTML = html;
}

// ============================================
// 📸 نظام طلب الروشتة
// ============================================
var prescriptionImageData = null;

function openPrescriptionScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  var addressInput = document.getElementById('prescriptionAddress');
  if (addressInput && user.address) addressInput.value = user.address;

  prescriptionImageData = null;
  resetPrescriptionUpload();
  showScreen('prescriptionScreen');
}

function closePrescriptionScreen() { showScreen('homeScreen'); }

function openPrescriptionPicker() {
  var input = document.getElementById('prescriptionInput');
  if (input) input.click();
}

function handlePrescriptionUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showError('حجم الصورة كبير جداً - الحد الأقصى 5MB');
    return;
  }

  if (!file.type.startsWith('image/')) {
    showError('يجب أن تكون الصورة بصيغة صورة');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    prescriptionImageData = e.target.result;

    var placeholder = document.getElementById('prescriptionPlaceholder');
    var preview = document.getElementById('prescriptionPreview');
    var img = document.getElementById('prescriptionImage');

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (img) img.src = prescriptionImageData;

    showToast('✅ تم رفع الصورة');
  };
  reader.readAsDataURL(file);
}

function removePrescriptionImage(event) {
  if (event) event.stopPropagation();
  prescriptionImageData = null;
  resetPrescriptionUpload();
  var input = document.getElementById('prescriptionInput');
  if (input) input.value = '';
}

function resetPrescriptionUpload() {
  var placeholder = document.getElementById('prescriptionPlaceholder');
  var preview = document.getElementById('prescriptionPreview');
  if (placeholder) placeholder.style.display = 'block';
  if (preview) preview.style.display = 'none';
}

async function submitPrescription(event) {
  if (event) event.preventDefault();

  if (!prescriptionImageData) { showError('ارفع صورة الوصفة أولاً'); return; }

  var address = document.getElementById('prescriptionAddress').value.trim();
  if (!address) { showError('أدخل عنوان التوصيل'); return; }

  var notes = document.getElementById('prescriptionNotes') ? document.getElementById('prescriptionNotes').value.trim() : '';
  var pharmacy = document.getElementById('prescriptionPharmacy') ? document.getElementById('prescriptionPharmacy').value : '';

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);

  var orderId = Math.floor(1000 + Math.random() * 9000);
  var order = {
    id: orderId,
    type: 'prescription',
    patientName: user.name,
    patientPhone: user.phone,
    pharmacy: pharmacy || 'غير محدد',
    address: address,
    notes: notes,
    image: prescriptionImageData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // ارفع الصورة إلى Firebase Storage
  if (isFirebaseReady() && user.phone) {
    try {
      var path = 'prescriptions/' + user.phone + '_' + Date.now() + '.jpg';
      order.image = await uploadImageToStorage(prescriptionImageData, path);
    } catch (e) { console.warn('⚠️ خطأ رفع الصورة:', e); }
  }

  // احفظ محلياً
  var orders = JSON.parse(localStorage.getItem('saydaliyati_prescription_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_prescription_orders', JSON.stringify(orders));

  // احفظ في Firestore
  if (isFirebaseReady()) {
    try { await saveOrderToFirestore(order); } catch (e) { console.warn(e); }
  }

  addInternalNotification('order', '📸 تم إرسال روشتتك', 'ستتواصل معك صيدلية قريبة');

  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'ستتواصل معك صيدلية قريبة خلال دقائق');

  prescriptionImageData = null;
  resetPrescriptionUpload();
}

// ============================================
// 🛒 نظام سلة التسوق
// ============================================
var PHARMACY_INVENTORY = {};
var cart = [];
var currentModalProduct = null;
var modalQuantity = 1;

function openCartScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  cart = JSON.parse(localStorage.getItem('saydaliyati_cart') || '[]');

  var addressInput = document.getElementById('cartAddress');
  if (addressInput && user.address) addressInput.value = user.address;

  renderCart();
  showScreen('cartScreen');
}

function onPharmacyChange() {
  var pharmacy = document.getElementById('cartPharmacySelect').value;

  var infoBanner = document.getElementById('cartInfoBanner');
  var productsSection = document.getElementById('cartProducts');

  if (!pharmacy) {
    if (infoBanner) infoBanner.style.display = 'flex';
    if (productsSection) productsSection.style.display = 'none';
    return;
  }

  if (cart.length > 0 && cart[0].pharmacy !== pharmacy) {
    if (!confirm('السلة تحتوي منتجات من صيدلية أخرى. مسحها والبدء من جديد؟')) {
      document.getElementById('cartPharmacySelect').value = cart[0].pharmacy;
      return;
    }
    cart = [];
    saveCart();
  }

  if (infoBanner) infoBanner.style.display = 'none';
  if (productsSection) productsSection.style.display = 'block';

  renderProducts(pharmacy);
  renderCart();
}

function renderProducts(pharmacy) {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;

  var products = PHARMACY_INVENTORY[pharmacy] || [];

  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">لا توجد أدوية متوفرة</p>';
    return;
  }

  var html = '';
  products.forEach(function (p) {
    html +=
      '<div class="product-card" onclick="openProductModal(\'' + p.id + '\', \'' + pharmacy + '\')">' +
        '<div class="product-icon">' + p.icon + '</div>' +
        '<h4 class="product-name">' + p.name + '</h4>' +
        '<p class="product-category">' + p.category + '</p>' +
        '<p class="product-price">' + p.price.toLocaleString() + ' دينار</p>' +
      '</div>';
  });

  grid.innerHTML = html;
}

function openProductModal(productId, pharmacy) {
  var products = PHARMACY_INVENTORY[pharmacy] || [];
  var product = products.find(function (p) { return p.id === productId; });
  if (!product) return;

  currentModalProduct = Object.assign({}, product, { pharmacy: pharmacy });
  modalQuantity = 1;

  document.getElementById('productModalName').textContent = product.name;
  document.getElementById('productModalIcon').textContent = product.icon;
  document.getElementById('productModalDesc').textContent = product.desc;
  document.getElementById('productModalPrice').textContent = product.price.toLocaleString() + ' دينار';
  document.getElementById('productModalCategory').textContent = product.category;
  document.getElementById('modalQuantity').textContent = modalQuantity;

  var stockEl = document.getElementById('productModalStock');
  if (product.stock > 10) {
    stockEl.textContent = 'متوفر (' + product.stock + ')';
    stockEl.className = 'stock-available';
  } else if (product.stock > 0) {
    stockEl.textContent = 'كمية محدودة (' + product.stock + ')';
    stockEl.className = 'stock-low';
  } else {
    stockEl.textContent = 'غير متوفر';
    stockEl.className = 'stock-out';
  }

  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = '';
  currentModalProduct = null;
}

function increaseModalQuantity() {
  if (!currentModalProduct) return;
  if (modalQuantity < currentModalProduct.stock) {
    modalQuantity++;
    document.getElementById('modalQuantity').textContent = modalQuantity;
  } else {
    showToast('الكمية المتوفرة: ' + currentModalProduct.stock);
  }
}

function decreaseModalQuantity() {
  if (modalQuantity > 1) {
    modalQuantity--;
    document.getElementById('modalQuantity').textContent = modalQuantity;
  }
}

function addToCartFromModal() {
  if (!currentModalProduct) return;

  var existingIndex = cart.findIndex(function (item) {
    return item.id === currentModalProduct.id;
  });

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += modalQuantity;
  } else {
    cart.push({
      id: currentModalProduct.id,
      name: currentModalProduct.name,
      price: currentModalProduct.price,
      icon: currentModalProduct.icon,
      category: currentModalProduct.category,
      quantity: modalQuantity,
      pharmacy: currentModalProduct.pharmacy
    });
  }

  saveCart();
  closeProductModal();
  renderCart();
  showToast('✅ تمت الإضافة إلى السلة');

  if (navigator.vibrate) navigator.vibrate([50]);
}

function renderCart() {
  var itemsEl = document.getElementById('cartItems');
  var emptyEl = document.getElementById('cartEmpty');
  var sectionEl = document.getElementById('cartItemsSection');
  var summaryEl = document.getElementById('cartSummary');
  var badgeEl = document.getElementById('cartBadge');

  var totalItems = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);

  if (badgeEl) {
    badgeEl.textContent = totalItems;
    badgeEl.setAttribute('data-count', totalItems);
  }

  if (cart.length === 0) {
    if (itemsEl) itemsEl.innerHTML = '';
    if (sectionEl) sectionEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (sectionEl) sectionEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  var html = '';
  cart.forEach(function (item, index) {
    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-icon">' + item.icon + '</div>' +
        '<div class="cart-item-info">' +
          '<h4 class="cart-item-name">' + item.name + '</h4>' +
          '<p class="cart-item-price">' + item.price.toLocaleString() + ' دينار</p>' +
        '</div>' +
        '<div class="cart-item-controls">' +
          '<button class="cart-qty-btn" onclick="changeQuantity(' + index + ', -1)">−</button>' +
          '<span class="cart-item-qty">' + item.quantity + '</span>' +
          '<button class="cart-qty-btn" onclick="changeQuantity(' + index + ', 1)">+</button>' +
          '<button class="cart-qty-btn remove" onclick="removeFromCart(' + index + ')">×</button>' +
        '</div>' +
      '</div>';
  });

  if (itemsEl) itemsEl.innerHTML = html;

  var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
  var delivery = 3000;
  var total = subtotal + delivery;

  document.getElementById('cartSubtotal').textContent = subtotal.toLocaleString() + ' دينار';
  document.getElementById('cartDelivery').textContent = delivery.toLocaleString() + ' دينار';
  document.getElementById('cartTotal').textContent = total.toLocaleString() + ' دينار';
}

function changeQuantity(index, delta) {
  if (index < 0 || index >= cart.length) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم الحذف من السلة');
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('مسح جميع المنتجات من السلة؟')) return;
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم مسح السلة');
}

function saveCart() {
  localStorage.setItem('saydaliyati_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  var badgeEl = document.getElementById('cartBadge');
  if (!badgeEl) return;
  var total = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  badgeEl.textContent = total;
  badgeEl.setAttribute('data-count', total);
}

async function submitCartOrder() {
  if (cart.length === 0) { showError('السلة فارغة'); return; }

  var pharmacy = document.getElementById('cartPharmacySelect').value;
  var address = document.getElementById('cartAddress').value.trim();
  var notes = document.getElementById('cartNotes').value.trim();
  var paymentEl = document.querySelector('input[name="paymentMethod"]:checked');
  var payment = paymentEl ? paymentEl.value : 'cash';

  if (!pharmacy) { showError('اختر صيدلية'); return; }
  if (!address) { showError('أدخل عنوان التوصيل'); return; }

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);

  var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
  var delivery = 3000;
  var total = subtotal + delivery;

  var orderId = Math.floor(1000 + Math.random() * 9000);
  var order = {
    id: orderId,
    type: 'cart',
    patientName: user.name,
    patientPhone: user.phone,
    pharmacy: pharmacy,
    address: address,
    notes: notes,
    payment: payment,
    items: cart.slice(),
    subtotal: subtotal,
    delivery: delivery,
    total: total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // محلياً
  var orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_cart_orders', JSON.stringify(orders));

  // Firestore
  if (isFirebaseReady()) {
    try { await saveOrderToFirestore(order); } catch (e) { console.warn(e); }
  }

  addInternalNotification('order', '🛒 طلبك #' + orderId, 'في انتظار قبول الصيدلية');

  cart = [];
  saveCart();
  updateCartBadge();

  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'طلب #' + orderId + ' - ' + pharmacy);
}

// ============================================
// 🎉 نهاية الجزء 3 من script.js
// ============================================
console.log('توصيل طبي v14 — الجزء 3 اكتمل');
// ============================================
// توصيل طبي - v14
// الجزء 4 من 4: Rating Submit + Posts Feed + Radar + Map + Tracking + Settings + Inventory + Init
// ============================================

// ============================================
// ⭐ نظام التقييم — Submit
// ============================================
var currentRating = 0;

function openRatingModal(targetName, targetType, orderId) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  currentRating = 0;

  var titleEl = document.getElementById('ratingModalTitle');
  var nameEl = document.getElementById('ratingTargetName');
  var typeEl = document.getElementById('ratingTargetType');
  var iconEl = document.getElementById('ratingTargetIcon');

  if (targetType === 'delivery') {
    if (titleEl) titleEl.textContent = 'قيّم تجربتك مع المندوب';
    if (iconEl) iconEl.textContent = '🚴';
    if (typeEl) typeEl.textContent = 'مندوب توصيل';
  } else {
    if (titleEl) titleEl.textContent = 'قيّم تجربتك مع الصيدلية';
    if (iconEl) iconEl.textContent = '🏪';
    if (typeEl) typeEl.textContent = 'صيدلية';
  }

  if (nameEl) nameEl.textContent = targetName;

  document.getElementById('ratingTargetId').value = orderId || '';
  document.getElementById('ratingTargetType').value = targetType;
  document.getElementById('ratingComment').value = '';

  document.querySelectorAll('.rating-star').forEach(function (star) {
    star.classList.remove('active');
  });

  var textEl = document.getElementById('ratingText');
  if (textEl) {
    textEl.textContent = 'اضغط على النجوم للتقييم';
    textEl.className = 'rating-text';
  }

  document.getElementById('ratingModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
  document.getElementById('ratingModal').classList.remove('active');
  document.body.style.overflow = '';
  currentRating = 0;
}

function selectRating(value) {
  currentRating = value;

  document.querySelectorAll('.rating-star').forEach(function (star, index) {
    star.classList.toggle('active', index < value);
  });

  var textEl = document.getElementById('ratingText');
  var texts = { 1: '😞 سيء جداً', 2: '😕 ضعيف', 3: '😐 مقبول', 4: '😊 جيد', 5: '🤩 ممتاز!' };
  var classes = { 1: 'bad', 2: 'bad', 3: 'medium', 4: 'good', 5: 'good' };

  if (textEl) {
    textEl.textContent = texts[value];
    textEl.className = 'rating-text ' + classes[value];
  }

  if (navigator.vibrate) navigator.vibrate([30]);
}

async function submitRating() {
  if (currentRating === 0) { showError('اختر تقييماً أولاً'); return; }

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);

  var targetName = document.getElementById('ratingTargetName').textContent;
  var targetType = document.getElementById('ratingTargetType').value;
  var orderId = document.getElementById('ratingTargetId').value;
  var comment = document.getElementById('ratingComment').value.trim();

  var rating = {
    id: 'RATING_' + Date.now(),
    from: user.name,
    fromPhone: user.phone,
    targetName: targetName,
    targetType: targetType,
    orderId: orderId,
    rating: currentRating,
    comment: comment,
    date: new Date().toISOString()
  };

  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  ratings.unshift(rating);
  localStorage.setItem('saydaliyati_ratings', JSON.stringify(ratings));

  if (isFirebaseReady()) {
    try { await saveRatingToFirestore(rating); } catch (e) { console.warn(e); }
  }

  addInternalNotification('rating', '⭐ شكراً لتقييمك', 'قيّمت ' + targetName + ' بـ ' + currentRating + ' نجوم');

  playSuccessSound();
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  closeRatingModal();
  showToast('⭐ شكراً لتقييمك ' + targetName);

  if (document.getElementById('profileScreen') && document.getElementById('profileScreen').classList.contains('active')) {
    renderMyRatings();
  }
}

// ============================================
// 📢 Posts Feed (Cyberpunk)
// ============================================
var postsCache = [];
var currentPostFilter = 'all';
var postImageData = null;
var postImageFile = null;

function openAddPostModal() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') { showToast('هذه الميزة للصيدليات فقط'); return; }

  postImageData = null;
  postImageFile = null;

  var placeholder = document.getElementById('postUploadPlaceholder');
  var preview = document.getElementById('postUploadPreview');
  if (placeholder) placeholder.style.display = 'block';
  if (preview) preview.style.display = 'none';

  document.getElementById('postTitle').value = '';
  document.getElementById('postDescription').value = '';
  document.getElementById('postPrice').value = '';
  document.getElementById('postCategory').value = '';
  document.getElementById('postImageInput').value = '';

  var modal = document.getElementById('addPostModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (navigator.vibrate) navigator.vibrate([30]);
}

function closeAddPostModal() {
  var modal = document.getElementById('addPostModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  postImageData = null;
  postImageFile = null;
}

function openPostImagePicker() {
  var input = document.getElementById('postImageInput');
  if (input) input.click();
}

function handlePostImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) { showError('حجم الصورة كبير جداً - الحد الأقصى 5MB'); return; }
  if (!file.type.startsWith('image/')) { showError('يجب أن تكون الصورة بصيغة صورة'); return; }

  postImageFile = file;

  var reader = new FileReader();
  reader.onload = function (e) {
    postImageData = e.target.result;

    var placeholder = document.getElementById('postUploadPlaceholder');
    var preview = document.getElementById('postUploadPreview');
    var img = document.getElementById('postImagePreview');

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (img) img.src = postImageData;

    showToast('✅ تم رفع الصورة');
  };
  reader.readAsDataURL(file);
}

function removePostImage(event) {
  if (event) event.stopPropagation();

  postImageData = null;
  postImageFile = null;

  var placeholder = document.getElementById('postUploadPlaceholder');
  var preview = document.getElementById('postUploadPreview');
  var input = document.getElementById('postImageInput');

  if (placeholder) placeholder.style.display = 'block';
  if (preview) preview.style.display = 'none';
  if (input) input.value = '';
}

function savePostFromHeader() {
  var form = document.querySelector('#addPostModal form');
  if (form) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}

async function publishPost(event) {
  if (event) event.preventDefault();

  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showError('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);

  var title = document.getElementById('postTitle').value.trim();
  var description = document.getElementById('postDescription').value.trim();
  var price = parseInt(document.getElementById('postPrice').value);
  var category = document.getElementById('postCategory').value;

  if (!title || !description || !category || isNaN(price)) { showError('املأ كل الحقول المطلوبة'); return; }
  if (!postImageData) { showError('ارفع صورة الدواء أولاً'); return; }
  if (price < 0) { showError('السعر يجب أن يكون موجباً'); return; }

  var btn = document.getElementById('postSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ جاري النشر...'; }

  showToast('⏳ جاري رفع الصورة...');

  try {
    var imageURL = postImageData;

    if (isFirebaseReady() && user.phone) {
      try {
        var path = 'posts/' + user.phone + '_' + Date.now() + '.jpg';
        imageURL = await uploadImageToStorage(postImageData, path);
      } catch (err) {
        console.warn('⚠️ خطأ رفع الصورة:', err);
      }
    }

    var postData = {
      pharmacyId: user.phone,
      pharmacyName: user.name || 'صيدلية',
      title: title,
      description: description,
      category: category,
      price: price,
      image: imageURL,
      createdAt: new Date().toISOString(),
      active: true
    };

    var postId = null;
    if (isFirebaseReady()) {
      postId = await savePostToFirestore(postData);
    }

    if (!postId) {
      postData.id = 'LOCAL_' + Date.now();
      var localPosts = JSON.parse(localStorage.getItem('saydaliyati_posts') || '[]');
      localPosts.unshift(postData);
      localStorage.setItem('saydaliyati_posts', JSON.stringify(localPosts));
    }

    addInternalNotification('offer', '📢 تم نشر عرضك', title + ' - ' + price.toLocaleString() + ' دينار');

    playSuccessSound();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    showToast('✅ تم نشر العرض بنجاح');

    closeAddPostModal();
    await loadPostsFromFirestore();
    renderPostsFeed();

  } catch (error) {
    console.error('❌ خطأ نشر العرض:', error);
    showError('فشل النشر: ' + error.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'نشر العرض الآن';
    }
  }
}

function renderPostsFeed() {
  var container = document.getElementById('postsList');
  var counterEl = document.getElementById('postsCount');
  if (!container) return;

  var filtered = postsCache;
  if (currentPostFilter !== 'all') {
    filtered = postsCache.filter(function (post) {
      return post.category === currentPostFilter;
    });
  }

  if (counterEl) counterEl.textContent = postsCache.length;

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="posts-empty">' +
        '<div class="posts-empty-icon">📢</div>' +
        '<h3>لا توجد عروض</h3>' +
        '<p>' + (currentPostFilter === 'all' ? 'تابعنا قريباً - الصيدليات تنشر عروضاً جديدة' : 'لا توجد عروض في هذا التصنيف') + '</p>' +
      '</div>';
    return;
  }

  var categoryMap = {
    'medicine': 'عقاقير طبية',
    'vitamins': 'فيتامينات ومكملات',
    'equipment': 'معدات طبية'
  };

  var html = '';
  filtered.forEach(function (post) {
    var categoryLabel = categoryMap[post.category] || post.category;
    var imageSrc = post.image || '';
    var priceFormatted = (post.price || 0).toLocaleString();
    var pharmacyName = post.pharmacyName || 'صيدلية';

    var imageHTML = '';
    if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
      imageHTML = '<img src="' + imageSrc + '" alt="' + post.title + '" onerror="this.style.display=\'none\'">';
    } else {
      imageHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:var(--bg-secondary);">💊</div>';
    }

    html +=
      '<div class="post-card">' +
        '<div class="post-image-wrapper">' +
          imageHTML +
          '<div class="post-image-overlay"></div>' +
          '<div class="post-category-badge">' + categoryLabel + '</div>' +
          '<div class="post-payment-badge">💰 متوفر</div>' +
        '</div>' +
        '<div class="post-content">' +
          '<div class="post-pharmacy-name">' +
            '<span class="pharmacy-icon">🏪</span>' +
            '<span>' + pharmacyName + '</span>' +
          '</div>' +
          '<h3 class="post-title">' + post.title + '</h3>' +
          '<p class="post-description">' + post.description + '</p>' +
          '<div class="post-price-section">' +
            '<div>' +
              '<p class="post-price-label">السعر الإجمالي</p>' +
              '<div class="post-price-value">' + priceFormatted + '<small>د.ع</small></div>' +
            '</div>' +
          '</div>' +
          '<button class="post-order-btn" onclick="orderFromPost(\'' + post.id + '\')">' +
            '<span class="order-icon">⚡</span>' +
            '<span>اطلب الآن</span>' +
          '</button>' +
        '</div>' +
      '</div>';
  });

  container.innerHTML = html;
}

function filterPosts(filter, btn) {
  currentPostFilter = filter;

  document.querySelectorAll('.post-filter-chip').forEach(function (b) {
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  renderPostsFeed();

  if (navigator.vibrate) navigator.vibrate([20]);
}

function orderFromPost(postId) {
  var post = postsCache.find(function (p) { return p.id === postId; });
  if (!post) { showToast('⚠️ العرض غير موجود'); return; }

  localStorage.setItem('saydaliyati_selected_pharmacy', JSON.stringify({
    id: post.pharmacyId,
    name: post.pharmacyName
  }));

  localStorage.setItem('saydaliyati_selected_post', JSON.stringify({
    id: post.id,
    title: post.title,
    description: post.description,
    price: post.price,
    image: post.image,
    pharmacyName: post.pharmacyName,
    pharmacyId: post.pharmacyId
  }));

  if (navigator.vibrate) navigator.vibrate([50]);

  showToast('🛒 جاري فتح الطلب من: ' + post.pharmacyName);

  setTimeout(function () { openCartScreen(); }, 800);
}

async function initPostsFeed() {
  try {
    postsCache = await loadPostsFromFirestore();
    renderPostsFeed();
  } catch (e) {
    console.log('⚠️ خطأ تحميل العروض:', e);
    postsCache = [];
    renderPostsFeed();
  }
}

async function refreshPosts() {
  showToast('🔄 جاري تحديث العروض...');
  postsCache = await loadPostsFromFirestore();
  renderPostsFeed();
  showToast('✅ تم التحديث');
}

// ============================================
// 📡 الرادار
// ============================================
var radarActive = false;
var radarInterval = null;
var orderSimulationInterval = null;
var orderTimerInterval = null;
var orderTimerSeconds = 10;

function toggleRadar() {
  var radarSimple = document.getElementById('radarSimple');
  var radarTitle = document.getElementById('radarTitle');
  var btnText = document.getElementById('radarBtnText');
  var btn = document.getElementById('radarBtn');

  if (!radarActive) {
    radarActive = true;

    if (radarSimple) radarSimple.classList.add('active');
    if (radarTitle) radarTitle.textContent = 'جارٍ البحث...';
    if (btnText) btnText.textContent = 'إيقاف البحث';
    if (btn) btn.classList.add('active');

    playRadarActivateSound();
    vibrateDevice([100, 50, 100]);
    showToast('📡 الرادار يعمل - جاري البحث...');

    if (radarInterval) clearInterval(radarInterval);
    radarInterval = setInterval(function () { playSonarPing(); }, 2000);

    setTimeout(function () {
      if (radarActive) {
        playAlertDing();
        vibrateDevice([200, 100, 200]);
        openOrderSheet();
        if (radarTitle) radarTitle.textContent = '📦 تم رصد طلب!';
      }
    }, 5000);

    startOrderSimulation();
  } else {
    radarActive = false;

    if (radarSimple) radarSimple.classList.remove('active');
    if (radarTitle) radarTitle.textContent = 'ابدأ البحث';
    if (btnText) btnText.textContent = 'ابدأ البحث';
    if (btn) btn.classList.remove('active');

    if (radarInterval) { clearInterval(radarInterval); radarInterval = null; }
    if (orderSimulationInterval) { clearInterval(orderSimulationInterval); orderSimulationInterval = null; }

    showToast('⏹️ تم إيقاف الرادار');
  }
}

function startOrderSimulation() {
  if (orderSimulationInterval) clearInterval(orderSimulationInterval);
  orderSimulationInterval = setInterval(function () {
    if (radarActive) {
      var sheet = document.getElementById('orderSheet');
      if (sheet && !sheet.classList.contains('active')) {
        playAlertDing();
        vibrateDevice([200, 100, 200]);
        openOrderSheet();
      }
    }
  }, 15000);
}

function openOrderSheet() {
  var overlay = document.getElementById('orderSheetOverlay');
  var sheet = document.getElementById('orderSheet');
  if (overlay) overlay.classList.add('active');
  if (sheet) sheet.classList.add('active');
  document.body.style.overflow = 'hidden';
  startOrderTimer();
}

function closeOrderSheet() {
  var overlay = document.getElementById('orderSheetOverlay');
  var sheet = document.getElementById('orderSheet');
  if (overlay) overlay.classList.remove('active');
  if (sheet) sheet.classList.remove('active');
  document.body.style.overflow = '';

  if (orderTimerInterval) { clearInterval(orderTimerInterval); orderTimerInterval = null; }

  var radarTitle = document.getElementById('radarTitle');
  if (radarTitle && radarActive) radarTitle.textContent = 'جارٍ البحث...';
}

function startOrderTimer() {
  orderTimerSeconds = 10;
  var progressEl = document.getElementById('timerProgress');
  var textEl = document.getElementById('timerText');

  if (progressEl) progressEl.style.width = '100%';
  if (textEl) textEl.textContent = orderTimerSeconds;

  if (orderTimerInterval) clearInterval(orderTimerInterval);

  orderTimerInterval = setInterval(function () {
    orderTimerSeconds--;
    if (progressEl) progressEl.style.width = (orderTimerSeconds * 10) + '%';
    if (textEl) textEl.textContent = orderTimerSeconds;

    if (orderTimerSeconds <= 0) {
      clearInterval(orderTimerInterval);
      orderTimerInterval = null;
      closeOrderSheet();
      showToast('انتهى وقت الطلب');
    }
  }, 1000);
}

function acceptFromSheet() {
  playSuccessSound();
  closeOrderSheet();
  showToast('✅ تم قبول الطلب - الرادار يعمل');

  setTimeout(function () {
    if (radarActive && !radarInterval) {
      radarInterval = setInterval(function () { playSonarPing(); }, 2000);
    }
  }, 1000);

  setTimeout(function () { goToMyOrders(); }, 500);
}

// ============================================
// 🔔 إشعارات Push + Radar System
// ============================================
function sendNotification(options) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    addInternalNotification(options.type || 'system', options.title, options.body);
    vibrateDevice([200, 100, 200]);
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'SHOW_NOTIFICATION',
    payload: {
      title: options.title,
      body: options.body,
      icon: options.icon || '/icon-192.png',
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || ('saydaliyati-' + Date.now()),
      requireInteraction: options.requireInteraction || false,
      data: {
        orderId: options.orderId || null,
        type: options.type || 'order',
        url: options.url || '/'
      },
      actions: options.actions || []
    }
  });

  vibrateDevice(options.vibrate || [200, 100, 200]);
}

function handleNotificationClick(data) {
  console.log('🖱️ notification click:', data);
  var action = data.action;
  var orderId = data.orderId;

  vibrateDevice([100]);

  if (action === 'reject') {
    showToast('تم رفض الطلب #' + orderId);
    return;
  }

  if (action === 'accept' || action === 'open') {
    acceptOrderFromNotification(orderId);
    setTimeout(function () {
      goToMyOrders();
      setTimeout(function () { scrollToOrderAndHighlight(orderId); }, 300);
    }, 100);
  }
}

function acceptOrderFromNotification(orderId) {
  showToast('✅ تم قبول الطلب #' + orderId);

  var acceptedOrders = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
  acceptedOrders.unshift({ id: orderId, acceptedAt: new Date().toISOString() });
  localStorage.setItem('saydaliyati_accepted_orders', JSON.stringify(acceptedOrders));

  addInternalNotification('accepted', '✅ تم قبول الطلب #' + orderId, 'جاري التوصيل');
  updateNotifBadge();
}

function scrollToOrderAndHighlight(orderId) {
  var cards = document.querySelectorAll('.priority-card, .order-card, .delivery-order-card');
  cards.forEach(function (card) {
    var text = card.textContent || '';
    if (text.indexOf('#' + orderId) !== -1) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(function () { card.classList.remove('highlighted'); }, 3000);
    }
  });
}

function checkUrlForOrder() {
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  var action = params.get('action');

  if (orderId) {
    if (action === 'accept') acceptOrderFromNotification(orderId);

    setTimeout(function () {
      goToMyOrders();
      setTimeout(function () { scrollToOrderAndHighlight(orderId); }, 500);
    }, 300);

    window.history.replaceState({}, '', '/');
  }
}

var radarSystemActive = false;
var radarCheckInterval = null;

function startRadarSystem() {
  if (radarSystemActive) return;
  radarSystemActive = true;
  console.log('🚀 نظام الرادار يعمل...');

  if (radarCheckInterval) clearInterval(radarCheckInterval);
  radarCheckInterval = setInterval(function () { checkForNewOrders(); }, 10000);

  checkForNewOrders();
}

function stopRadarSystem() {
  radarSystemActive = false;
  if (radarCheckInterval) { clearInterval(radarCheckInterval); radarCheckInterval = null; }
  console.log('🛑 نظام الرادار متوقف');
}
function checkForNewOrders() {
  // معطّل — الإشعارات الحقيقية تجي من Firestore
  return;
}
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('المتصفح لا يدعم الإشعارات');
    return Promise.resolve('unsupported');
  }

  return Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      console.log('✅ الإشعارات مفعّلة');
      showToast('الإشعارات مفعّلة ✅');
      startRadarSystem();
    } else {
      console.log('❌ الإشعارات مرفوضة');
    }
    return permission;
  });
}

// ============================================
// 🗺️ الخريطة + GPS
// ============================================
var mainMap = null;
var trackingMap = null;
var myLocation = null;
var myMarker = null;
var routeLine = null;
var BAGHDAD_CENTER = [33.3152, 44.3661];

var PHARMACY_LOCATIONS = {
  'صيدلية النور': [33.3000, 44.4000],
  'صيدلية الحياة': [33.2800, 44.3800],
  'صيدلية الشفاء': [33.3300, 44.3500]
};

function openMapScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'delivery') { showToast('هذه الميزة للمندوبين فقط'); return; }

  showScreen('mapScreen');

  setTimeout(function () {
    initMainMap();
    requestMyLocation();
    loadNearbyOrders();
  }, 300);
}

function closeMapScreen() {
  if (mainMap) { mainMap.remove(); mainMap = null; }
  showScreen('deliveryDashboard');
}

function initMainMap() {
  var mapEl = document.getElementById('leafletMap');
  if (!mapEl) return;
  if (mainMap) mainMap.remove();

  mainMap = L.map('leafletMap').setView(BAGHDAD_CENTER, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(mainMap);

  var loading = document.getElementById('mapLoading');
  if (loading) loading.style.display = 'none';

  addPharmacyMarkers();
}

function requestMyLocation() {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم GPS');
    updateGpsInfo(null);
    return;
  }

  var subtitleEl = document.getElementById('mapSubtitle');
  if (subtitleEl) subtitleEl.textContent = 'جارٍ تحديد موقعك...';

  navigator.geolocation.getCurrentPosition(
    function (position) {
      myLocation = [position.coords.latitude, position.coords.longitude];
      updateGpsInfo(position);
      addMyLocationMarker();
      if (mainMap) mainMap.setView(myLocation, 15);
      if (subtitleEl) subtitleEl.textContent = 'تم تحديد موقعك ✅';
    },
    function (error) {
      myLocation = BAGHDAD_CENTER;
      updateGpsInfo(null);
      addMyLocationMarker();
      if (subtitleEl) subtitleEl.textContent = 'تعذّر تحديد الموقع - استخدمنا بغداد';
      showToast('⚠️ تعذّر تحديد موقعك');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function updateGpsInfo(position) {
  var latEl = document.getElementById('gpsLat');
  var lngEl = document.getElementById('gpsLng');
  var addrEl = document.getElementById('gpsAddress');

  if (position && myLocation) {
    if (latEl) latEl.textContent = 'Lat: ' + myLocation[0].toFixed(5);
    if (lngEl) lngEl.textContent = 'Lng: ' + myLocation[1].toFixed(5);
    if (addrEl) addrEl.textContent = 'بغداد، العراق';
  } else {
    if (latEl) latEl.textContent = 'Lat: --';
    if (lngEl) lngEl.textContent = 'Lng: --';
    if (addrEl) addrEl.textContent = 'الموقع غير متاح';
  }
}

function addMyLocationMarker() {
  if (!mainMap || !myLocation) return;
  if (myMarker) mainMap.removeLayer(myMarker);

  var myIcon = L.divIcon({
    className: 'custom-map-marker marker-me',
    html: '<div class="custom-marker-pin"><span>📍</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  myMarker = L.marker(myLocation, { icon: myIcon })
    .addTo(mainMap)
    .bindPopup('<strong>موقعك الحالي</strong><br>أنت هنا')
    .openPopup();
}

function addPharmacyMarkers() {
  if (!mainMap) return;

  var icon = L.divIcon({
    className: 'custom-map-marker marker-pharmacy',
    html: '<div class="custom-marker-pin"><span>🏪</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  for (var name in PHARMACY_LOCATIONS) {
    if (PHARMACY_LOCATIONS.hasOwnProperty(name)) {
      var loc = PHARMACY_LOCATIONS[name];
      L.marker(loc, { icon: icon }).addTo(mainMap).bindPopup('<strong>' + name + '</strong><br>صيدلية');
    }
  }
}
function loadNearbyOrders() {
  var listEl = document.getElementById('nearbyOrdersList');
  var countEl = document.getElementById('nearbyCount');
  if (!listEl) return;

  if (countEl) countEl.textContent = '0';

  listEl.innerHTML =
    '<div class="cart-empty">' +
      '<div class="cart-empty-icon">📦</div>' +
      '<h3>لا توجد طلبات قريبة</h3>' +
      '<p>ستظهر هنا الطلبات القريبة منك</p>' +
    '</div>';
}
function focusOnOrder(lat, lng, orderId) {
  if (!mainMap) return;
  mainMap.setView([lat, lng], 16);

  var icon = L.divIcon({
    className: 'custom-map-marker marker-patient',
    html: '<div class="custom-marker-pin"><span>🏠</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  L.marker([lat, lng], { icon: icon })
    .addTo(mainMap)
    .bindPopup('<strong>طلب #' + orderId + '</strong><br>موقع التسليم')
    .openPopup();

  drawRoute(myLocation, [lat, lng]);
  showToast('📍 تم تحديد موقع الطلب #' + orderId);
}

function drawRoute(from, to) {
  if (!mainMap || !from || !to) return;
  if (routeLine) mainMap.removeLayer(routeLine);
  routeLine = L.polyline([from, to], {
    color: '#2563EB', weight: 4, opacity: 0.7,
    dashArray: '10, 10', lineCap: 'round'
  }).addTo(mainMap);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function centerOnMe() {
  if (!mainMap || !myLocation) { showToast('جاري تحديد موقعك...'); requestMyLocation(); return; }
  mainMap.setView(myLocation, 16);
  if (myMarker) myMarker.openPopup();
  showToast('📍 تم التركيز على موقعك');
}

function showAllOrders() {
  if (!mainMap || !myLocation) return;

  var orders = [
    { lat: 33.3000, lng: 44.4000 },
    { lat: 33.2800, lng: 44.3800 },
    { lat: 33.3300, lng: 44.3500 }
  ];

  orders.forEach(function (order) { drawRoute(myLocation, [order.lat, order.lng]); });

  var group = new L.featureGroup([
    L.marker(myLocation),
    L.marker([33.3000, 44.4000]),
    L.marker([33.2800, 44.3800]),
    L.marker([33.3300, 44.3500])
  ]);

  mainMap.fitBounds(group.getBounds().pad(0.2));
  showToast('🗺️ عرض كل الطلبات');
}

function refreshMyLocation() {
  showToast('🔄 جارٍ تحديث موقعك...');
  requestMyLocation();
}

// ============================================
// 🚴 تتبع المندوب (للمريض)
// ============================================
function trackDeliveryOnMap(deliveryName, pharmacyLat, pharmacyLng) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  showScreen('trackingScreen');

  var nameEl = document.getElementById('trackingDeliveryName');
  if (nameEl) nameEl.textContent = deliveryName;

  setTimeout(function () { initTrackingMap(pharmacyLat, pharmacyLng); }, 300);
}

function closeTrackingScreen() {
  if (trackingMap) { trackingMap.remove(); trackingMap = null; }
  showScreen('myOrdersScreen');
}

function initTrackingMap(pharmacyLat, pharmacyLng) {
  var mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  if (trackingMap) trackingMap.remove();

  var patientLoc = [33.3152, 44.3661];
  var pharmacyLoc = [pharmacyLat, pharmacyLng];

  trackingMap = L.map('trackingMap').setView(patientLoc, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(trackingMap);

  var patientIcon = L.divIcon({ className: 'custom-map-marker marker-patient', html: '<div class="custom-marker-pin"><span>🏠</span></div>', iconSize: [40, 40], iconAnchor: [20, 40] });
  L.marker(patientLoc, { icon: patientIcon }).addTo(trackingMap).bindPopup('<strong>موقعك</strong>');

  var pharmacyIcon = L.divIcon({ className: 'custom-map-marker marker-pharmacy', html: '<div class="custom-marker-pin"><span>🏪</span></div>', iconSize: [40, 40], iconAnchor: [20, 40] });
  L.marker(pharmacyLoc, { icon: pharmacyIcon }).addTo(trackingMap).bindPopup('<strong>الصيدلية</strong>');

  var midLat = (patientLoc[0] + pharmacyLoc[0]) / 2;
  var midLng = (patientLoc[1] + pharmacyLoc[1]) / 2;

  var deliveryIcon = L.divIcon({ className: 'custom-map-marker marker-delivery', html: '<div class="custom-marker-pin"><span>🚴</span></div>', iconSize: [40, 40], iconAnchor: [20, 40] });
  var deliveryMarker = L.marker([midLat, midLng], { icon: deliveryIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>المندوب</strong><br>في الطريق')
    .openPopup();

  L.polyline([pharmacyLoc, [midLat, midLng], patientLoc], {
    color: '#10B981', weight: 4, opacity: 0.7
  }).addTo(trackingMap);

  var group = new L.featureGroup([L.marker(patientLoc), L.marker(pharmacyLoc), L.marker([midLat, midLng])]);
  trackingMap.fitBounds(group.getBounds().pad(0.2));

  simulateDeliveryMovement(deliveryMarker, [midLat, midLng], patientLoc);
}

function simulateDeliveryMovement(marker, start, end) {
  var steps = 30;
  var currentStep = 0;

  var interval = setInterval(function () {
    currentStep++;
    if (currentStep > steps) { clearInterval(interval); return; }

    var ratio = currentStep / steps;
    var lat = start[0] + (end[0] - start[0]) * ratio;
    var lng = start[1] + (end[1] - start[1]) * ratio;

    marker.setLatLng([lat, lng]);

    var distance = calculateDistance(lat, lng, end[0], end[1]);
    var eta = Math.max(1, Math.round(distance * 3));

    var etaEl = document.getElementById('trackingETA');
    var distEl = document.getElementById('trackingDistance');
    var progEl = document.getElementById('trackingProgressFill');

    if (etaEl) etaEl.textContent = eta + ' دقيقة';
    if (distEl) distEl.textContent = distance.toFixed(1) + ' كم';
    if (progEl) progEl.style.width = (40 + (ratio * 55)) + '%';
  }, 2000);
}

function refreshTracking() {
  showToast('🔄 جارٍ تحديث موقع المندوب...');
}

// ============================================
// ⚙️ الإعدادات + من نحن + تواصل
// ============================================
function openSettings() { closeSidebar(); showScreen('settingsScreen'); }
function openAbout() { closeSidebar(); showScreen('aboutScreen'); }
function openAppDetails() { closeSidebar(); showScreen('aboutUsScreen'); }
function openContact() { closeSidebar(); showScreen('contactScreen'); }

function openAboutUs() { showScreen('aboutUsScreen'); }
function openVision() { showScreen('visionScreen'); }
function openValues() { showScreen('valuesScreen'); }
function closeAllScreens() { goToDashboardByType(); }

// ============================================
// 📂 القائمة الجانبية
// ============================================
function openSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// 💊 نظام المخزون
// ============================================
var currentInventoryFilter = 'all';
var currentInventorySearch = '';

function getInventoryKey() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return 'saydaliyati_inventory_default';
  var user = JSON.parse(userStr);
  return 'saydaliyati_inventory_' + (user.phone || 'default');
}
function loadInventory() {
  var key = getInventoryKey();
  var inventory = JSON.parse(localStorage.getItem(key) || 'null');

  if (!inventory) {
    inventory = [];
    saveInventory(inventory);
  }

  return inventory;
}
function saveInventory(inventory) {
  var key = getInventoryKey();
  localStorage.setItem(key, JSON.stringify(inventory));

  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (userStr && typeof PHARMACY_INVENTORY !== 'undefined') {
    try {
      var user = JSON.parse(userStr);
      var pharmacyName = user.name || 'صيدلية';
      PHARMACY_INVENTORY[pharmacyName] = inventory.map(function (med) {
        return {
          id: med.id, name: med.name, category: med.category,
          price: med.price, icon: med.icon, stock: med.stock, desc: med.desc
        };
      });
    } catch (e) {}
  }
}

function openInventoryScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') { showToast('هذه الميزة للصيدليات فقط'); return; }

  currentInventoryFilter = 'all';
  currentInventorySearch = '';

  var searchInput = document.getElementById('inventorySearch');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.inv-filter').forEach(function (btn, i) {
    btn.classList.toggle('active', i === 0);
  });

  renderInventory();
  showScreen('inventoryScreen');
}

function closeInventoryScreen() {
  showScreen('pharmacyDashboard');
}

function renderInventory() {
  var inventory = loadInventory();
  var listEl = document.getElementById('inventoryList');
  var subtitleEl = document.getElementById('inventorySubtitle');
  if (!listEl) return;

  var totalMeds = inventory.length;
  var lowStock = inventory.filter(function (m) { return m.stock > 0 && m.stock <= 10; }).length;
  var outOfStock = inventory.filter(function (m) { return m.stock === 0; }).length;
  var totalValue = inventory.reduce(function (sum, m) { return sum + (m.price * m.stock); }, 0);

  var elTotalMeds = document.getElementById('invTotalMeds');
  var elLowStock = document.getElementById('invLowStock');
  var elOutOfStock = document.getElementById('invOutOfStock');
  var elValue = document.getElementById('invValue');

  if (elTotalMeds) elTotalMeds.textContent = totalMeds;
  if (elLowStock) elLowStock.textContent = lowStock;
  if (elOutOfStock) elOutOfStock.textContent = outOfStock;
  if (elValue) elValue.textContent = (totalValue / 1000).toFixed(0) + 'K';

  var alertEl = document.getElementById('inventoryAlert');
  var alertText = document.getElementById('inventoryAlertText');
  if (alertEl && alertText) {
    if (lowStock + outOfStock > 0) {
      alertEl.style.display = 'flex';
      alertText.textContent = (lowStock + outOfStock) + ' دواء يحتاج إعادة تعبئة';
    } else {
      alertEl.style.display = 'none';
    }
  }

  var filtered = inventory.filter(function (m) {
    if (currentInventoryFilter === 'available' && m.stock <= 10) return false;
    if (currentInventoryFilter === 'low' && (m.stock === 0 || m.stock > 10)) return false;
    if (currentInventoryFilter === 'out' && m.stock !== 0) return false;

    if (currentInventorySearch) {
      var search = currentInventorySearch.toLowerCase();
      if (m.name.toLowerCase().indexOf(search) === -1 && m.category.toLowerCase().indexOf(search) === -1) {
        return false;
      }
    }
    return true;
  });

  if (subtitleEl) subtitleEl.textContent = filtered.length + ' من ' + totalMeds + ' دواء';

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">💊</div><h3>لا توجد أدوية</h3><p>اضغط "+ إضافة دواء" للبدء</p></div>';
    return;
  }

  var html = '';
  filtered.forEach(function (med) {
    var stockClass = med.stock === 0 ? 'out' : (med.stock <= 10 ? 'low' : 'available');
    var stockText = med.stock === 0 ? 'نفد' : (med.stock <= 10 ? 'قارب على النفاد (' + med.stock + ')' : 'متوفر (' + med.stock + ')');
    var cardClass = med.stock === 0 ? 'out-of-stock' : (med.stock <= 10 ? 'low-stock' : '');

    html +=
      '<div class="medicine-card ' + cardClass + '">' +
        '<div class="medicine-card-icon">' + med.icon + '</div>' +
        '<div class="medicine-card-info">' +
          '<h4 class="medicine-card-name">' + med.name + '</h4>' +
          '<div class="medicine-card-meta">' +
            '<span>📁 ' + med.category + '</span>' +
            '<span class="medicine-card-price">💰 ' + med.price.toLocaleString() + ' د</span>' +
            '<span class="medicine-card-stock ' + stockClass + '">📦 ' + stockText + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="medicine-card-actions">' +
          '<button class="medicine-action-btn edit" onclick="openEditMedicineModal(\'' + med.id + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
          '<button class="medicine-action-btn delete" onclick="deleteMedicine(\'' + med.id + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
  });

  listEl.innerHTML = html;
}

function filterInventoryBy(filter, btn) {
  currentInventoryFilter = filter;
  document.querySelectorAll('.inv-filter').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function filterInventory() {
  var input = document.getElementById('inventorySearch');
  currentInventorySearch = input ? input.value.trim() : '';
  renderInventory();
}

function openAddMedicineModal() {
  var titleEl = document.getElementById('medicineModalTitle');
  if (titleEl) titleEl.textContent = 'إضافة دواء جديد';

  var fields = ['editMedicineId', 'medicineName', 'medicineCategory', 'medicinePrice', 'medicineStock', 'medicineDesc'];
  fields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  var stockEl = document.getElementById('medicineStock');
  if (stockEl) stockEl.value = '50';

  var iconEl = document.getElementById('medicineIcon');
  if (iconEl) iconEl.value = '💊';

  var btnEl = document.getElementById('medicineSubmitBtn');
  if (btnEl) btnEl.textContent = 'إضافة إلى المخزون';

  document.querySelectorAll('.medicine-icon-option').forEach(function (btn, i) {
    btn.classList.toggle('active', i === 0);
  });

  var modal = document.getElementById('medicineModal');
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function openEditMedicineModal(medId) {
  var inventory = loadInventory();
  var med = inventory.find(function (m) { return m.id === medId; });
  if (!med) { showError('الدواء غير موجود'); return; }

  var titleEl = document.getElementById('medicineModalTitle');
  if (titleEl) titleEl.textContent = 'تعديل الدواء';

  document.getElementById('editMedicineId').value = med.id;
  document.getElementById('medicineName').value = med.name;
  document.getElementById('medicineCategory').value = med.category;
  document.getElementById('medicinePrice').value = med.price;
  document.getElementById('medicineStock').value = med.stock;
  document.getElementById('medicineDesc').value = med.desc || '';
  document.getElementById('medicineIcon').value = med.icon;

  var btnEl = document.getElementById('medicineSubmitBtn');
  if (btnEl) btnEl.textContent = 'حفظ التعديلات';

  document.querySelectorAll('.medicine-icon-option').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-icon') === med.icon);
  });

  var modal = document.getElementById('medicineModal');
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeMedicineModal() {
  var modal = document.getElementById('medicineModal');
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function selectIconNew(icon, btn) {
  var iconInput = document.getElementById('medicineIcon');
  if (iconInput) iconInput.value = icon;

  document.querySelectorAll('.medicine-icon-option').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  if (navigator.vibrate) navigator.vibrate([20]);
}

function selectIcon(icon, btn) { selectIconNew(icon, btn); }

function saveMedicineFromHeader() {
  var form = document.querySelector('#medicineModal form');
  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

function saveMedicine(event) {
  if (event) event.preventDefault();

  var medId = document.getElementById('editMedicineId').value;
  var name = document.getElementById('medicineName').value.trim();
  var category = document.getElementById('medicineCategory').value;
  var price = parseInt(document.getElementById('medicinePrice').value);
  var stock = parseInt(document.getElementById('medicineStock').value) || 50;
  var desc = document.getElementById('medicineDesc').value.trim();
  var icon = document.getElementById('medicineIcon').value;

  if (!name || !category || isNaN(price)) { showError('املأ كل الحقول المطلوبة'); return; }
  if (price < 0 || stock < 0) { showError('السعر والكمية يجب أن يكونا موجبين'); return; }

  var inventory = loadInventory();

  if (medId) {
    var index = inventory.findIndex(function (m) { return m.id === medId; });
    if (index !== -1) {
      inventory[index].name = name;
      inventory[index].category = category;
      inventory[index].price = price;
      inventory[index].stock = stock;
      inventory[index].desc = desc;
      inventory[index].icon = icon;
    }
    showToast('✅ تم حفظ التعديلات');
  } else {
    inventory.unshift({
      id: 'MED_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name, category: category, price: price, stock: stock, desc: desc, icon: icon
    });
    showToast('✅ تمت إضافة الدواء');
  }

  saveInventory(inventory);
  closeMedicineModal();
  renderInventory();

  if (navigator.vibrate) navigator.vibrate([50]);
}

function deleteMedicine(medId) {
  if (!confirm('هل تريد حذف هذا الدواء؟')) return;
  var inventory = loadInventory();
  inventory = inventory.filter(function (m) { return m.id !== medId; });
  saveInventory(inventory);
  renderInventory();
  showToast('تم حذف الدواء');
}

// ============================================
// 📱 منع التكبير
// ============================================
document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

// ============================================
// 🚀 عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('توصيل طبي v14 جاهز');

  // إظهار/إخفاء زر "إضافة عرض"
  var currentUserStr = localStorage.getItem('saydaliyati_current_user');
  var addPostBtn = document.querySelector('.posts-feed-add-btn');

  if (addPostBtn && currentUserStr) {
    try {
      var currentUser = JSON.parse(currentUserStr);
      addPostBtn.style.display = (currentUser.type === 'pharmacy') ? 'flex' : 'none';
    } catch (e) {
      addPostBtn.style.display = 'none';
    }
  } else if (addPostBtn) {
    addPostBtn.style.display = 'none';
  }

  loadTheme();
  setTimeout(createSplashParticles, 100);

  // إغلاق كل الـ Sheets عند البداية
  var orderSheet = document.getElementById('orderSheet');
  var orderSheetOverlay = document.getElementById('orderSheetOverlay');
  if (orderSheet) orderSheet.classList.remove('active');
  if (orderSheetOverlay) orderSheetOverlay.classList.remove('active');

  var navSheet = document.getElementById('navSheet');
  var navSheetOverlay = document.getElementById('navSheetOverlay');
  if (navSheet) navSheet.classList.remove('active');
  if (navSheetOverlay) navSheetOverlay.classList.remove('active');

  document.querySelectorAll('.modal-overlay').forEach(function (modal) {
    modal.classList.remove('active');
  });

  document.body.addEventListener('click', function () { initAudio(); }, { once: true });

  setTimeout(checkUrlForOrder, 500);

  if (currentUserStr) {
    goToDashboardByType();
  } else {
    showScreen('splashScreen');
  }

  if (currentUserStr && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    startRadarSystem();
  }

  setTimeout(function () {
    if (currentUserStr && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      var user = JSON.parse(currentUserStr);
      if (user.type === 'delivery' || user.type === 'pharmacy') {
        requestNotificationPermission();
      }
    }
  }, 3000);

  updateNotifBadge();
});

// ============================================
// 🛑 Hooks: Radar + Logout
// ============================================
var originalToggleRadar = window.toggleRadar;
window.toggleRadar = function () {
  if (originalToggleRadar) originalToggleRadar.apply(this, arguments);

  if (radarActive) {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      requestNotificationPermission();
    }
    startRadarSystem();
  } else {
    stopRadarSystem();
  }
};

var originalLogout = window.logout;
window.logout = async function () {
  stopRadarSystem();
  if (originalLogout) await originalLogout.apply(this, arguments);
};
// ============================================
// 🛡️ منع تكرار الـ submit وإزالة overlays القديمة
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  // كل الفورمات في التطبيق
  document.querySelectorAll('form').forEach(function (form) {
    // احفظ الـ onsubmit القديم
    var oldOnsubmit = form.onsubmit;

    form.onsubmit = function (event) {
      event.preventDefault();
      event.stopPropagation();

      // احذف أي overlay قديم قبل تنفيذ الـ handler
      document.querySelectorAll('.success-overlay').forEach(function (el) { el.remove(); });

      if (oldOnsubmit) {
        try { oldOnsubmit.call(form, event); } catch (e) { console.error(e); }
      }

      return false;
    };
  });

  // امنع أي submit افتراضي
  document.addEventListener('submit', function (e) {
    e.preventDefault();
  }, true);
});

// observer لإزالة أي success-overlay جديد يتراكم
var successObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (m) {
    m.addedNodes.forEach(function (node) {
      if (node.classList && node.classList.contains('success-overlay')) {
        var all = document.querySelectorAll('.success-overlay');
        // احتفظ بواحد فقط (الأخير)
        for (var i = 0; i < all.length - 1; i++) {
          all[i].remove();
        }
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  successObserver.observe(document.body, { childList: true, subtree: true });
});
// ============================================
// 🎉 نهاية script.js
// ============================================
console.log('توصيل طبي v14 — script.js اكتمل');
