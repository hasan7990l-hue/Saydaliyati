// ============================================
// DAWAK دواك - v15
// Complete Rebuild — Part 1/5
// Firebase + Auth + Utils + Audio + Particles + Toast
// ============================================

console.log('🏆 DAWAK v15 - بدأ التحميل');

// ============================================
// 🎯 Global State
// ============================================
var cart = [];
var currentProductDetails = null;
var pdpQuantity = 1;
var currentOnboardingSlide = 0;
var totalOnboardingSlides = 3;
var ordersCache = [];
var currentOrderFilter = 'all';
var currentHomeCategory = 'all';
var postsCache = [];
var currentChatId = null;
var currentChatUser = null;
var currentRating = 0;
var radarActive = false;
var radarProgressInterval = null;
var radarTimer = 0;
var callActive = false;
var callTimerInterval = null;
var callSeconds = 0;
var callMuted = false;
var callVolumeOn = true;

var COLLECTIONS = {
  USERS: 'users',
  PHARMACIES: 'pharmacies',
  ORDERS: 'orders',
  RATINGS: 'ratings',
  POSTS: 'posts',
  INVENTORY: 'inventory',
  NOTIFICATIONS: 'notifications',
  CHATS: 'chats'
};

var DELIVERY_PRICING = {
  BASE_FEE: 1500,
  PER_KM: 500,
  MIN_FEE: 2000,
  MAX_FEE: 8000,
  DRIVER_SHARE: 0.85,
  DEFAULT_DISTANCE: 3
};

var COUPONS = {
  'DAWAK10': { type: 'percentage', value: 10, label: 'خصم 10%' },
  'DAWAK20': { type: 'percentage', value: 20, label: 'خصم 20%' },
  'WELCOME': { type: 'percentage', value: 15, label: 'خصم ترحيبي 15%' }
};

// ============================================
// 🔥 Firebase Ready Check
// ============================================
function isFirebaseReady() {
  return !!(window.firebaseDB && window.firebaseAuth && window.firebaseCollection);
}

// ============================================
// 🛠️ Utils
// ============================================
function showError(message) {
  showToast('⚠️ ' + message);
}

function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString('en-US');
}

function formatDate(dateStr) {
  try {
    var date = new Date(dateStr);
    var now = new Date();
    var diffMs = now - date;
    var mins = Math.floor(diffMs / 60000);
    var hours = Math.floor(diffMs / 3600000);
    var days = Math.floor(diffMs / 86400000);

    if (mins < 1) return 'الآن';
    if (mins < 60) return 'منذ ' + mins + ' دقيقة';
    if (hours < 24) return 'منذ ' + hours + ' ساعة';
    if (days < 7) return 'منذ ' + days + ' يوم';

    return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return '—'; }
}

function formatTime(timestamp) {
  try {
    var date = new Date(timestamp);
    return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

// ============================================
// 💬 Toast
// ============================================
function showToast(message) {
  document.querySelectorAll('.toast-message').forEach(function (t) { t.remove(); });
  var toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function () { toast.classList.add('show'); }, 50);
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
  }, 2500);
}

// ============================================
// 🎯 Confirm
// ============================================
function showConfirm(options) {
  return new Promise(function (resolve) {
    var title = options.title || 'هل أنت متأكد؟';
    var message = options.message || '';
    var confirmText = options.confirmText || 'نعم';
    var cancelText = options.cancelText || 'إلغاء';
    var confirmColor = options.confirmColor || 'danger';
    var icon = options.icon || '⚠️';

    var overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML =
      '<div class="confirm-box">' +
        '<div class="confirm-icon confirm-icon-' + confirmColor + '">' + icon + '</div>' +
        '<h3 class="confirm-title">' + title + '</h3>' +
        (message ? '<p class="confirm-message">' + message + '</p>' : '') +
        '<div class="confirm-actions">' +
          '<button type="button" class="confirm-btn confirm-cancel">' + cancelText + '</button>' +
          '<button type="button" class="confirm-btn confirm-accept confirm-accept-' + confirmColor + '">' + confirmText + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var cancelBtn = overlay.querySelector('.confirm-cancel');
    var acceptBtn = overlay.querySelector('.confirm-accept');

    function close(result) {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); resolve(result); }, 300);
    }

    cancelBtn.onclick = function () { close(false); };
    acceptBtn.onclick = function () { close(true); };
    overlay.onclick = function (e) { if (e.target === overlay) close(false); };
    setTimeout(function () { overlay.classList.add('show'); }, 50);
  });
}

// ============================================
// ✅ Success
// ============================================
function showSuccessMessage(title, message) {
  document.querySelectorAll('.success-overlay').forEach(function (el) { el.remove(); });
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
// 🔐 Password
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
// 💰 Delivery Pricing
// ============================================
function calculateDeliveryFee(distanceKm) {
  distanceKm = parseFloat(distanceKm) || DELIVERY_PRICING.DEFAULT_DISTANCE;
  if (distanceKm < 0.5) distanceKm = 0.5;
  var total = DELIVERY_PRICING.BASE_FEE + (DELIVERY_PRICING.PER_KM * distanceKm);
  if (total < DELIVERY_PRICING.MIN_FEE) total = DELIVERY_PRICING.MIN_FEE;
  if (total > DELIVERY_PRICING.MAX_FEE) total = DELIVERY_PRICING.MAX_FEE;
  total = Math.round(total / 100) * 100;
  var driverShare = Math.round(total * DELIVERY_PRICING.DRIVER_SHARE / 100) * 100;
  return {
    distance: distanceKm,
    total: total,
    driverShare: driverShare,
    platformShare: total - driverShare
  };
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return DELIVERY_PRICING.DEFAULT_DISTANCE;
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// ============================================
// 💾 LocalStorage
// ============================================
function saveRegistration(data) {
  data.date = data.date || new Date().toISOString();
  var regs = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  var idx = regs.findIndex(function (r) { return r.phone === data.phone; });
  if (idx !== -1) regs[idx] = data;
  else regs.push(data);
  localStorage.setItem('saydaliyati_registrations', JSON.stringify(regs));
}

function saveCart() {
  localStorage.setItem('saydaliyati_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  var total = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
  var badge1 = document.getElementById('cartBadgeNav');
  if (badge1) {
    badge1.textContent = total;
    badge1.style.display = total > 0 ? 'flex' : 'none';
  }
  var badge2 = document.getElementById('cartCountBadge');
  if (badge2) {
    badge2.textContent = total + ' ' + (total === 1 ? 'منتج' : 'منتجات');
  }
}

// ============================================
// 🔊 Audio
// ============================================
var audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
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
      var t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
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
  } catch (e) {}
}

function vibrateDevice(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ============================================
// 🎬 Particles
// ============================================
function createSplashParticles() {
  var container = document.getElementById('splashParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'splash-particle';
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
// 🔥 Firestore — Users
// ============================================
async function saveUserToFirestore(userData) {
  if (!isFirebaseReady()) return null;
  try {
    var userId = userData.uid || userData.phone;
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
    if (snap.exists()) return Object.assign({ id: snap.id }, snap.data());
    return null;
  } catch (error) {
    console.error('❌ خطأ جلب المستخدم:', error);
    return null;
  }
}

// ============================================
// 🔥 Firestore — Pharmacies
// ============================================
async function savePharmacyToFirestore(pharmacyData) {
  if (!isFirebaseReady()) return null;
  try {
    var ref = window.firebaseDoc(window.firebaseDB, COLLECTIONS.PHARMACIES, pharmacyData.phone);
    await window.firebaseSetDoc(ref, Object.assign({}, pharmacyData, {
      updatedAt: new Date().toISOString()
    }), { merge: true });
    return pharmacyData.phone;
  } catch (error) {
    console.error('❌ خطأ حفظ الصيدلية:', error);
    return null;
  }
}

async function loadPharmaciesFromFirestore() {
  if (!isFirebaseReady()) return [];
  try {
    var snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.PHARMACIES)
    );
    var pharmacies = [];
    snapshot.forEach(function (doc) {
      var data = doc.data();
      if (data.active !== false) pharmacies.push(Object.assign({ id: doc.id }, data));
    });
    console.log('✅ تم جلب', pharmacies.length, 'صيدلية');
    return pharmacies;
  } catch (error) {
    console.error('❌ خطأ جلب الصيدليات:', error);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Orders
// ============================================
async function saveOrderToFirestore(orderData) {
  if (!isFirebaseReady()) return null;
  try {
    var ref = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.ORDERS),
      Object.assign({}, orderData, {
        createdAt: new Date().toISOString(),
        status: orderData.status || 'pending'
      })
    );
    console.log('✅ تم حفظ الطلب:', ref.id);
    return ref.id;
  } catch (error) {
    console.error('❌ خطأ حفظ الطلب:', error);
    return null;
  }
}

async function updateOrderInFirestore(orderId, updates) {
  if (!isFirebaseReady()) return false;
  try {
    var ref = window.firebaseDoc(window.firebaseDB, COLLECTIONS.ORDERS, orderId);
    await window.firebaseUpdateDoc(ref, Object.assign({}, updates, {
      updatedAt: new Date().toISOString()
    }));
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
    orders.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
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
    orders.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return orders;
  } catch (error) {
    console.error('❌ خطأ جلب طلبات الصيدلية:', error);
    return [];
  }
}

async function loadDeliveryOrdersFromFirestore() {
  if (!isFirebaseReady()) return [];
  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.ORDERS),
      window.firebaseWhere('status', '==', 'pending')
    );
    var snap = await window.firebaseGetDocs(q);
    var orders = [];
    snap.forEach(function (doc) { orders.push(Object.assign({ id: doc.id }, doc.data())); });
    return orders;
  } catch (e) {
    console.error('❌ خطأ:', e);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Posts
// ============================================
async function savePostToFirestore(postData) {
  if (!isFirebaseReady()) return null;
  try {
    var ref = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.POSTS),
      postData
    );
    return ref.id;
  } catch (error) {
    console.error('❌ خطأ حفظ العرض:', error);
    return null;
  }
}

async function loadPostsFromFirestore() {
  if (!isFirebaseReady()) return [];
  try {
    var snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.POSTS)
    );
    var posts = [];
    snapshot.forEach(function (doc) {
      var data = doc.data();
      if (data.active !== false) posts.push(Object.assign({ id: doc.id }, data));
    });
    posts.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return posts;
  } catch (error) {
    console.error('❌ خطأ جلب العروض:', error);
    return [];
  }
}

// ============================================
// 🔥 Firestore — Ratings
// ============================================
async function saveRatingToFirestore(ratingData) {
  if (!isFirebaseReady()) return null;
  try {
    var ref = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.RATINGS),
      Object.assign({}, ratingData, { createdAt: new Date().toISOString() })
    );
    return ref.id;
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
    var snap = await window.firebaseGetDocs(q);
    var ratings = [];
    snap.forEach(function (doc) { ratings.push(Object.assign({ id: doc.id }, doc.data())); });
    return ratings;
  } catch (error) { return []; }
}

// ============================================
// 🔥 Firestore — Notifications
// ============================================
async function saveNotificationToFirestore(notifData) {
  if (!isFirebaseReady()) return null;
  try {
    var ref = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.NOTIFICATIONS),
      Object.assign({}, notifData, { createdAt: new Date().toISOString() })
    );
    return ref.id;
  } catch (error) {
    console.error('❌ خطأ حفظ الإشعار:', error);
    return null;
  }
}

async function getNotificationsFromFirestore(userPhone) {
  if (!isFirebaseReady()) return [];
  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.NOTIFICATIONS),
      window.firebaseWhere('userPhone', '==', userPhone)
    );
    var snap = await window.firebaseGetDocs(q);
    var notifs = [];
    snap.forEach(function (doc) { notifs.push(Object.assign({ id: doc.id }, doc.data())); });
    notifs.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return notifs;
  } catch (error) { return []; }
}

function addInternalNotification(type, title, message) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  try {
    var user = JSON.parse(userStr);
    var notif = {
      userPhone: user.phone,
      type: type,
      title: title,
      message: message,
      read: false
    };
    if (isFirebaseReady()) {
      saveNotificationToFirestore(notif);
    }
    // محلياً
    var localNotifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
    localNotifs.unshift(Object.assign({}, notif, { date: new Date().toISOString() }));
    if (localNotifs.length > 50) localNotifs = localNotifs.slice(0, 50);
    localStorage.setItem('saydaliyati_notifications', JSON.stringify(localNotifs));
    // تحديث نقطة الإشعارات
    var dot = document.getElementById('homeNotifDot');
    if (dot) dot.style.display = 'block';
  } catch (e) {}
}

console.log('🏆 DAWAK v15 — الجزء 1 اكتمل ✅');
// ============================================
// 📱 Screens Management
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

    if (screenId === 'splashScreen') setTimeout(createSplashParticles, 100);
    if (screenId === 'pharmacyScreen') {
      setTimeout(function () {
        if (typeof initPharmacyMap === 'function') initPharmacyMap();
      }, 300);
    }

    console.log('✅ showScreen:', screenId);
  }
}

function updateBottomNav(screenId) {
  var nav = document.getElementById('mainBottomNav');
  if (!nav) return;

  var navScreens = [
    'homeScreen',
    'pharmacyDashboard',
    'deliveryDashboard',
    'myOrdersScreen',
    'notificationsScreen',
    'profileScreen',
    'conversationsScreen'
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
  else if (tab === 'orders') goToMyOrdersV2();
  else if (tab === 'cart') openCartScreen();
  else if (tab === 'chat') openConversationsScreen();
  else if (tab === 'notifications') openNotifications();
  else if (tab === 'profile') openProfile();
}

// ============================================
// 🎬 Onboarding
// ============================================
function initOnboarding() {
  var hasSeen = localStorage.getItem('saydaliyati_onboarding_done');
  if (hasSeen === 'true') {
    showScreen('loginScreen');
    return;
  }
  currentOnboardingSlide = 0;
  updateOnboardingUI();
}

function nextSlide() {
  if (currentOnboardingSlide < totalOnboardingSlides - 1) {
    currentOnboardingSlide++;
    updateOnboardingUI();
    playSonarPing();
    if (navigator.vibrate) navigator.vibrate([30]);
  } else {
    finishOnboarding();
  }
}

function goToSlide(index) {
  if (index < 0 || index >= totalOnboardingSlides) return;
  if (index === currentOnboardingSlide) return;
  currentOnboardingSlide = index;
  updateOnboardingUI();
  playSonarPing();
}

function updateOnboardingUI() {
  document.querySelectorAll('.ob-slide').forEach(function (slide) {
    slide.classList.remove('active');
  });
  var currentSlide = document.querySelector('.ob-slide[data-slide="' + currentOnboardingSlide + '"]');
  if (currentSlide) currentSlide.classList.add('active');

  document.querySelectorAll('.ob-dot').forEach(function (dot, idx) {
    dot.classList.toggle('active', idx === currentOnboardingSlide);
  });

  var nextBtn = document.getElementById('obNextBtn');
  var nextText = document.getElementById('obNextText');

  if (nextBtn && nextText) {
    if (currentOnboardingSlide === totalOnboardingSlides - 1) {
      nextText.textContent = 'ابدأ الآن';
      nextBtn.classList.add('finish');
    } else {
      nextText.textContent = 'التالي';
      nextBtn.classList.remove('finish');
    }
  }
}

function finishOnboarding() {
  localStorage.setItem('saydaliyati_onboarding_done', 'true');
  playSuccessSound();
  if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  setTimeout(function () { showScreen('loginScreen'); }, 300);
}

// ============================================
// 🔀 Navigation
// ============================================
function goToSplash() { showScreen('splashScreen'); }
function goToLogin() { showScreen('loginScreen'); }
function goToRoleSelection() { showScreen('roleScreen'); }
function closeAllScreens() { goToDashboardByType(); }

function selectRole(role) {
  if (role === 'patient') {
    showScreen('patientScreen');
  } else if (role === 'pharmacy') {
    showScreen('pharmacyScreen');
    setTimeout(function () {
      if (typeof initPharmacyMap === 'function') initPharmacyMap();
    }, 300);
  } else if (role === 'delivery') {
    showScreen('deliveryScreen');
  }
}

// ============================================
// 🎯 Dashboard by User Type
// ============================================
function goToDashboardByType() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};

  if (user.type === 'pharmacy') {
    showScreen('pharmacyDashboard');
    setTimeout(function () {
      updateUserName();
      loadPharmacyDashboard();
    }, 100);
  } else if (user.type === 'delivery') {
    showScreen('deliveryDashboard');
    setTimeout(function () {
      updateUserName();
      loadDeliveryDashboard();
    }, 100);
  } else {
    showScreen('homeScreen');
    setTimeout(function () {
      updateUserName();
      detectUserLocationSilent();
      loadHomePharmacies();
      loadHomeOffers();
      updateHomeNotifDot();
    }, 100);
  }
}

// ============================================
// 👤 Update User Info (في كل الشاشات)
// ============================================
function updateUserName() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  try {
    var user = JSON.parse(userStr);
    var userName = user.name || 'مستخدم';
    var firstLetter = userName.charAt(0);

    // Home
    var homeName = document.getElementById('homeUserName');
    if (homeName) homeName.textContent = userName;

    var homeAvatar = document.getElementById('homeAvatarLetter');
    var homeAvatarBtn = document.getElementById('homeAvatarBtn');
    if (homeAvatar && homeAvatarBtn) {
      if (user.avatar) {
        homeAvatar.textContent = '';
        homeAvatarBtn.style.backgroundImage = 'url(' + user.avatar + ')';
        homeAvatarBtn.style.backgroundSize = 'cover';
        homeAvatarBtn.style.backgroundPosition = 'center';
      } else {
        homeAvatar.textContent = firstLetter;
        homeAvatarBtn.style.backgroundImage = '';
      }
    }

    // Pharmacy
    var phGreeting = document.getElementById('pharmacyGreeting');
    if (phGreeting) phGreeting.textContent = userName;

    var phAvatar = document.getElementById('pharmacyAvatarLetter');
    if (phAvatar) {
      var phAvatarBtn = phAvatar.parentElement;
      if (user.avatar && phAvatarBtn) {
        phAvatar.textContent = '';
        phAvatarBtn.style.backgroundImage = 'url(' + user.avatar + ')';
        phAvatarBtn.style.backgroundSize = 'cover';
        phAvatarBtn.style.backgroundPosition = 'center';
      } else {
        phAvatar.textContent = firstLetter;
      }
    }

    // Delivery
    var delGreeting = document.getElementById('deliveryGreeting');
    if (delGreeting) delGreeting.textContent = userName;

    var delAvatar = document.getElementById('deliveryAvatarLetter');
    if (delAvatar) {
      var delAvatarBtn = delAvatar.parentElement;
      if (user.avatar && delAvatarBtn) {
        delAvatar.textContent = '';
        delAvatarBtn.style.backgroundImage = 'url(' + user.avatar + ')';
        delAvatarBtn.style.backgroundSize = 'cover';
        delAvatarBtn.style.backgroundPosition = 'center';
      } else {
        delAvatar.textContent = firstLetter;
      }
    }

    // Profile
    var profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = userName;

    var profilePhone = document.getElementById('profilePhone');
    if (profilePhone) profilePhone.textContent = user.phone || '-';

    var profileLocation = document.getElementById('profileLocation');
    if (profileLocation) profileLocation.textContent = user.address || user.area || 'بغداد، العراق';

    var profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
      if (user.avatar) {
        profileAvatar.textContent = '';
        profileAvatar.style.backgroundImage = 'url(' + user.avatar + ')';
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.style.backgroundPosition = 'center';
      } else {
        profileAvatar.textContent = firstLetter;
        profileAvatar.style.backgroundImage = '';
      }
    }
  } catch (e) {
    console.error('خطأ تحديث الاسم:', e);
  }
}

// ============================================
// 🔐 Login
// ============================================
async function submitLogin(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  var phoneInput = document.getElementById('loginPhone');
  var passwordInput = document.getElementById('loginPassword');

  var phone = phoneInput.value.trim();
  var password = passwordInput.value.trim();

  if (!phone || !password) { showError('املأ كل الحقول'); return; }
  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح (07XXXXXXXXX)'); return; }

  var authEmails = [
    phone + '@saydaliyati.app',
    phone + '@pharmacy.saydaliyati.app',
    phone + '@driver.saydaliyati.app'
  ];

  var user = null;
  var authError = null;

  if (window.firebaseAuth && window.firebaseSignIn) {
    for (var i = 0; i < authEmails.length; i++) {
      try {
        var userCred = await window.firebaseSignIn(window.firebaseAuth, authEmails[i], password);
        console.log('✅ Firebase Auth:', userCred.user.uid);

        if (isFirebaseReady()) {
          try {
            user = await getUserFromFirestore(userCred.user.uid);
          } catch (e) {}
        }

        if (!user) {
          // fallback to registrations
          var regs = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
          var localUser = regs.find(function (r) { return r.phone === phone; });
          if (localUser) user = localUser;
        }

        if (!user) {
          user = {
            uid: userCred.user.uid,
            type: 'patient',
            name: 'مستخدم',
            phone: phone,
            email: authEmails[i],
            loginMethod: 'phone',
            date: new Date().toISOString()
          };
        }
        break;
      } catch (err) {
        authError = err;
      }
    }
  }

  if (!user) {
    var regs2 = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    var localUser2 = regs2.find(function (r) {
      return r.phone === phone && r.password === password;
    });
    if (localUser2) user = localUser2;
  }

  if (!user) {
    if (authError) {
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        showError('رقم الهاتف أو كلمة المرور غير صحيحة');
      } else {
        showError('رقم الهاتف غير مسجل');
      }
    } else {
      showError('رقم الهاتف غير مسجل. سجل حساب جديد أولاً.');
    }
    return;
  }

  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
  playSuccessSound();
  if (navigator.vibrate) navigator.vibrate([50]);

  showToast('أهلاً بك في DAWAK، ' + (user.name || ''));

  setTimeout(function () {
    goToDashboardByType();
  }, 500);
}

// ============================================
// 🚪 Logout
// ============================================
async function logout() {
  var confirmed = await showConfirm({
    title: 'تسجيل الخروج',
    message: 'هل أنت متأكد من تسجيل الخروج؟',
    confirmText: 'نعم، سجل خروج',
    cancelText: 'إلغاء',
    confirmColor: 'danger',
    icon: '🚪'
  });

  if (!confirmed) return;

  localStorage.removeItem('saydaliyati_current_user');

  if (typeof signOutFromFirebase === 'function') {
    try { await signOutFromFirebase(); } catch (e) {}
  }

  showScreen('loginScreen');
  showToast('✅ تم تسجيل الخروج');
}

async function signOutFromFirebase() {
  if (!window.firebaseAuth || !window.firebaseSignOut) return;
  try {
    await window.firebaseSignOut(window.firebaseAuth);
  } catch (e) {}
}

// ============================================
// 🔑 Forgot Password
// ============================================
async function forgotPassword() {
  var phoneInput = document.getElementById('loginPhone');
  var phone = phoneInput ? phoneInput.value.trim() : '';

  if (!phone) {
    var userPhone = prompt('📱 أدخل رقم هاتفك المسجل:');
    if (!userPhone) return;
    phone = userPhone.trim();
  }

  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح'); return; }

  var confirmed = await showConfirm({
    title: 'استعادة كلمة المرور',
    message: 'سنتواصل معك على الرقم ' + phone,
    confirmText: 'نعم، أرسل',
    cancelText: 'إلغاء',
    confirmColor: 'info',
    icon: '🔑'
  });

  if (!confirmed) return;

  try {
    if (isFirebaseReady()) {
      await window.firebaseAddDoc(
        window.firebaseCollection(window.firebaseDB, 'password_reset_requests'),
        {
          phone: phone,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      );
    }
    playSuccessSound();
    showSuccessMessage('تم استلام طلبك', 'سنتواصل معك خلال 24 ساعة');
  } catch (e) {
    showError('فشل إرسال الطلب');
  }
}

// ============================================
// 🧑 Patient Registration
// ============================================
async function submitPatient(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }

  var name = document.getElementById('patientName').value.trim();
  var phone = document.getElementById('patientPhone').value.trim();
  var address = document.getElementById('patientAddress').value.trim();
  var password = document.getElementById('patientPassword').value.trim();

  if (!name || !phone || !address || !password) { showError('املأ الحقول الإلزامية'); return; }
  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح'); return; }
  if (password.length < 6) { showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

  var authEmail = phone + '@saydaliyati.app';
  var uid = null;

  if (window.firebaseAuth && window.firebaseCreateUser) {
    try {
      var userCred = await window.firebaseCreateUser(window.firebaseAuth, authEmail, password);
      uid = userCred.user.uid;
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        showError('رقم الهاتف مسجل مسبقاً');
      } else {
        showError('فشل التسجيل: ' + authError.message);
      }
      return;
    }
  } else {
    uid = 'local_' + phone + '_' + Date.now();
  }

  var user = {
    uid: uid,
    type: 'patient',
    name: name,
    phone: phone,
    address: address,
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try { await saveUserToFirestore(user); } catch (e) {}

  playSuccessSound();
  showSuccessMessage('تم إنشاء حسابك', 'أهلاً بك في DAWAK، ' + name);
}

// ============================================
// 🏪 Pharmacy Registration
// ============================================
async function submitPharmacy(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }

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
  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح'); return; }
  if (password.length < 6) { showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

  var pharmacyLat = document.getElementById('pharmacyLat').value;
  var pharmacyLng = document.getElementById('pharmacyLng').value;

  if (!pharmacyLat || !pharmacyLng) {
    showError('الرجاء تحديد موقع الصيدلية على الخريطة');
    return;
  }

  var authEmail = phone + '@pharmacy.saydaliyati.app';
  var uid = null;

  if (window.firebaseAuth && window.firebaseCreateUser) {
    try {
      var userCred = await window.firebaseCreateUser(window.firebaseAuth, authEmail, password);
      uid = userCred.user.uid;
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        showError('رقم الهاتف مسجل مسبقاً');
      } else {
        showError('فشل التسجيل: ' + authError.message);
      }
      return;
    }
  } else {
    uid = 'local_' + phone + '_' + Date.now();
  }

  var user = {
    uid: uid,
    type: 'pharmacy',
    name: name,
    owner: owner,
    phone: phone,
    address: address,
    license: license,
    lat: parseFloat(pharmacyLat),
    lng: parseFloat(pharmacyLng),
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try {
    await saveUserToFirestore(user);
    await savePharmacyToFirestore({
      uid: uid,
      name: name,
      owner: owner,
      phone: phone,
      address: address,
      license: license,
      lat: parseFloat(pharmacyLat),
      lng: parseFloat(pharmacyLng),
      rating: 0,
      logo: 'ص',
      deliveryTime: '30 دقيقة',
      active: true
    });
  } catch (e) {}

  playSuccessSound();
  showSuccessMessage('تم استلام طلبك', 'سنتواصل معك خلال 24 ساعة');
}

// ============================================
// 🚴 Delivery Registration
// ============================================
async function submitDelivery(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }

  var name = document.getElementById('deliveryName').value.trim();
  var phone = document.getElementById('deliveryPhone').value.trim();
  var area = document.getElementById('deliveryArea').value.trim();
  var vehicle = document.getElementById('vehicleType').value;
  var password = document.getElementById('deliveryPassword').value.trim();

  if (!name || !phone || !area || !vehicle || !password) {
    showError('املأ الحقول الإلزامية');
    return;
  }
  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح'); return; }
  if (password.length < 6) { showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

  var authEmail = phone + '@driver.saydaliyati.app';
  var uid = null;

  if (window.firebaseAuth && window.firebaseCreateUser) {
    try {
      var userCred = await window.firebaseCreateUser(window.firebaseAuth, authEmail, password);
      uid = userCred.user.uid;
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        showError('رقم الهاتف مسجل مسبقاً');
      } else {
        showError('فشل التسجيل: ' + authError.message);
      }
      return;
    }
  } else {
    uid = 'local_' + phone + '_' + Date.now();
  }

  var user = {
    uid: uid,
    type: 'delivery',
    name: name,
    phone: phone,
    area: area,
    vehicle: vehicle,
    password: password,
    date: new Date().toISOString()
  };

  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

  try { await saveUserToFirestore(user); } catch (e) {}

  playSuccessSound();
  showSuccessMessage('مرحباً بك في فريقنا', 'سنتواصل معك قريباً');
}

// ============================================
// 🔥 Google Sign-In
// ============================================
async function signInWithGoogleTest() {
  if (!window.firebaseAuth || !window.firebaseProvider || !window.firebaseSignInWithPopup) {
    showError('Firebase غير جاهز');
    return;
  }

  try {
    var result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseProvider);
    var user = result.user;

    var userData = {
      uid: user.uid,
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

    var existing = null;
    try { existing = await getUserFromFirestore(user.uid); } catch (e) {}

    if (existing) userData = Object.assign({}, userData, existing);
    else {
      saveRegistration(userData);
      try { await saveUserToFirestore(userData); } catch (e) {}
    }

    localStorage.setItem('saydaliyati_current_user', JSON.stringify(userData));
    playSuccessSound();
    showToast('✅ تم الدخول بنجاح');

    setTimeout(goToDashboardByType, 800);
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') showToast('⚠️ تم إغلاق النافذة');
    else showError('فشل الدخول');
  }
}

async function signUpWithGoogleTest() { return signInWithGoogleTest(); }

// ============================================
// 🗺️ Pharmacy Map (Registration)
// ============================================
var pharmacyMap = null;
var pharmacyMarker = null;

function initPharmacyMap() {
  var mapEl = document.getElementById('pharmacyMap');
  if (!mapEl) return;
  if (pharmacyMap) return;
  if (typeof L === 'undefined') return;

  var center = [33.3152, 44.3661];

  pharmacyMap = L.map('pharmacyMap', {
    zoomControl: true,
    attributionControl: false
  }).setView(center, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(pharmacyMap);

  var icon = L.divIcon({
    className: 'custom-map-marker marker-pharmacy',
    html: '<div class="custom-marker-pin"><span>🏪</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

  pharmacyMarker = L.marker(center, { icon: icon, draggable: true }).addTo(pharmacyMap);

  pharmacyMarker.on('dragend', function (e) {
    var pos = e.target.getLatLng();
    setPharmacyLocation(pos.lat, pos.lng);
  });

  pharmacyMap.on('click', function (e) {
    pharmacyMarker.setLatLng(e.latlng);
    setPharmacyLocation(e.latlng.lat, e.latlng.lng);
  });

  setPharmacyLocation(center[0], center[1]);
}

function getPharmacyLocation() {
  if (!navigator.geolocation) { showToast('⚠️ المتصفح لا يدعم GPS'); return; }
  showToast('🔄 جاري تحديد موقعك...');

  navigator.geolocation.getCurrentPosition(
    function (position) {
      var loc = [position.coords.latitude, position.coords.longitude];
      if (pharmacyMap && pharmacyMarker) {
        pharmacyMap.setView(loc, 16);
        pharmacyMarker.setLatLng(loc);
      }
      setPharmacyLocation(loc[0], loc[1]);
      showToast('✅ تم تحديد موقع الصيدلية');
    },
    function () { showToast('⚠️ تعذّر تحديد موقعك'); },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function setPharmacyLocation(lat, lng) {
  var latEl = document.getElementById('pharmacyLat');
  var lngEl = document.getElementById('pharmacyLng');
  var statusEl = document.getElementById('pharmacyLocationStatus');

  if (latEl) latEl.value = lat;
  if (lngEl) lngEl.value = lng;

  if (statusEl) {
    statusEl.textContent = '✅ الموقع محدد: ' + lat.toFixed(4) + ' , ' + lng.toFixed(4);
    statusEl.classList.add('ok');
  }
}

// ============================================
// 📍 User Location (Silent)
// ============================================
function detectUserLocation() {
  var locEl = document.getElementById('homeUserLocation');
  if (!locEl) return;

  if (!navigator.geolocation) {
    locEl.textContent = 'بغداد، العراق';
    return;
  }

  locEl.textContent = '🔄 جاري تحديد موقعك...';

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      try {
        var response = await fetch(
          'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=ar'
        );
        var data = await response.json();

        if (data && data.address) {
          var city = data.address.city || data.address.town || data.address.state || 'بغداد';
          var suburb = data.address.suburb || data.address.neighbourhood || data.address.village || '';
          var locText = suburb ? (suburb + '، ' + city) : city;
          locEl.textContent = locText;

          var userStr = localStorage.getItem('saydaliyati_current_user');
          if (userStr) {
            var user = JSON.parse(userStr);
            user.lat = lat;
            user.lng = lng;
            user.locationText = locText;
            localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
          }
        } else {
          locEl.textContent = 'بغداد، العراق';
        }
      } catch (e) {
        locEl.textContent = 'بغداد، العراق';
      }

      localStorage.setItem('saydaliyati_user_location', JSON.stringify({ lat: lat, lng: lng }));
    },
    function () {
      locEl.textContent = '📍 اضغط لتحديد موقعك';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function detectUserLocationSilent() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    function (position) {
      localStorage.setItem('saydaliyati_user_location', JSON.stringify({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }));
    },
    function () {},
    { enableHighAccuracy: true, timeout: 5000 }
  );
}

console.log('🏆 DAWAK v15 — الجزء 2 اكتمل ✅');
// ============================================
// 🏠 Home — Pharmacies
// ============================================
async function loadHomePharmacies() {
  var container = document.getElementById('homePharmaciesList');
  if (!container) return;

  container.innerHTML = '<div class="home-loading"><div class="home-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="home-loading">لا توجد صيدليات</div>';
      return;
    }

    var pharmacies = await loadPharmaciesFromFirestore();
    pharmacies.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    var topPharmacies = pharmacies.slice(0, 3);

    if (topPharmacies.length === 0) {
      container.innerHTML = '<div class="home-loading">لا توجد صيدليات مسجلة بعد</div>';
      return;
    }

    var userLoc = null;
    try {
      var locStr = localStorage.getItem('saydaliyati_user_location');
      if (locStr) userLoc = JSON.parse(locStr);
    } catch (e) {}

    var html = '';
    topPharmacies.forEach(function (p) {
      var rating = p.rating || 0;
      var distanceText = '—';
      if (userLoc && p.lat && p.lng) {
        var dist = calculateDistanceKm(userLoc.lat, userLoc.lng, p.lat, p.lng);
        distanceText = dist.toFixed(1) + ' كم';
      }

      var logo = p.logo || 'ص';

      html +=
        '<div class="home-pharmacy-card" onclick="openPharmacyDetails(\'' + p.id + '\')">' +
          '<div class="home-pharmacy-logo">' + logo + '</div>' +
          '<div class="home-pharmacy-info">' +
            '<h4 class="home-pharmacy-name">' + (p.name || 'صيدلية') + '</h4>' +
            '<div class="home-pharmacy-meta">' +
              '<span class="home-pharmacy-rating">★ ' + rating.toFixed(1) + '</span>' +
              '<span>📍 ' + distanceText + '</span>' +
            '</div>' +
            '<span class="home-pharmacy-status"><span class="status-dot"></span>مفتوح الآن</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('❌ خطأ تحميل الصيدليات:', error);
    container.innerHTML = '<div class="home-loading">حدث خطأ</div>';
  }
}

// ============================================
// 💊 Home — Offers
// ============================================
async function loadHomeOffers() {
  var container = document.getElementById('homeOffersScroll');
  if (!container) return;

  container.innerHTML = '<div class="home-loading"><div class="home-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="home-loading">لا توجد عروض</div>';
      return;
    }

    var posts = await loadPostsFromFirestore();
    postsCache = posts;

    if (!posts || posts.length === 0) {
      container.innerHTML = '<div class="home-loading">لا توجد عروض حالياً</div>';
      return;
    }

    var topPosts = posts.slice(0, 6);
    var html = '';

    topPosts.forEach(function (post) {
      var imageSrc = post.image || '';
      var price = (post.price || 0).toLocaleString();
      var title = post.title || 'دواء';

      var imageHTML = '💊';
      if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
        imageHTML = '<img src="' + imageSrc + '" alt="">';
      }

      html +=
        '<div class="home-offer-card" onclick="orderFromPostV2(\'' + post.id + '\')">' +
          '<div class="home-offer-image">' + imageHTML + '</div>' +
          '<h4 class="home-offer-title">' + title + '</h4>' +
          '<div class="home-offer-price-row">' +
            '<span class="home-offer-price">' + price + '<small>د.ع</small></span>' +
            '<span class="home-offer-plus">+</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('❌ خطأ تحميل العروض:', error);
    container.innerHTML = '<div class="home-loading">حدث خطأ</div>';
  }
}

function filterHomeCategory(category, btn) {
  currentHomeCategory = category;
  document.querySelectorAll('.home-cat').forEach(function (chip) {
    chip.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  if (navigator.vibrate) navigator.vibrate([20]);
  loadHomeOffersByCategory(category);
}

async function loadHomeOffersByCategory(category) {
  var container = document.getElementById('homeOffersScroll');
  if (!container) return;

  try {
    if (!isFirebaseReady()) return;
    var posts = await loadPostsFromFirestore();

    if (category !== 'all') {
      var catMap = {
        'care': 'medicine',
        'antibiotics': 'medicine',
        'vitamins': 'vitamins',
        'painkillers': 'medicine'
      };
      var firestoreCat = catMap[category] || category;
      posts = posts.filter(function (p) { return p.category === firestoreCat; });
    }

    if (posts.length === 0) {
      container.innerHTML = '<div class="home-loading">لا توجد عروض</div>';
      return;
    }

    var topPosts = posts.slice(0, 6);
    var html = '';

    topPosts.forEach(function (post) {
      var imageSrc = post.image || '';
      var imageHTML = '💊';
      if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
        imageHTML = '<img src="' + imageSrc + '" alt="">';
      }

      html +=
        '<div class="home-offer-card" onclick="orderFromPostV2(\'' + post.id + '\')">' +
          '<div class="home-offer-image">' + imageHTML + '</div>' +
          '<h4 class="home-offer-title">' + (post.title || 'دواء') + '</h4>' +
          '<div class="home-offer-price-row">' +
            '<span class="home-offer-price">' + (post.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
            '<span class="home-offer-plus">+</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

function updateHomeNotifDot() {
  var dotEl = document.getElementById('homeNotifDot');
  if (!dotEl) return;
  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  var unread = notifs.filter(function (n) { return !n.read; }).length;
  dotEl.style.display = unread > 0 ? 'block' : 'none';
}

function openSearchScreen() { showToast('🔍 البحث قريباً'); }
function openPharmaciesList() { showToast('🏪 القائمة قريباً'); }
function openAllPosts() {
  var el = document.getElementById('homeOffersScroll');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openPharmacyDetails(pharmacyId) {
  localStorage.setItem('saydaliyati_selected_pharmacy', JSON.stringify({ id: pharmacyId }));
  showToast('🏪 جاري فتح الصيدلية...');
  setTimeout(openCartScreen, 500);
}

// ============================================
// 🛒 Cart — Open + Render
// ============================================
async function openCartScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }

  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  cart = JSON.parse(localStorage.getItem('saydaliyati_cart') || '[]');

  var addressInput = document.getElementById('cartAddressInput');
  if (addressInput && user.address) addressInput.value = user.address;

  renderCartV2();
  showScreen('cartScreen');
}

function renderCartV2() {
  var container = document.getElementById('cartItemsList');
  var emptyState = document.getElementById('cartEmptyState');
  var summaryCard = document.getElementById('cartSummaryCard');
  var addressSection = document.getElementById('cartAddressSection');
  var paymentSection = document.getElementById('cartPaymentSection');
  var checkoutBtn = document.getElementById('cartCheckoutBtn');
  var couponWrapper = document.getElementById('cartCouponWrapper');
  var clearBtn = document.getElementById('cartClearBtn');
  var countBadge = document.getElementById('cartCountBadge');

  if (!container) return;

  var totalItems = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
  if (countBadge) countBadge.textContent = totalItems + ' ' + (totalItems === 1 ? 'منتج' : 'منتجات');

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (summaryCard) summaryCard.style.display = 'none';
    if (addressSection) addressSection.style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    if (couponWrapper) couponWrapper.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    updateCartBadge();
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summaryCard) summaryCard.style.display = 'block';
  if (addressSection) addressSection.style.display = 'block';
  if (paymentSection) paymentSection.style.display = 'block';
  if (checkoutBtn) checkoutBtn.style.display = 'flex';
  if (couponWrapper) couponWrapper.style.display = 'block';
  if (clearBtn) clearBtn.style.display = 'flex';

  var html = '';
  cart.forEach(function (item, index) {
    var imageHTML = '💊';
    if (item.image && (item.image.startsWith('http') || item.image.startsWith('data:'))) {
      imageHTML = '<img src="' + item.image + '" alt="">';
    } else if (item.icon) {
      imageHTML = item.icon;
    }

    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-image">' + imageHTML + '</div>' +
        '<div class="cart-item-details">' +
          '<h4 class="cart-item-name">' + item.name + '</h4>' +
          '<p class="cart-item-pharmacy">🏪 ' + (item.pharmacy || 'صيدلية') + '</p>' +
          '<span class="cart-item-price">' + item.price.toLocaleString() + '<small>د.ع</small></span>' +
        '</div>' +
        '<div class="cart-item-controls">' +
          '<button class="cart-qty-btn" onclick="changeQuantity(' + index + ', -1)">−</button>' +
          '<span class="cart-qty-value">' + item.quantity + '</span>' +
          '<button class="cart-qty-btn" onclick="changeQuantity(' + index + ', 1)">+</button>' +
          '<button class="cart-remove" onclick="removeFromCart(' + index + ')">🗑️</button>' +
        '</div>' +
      '</div>';
  });

  container.innerHTML = html;
  updateCartSummary();
  updateCartBadge();
}

function changeQuantity(index, delta) {
  if (index < 0 || index >= cart.length) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  renderCartV2();
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  renderCartV2();
  showToast('تم الحذف من السلة');
}

async function clearCart() {
  if (cart.length === 0) return;
  var confirmed = await showConfirm({
    title: 'مسح السلة',
    message: 'هل تريد مسح جميع المنتجات؟',
    confirmText: 'نعم، امسح',
    cancelText: 'إلغاء',
    confirmColor: 'danger',
    icon: '🗑️'
  });
  if (!confirmed) return;
  cart = [];
  saveCart();
  renderCartV2();
  showToast('تم مسح السلة');
}

function updateCartSummary() {
  var subtotal = cart.reduce(function (s, i) { return s + (i.price * i.quantity); }, 0);

  var deliveryData = JSON.parse(localStorage.getItem('saydaliyati_cart_delivery') || 'null');
  var delivery = deliveryData ? deliveryData.total : 0;

  if (!deliveryData) {
    var userLoc = JSON.parse(localStorage.getItem('saydaliyati_user_location') || 'null');
    if (userLoc && cart.length > 0) {
      delivery = calculateDeliveryFee(DELIVERY_PRICING.DEFAULT_DISTANCE).total;
    } else {
      delivery = 3000;
    }
  }

  var discount = 0;
  var couponData = JSON.parse(localStorage.getItem('saydaliyati_cart_coupon') || 'null');
  if (couponData) {
    if (couponData.type === 'percentage') discount = Math.round(subtotal * (couponData.value / 100));
    else if (couponData.type === 'fixed') discount = Math.min(couponData.value, subtotal);
  }

  var total = subtotal + delivery - discount;

  var subEl = document.getElementById('cartSubtotalValue');
  var delEl = document.getElementById('cartDeliveryValue');
  var discEl = document.getElementById('cartDiscountValue');
  var discRow = document.getElementById('cartDiscountRow');
  var totEl = document.getElementById('cartTotalValue');
  var coTotal = document.getElementById('cartCheckoutTotal');

  if (subEl) subEl.textContent = subtotal.toLocaleString() + ' د.ع';
  if (delEl) delEl.textContent = delivery.toLocaleString() + ' د.ع';

  if (discount > 0 && discRow) {
    discRow.style.display = 'flex';
    if (discEl) discEl.textContent = '- ' + discount.toLocaleString() + ' د.ع';
  } else if (discRow) {
    discRow.style.display = 'none';
  }

  if (totEl) totEl.textContent = total.toLocaleString() + ' د.ع';
  if (coTotal) coTotal.textContent = total.toLocaleString() + ' د.ع';
}

function applyCoupon() {
  var input = document.getElementById('cartCouponInput');
  var message = document.getElementById('cartCouponMessage');
  if (!input || !message) return;

  var code = input.value.trim().toUpperCase();

  if (!code) {
    message.textContent = '⚠️ أدخل كود الخصم';
    message.className = 'cart-coupon-msg error';
    return;
  }

  if (COUPONS[code]) {
    var coupon = COUPONS[code];
    localStorage.setItem('saydaliyati_cart_coupon', JSON.stringify({
      code: code, type: coupon.type, value: coupon.value, label: coupon.label
    }));
    message.textContent = '✅ تم تطبيق ' + coupon.label;
    message.className = 'cart-coupon-msg success';
    playSuccessSound();
    updateCartSummary();
    showToast('🎉 ' + coupon.label);
  } else {
    message.textContent = '❌ كود الخصم غير صحيح';
    message.className = 'cart-coupon-msg error';
    localStorage.removeItem('saydaliyati_cart_coupon');
    updateCartSummary();
  }
}

function openMapForAddress() {
  showToast('📍 جاري تحديد موقعك...');

  if (!navigator.geolocation) { showToast('⚠️ المتصفح لا يدعم GPS'); return; }

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      try {
        var response = await fetch(
          'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=ar'
        );
        var data = await response.json();

        if (data && data.address) {
          var city = data.address.city || data.address.town || 'بغداد';
          var suburb = data.address.suburb || data.address.neighbourhood || '';
          var street = data.address.road || '';
          var parts = [street, suburb, city].filter(function (p) { return p; });
          var locText = parts.join('، ');

          var addressInput = document.getElementById('cartAddressInput');
          if (addressInput) addressInput.value = locText;

          var userStr = localStorage.getItem('saydaliyati_current_user');
          if (userStr) {
            var user = JSON.parse(userStr);
            user.address = locText;
            user.lat = lat;
            user.lng = lng;
            localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
          }

          localStorage.setItem('saydaliyati_user_location', JSON.stringify({ lat: lat, lng: lng }));
          showToast('✅ تم تحديد العنوان');

          updateCartSummary();
        }
      } catch (e) {
        showToast('⚠️ تعذّر تحديد العنوان');
      }
    },
    function () { showToast('⚠️ تعذر تحديد موقعك'); },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function submitCartOrderV2() {
  if (cart.length === 0) { showError('السلة فارغة'); return; }

  var addressInput = document.getElementById('cartAddressInput');
  var address = addressInput ? addressInput.value.trim() : '';

  if (!address) { showError('أدخل عنوان التوصيل'); return; }

  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  var user = JSON.parse(userStr);

  var subtotal = cart.reduce(function (s, i) { return s + (i.price * i.quantity); }, 0);

  var deliveryData = JSON.parse(localStorage.getItem('saydaliyati_cart_delivery') || 'null');
  var delivery = deliveryData ? deliveryData.total : 3000;
  var driverShare = deliveryData ? deliveryData.driverShare : Math.round(delivery * 0.85);
  var platformShare = deliveryData ? deliveryData.platformShare : delivery - driverShare;
  var distance = deliveryData ? deliveryData.distance : 3;

  var discount = 0;
  var couponData = JSON.parse(localStorage.getItem('saydaliyati_cart_coupon') || 'null');
  if (couponData) {
    if (couponData.type === 'percentage') discount = Math.round(subtotal * (couponData.value / 100));
    else if (couponData.type === 'fixed') discount = Math.min(couponData.value, subtotal);
  }

  var total = subtotal + delivery - discount;
  var orderId = Math.floor(1000 + Math.random() * 9000);

  var order = {
    id: orderId,
    type: 'cart',
    patientName: user.name,
    patientPhone: user.phone,
    patientId: user.uid || user.phone,
    patientLat: user.lat || null,
    patientLng: user.lng || null,
    pharmacy: cart[0].pharmacy,
    address: address,
    payment: 'cash',
    items: cart.slice(),
    subtotal: subtotal,
    delivery: delivery,
    deliveryFee: delivery,
    discount: discount,
    couponCode: couponData ? couponData.code : null,
    driverShare: driverShare,
    platformShare: platformShare,
    distance: distance,
    total: total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseReady()) {
    try { await saveOrderToFirestore(order); } catch (e) {}
  }

  var orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_cart_orders', JSON.stringify(orders));

  addInternalNotification('order', '🛒 طلبك #' + orderId, 'في انتظار قبول الصيدلية');

  cart = [];
  saveCart();
  updateCartBadge();
  localStorage.removeItem('saydaliyati_cart_delivery');
  localStorage.removeItem('saydaliyati_cart_coupon');

  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'طلب #' + orderId);
  renderCartV2();
}

// ============================================
// 💊 Product Details
// ============================================
function openProductDetails(productData) {
  if (!productData) { showToast('⚠️ لا توجد بيانات'); return; }

  currentProductDetails = Object.assign({}, productData);
  pdpQuantity = 1;

  var imgEl = document.getElementById('pdpImage');
  var emojiEl = document.getElementById('pdpImageEmoji');
  var imageSrc = productData.image || '';

  if (imgEl && emojiEl) {
    if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
      imgEl.src = imageSrc;
      imgEl.style.display = 'block';
      emojiEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      emojiEl.style.display = 'block';
      emojiEl.textContent = productData.icon || '💊';
    }
  }

  var titleEl = document.getElementById('pdpTitle');
  if (titleEl) titleEl.textContent = productData.name || 'دواء';

  var catEl = document.getElementById('pdpCategory');
  if (catEl) catEl.textContent = productData.category || 'أدوية';

  var ratEl = document.getElementById('pdpRatingValue');
  if (ratEl) ratEl.textContent = (productData.rating || 0).toFixed(1);

  var ratCntEl = document.getElementById('pdpRatingCount');
  if (ratCntEl) ratCntEl.textContent = productData.ratingCount || 0;

  var stockEl = document.getElementById('pdpStockText');
  var stock = productData.stock || 0;
  if (stockEl) {
    if (stock === 0) stockEl.textContent = 'غير متوفر';
    else if (stock <= 10) stockEl.textContent = 'كمية محدودة - ' + stock;
    else stockEl.textContent = 'متوفر - ' + stock + ' علبة';
  }

  var priceCurEl = document.getElementById('pdpPriceCurrent');
  if (priceCurEl) priceCurEl.textContent = (productData.price || 0).toLocaleString();

  var descEl = document.getElementById('pdpDescription');
  if (descEl) descEl.textContent = productData.desc || (productData.name + ' دواء موثوق من صيدلية معتمدة.');

  var qtyEl = document.getElementById('pdpQuantity');
  if (qtyEl) qtyEl.textContent = pdpQuantity;

  updatePdpAddButton();
  updatePdpFavoriteStatus();
  loadAlternatives(productData.category, productData.id);

  showScreen('productDetailsScreen');
  if (navigator.vibrate) navigator.vibrate([30]);
}

function closeProductDetails() {
  currentProductDetails = null;
  pdpQuantity = 1;
  goToDashboardByType();
}

function pdpChangeQty(delta) {
  if (!currentProductDetails) return;
  var maxStock = currentProductDetails.stock || 50;
  var newQty = pdpQuantity + delta;
  if (newQty < 1) newQty = 1;
  if (newQty > maxStock) { showToast('⚠️ الكمية المتوفرة: ' + maxStock); return; }
  pdpQuantity = newQty;
  var qtyEl = document.getElementById('pdpQuantity');
  if (qtyEl) qtyEl.textContent = pdpQuantity;
  updatePdpAddButton();
  if (navigator.vibrate) navigator.vibrate([15]);
}

function updatePdpAddButton() {
  if (!currentProductDetails) return;
  var total = (currentProductDetails.price || 0) * pdpQuantity;
  var totalEl = document.getElementById('pdpAddTotal');
  if (totalEl) totalEl.textContent = total.toLocaleString();
}

function pdpAddToCart() {
  if (!currentProductDetails) return;
  var stock = currentProductDetails.stock || 50;
  if (stock === 0) { showToast('⚠️ المنتج نفد'); return; }

  if (cart.length > 0 && cart[0].pharmacy !== currentProductDetails.pharmacy) {
    showConfirm({
      title: 'تغيير الصيدلية',
      message: 'هل تريد مسح السلة والبدء من جديد؟',
      confirmText: 'نعم، امسح',
      cancelText: 'إلغاء',
      confirmColor: 'warning',
      icon: '⚠️'
    }).then(function (confirmed) {
      if (confirmed) { cart = []; saveCart(); doAddToCart(); }
    });
    return;
  }
  doAddToCart();
}

function doAddToCart() {
  if (!currentProductDetails) return;

  var existingIdx = cart.findIndex(function (item) { return item.id === currentProductDetails.id; });

  if (existingIdx !== -1) {
    cart[existingIdx].quantity += pdpQuantity;
  } else {
    cart.push({
      id: currentProductDetails.id,
      name: currentProductDetails.name,
      price: currentProductDetails.price,
      icon: currentProductDetails.icon || '💊',
      image: currentProductDetails.image,
      category: currentProductDetails.category,
      quantity: pdpQuantity,
      pharmacy: currentProductDetails.pharmacy
    });
  }

  saveCart();
  updateCartBadge();
  playSuccessSound();
  if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  showToast('✅ تمت الإضافة إلى السلة');

  setTimeout(function () { closeProductDetails(); }, 600);
}

async function loadAlternatives(category, excludeId) {
  var container = document.getElementById('pdpAlternativesScroll');
  if (!container) return;

  container.innerHTML = '<div class="pdp-alt-loading"><div class="pdp-alt-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="pdp-alt-loading">لا توجد بدائل</div>';
      return;
    }

    var posts = await loadPostsFromFirestore();
    var alternatives = posts.filter(function (p) { return p.id !== excludeId; }).slice(0, 5);

    if (alternatives.length === 0) {
      container.innerHTML = '<div class="pdp-alt-loading">لا توجد بدائل متاحة</div>';
      return;
    }

    var html = '';
    alternatives.forEach(function (alt) {
      var imageSrc = alt.image || '';
      var imageHTML = '💊';
      if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
        imageHTML = '<img src="' + imageSrc + '" alt="">';
      }

      html +=
        '<div class="pdp-alt-card" onclick="openAlternativeProduct(\'' + alt.id + '\')">' +
          '<div class="pdp-alt-image">' + imageHTML + '</div>' +
          '<h4 class="pdp-alt-name">' + (alt.title || 'دواء') + '</h4>' +
          '<span class="pdp-alt-price">' + (alt.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
        '</div>';
    });
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<div class="pdp-alt-loading">حدث خطأ</div>';
  }
}

async function openAlternativeProduct(postId) {
  try {
    var posts = await loadPostsFromFirestore();
    var post = posts.find(function (p) { return String(p.id) === String(postId); });
    if (!post) { showToast('⚠️ المنتج غير موجود'); return; }

    openProductDetails({
      id: post.id,
      name: post.title,
      price: post.price,
      image: post.image,
      icon: '💊',
      category: post.category,
      desc: post.description,
      pharmacy: post.pharmacyName,
      stock: 50,
      rating: 0,
      ratingCount: 0
    });
  } catch (e) { showToast('⚠️ فشل التحميل'); }
}

function toggleFavoriteProduct() {
  if (!currentProductDetails) return;
  var productId = currentProductDetails.id;
  var favorites = JSON.parse(localStorage.getItem('saydaliyati_favorites') || '[]');
  var idx = favorites.findIndex(function (f) { return f.id === productId; });

  if (idx !== -1) {
    favorites.splice(idx, 1);
    showToast('💔 تم إزالة من المفضلة');
  } else {
    favorites.push({
      id: productId,
      name: currentProductDetails.name,
      price: currentProductDetails.price,
      image: currentProductDetails.image,
      icon: currentProductDetails.icon,
      category: currentProductDetails.category,
      pharmacy: currentProductDetails.pharmacy,
      addedAt: new Date().toISOString()
    });
    showToast('❤️ تمت الإضافة للمفضلة');
    playSuccessSound();
  }
  localStorage.setItem('saydaliyati_favorites', JSON.stringify(favorites));
  updatePdpFavoriteStatus();
  if (navigator.vibrate) navigator.vibrate([30]);
}

function updatePdpFavoriteStatus() {
  if (!currentProductDetails) return;
  var btn = document.getElementById('pdpFavBtn');
  if (!btn) return;
  var favorites = JSON.parse(localStorage.getItem('saydaliyati_favorites') || '[]');
  var isFav = favorites.some(function (f) { return f.id === currentProductDetails.id; });
  btn.classList.toggle('active', isFav);
}

function shareProduct() {
  if (!currentProductDetails) return;
  var shareText = currentProductDetails.name + ' - ' + (currentProductDetails.price || 0).toLocaleString() + ' د.ع\nمن DAWAK دواك 🏥';

  if (navigator.share) {
    navigator.share({ title: currentProductDetails.name, text: shareText }).catch(function () {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(function () {
      showToast('📋 تم نسخ معلومات المنتج');
    });
  }
}

function orderFromPostV2(postId) {
  var post = postsCache.find(function (p) { return p.id === postId; });
  if (!post) { showToast('⚠️ العرض غير موجود'); return; }

  openProductDetails({
    id: post.id,
    name: post.title,
    price: post.price,
    image: post.image,
    icon: '💊',
    category: post.category,
    desc: post.description,
    pharmacy: post.pharmacyName,
    stock: 50,
    rating: 0,
    ratingCount: 0
  });
}

// ============================================
// 📸 Prescription
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
  if (file.size > 5 * 1024 * 1024) { showError('حجم الصورة كبير جداً'); return; }
  if (!file.type.startsWith('image/')) { showError('يجب أن تكون الصورة بصيغة صورة'); return; }

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

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);

  var orderId = Math.floor(1000 + Math.random() * 9000);
  var order = {
    id: orderId,
    type: 'prescription',
    patientName: user.name,
    patientPhone: user.phone,
    patientId: user.uid || user.phone,
    pharmacy: 'صيدلية النور',
    address: address,
    notes: document.getElementById('prescriptionNotes') ? document.getElementById('prescriptionNotes').value : '',
    image: prescriptionImageData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseReady()) {
    try { await saveOrderToFirestore(order); } catch (e) {}
  }

  var orders = JSON.parse(localStorage.getItem('saydaliyati_prescription_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_prescription_orders', JSON.stringify(orders));

  addInternalNotification('order', '📸 تم إرسال روشتتك', 'ستتواصل معك صيدلية قريبة');

  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'ستتواصل معك صيدلية قريبة خلال دقائق');
  prescriptionImageData = null;
  resetPrescriptionUpload();
}

console.log('🏆 DAWAK v15 — الجزء 3 اكتمل ✅');
// ============================================
// 📋 My Orders
// ============================================
async function goToMyOrdersV2() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';

  var titleEl = document.getElementById('myOrdersTitle');
  if (titleEl) {
    if (userType === 'pharmacy') titleEl.textContent = 'الطلبات الواردة';
    else if (userType === 'delivery') titleEl.textContent = 'طلباتي';
    else titleEl.textContent = 'طلباتي';
  }

  showScreen('myOrdersScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var ordersBtn = document.querySelector('.nav-btn[data-tab="orders"]');
  if (ordersBtn) ordersBtn.classList.add('active');

  await renderOrdersV2();
}

async function renderOrdersV2() {
  var container = document.getElementById('ordersListContainer');
  var loadingEl = document.getElementById('ordersLoading');
  var emptyEl = document.getElementById('ordersEmptyState');

  if (!container) return;

  if (loadingEl) loadingEl.style.display = 'flex';
  if (emptyEl) emptyEl.style.display = 'none';
  container.querySelectorAll('.order-card').forEach(function (c) { c.remove(); });

  try {
    var userStr = localStorage.getItem('saydaliyati_current_user');
    if (!userStr) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }

    var user = JSON.parse(userStr);
    var userType = user.type || 'patient';
    var orders = [];

    if (isFirebaseReady()) {
      if (userType === 'patient' && user.phone) {
        orders = await getUserOrdersFromFirestore(user.phone);
      } else if (userType === 'pharmacy' && user.name) {
        orders = await getPharmacyOrdersFromFirestore(user.name);
      } else if (userType === 'delivery') {
        orders = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
      }
    } else {
      orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
      if (userType === 'patient' && user.phone) {
        orders = orders.filter(function (o) { return o.patientPhone === user.phone; });
      }
    }

    ordersCache = orders;
    if (loadingEl) loadingEl.style.display = 'none';

    if (!orders || orders.length === 0) {
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }

    var filtered = filterOrdersByStatus(orders, currentOrderFilter);

    if (filtered.length === 0) {
      if (emptyEl) {
        emptyEl.style.display = 'flex';
        var h3 = emptyEl.querySelector('h3');
        var p = emptyEl.querySelector('p');
        if (h3) h3.textContent = 'لا توجد طلبات في هذا التصنيف';
        if (p) p.textContent = 'جرب تصنيف آخر';
      }
      return;
    }

    renderOrdersCards(filtered, container);
  } catch (error) {
    console.error('❌ خطأ عرض الطلبات:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
  }
}

function renderOrdersCards(orders, container) {
  var html = '';

  orders.forEach(function (order) {
    var status = getOrderStatusInfo(order);
    var itemsList = (order.items || []).map(function (i) {
      return (i.name || 'دواء') + ' ×' + (i.quantity || 1);
    }).join(' • ');

    if (!itemsList && order.type === 'prescription') itemsList = '📸 طلب روشتة';
    if (!itemsList) itemsList = 'طلب دواء';

    var pharmacyName = order.pharmacy || 'صيدلية';
    var orderId = order.id || '0';
    var total = (order.total || 0).toLocaleString();
    var dateStr = order.createdAt ? formatDate(order.createdAt) : '—';

    var actionsHTML = '';

    if (status.key === 'pending') {
      actionsHTML =
        '<button class="order-btn primary" onclick="trackOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
          'تتبع' +
        '</button>';
    } else if (status.key === 'completed') {
      actionsHTML =
        '<button class="order-btn outline" onclick="reorderOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
          'إعادة' +
        '</button>' +
        '<button class="order-btn primary" onclick="rateOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
          'تقييم' +
        '</button>';
    } else {
      actionsHTML =
        '<button class="order-btn outline" onclick="reorderOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
          'إعادة' +
        '</button>';
    }

    html +=
      '<div class="order-card status-' + status.key + '">' +
        '<div class="order-header">' +
          '<div>' +
            '<h3 class="order-pharmacy">' + pharmacyName + '</h3>' +
            '<p class="order-date">📅 ' + dateStr + '</p>' +
          '</div>' +
          '<span class="order-status ' + status.key + '">' +
            '<span class="status-dot"></span>' +
            status.label +
          '</span>' +
        '</div>' +
        '<div class="order-id">رقم الطلب: #' + orderId + '</div>' +
        '<div class="order-items">📦 ' + itemsList + '</div>' +
        '<div class="order-footer">' +
          '<span class="order-total">' + total + '<small>د.ع</small></span>' +
          '<div class="order-actions">' + actionsHTML + '</div>' +
        '</div>' +
      '</div>';
  });

  var emptyEl = document.getElementById('ordersEmptyState');
  if (emptyEl) emptyEl.insertAdjacentHTML('beforebegin', html);
  else container.innerHTML = html;
}

function getOrderStatusInfo(order) {
  var status = (order.status || 'pending').toLowerCase();
  if (status === 'delivered' || status === 'completed' || status === 'done') {
    return { key: 'completed', label: 'مكتمل' };
  }
  if (status === 'cancelled' || status === 'rejected') {
    return { key: 'cancelled', label: 'ملغي' };
  }
  return { key: 'pending', label: 'قيد التوصيل' };
}

function filterOrdersByStatus(orders, filter) {
  if (filter === 'all') return orders;
  return orders.filter(function (order) {
    return getOrderStatusInfo(order).key === filter;
  });
}

function filterOrders(filter, btn) {
  currentOrderFilter = filter;
  document.querySelectorAll('.orders-tab').forEach(function (tab) {
    tab.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  if (navigator.vibrate) navigator.vibrate([20]);
  renderOrdersV2();
}

function reorderOrder(orderId) {
  var order = ordersCache.find(function (o) { return String(o.id) === String(orderId); });
  if (!order) { showToast('⚠️ الطلب غير موجود'); return; }

  if (order.items && order.items.length > 0) {
    cart = order.items.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        icon: item.icon || '💊',
        image: item.image,
        category: item.category,
        quantity: item.quantity,
        pharmacy: order.pharmacy || item.pharmacy
      };
    });
    saveCart();
    updateCartBadge();
    playSuccessSound();
    showToast('🛒 تم نسخ المنتجات للسلة');
    setTimeout(openCartScreen, 700);
  } else {
    showToast('⚠️ لا توجد منتجات');
  }
}

function rateOrder(orderId) {
  var order = ordersCache.find(function (o) { return String(o.id) === String(orderId); });
  if (!order) { showToast('⚠️ الطلب غير موجود'); return; }
  openRatingModal(order.pharmacy || 'صيدلية', 'pharmacy', orderId);
}

// ============================================
// 🗺️ Tracking
// ============================================
var trackingMap = null;

function trackOrder(orderId) {
  var order = ordersCache.find(function (o) { return String(o.id) === String(orderId); });
  if (!order) { showToast('⚠️ الطلب غير موجود'); return; }

  var etaEl = document.getElementById('trackingETA');
  if (etaEl) etaEl.textContent = 'يصل خلال 15 دقيقة';

  var nameEl = document.getElementById('trackingDeliveryName');
  if (nameEl) nameEl.textContent = order.deliveryName || 'المندوب';

  var vehicleEl = document.getElementById('trackingDeliveryVehicle');
  if (vehicleEl) vehicleEl.textContent = 'على الطريق إليك';

  var infoEl = document.getElementById('trackingOrderInfo');
  if (infoEl) infoEl.textContent = 'طلب #' + orderId + ' • ' + (order.pharmacy || 'صيدلية');

  showScreen('trackingScreen');

  setTimeout(function () {
    initTrackingMap(order.pharmacyLat || 33.3152, order.pharmacyLng || 44.3661);
  }, 300);

  if (navigator.vibrate) navigator.vibrate([30]);
}

function closeTrackingScreen() {
  if (trackingMap) { trackingMap.remove(); trackingMap = null; }
  showScreen('myOrdersScreen');
}

function initTrackingMap(pharmacyLat, pharmacyLng) {
  var mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  if (trackingMap) trackingMap.remove();
  if (typeof L === 'undefined') return;

  var userLoc = JSON.parse(localStorage.getItem('saydaliyati_user_location') || 'null');
  var patientLoc = userLoc ? [userLoc.lat, userLoc.lng] : [33.3152, 44.3661];
  var pharmacyLoc = [pharmacyLat, pharmacyLng];

  trackingMap = L.map('trackingMap').setView(patientLoc, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(trackingMap);

  var patientIcon = L.divIcon({
    className: 'custom-map-marker marker-patient',
    html: '<div class="custom-marker-pin"><span>🏠</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  L.marker(patientLoc, { icon: patientIcon }).addTo(trackingMap).bindPopup('<strong>موقعك</strong>');

  var pharmacyIcon = L.divIcon({
    className: 'custom-map-marker marker-pharmacy',
    html: '<div class="custom-marker-pin"><span>🏪</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  L.marker(pharmacyLoc, { icon: pharmacyIcon }).addTo(trackingMap).bindPopup('<strong>الصيدلية</strong>');

  var midLat = (patientLoc[0] + pharmacyLoc[0]) / 2;
  var midLng = (patientLoc[1] + pharmacyLoc[1]) / 2;

  var deliveryIcon = L.divIcon({
    className: 'custom-map-marker marker-delivery',
    html: '<div class="custom-marker-pin"><span>🚴</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  L.marker([midLat, midLng], { icon: deliveryIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>المندوب</strong><br>في الطريق')
    .openPopup();

  L.polyline([pharmacyLoc, [midLat, midLng], patientLoc], {
    color: '#10B981', weight: 4, opacity: 0.7
  }).addTo(trackingMap);

  var group = new L.featureGroup([
    L.marker(patientLoc),
    L.marker(pharmacyLoc),
    L.marker([midLat, midLng])
  ]);
  trackingMap.fitBounds(group.getBounds().pad(0.2));
}

function refreshTracking() { showToast('🔄 جاري التحديث...'); }
function shareMyLocation() {
  if (navigator.share) {
    navigator.share({ title: 'موقعي', text: 'هذا موقعي الحالي' }).catch(function () {});
  } else {
    showToast('📋 تم نسخ موقعك');
  }
}

// ============================================
// 🔔 Notifications (Real)
// ============================================
function openNotifications() {
  showScreen('notificationsScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var notifBtn = document.querySelector('.nav-btn[data-tab="notifications"]');
  if (notifBtn) notifBtn.classList.add('active');

  renderNotificationsReal();
}

async function renderNotificationsReal() {
  var listEl = document.getElementById('notificationsList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="notif-loading"><div class="notif-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    var userStr = localStorage.getItem('saydaliyati_current_user');
    if (!userStr) {
      listEl.innerHTML = '<div class="notif-loading">سجّل دخول أولاً</div>';
      return;
    }

    var user = JSON.parse(userStr);
    var notifs = [];

    if (isFirebaseReady() && user.phone) {
      try {
        notifs = await getNotificationsFromFirestore(user.phone);
      } catch (e) {}
    }

    if (notifs.length === 0) {
      var localNotifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
      if (localNotifs.length > 0) notifs = localNotifs;
    }

    if (notifs.length === 0) {
      listEl.innerHTML =
        '<div class="notif-loading">' +
          '<div style="font-size:60px;opacity:0.5;margin-bottom:12px;">🔔</div>' +
          '<h3 style="color:#F8FAFC;font-size:18px;margin-bottom:8px;">لا توجد إشعارات</h3>' +
          '<p>ستظهر هنا إشعاراتك الجديدة</p>' +
        '</div>';
      return;
    }

    var html = '';
    notifs.forEach(function (n) {
      var isUnread = !n.read;
      var iconClass = 'green';
      var icon = '✓';

      if (n.type === 'offer') { iconClass = 'orange'; icon = '🏷️'; }
      else if (n.type === 'delivery') { iconClass = 'blue'; icon = '🚴'; }
      else if (n.type === 'order') { iconClass = 'green'; icon = '✓'; }

      var timeText = n.date || n.createdAt ? formatDate(n.date || n.createdAt) : 'الآن';

      html +=
        '<div class="notif-card' + (isUnread ? ' unread' : '') + '">' +
          '<div class="notif-icon ' + iconClass + '">' + icon + '</div>' +
          '<div class="notif-content">' +
            '<h4>' + (n.title || 'إشعار') + '</h4>' +
            '<p>' + (n.message || '') + '</p>' +
            '<p class="notif-time">' + timeText + '</p>' +
          '</div>' +
          (isUnread ? '<span class="notif-dot"></span>' : '') +
        '</div>';
    });

    listEl.innerHTML = html;

    // علم الإشعارات كمقروءة
    notifs.forEach(function (n) {
      if (n.id && isFirebaseReady()) {
        try {
          var ref = window.firebaseDoc(window.firebaseDB, COLLECTIONS.NOTIFICATIONS, n.id);
          window.firebaseUpdateDoc(ref, { read: true });
        } catch (e) {}
      }
    });

    var dot = document.getElementById('homeNotifDot');
    if (dot) dot.style.display = 'none';

    localStorage.setItem('saydaliyati_notifications', JSON.stringify(
      JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]').map(function (n) {
        return Object.assign({}, n, { read: true });
      })
    ));

  } catch (e) {
    listEl.innerHTML = '<div class="notif-loading">حدث خطأ</div>';
  }
}

function filterNotifications(filter, btn) {
  document.querySelectorAll('.notif-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  renderNotificationsReal();
}

// ============================================
// ⚙️ Settings
// ============================================
function openSettings() { showScreen('settingsScreen'); }

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('saydaliyati_theme', newTheme);

  var toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = newTheme === 'dark';

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', newTheme === 'dark' ? '#050810' : '#F8FAFC');
}

function setTheme(theme, btn) {
  if (theme === 'auto') {
    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = isDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('saydaliyati_theme', theme);

  document.querySelectorAll('.settings-theme-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  var toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = theme === 'dark';
}

function toggleNotifications() {
  var toggle = document.getElementById('notificationsToggle');
  if (!toggle) return;
  localStorage.setItem('saydaliyati_notifications_enabled', toggle.checked ? 'true' : 'false');
  showToast(toggle.checked ? '✅ الإشعارات مفعلة' : '🔕 الإشعارات معطلة');
}

// ============================================
// 💬 Conversations + Chat
// ============================================
async function openConversationsScreen() {
  showScreen('conversationsScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var chatBtn = document.querySelector('.nav-btn[data-tab="chat"]');
  if (chatBtn) chatBtn.classList.add('active');

  await loadConversations();
}

async function loadConversations() {
  var listEl = document.getElementById('conversationsList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="conv-loading"><div class="conv-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    var userStr = localStorage.getItem('saydaliyati_current_user');
    if (!userStr) return;
    var user = JSON.parse(userStr);

    // جلب الصيدليات للتواصل معها
    var pharmacies = await loadPharmaciesFromFirestore();

    if (pharmacies.length === 0) {
      listEl.innerHTML =
        '<div class="conv-loading">' +
          '<div style="font-size:60px;opacity:0.5;margin-bottom:12px;">💬</div>' +
          '<h3 style="color:#F8FAFC;font-size:18px;margin-bottom:8px;">لا توجد محادثات</h3>' +
          '<p>ابدأ التواصل مع الصيدليات</p>' +
        '</div>';
      return;
    }

    var html = '';
    pharmacies.forEach(function (p) {
      var initial = (p.name || 'ص').charAt(0);
      html +=
        '<div class="conv-card" onclick="openChatWith(\'' + p.id + '\', \'' + (p.name || '').replace(/'/g, "\\'") + '\')">' +
          '<div class="conv-avatar">' + initial + '<span class="conv-online"></span></div>' +
          '<div class="conv-info">' +
            '<div class="conv-name">' +
              '<h4>' + (p.name || 'صيدلية') + '</h4>' +
              '<span class="conv-time">الآن</span>' +
            '</div>' +
            '<p class="conv-preview">اضغط لبدء محادثة</p>' +
          '</div>' +
        '</div>';
    });

    listEl.innerHTML = html;
  } catch (e) {
    console.error(e);
    listEl.innerHTML = '<div class="conv-loading">حدث خطأ</div>';
  }
}

async function openChatWith(userId, userName) {
  currentChatId = 'chat_' + userId;
  currentChatUser = { id: userId, name: userName };

  var nameEl = document.getElementById('chatUserName');
  if (nameEl) nameEl.textContent = userName;

  var avatarEl = document.getElementById('chatUserAvatar');
  if (avatarEl) avatarEl.textContent = (userName || 'ص').charAt(0);

  showScreen('chatScreen');
  await loadChatMessages();
}

function closeChatScreen() {
  currentChatId = null;
  currentChatUser = null;
  openConversationsScreen();
}

async function loadChatMessages() {
  var container = document.getElementById('chatMessages');
  if (!container) return;

  container.innerHTML = '<div class="chat-loading"><div class="chat-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    if (!isFirebaseReady() || !currentChatId) {
      container.innerHTML = '<div class="chat-loading">جارٍ بدء المحادثة...</div>';
      return;
    }

    var q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.CHATS, currentChatId, 'messages'),
      window.firebaseOrderBy('createdAt', 'asc'),
      window.firebaseLimit(50)
    );

    var snap = await window.firebaseGetDocs(q);

    if (snap.empty) {
      container.innerHTML = '<div class="chat-loading">لا توجد رسائل بعد. ابدأ المحادثة!</div>';
      return;
    }

    var userStr = localStorage.getItem('saydaliyati_current_user');
    var user = userStr ? JSON.parse(userStr) : {};
    var myPhone = user.phone;

    var html = '';
    snap.forEach(function (doc) {
      var msg = doc.data();
      var isSent = msg.senderPhone === myPhone;

      html +=
        '<div class="chat-message ' + (isSent ? 'sent' : 'received') + '">' +
          (msg.text || '') +
          '<span class="chat-message-time">' + formatTime(msg.createdAt) + '</span>' +
        '</div>';
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="chat-loading">ابدأ المحادثة</div>';
  }
}

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  if (!input) return;

  var text = input.value.trim();
  if (!text) return;

  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);

  if (!isFirebaseReady() || !currentChatId) {
    showToast('⚠️ المحادثة غير متاحة');
    return;
  }

  try {
    await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, COLLECTIONS.CHATS, currentChatId, 'messages'),
      {
        text: text,
        senderPhone: user.phone,
        senderName: user.name,
        createdAt: new Date().toISOString()
      }
    );

    input.value = '';
    await loadChatMessages();
    playSuccessSound();
  } catch (e) {
    console.error(e);
    showError('فشل إرسال الرسالة');
  }
}

function handleChatInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendChatMessage();
  }
}

// ============================================
// 📞 Call
// ============================================
function openCallScreen() {
  showScreen('callScreen');

  var nameEl = document.getElementById('callUserName');
  if (nameEl) nameEl.textContent = currentChatUser ? currentChatUser.name : 'المستخدم';

  var avatarEl = document.getElementById('callUserAvatar');
  if (avatarEl) avatarEl.textContent = currentChatUser ? (currentChatUser.name || '👤').charAt(0) : '👤';

  callActive = true;
  callSeconds = 0;
  callMuted = false;
  callVolumeOn = true;

  var statusEl = document.getElementById('callStatus');
  if (statusEl) statusEl.textContent = 'جارٍ الاتصال...';

  setTimeout(function () {
    var statusEl = document.getElementById('callStatus');
    if (statusEl) statusEl.textContent = 'متصل الآن';

    var timerEl = document.getElementById('callTimer');
    if (timerEl) timerEl.style.display = 'block';

    var waveEl = document.getElementById('callWave');
    if (waveEl) waveEl.style.display = 'flex';

    var infoEl = document.getElementById('callOrderInfo');
    if (infoEl) infoEl.style.display = 'inline-flex';

    startCallTimer();
  }, 2000);
}

function startCallTimer() {
  if (callTimerInterval) clearInterval(callTimerInterval);
  callSeconds = 0;

  callTimerInterval = setInterval(function () {
    callSeconds++;
    var mins = Math.floor(callSeconds / 60);
    var secs = callSeconds % 60;
    var timerEl = document.getElementById('callTimer');
    if (timerEl) {
      timerEl.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }
  }, 1000);
}

function endCall() {
  callActive = false;
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }

  showToast('📞 تم إنهاء المكالمة');
  showScreen('trackingScreen');
}

function toggleMute() {
  callMuted = !callMuted;
  showToast(callMuted ? '🔇 تم كتم الميكروفون' : '🎤 تم تفعيل الميكروفون');

  var btn = event.currentTarget;
  if (btn) btn.classList.toggle('active', callMuted);
}

function toggleCallVolume() {
  callVolumeOn = !callVolumeOn;
  showToast(callVolumeOn ? '🔊 مكبر الصوت مفعل' : '🔈 مكبر الصوت معطل');

  var btn = event.currentTarget;
  if (btn) btn.classList.toggle('active', callVolumeOn);
}

// ============================================
// ⭐ Rating
// ============================================
function openRatingModal(targetName, targetType, orderId) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }

  currentRating = 0;
  document.getElementById('ratingTargetName').textContent = targetName;
  document.getElementById('ratingTargetType').value = targetType;
  document.getElementById('ratingTargetId').value = orderId || '';
  document.getElementById('ratingComment').value = '';

  document.querySelectorAll('.rating-star').forEach(function (s) { s.classList.remove('active'); });

  var textEl = document.getElementById('ratingText');
  if (textEl) textEl.textContent = 'اضغط على النجوم';

  document.getElementById('ratingModal').classList.add('active');
}

function closeRatingModal() {
  document.getElementById('ratingModal').classList.remove('active');
  currentRating = 0;
}

function selectRating(value) {
  currentRating = value;
  document.querySelectorAll('.rating-star').forEach(function (star, idx) {
    star.classList.toggle('active', idx < value);
  });
  var texts = { 1: '😞 سيء جداً', 2: '😕 ضعيف', 3: '😐 مقبول', 4: '😊 جيد', 5: '🤩 ممتاز!' };
  var textEl = document.getElementById('ratingText');
  if (textEl) textEl.textContent = texts[value];
  if (navigator.vibrate) navigator.vibrate([30]);
}

async function submitRating() {
  if (currentRating === 0) { showError('اختر تقييماً أولاً'); return; }

  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);

  var rating = {
    id: 'RATING_' + Date.now(),
    from: user.name,
    fromPhone: user.phone,
    targetName: document.getElementById('ratingTargetName').textContent,
    targetType: document.getElementById('ratingTargetType').value,
    orderId: document.getElementById('ratingTargetId').value,
    rating: currentRating,
    comment: document.getElementById('ratingComment').value.trim(),
    date: new Date().toISOString()
  };

  if (isFirebaseReady()) {
    try { await saveRatingToFirestore(rating); } catch (e) {}
  }

  playSuccessSound();
  closeRatingModal();
  showToast('⭐ شكراً لتقييمك');
}

console.log('🏆 DAWAK v15 — الجزء 4 اكتمل ✅');
// ============================================
// 👤 Profile — ديناميكي لكل نوع مستخدم
// ============================================
async function openProfile() {
  updateUserName();
  showScreen('profileScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var profileBtn = document.querySelector('.nav-btn[data-tab="profile"]');
  if (profileBtn) profileBtn.classList.add('active');

  await renderProfileStats();
  await renderProfileMenu();
}

async function renderProfileStats() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  try {
    var user = JSON.parse(userStr);
    var userType = user.type || 'patient';

    // Order count
    var orders = [];
    if (isFirebaseReady() && user.phone) {
      if (userType === 'pharmacy') {
        orders = await getPharmacyOrdersFromFirestore(user.name);
      } else {
        orders = await getUserOrdersFromFirestore(user.phone);
      }
    } else {
      orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
    }

    var favorites = JSON.parse(localStorage.getItem('saydaliyati_favorites') || '[]');
    var addresses = user.address ? [user.address] : [];
    var balance = user.balance || 0;

    var orderCountEl = document.getElementById('profileOrderCount');
    var favCountEl = document.getElementById('profileFavCount');
    var addrCountEl = document.getElementById('profileAddrCount');
    var balanceEl = document.getElementById('profileBalance');
    var balanceCard = document.getElementById('profileBalanceCard');

    if (orderCountEl) orderCountEl.textContent = orders.length;
    if (favCountEl) favCountEl.textContent = favorites.length;
    if (addrCountEl) addrCountEl.textContent = addresses.length;
    if (balanceEl) balanceEl.textContent = balance.toLocaleString() + ' د.ع';
    if (balanceCard) {
      balanceCard.style.display = userType === 'patient' ? 'flex' : 'none';
    }

    // إخفاء إحصائيات المريض للمندوب/الصيدلية
    var statsEl = document.getElementById('profileStats');
    if (statsEl && userType !== 'patient') {
      statsEl.style.display = 'none';
    } else if (statsEl) {
      statsEl.style.display = 'grid';
    }
  } catch (e) {
    console.error('خطأ الإحصائيات:', e);
  }
}

async function renderProfileMenu() {
  var container = document.getElementById('profileMenuList');
  if (!container) return;

  try {
    var userStr = localStorage.getItem('saydaliyati_current_user');
    if (!userStr) return;
    var user = JSON.parse(userStr);
    var userType = user.type || 'patient';

    var menuItems = [];

    if (userType === 'patient') {
      menuItems = [
        { icon: '📍', label: 'عناويني', action: 'openAddresses()' },
        { icon: '📋', label: 'سجل الطلبات', action: 'openOrdersHistory()' },
        { icon: '🏷️', label: 'العروض المحفوظة', action: 'openSavedOffers()' },
        { icon: '💬', label: 'محادثاتي', action: 'openConversationsScreen()' },
        { icon: '⚙️', label: 'الإعدادات', action: 'openSettings()' },
        { icon: '❓', label: 'مساعدة ودعم', action: 'openHelpSupport()' },
        { icon: '🚪', label: 'تسجيل خروج', action: 'logout()', isLogout: true }
      ];
    } else if (userType === 'pharmacy') {
      menuItems = [
        { icon: '📊', label: 'لوحة التحكم', action: 'goToDashboardByType()' },
        { icon: '💊', label: 'إدارة المخزون', action: 'openInventoryScreen()' },
        { icon: '📢', label: 'نشر عرض', action: 'openAddPostModal()' },
        { icon: '📋', label: 'الطلبات الواردة', action: 'goToMyOrdersV2()' },
        { icon: '💬', label: 'المحادثات', action: 'openConversationsScreen()' },
        { icon: '⚙️', label: 'الإعدادات', action: 'openSettings()' },
        { icon: '❓', label: 'مساعدة ودعم', action: 'openHelpSupport()' },
        { icon: '🚪', label: 'تسجيل خروج', action: 'logout()', isLogout: true }
      ];
    } else if (userType === 'delivery') {
      menuItems = [
        { icon: '📡', label: 'البحث عن طلبات', action: 'goToDashboardByType()' },
        { icon: '📋', label: 'سجل التوصيلات', action: 'openOrdersHistory()' },
        { icon: '💰', label: 'أرباحي', action: 'openEarnings()' },
        { icon: '💬', label: 'محادثاتي', action: 'openConversationsScreen()' },
        { icon: '⚙️', label: 'الإعدادات', action: 'openSettings()' },
        { icon: '❓', label: 'مساعدة ودعم', action: 'openHelpSupport()' },
        { icon: '🚪', label: 'تسجيل خروج', action: 'logout()', isLogout: true }
      ];
    }

    var html = '';
    menuItems.forEach(function (item) {
      html +=
        '<div class="profile-menu-item' + (item.isLogout ? ' logout-item' : '') + '" onclick="' + item.action + '">' +
          '<div class="profile-menu-icon">' + item.icon + '</div>' +
          '<span>' + item.label + '</span>' +
          '<span class="profile-menu-arrow">←</span>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (e) {
    console.error('خطأ القائمة:', e);
  }
}

function openAddresses() {
  showToast('📍 إضافة عنوان — قريباً');
}

function openOrdersHistory() {
  currentOrderFilter = 'completed';
  goToMyOrdersV2();
}

function openSavedOffers() {
  var favorites = JSON.parse(localStorage.getItem('saydaliyati_favorites') || '[]');
  if (favorites.length === 0) {
    showToast('🏷️ لا توجد عروض محفوظة');
    return;
  }
  showToast('🏷️ لديك ' + favorites.length + ' عروض محفوظة');
  goToDashboardByType();
}

function openEarnings() {
  var accepted = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
  var total = accepted.reduce(function (s, o) { return s + (o.driverShare || 0); }, 0);
  showToast('💰 أرباحك: ' + total.toLocaleString() + ' د.ع');
}

function openHelpSupport() {
  showToast('📞 واتساب: +964 775 145 9130');
}

function openImagePicker() {
  var input = document.getElementById('avatarInput');
  if (input) input.click();
}

async function handleAvatarUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showError('حجم الصورة كبير جداً - الحد الأقصى 2MB'); return; }

  var reader = new FileReader();
  reader.onload = async function (e) {
    var imageData = await compressImage(e.target.result, 400, 0.8);

    var userStr = localStorage.getItem('saydaliyati_current_user');
    var user = JSON.parse(userStr);
    user.avatar = imageData;
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

    var regs = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    for (var i = 0; i < regs.length; i++) {
      if (regs[i].phone === user.phone) {
        regs[i].avatar = imageData;
        break;
      }
    }
    localStorage.setItem('saydaliyati_registrations', JSON.stringify(regs));

    if (isFirebaseReady()) {
      try { await saveUserToFirestore(user); } catch (err) {}
    }

    updateUserName();
    showToast('✅ تم تحديث الصورة');
  };
  reader.readAsDataURL(file);
}

function compressImage(base64, maxSize, quality) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var ratio = 1;
      if (img.width > maxSize || img.height > maxSize) {
        ratio = img.width > img.height ? maxSize / img.width : maxSize / img.height;
      }
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = function () { resolve(base64); };
    img.src = base64;
  });
}

// ============================================
// 🏪 Pharmacy Dashboard (Real Stats)
// ============================================
async function loadPharmacyDashboard() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);

  try {
    var orders = [];
    if (isFirebaseReady() && user.name) {
      orders = await getPharmacyOrdersFromFirestore(user.name);
    }

    var newOrders = orders.filter(function (o) { return o.status === 'pending'; });
    var today = new Date().toISOString().split('T')[0];
    var doneToday = orders.filter(function (o) {
      return o.status === 'delivered' && o.createdAt && o.createdAt.startsWith(today);
    });
    var revenue = doneToday.reduce(function (s, o) { return s + (o.total || 0); }, 0);

    var newEl = document.getElementById('pharmacyNewOrdersCount');
    var doneEl = document.getElementById('pharmacyDoneTodayCount');
    var revEl = document.getElementById('pharmacyTodayRevenueStat');
    var ratingEl = document.getElementById('pharmacyRatingStat');

    if (newEl) newEl.textContent = newOrders.length;
    if (doneEl) doneEl.textContent = doneToday.length;
    if (revEl) revEl.textContent = revenue > 0 ? (revenue / 1000).toFixed(0) + 'K' : '0';
    if (ratingEl) ratingEl.textContent = (user.rating || 0).toFixed(1);

    // عرض الطلبات الجديدة
    var ordersList = document.getElementById('pharmacyDashboardOrdersList');
    if (ordersList) {
      if (newOrders.length === 0) {
        ordersList.innerHTML =
          '<div class="phdash-empty">' +
            '<div class="phdash-empty-icon">💊</div>' +
            '<h4>لا توجد طلبات جديدة</h4>' +
            '<p>ستظهر هنا الطلبات الواردة</p>' +
          '</div>';
      } else {
        var html = '';
        newOrders.slice(0, 3).forEach(function (o) {
          html +=
            '<div class="order-card status-pending">' +
              '<div class="order-header">' +
                '<div>' +
                  '<h3 class="order-pharmacy">' + (o.patientName || 'مريض') + '</h3>' +
                  '<p class="order-date">' + formatDate(o.createdAt) + '</p>' +
                '</div>' +
                '<span class="order-status pending"><span class="status-dot"></span>جديد</span>' +
              '</div>' +
              '<div class="order-id">#' + o.id + '</div>' +
              '<div class="order-items">📍 ' + (o.address || '-') + '</div>' +
              '<div class="order-footer">' +
                '<span class="order-total">' + (o.total || 0).toLocaleString() + '<small>د.ع</small></span>' +
                '<div class="order-actions">' +
                  '<button class="order-btn primary" onclick="acceptPharmacyOrder(\'' + o.id + '\')">قبول</button>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        ordersList.innerHTML = html;
      }
    }
  } catch (e) {
    console.error('خطأ لوحة الصيدلية:', e);
  }
}

async function acceptPharmacyOrder(orderId) {
  try {
    if (isFirebaseReady()) {
      await updateOrderInFirestore(String(orderId), {
        status: 'accepted',
        acceptedBy: 'pharmacy',
        acceptedAt: new Date().toISOString()
      });
    }
    playSuccessSound();
    showToast('✅ تم قبول الطلب #' + orderId);
    setTimeout(loadPharmacyDashboard, 500);
  } catch (e) {
    showError('فشل قبول الطلب');
  }
}

// ============================================
// 🚴 Delivery Dashboard + Radar
// ============================================
async function loadDeliveryDashboard() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  try {
    var accepted = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
    var listEl = document.getElementById('deliveryDashboardOrdersList');

    if (!listEl) return;

    if (accepted.length === 0) {
      listEl.innerHTML =
        '<div class="phdash-empty">' +
          '<div class="phdash-empty-icon">📦</div>' +
          '<h4>لا توجد طلبات</h4>' +
          '<p>شغّل الرادار لاستقبال الطلبات</p>' +
        '</div>';
    }
  } catch (e) {}
}

function toggleRadarSearch() {
  var box = document.getElementById('radarSearchBox');
  var btn = document.getElementById('radarSearchBtn');
  var btnText = document.getElementById('radarSearchBtnText');
  var titleEl = document.getElementById('radarSearchTitle');
  var statusEl = document.getElementById('radarSearchStatus');
  var progressWrap = document.getElementById('radarProgressWrap');
  var progressBar = document.getElementById('radarProgressBar');

  if (!radarActive) {
    // بدء البحث
    radarActive = true;
    radarTimer = 0;

    if (box) box.classList.add('active');
    if (btn) btn.classList.add('active');
    if (btnText) btnText.textContent = '⏹️ إيقاف البحث';
    if (progressWrap) progressWrap.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';

    var messages = [
      '✅ تم تفعيل البحث',
      '🔍 جاري البحث عن الطلبات القريبة...',
      '📍 نطاق البحث: 5 كم',
      '⏳ في انتظار طلبات جديدة...'
    ];

    var msgIndex = 0;
    if (titleEl) titleEl.textContent = messages[0];
    if (statusEl) statusEl.textContent = 'الرجاء الانتظار';

    playRadarActivateSound();
    vibrateDevice([100, 50, 100]);

    // Progress bar
    if (radarProgressInterval) clearInterval(radarProgressInterval);
    radarProgressInterval = setInterval(function () {
      radarTimer += 5;
      if (progressBar) progressBar.style.width = Math.min(radarTimer, 100) + '%';

      if (radarTimer >= 100) {
        radarTimer = 0;
        if (progressBar) progressBar.style.width = '0%';

        msgIndex = (msgIndex + 1) % messages.length;
        if (titleEl) titleEl.textContent = messages[msgIndex];
      }
    }, 500);

    // صوت الرادار
    if (window.radarPingInterval) clearInterval(window.radarPingInterval);
    window.radarPingInterval = setInterval(playSonarPing, 2000);

    // محاكاة طلب جديد بعد 8 ثواني
    setTimeout(function () {
      if (radarActive) {
        playAlertDing();
        vibrateDevice([200, 100, 200]);
        if (statusEl) statusEl.textContent = '🎉 تم إيجاد طلب قريب!';
        if (titleEl) titleEl.textContent = 'طلب جديد في منطقتك';
        showToast('🔔 طلب جديد وصل!');
      }
    }, 8000);

  } else {
    // إيقاف البحث
    radarActive = false;

    if (box) box.classList.remove('active');
    if (btn) btn.classList.remove('active');
    if (btnText) btnText.textContent = 'ابدأ البحث';
    if (progressWrap) progressWrap.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
    if (titleEl) titleEl.textContent = 'ابحث عن الطلبات القريبة';
    if (statusEl) statusEl.textContent = 'اضغط "ابدأ البحث" للبدء';

    if (radarProgressInterval) {
      clearInterval(radarProgressInterval);
      radarProgressInterval = null;
    }
    if (window.radarPingInterval) {
      clearInterval(window.radarPingInterval);
      window.radarPingInterval = null;
    }

    showToast('⏹️ تم إيقاف البحث');
  }
}

// ============================================
// 💊 Inventory
// ============================================
function getInventoryKey() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return 'saydaliyati_inventory_default';
  var user = JSON.parse(userStr);
  return 'saydaliyati_inventory_' + (user.phone || 'default');
}

function loadInventory() {
  var key = getInventoryKey();
  var inv = JSON.parse(localStorage.getItem(key) || 'null');
  if (!inv) inv = [];
  return inv;
}

function saveInventory(inv) {
  var key = getInventoryKey();
  localStorage.setItem(key, JSON.stringify(inv));

  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);

  if (isFirebaseReady() && user.phone) {
    try {
      var ref = window.firebaseDoc(window.firebaseDB, COLLECTIONS.INVENTORY, user.phone);
      window.firebaseSetDoc(ref, {
        pharmacyName: user.name,
        pharmacyPhone: user.phone,
        items: inv,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {}
  }
}

function openInventoryScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') { showToast('للصيدليات فقط'); return; }
  showScreen('inventoryScreen');
  renderInventory();
}

function closeInventoryScreen() { showScreen('pharmacyDashboard'); }

function renderInventory() {
  var inv = loadInventory();
  var listEl = document.getElementById('inventoryList');
  if (!listEl) return;

  var totalMeds = inv.length;
  var lowStock = inv.filter(function (m) { return m.stock > 0 && m.stock <= 10; }).length;
  var outOfStock = inv.filter(function (m) { return m.stock === 0; }).length;
  var totalValue = inv.reduce(function (s, m) { return s + (m.price * m.stock); }, 0);

  var elTotal = document.getElementById('invTotalMeds');
  var elLow = document.getElementById('invLowStock');
  var elOut = document.getElementById('invOutOfStock');
  var elVal = document.getElementById('invValue');

  if (elTotal) elTotal.textContent = totalMeds;
  if (elLow) elLow.textContent = lowStock;
  if (elOut) elOut.textContent = outOfStock;
  if (elVal) elVal.textContent = (totalValue / 1000).toFixed(0) + 'K';

  var subtitleEl = document.getElementById('inventorySubtitle');
  if (subtitleEl) subtitleEl.textContent = totalMeds + ' دواء';

  if (inv.length === 0) {
    listEl.innerHTML =
      '<div class="phdash-empty">' +
        '<div class="phdash-empty-icon">💊</div>' +
        '<h4>لا توجد أدوية</h4>' +
        '<p>اضغط "+ إضافة" للبدء</p>' +
      '</div>';
    return;
  }

  var html = '';
  inv.forEach(function (med) {
    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-image">' + (med.icon || '💊') + '</div>' +
        '<div class="cart-item-details">' +
          '<h4 class="cart-item-name">' + med.name + '</h4>' +
          '<p class="cart-item-pharmacy">📁 ' + (med.category || '-') + '</p>' +
          '<span class="cart-item-price">' + (med.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
        '</div>' +
      '</div>';
  });
  listEl.innerHTML = html;
}

function filterInventoryBy(filter, btn) {
  document.querySelectorAll('.inventory-filter').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function filterInventory() { renderInventory(); }
function openAddMedicineModal() { showToast('➕ إضافة دواء — قريباً'); }

// ============================================
// 📢 Add Post (Pharmacy)
// ============================================
function openAddPostModal() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') { showToast('للصيدليات فقط'); return; }

  document.getElementById('postTitle').value = '';
  document.getElementById('postDescription').value = '';
  document.getElementById('postPrice').value = '';
  document.getElementById('postCategory').value = '';

  document.getElementById('addPostModal').classList.add('active');
}

function closeAddPostModal() {
  document.getElementById('addPostModal').classList.remove('active');
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

  if (!title || !description || !category || isNaN(price)) {
    showError('املأ الحقول المطلوبة');
    return;
  }

  var postData = {
    pharmacyId: user.phone,
    pharmacyUid: user.uid || '',
    pharmacyName: user.name || 'صيدلية',
    title: title,
    description: description,
    category: category,
    price: price,
    image: '',
    createdAt: new Date().toISOString(),
    active: true
  };

  if (isFirebaseReady()) {
    try { await savePostToFirestore(postData); } catch (e) {}
  }

  addInternalNotification('offer', '📢 تم نشر عرضك', title);
  playSuccessSound();
  showToast('✅ تم نشر العرض');
  closeAddPostModal();
}

// ============================================
// 🚀 DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🏆 DAWAK v15 جاهز');
  document.title = 'DAWAK دواك - صحتك أولويتنا';

  var savedTheme = localStorage.getItem('saydaliyati_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  var toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = savedTheme === 'dark';

  var currentUser = localStorage.getItem('saydaliyati_current_user');
  var hasSeenOnboarding = localStorage.getItem('saydaliyati_onboarding_done') === 'true';

  // إذا المستخدم مسجل → روح Dashboard
  if (currentUser) {
    setTimeout(goToDashboardByType, 300);
    return;
  }

  // عرض Splash
  showScreen('splashScreen');
  setTimeout(createSplashParticles, 100);

  // بعد 2.5 ثانية → Onboarding أو Login
  setTimeout(function () {
    var user = localStorage.getItem('saydaliyati_current_user');
    if (user) return;

    if (!hasSeenOnboarding) {
      showScreen('onboardingScreen');
      initOnboarding();
    } else {
      showScreen('loginScreen');
    }
  }, 2500);

  document.body.addEventListener('click', function () { initAudio(); }, { once: true });
});

document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

// ============================================
// 🎉 نهاية script.js — DAWAK v15
// ============================================
console.log('🏆 DAWAK v15 — script.js اكتمل ✅');
