// ============================================
// DAWAK دواك - v15
// Complete Rebuild — Part 1/5: Core + Firebase + Auth + Utils
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

var COLLECTIONS = {
  USERS: 'users',
  PHARMACIES: 'pharmacies',
  ORDERS: 'orders',
  RATINGS: 'ratings',
  POSTS: 'posts',
  INVENTORY: 'inventory'
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
  'WELCOME': { type: 'percentage', value: 15, label: 'خصم ترحيبي 15%' },
  'SAVE2000': { type: 'fixed', value: 2000, label: 'خصم 2,000 د.ع' },
  'FIRST': { type: 'percentage', value: 25, label: 'خصم أول طلب 25%' }
};

// ============================================
// 🔥 Firebase Ready Check
// ============================================
function isFirebaseReady() {
  return !!(window.firebaseDB && window.firebaseAuth && window.firebaseCollection);
}

// ============================================
// 🛠️ Utility Functions
// ============================================
function showError(message) {
  showToast('⚠️ ' + message);
}

function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

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

  strengthEl.className = 'reg-v2-strength';
  if (password.length === 0) strengthEl.textContent = '';
  else if (score <= 2) { strengthEl.textContent = 'ضعيفة'; strengthEl.classList.add('weak'); }
  else if (score <= 4) { strengthEl.textContent = 'متوسطة'; strengthEl.classList.add('medium'); }
  else { strengthEl.textContent = 'قوية'; strengthEl.classList.add('strong'); }
}

// ============================================
// 💰 Delivery Fee
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
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
}

// ============================================
// 🔥 Firestore — Users
// ============================================
async function saveUserToFirestore(userData) {
  if (!isFirebaseReady()) return null;
  try {
    var userId = userData.uid || userData.googleId || userData.phone || ('user_' + Date.now());
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
    await window.firebaseSetDoc(ref, {
      uid: pharmacyData.uid || '',
      name: pharmacyData.name,
      owner: pharmacyData.owner || '',
      phone: pharmacyData.phone,
      address: pharmacyData.address,
      license: pharmacyData.license || '',
      rating: pharmacyData.rating || 5.0,
      logo: pharmacyData.logo || 'ص',
      deliveryTime: pharmacyData.deliveryTime || '30 دقيقة',
      lat: pharmacyData.lat || 33.3152,
      lng: pharmacyData.lng || 44.3661,
      active: pharmacyData.active !== undefined ? pharmacyData.active : true,
      createdAt: pharmacyData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return pharmacyData.phone;
  } catch (error) {
    console.error('❌ خطأ حفظ الصيدلية:', error);
    return null;
  }
}

async function loadPharmaciesFromFirestore() {
  if (!isFirebaseReady()) return loadPharmaciesFromLocal();
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
    return loadPharmaciesFromLocal();
  }
}

function loadPharmaciesFromLocal() {
  try {
    return JSON.parse(localStorage.getItem('saydaliyati_pharmacies_cache') || '[]');
  } catch (e) { return []; }
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
      window.firebaseCollection(window.firebaseDB, 'orders'),
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
    console.log('✅ تم حفظ العرض:', ref.id);
    return ref.id;
  } catch (error) {
    console.error('❌ خطأ حفظ العرض:', error);
    return null;
  }
}

async function loadPostsFromFirestore() {
  if (!isFirebaseReady()) return loadPostsFromLocal();
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
    return loadPostsFromLocal();
  }
}

function loadPostsFromLocal() {
  try { return JSON.parse(localStorage.getItem('saydaliyati_posts') || '[]'); }
  catch (e) { return []; }
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
// 💾 LocalStorage Helpers
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
  if (badge1) badge1.textContent = total;
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
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) {}
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

function createLoginParticles() {
  var c = document.getElementById('loginParticles');
  if (!c) return;
  c.innerHTML = '';
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div');
    p.className = 'login-particle';
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    c.appendChild(p);
  }
}

function createRoleParticles() {
  var c = document.getElementById('roleParticles');
  if (!c) return;
  c.innerHTML = '';
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div');
    p.className = 'role-particle';
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    c.appendChild(p);
  }
}

function createRegParticles(containerId) {
  var c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  for (var i = 0; i < 20; i++) {
    var p = document.createElement('div');
    p.className = 'reg-particle';
    var size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    c.appendChild(p);
  }
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
    if (screenId === 'loginScreen') setTimeout(createLoginParticles, 100);
    if (screenId === 'roleScreen') setTimeout(createRoleParticles, 100);
    if (screenId === 'patientScreen') setTimeout(function () { createRegParticles('patientParticles'); }, 100);
    if (screenId === 'pharmacyScreen') {
      setTimeout(function () {
        createRegParticles('pharmacyParticles');
        if (typeof initPharmacyMap === 'function') initPharmacyMap();
      }, 300);
    }
    if (screenId === 'deliveryScreen') setTimeout(function () { createRegParticles('deliveryParticles'); }, 100);

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
    'profileScreen'
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
  else if (tab === 'notifications') openNotifications();
  else if (tab === 'profile') openProfile();
}

// ============================================
// 🎬 Onboarding
// ============================================
function initOnboarding() {
  var hasSeen = localStorage.getItem('saydaliyati_onboarding_done');
  if (hasSeen === 'true') {
    showScreen('splashScreen');
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
  document.querySelectorAll('.ob-v2-slide').forEach(function (slide) {
    slide.classList.remove('active');
  });
  var currentSlide = document.querySelector('.ob-v2-slide[data-slide="' + currentOnboardingSlide + '"]');
  if (currentSlide) currentSlide.classList.add('active');

  document.querySelectorAll('.ob-v2-dot').forEach(function (dot, idx) {
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
  setTimeout(function () { showScreen('splashScreen'); }, 200);
}

// ============================================
// 🔀 Navigation Functions
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
    setTimeout(updateUserName, 100);
  } else if (user.type === 'delivery') {
    showScreen('deliveryDashboard');
    setTimeout(updateUserName, 100);
  } else {
    showScreen('homeScreen');
    setTimeout(function () {
      updateUserName();
      loadHomePharmacies();
      loadHomeOffers();
      updateHomeNotifDot();
    }, 100);
  }
}

function updateUserName() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;

  try {
    var user = JSON.parse(userStr);
    var userName = user.name || 'مستخدم';

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
        homeAvatar.textContent = userName.charAt(0);
        homeAvatarBtn.style.backgroundImage = '';
      }
    }

    // Pharmacy
    var phGreeting = document.getElementById('pharmacyGreeting');
    if (phGreeting) phGreeting.textContent = userName;

    // Delivery
    var delGreeting = document.getElementById('deliveryGreeting');
    if (delGreeting) delGreeting.textContent = userName;

    var delAvatar = document.getElementById('deliveryAvatarLetter');
    if (delAvatar) delAvatar.textContent = userName.charAt(0);

    // Profile
    var profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = userName;

    var profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
      if (user.avatar) {
        profileAvatar.textContent = '';
        profileAvatar.style.backgroundImage = 'url(' + user.avatar + ')';
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.style.backgroundPosition = 'center';
      } else {
        profileAvatar.textContent = userName.charAt(0);
        profileAvatar.style.backgroundImage = '';
      }
    }

    var infoPhone = document.getElementById('infoPhone');
    if (infoPhone) infoPhone.textContent = user.phone || '-';

    var infoAddress = document.getElementById('infoAddress');
    if (infoAddress) infoAddress.textContent = user.address || user.area || 'بغداد، العراق';
  } catch (e) {
    console.error('خطأ تحديث الاسم:', e);
  }
}

// ============================================
// 👤 Profile
// ============================================
function openProfile() {
  updateUserName();
  renderMyRatings();
  showScreen('profileScreen');
  updateBottomNav('profileScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var profileBtn = document.querySelector('.nav-btn[data-tab="profile"]');
  if (profileBtn) profileBtn.classList.add('active');
}

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
    var imageData = await compressImage(e.target.result, 400, 0.8);

    var userStr = localStorage.getItem('saydaliyati_current_user');
    var user = userStr ? JSON.parse(userStr) : {};
    user.avatar = imageData;
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));

    var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    for (var i = 0; i < registrations.length; i++) {
      if (registrations[i].phone === user.phone) {
        registrations[i].avatar = imageData;
        break;
      }
    }
    localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));

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

function logout() {
  showConfirm({
    title: 'تسجيل الخروج',
    message: 'هل أنت متأكد من تسجيل الخروج؟',
    confirmText: 'نعم، سجل خروج',
    cancelText: 'إلغاء',
    confirmColor: 'danger',
    icon: '🚪'
  }).then(function (confirmed) {
    if (!confirmed) return;
    localStorage.removeItem('saydaliyati_current_user');
    if (typeof signOutFromFirebase === 'function') {
      try { signOutFromFirebase(); } catch (e) {}
    }
    showScreen('splashScreen');
    showToast('تم تسجيل الخروج');
  });
}

async function signOutFromFirebase() {
  if (!window.firebaseAuth || !window.firebaseSignOut) return;
  try {
    await window.firebaseSignOut(window.firebaseAuth);
  } catch (e) {}
}

// ============================================
// 🌙 Theme
// ============================================
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

function setTheme(theme) {
  if (theme === 'auto') {
    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = isDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('saydaliyati_theme', theme);

  document.querySelectorAll('.settings-v2-theme-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  event.currentTarget.classList.add('active');

  var toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = theme === 'dark';
}

function loadTheme() {
  var saved = localStorage.getItem('saydaliyati_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  var toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = saved === 'dark';

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', saved === 'dark' ? '#050810' : '#F8FAFC');
}

// ============================================
// 📍 User Location (GPS)
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
      showToast('⚠️ تعذّر تحديد موقعك');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ============================================
// 🏪 Home — Pharmacies
// ============================================
async function loadHomePharmacies() {
  var container = document.getElementById('homePharmaciesList');
  if (!container) return;

  container.innerHTML =
    '<div class="home-v3-loading">' +
      '<div class="home-v3-spinner"></div>' +
      '<span>جاري تحميل الصيدليات...</span>' +
    '</div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="home-v3-loading">لا توجد صيدليات متاحة</div>';
      return;
    }

    var pharmacies = await loadPharmaciesFromFirestore();
    pharmacies.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    var topPharmacies = pharmacies.slice(0, 3);

    if (topPharmacies.length === 0) {
      container.innerHTML = '<div class="home-v3-loading">لا توجد صيدليات مسجلة بعد</div>';
      return;
    }

    var userLoc = null;
    try {
      var locStr = localStorage.getItem('saydaliyati_user_location');
      if (locStr) userLoc = JSON.parse(locStr);
    } catch (e) {}

    var html = '';
    topPharmacies.forEach(function (p) {
      var rating = p.rating || 5.0;
      var distanceText = '—';
      if (userLoc && p.lat && p.lng) {
        var dist = calculateDistanceKm(userLoc.lat, userLoc.lng, p.lat, p.lng);
        distanceText = dist.toFixed(1) + ' كم';
      }
      var logo = p.logo || 'ص';

      html +=
        '<div class="home-v3-pharmacy-card" onclick="orderFromPharmacy(\'' + p.id + '\', \'' + (p.name || 'صيدلية').replace(/'/g, "\\'") + '\')">' +
          '<div class="home-v3-pharmacy-logo">' + logo + '</div>' +
          '<div class="home-v3-pharmacy-info">' +
            '<h4 class="home-v3-pharmacy-name">' + (p.name || 'صيدلية') + '</h4>' +
            '<div class="home-v3-pharmacy-meta">' +
              '<span class="home-v3-pharmacy-rating">★ ' + rating.toFixed(1) + '</span>' +
              '<span>📍 ' + distanceText + '</span>' +
            '</div>' +
            '<span class="home-v3-pharmacy-status"><span class="status-dot"></span>مفتوح الآن</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('❌ خطأ تحميل الصيدليات:', error);
    container.innerHTML = '<div class="home-v3-loading">حدث خطأ</div>';
  }
}

// ============================================
// 💊 Home — Offers
// ============================================
async function loadHomeOffers() {
  var container = document.getElementById('homeOffersScroll');
  if (!container) return;

  container.innerHTML =
    '<div class="home-v3-loading">' +
      '<div class="home-v3-spinner"></div>' +
      '<span>جاري تحميل العروض...</span>' +
    '</div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="home-v3-loading">لا توجد عروض</div>';
      return;
    }

    var posts = await loadPostsFromFirestore();
    postsCache = posts;

    if (!posts || posts.length === 0) {
      container.innerHTML = '<div class="home-v3-loading">لا توجد عروض حالياً</div>';
      return;
    }

    var topPosts = posts.slice(0, 6);
    var html = '';

    topPosts.forEach(function (post) {
      var imageSrc = post.image || '';
      var price = (post.price || 0).toLocaleString();
      var title = post.title || 'دواء';

      var imageHTML = '';
      if (imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))) {
        imageHTML = '<img src="' + imageSrc + '" alt="' + title + '" onerror="this.parentNode.innerHTML=\'💊\'">';
      } else {
        imageHTML = '💊';
      }

      html +=
        '<div class="home-v3-offer-card" onclick="orderFromPostV2(\'' + post.id + '\')">' +
          '<div class="home-v3-offer-image">' + imageHTML + '</div>' +
          '<h4 class="home-v3-offer-title">' + title + '</h4>' +
          '<div class="home-v3-offer-price-row">' +
            '<span class="home-v3-offer-price">' + price + '<small>د.ع</small></span>' +
            '<span class="home-v3-offer-plus">+</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('❌ خطأ تحميل العروض:', error);
    container.innerHTML = '<div class="home-v3-loading">حدث خطأ</div>';
  }
}

function filterHomeCategory(category, btn) {
  currentHomeCategory = category;
  document.querySelectorAll('.home-v3-cat').forEach(function (chip) {
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
      container.innerHTML = '<div class="home-v3-loading">لا توجد عروض</div>';
      return;
    }

    var topPosts = posts.slice(0, 6);
    var html = '';

    topPosts.forEach(function (post) {
      var imageSrc = post.image || '';
      var imageHTML = imageSrc ? '<img src="' + imageSrc + '">' : '💊';

      html +=
        '<div class="home-v3-offer-card" onclick="orderFromPostV2(\'' + post.id + '\')">' +
          '<div class="home-v3-offer-image">' + imageHTML + '</div>' +
          '<h4 class="home-v3-offer-title">' + (post.title || 'دواء') + '</h4>' +
          '<div class="home-v3-offer-price-row">' +
            '<span class="home-v3-offer-price">' + (post.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
            '<span class="home-v3-offer-plus">+</span>' +
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
  var unreadCount = notifs.filter(function (n) { return !n.read; }).length;
  dotEl.style.display = unreadCount > 0 ? 'block' : 'none';
}

// ============================================
// 🔔 Notifications
// ============================================
function openNotifications() {
  showScreen('notificationsScreen');
  updateBottomNav('notificationsScreen');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var notifBtn = document.querySelector('.nav-btn[data-tab="notifications"]');
  if (notifBtn) notifBtn.classList.add('active');
}

function filterNotifications(filter, btn) {
  document.querySelectorAll('.notif-v2-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  showToast('🔔 ' + (filter === 'all' ? 'كل الإشعارات' : 'فلترة'));
}

function addInternalNotification(type, title, message) {
  var notif = {
    id: 'NOTIF_' + Date.now(),
    type: type,
    title: title,
    message: message,
    read: false,
    date: new Date().toISOString(),
    time: 'الآن'
  };
  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  notifs.unshift(notif);
  if (notifs.length > 50) notifs = notifs.slice(0, 50);
  localStorage.setItem('saydaliyati_notifications', JSON.stringify(notifs));
  updateHomeNotifDot();
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

console.log('🏆 DAWAK v15 — الجزء 2 اكتمل ✅');
// ============================================
// 🔐 Login + Registration
// ============================================
async function submitLogin(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  var phone = document.getElementById('loginPhone').value.trim();
  var password = document.getElementById('loginPassword').value.trim();

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
          try { user = await getUserFromFirestore(userCred.user.uid); } catch (e) {}
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
    var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
    var localUser = registrations.find(function (r) {
      return r.phone === phone && r.password === password;
    });
    if (localUser) user = localUser;
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
  showToast('أهلاً بك في DAWAK، ' + (user.name || ''));

  setTimeout(function () {
    goToDashboardByType();
  }, 500);
}

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
    showError('فشل إرسال الطلب. حاول لاحقاً.');
  }
}

// ============================================
// 🧑 Patient Registration
// ============================================
async function submitPatient(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }

  var name = document.getElementById('patientName').value.trim();
  var phone = document.getElementById('patientPhone').value.trim();
  var email = document.getElementById('patientEmail').value.trim();
  var address = document.getElementById('patientAddress').value.trim();
  var password = document.getElementById('patientPassword').value.trim();

  if (!name || !phone || !address || !password) { showError('املأ الحقول الإلزامية'); return; }
  if (!validatePhone(phone)) { showError('رقم الهاتف غير صحيح'); return; }
  if (password.length < 6) { showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

  var authEmail = email || (phone + '@saydaliyati.app');
  var uid = null;

  if (window.firebaseAuth && window.firebaseCreateUser) {
    try {
      var userCred = await window.firebaseCreateUser(window.firebaseAuth, authEmail, password);
      uid = userCred.user.uid;
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        showError('رقم الهاتف أو البريد مسجل مسبقاً');
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
    email: email,
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

  var pharmacyLat = document.getElementById('pharmacyLat').value || 33.3152;
  var pharmacyLng = document.getElementById('pharmacyLng').value || 44.3661;

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
      rating: 5.0,
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
    else showError('فشل الدخول: ' + (error.message || error.code));
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
// 🗺️ Order Tracking (Patient)
// ============================================
var trackingMap = null;

function trackOrder(orderId) {
  var order = ordersCache.find(function (o) { return String(o.id) === String(orderId); });
  if (!order) { showToast('⚠️ الطلب غير موجود'); return; }
  if (navigator.vibrate) navigator.vibrate([30]);
  showScreen('trackingScreen');
  setTimeout(function () { initTrackingMap(order.pharmacyLat || 33.3152, order.pharmacyLng || 44.3661); }, 300);
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
  L.marker([midLat, midLng], { icon: deliveryIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>المندوب</strong><br>في الطريق')
    .openPopup();

  L.polyline([pharmacyLoc, [midLat, midLng], patientLoc], {
    color: '#10B981', weight: 4, opacity: 0.7
  }).addTo(trackingMap);

  var group = new L.featureGroup([L.marker(patientLoc), L.marker(pharmacyLoc), L.marker([midLat, midLng])]);
  trackingMap.fitBounds(group.getBounds().pad(0.2));
}

function refreshTracking() { showToast('🔄 جاري التحديث...'); }

// ============================================
// ⭐ Rating
// ============================================
var currentRating = 0;

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
  if (textEl) { textEl.textContent = 'اضغط على النجوم للتقييم'; }

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

  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  ratings.unshift(rating);
  localStorage.setItem('saydaliyati_ratings', JSON.stringify(ratings));

  if (isFirebaseReady()) {
    try { await saveRatingToFirestore(rating); } catch (e) {}
  }

  playSuccessSound();
  closeRatingModal();
  showToast('⭐ شكراً لتقييمك');
}

async function renderMyRatings() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  var user = JSON.parse(userStr);
  var listEl = document.getElementById('myRatingsList');
  if (!listEl) return;

  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]')
    .filter(function (r) { return r.fromPhone === user.phone; });

  if (ratings.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#94A3B8;">لا توجد تقييمات بعد</div>';
    return;
  }

  var html = '';
  ratings.forEach(function (r) {
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<span style="color:' + (i <= r.rating ? '#FBBF24' : '#334155') + '">★</span>';
    }
    html +=
      '<div style="background:#0F172A;border:1.5px solid rgba(148,163,184,0.15);border-radius:12px;padding:14px;margin-bottom:10px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<h4 style="font-size:14px;font-weight:800;color:#F8FAFC;margin:0;">' + (r.targetName || '-') + '</h4>' +
          '<div style="display:flex;gap:2px;font-size:14px;">' + starsHtml + '</div>' +
        '</div>' +
        (r.comment ? '<p style="font-size:12px;color:#94A3B8;margin:6px 0 0;">' + r.comment + '</p>' : '') +
      '</div>';
  });
  listEl.innerHTML = html;
}

// ============================================
// ⚙️ Settings
// ============================================
function openSettings() { showScreen('settingsScreen'); }

function openAbout() { showToast('ℹ️ عن التطبيق قريباً'); }
function openAppDetails() { openAbout(); }
function openContact() { showToast('📞 التواصل قريباً'); }
function openAboutUs() { openAbout(); }
function openVision() { openAbout(); }
function openValues() { openAbout(); }

console.log('🏆 DAWAK v15 — الجزء 3 اكتمل ✅');
// ============================================
// 🛒 Cart — Add / Remove / Render
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
  updateBottomNav('cartScreen');
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
      '<div class="cart-v3-item">' +
        '<div class="cart-v3-item-image">' + imageHTML + '</div>' +
        '<div class="cart-v3-item-details">' +
          '<h4 class="cart-v3-item-name">' + item.name + '</h4>' +
          '<p class="cart-v3-item-pharmacy">🏪 ' + (item.pharmacy || 'صيدلية') + '</p>' +
          '<span class="cart-v3-item-price">' + item.price.toLocaleString() + '<small>د.ع</small></span>' +
        '</div>' +
        '<div class="cart-v3-item-controls">' +
          '<button class="cart-v3-qty-btn" onclick="changeQuantity(' + index + ', -1)">−</button>' +
          '<span class="cart-v3-qty-value">' + item.quantity + '</span>' +
          '<button class="cart-v3-qty-btn" onclick="changeQuantity(' + index + ', 1)">+</button>' +
          '<button class="cart-v3-remove" onclick="removeFromCart(' + index + ')">🗑️</button>' +
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
  var delivery = deliveryData ? deliveryData.total : 3000;

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
    message.className = 'cart-v3-coupon-msg error';
    return;
  }

  if (COUPONS[code]) {
    var coupon = COUPONS[code];
    localStorage.setItem('saydaliyati_cart_coupon', JSON.stringify({
      code: code, type: coupon.type, value: coupon.value, label: coupon.label
    }));
    message.textContent = '✅ تم تطبيق ' + coupon.label;
    message.className = 'cart-v3-coupon-msg success';
    playSuccessSound();
    updateCartSummary();
    showToast('🎉 ' + coupon.label);
  } else {
    message.textContent = '❌ كود الخصم غير صحيح';
    message.className = 'cart-v3-coupon-msg error';
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

  var paymentEl = document.querySelector('input[name="cartPayment"]:checked');
  var payment = paymentEl ? paymentEl.value : 'cash';

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
    payment: payment,
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

  var orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_cart_orders', JSON.stringify(orders));

  if (isFirebaseReady()) {
    try { await saveOrderToFirestore(order); } catch (e) {}
  }

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
  if (ratEl) ratEl.textContent = (productData.rating || 4.8).toFixed(1);

  var ratCntEl = document.getElementById('pdpRatingCount');
  if (ratCntEl) ratCntEl.textContent = productData.ratingCount || 120;

  var stockEl = document.getElementById('pdpStockText');
  var stock = productData.stock || 50;
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

  container.innerHTML = '<div class="pdp-v2-alt-loading"><div class="pdp-v2-alt-spinner"></div><span>جاري التحميل...</span></div>';

  try {
    if (!isFirebaseReady()) {
      container.innerHTML = '<div class="pdp-v2-alt-loading">لا توجد بدائل</div>';
      return;
    }

    var posts = await loadPostsFromFirestore();
    var alternatives = posts.filter(function (p) { return p.id !== excludeId; }).slice(0, 5);

    if (alternatives.length === 0) {
      container.innerHTML = '<div class="pdp-v2-alt-loading">لا توجد بدائل متاحة</div>';
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
        '<div class="pdp-v2-alt-card" onclick="openAlternativeProduct(\'' + alt.id + '\')">' +
          '<div class="pdp-v2-alt-image">' + imageHTML + '</div>' +
          '<h4 class="pdp-v2-alt-name">' + (alt.title || 'دواء') + '</h4>' +
          '<span class="pdp-v2-alt-price">' + (alt.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
        '</div>';
    });
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<div class="pdp-v2-alt-loading">حدث خطأ</div>';
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
      rating: 4.8,
      ratingCount: 120
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
    rating: 4.8,
    ratingCount: 120
  });
}

function orderFromPharmacy(pharmacyId, pharmacyName) {
  localStorage.setItem('saydaliyati_selected_pharmacy', JSON.stringify({
    id: pharmacyId, name: pharmacyName
  }));
  showToast('🛒 ' + pharmacyName);
  setTimeout(openCartScreen, 500);
}

// ============================================
// 🔍 Search / Pharmacies List / All Posts
// ============================================
function openSearchScreen() { showToast('🔍 البحث قريباً'); }
function openPharmaciesList() { showToast('🏪 القائمة قريباً'); }
function openAllPosts() {
  var el = document.getElementById('homeOffersScroll');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

console.log('🏆 DAWAK v15 — الجزء 4 اكتمل ✅');
// ============================================
// 📋 My Orders v3 (Patient / Pharmacy / Delivery)
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
  updateBottomNav('myOrdersScreen');

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
  container.querySelectorAll('.order-card-v3').forEach(function (c) { c.remove(); });

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
      updateOrdersTabs();
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
      updateOrdersTabs();
      return;
    }

    renderOrdersCards(filtered, container);
    updateOrdersTabs();
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
    var dateStr = order.createdAt ? formatOrderDate(order.createdAt) : '—';

    var actionsHTML = '';

    if (status.key === 'pending') {
      actionsHTML =
        '<button class="order-v3-btn primary" onclick="trackOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
          'تتبع' +
        '</button>';
    } else if (status.key === 'completed') {
      actionsHTML =
        '<button class="order-v3-btn outline" onclick="reorderOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
          'إعادة' +
        '</button>' +
        '<button class="order-v3-btn primary" onclick="rateOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
          'تقييم' +
        '</button>';
    } else {
      actionsHTML =
        '<button class="order-v3-btn outline" onclick="reorderOrder(\'' + orderId + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
          'إعادة' +
        '</button>';
    }

    html +=
      '<div class="order-card-v3 status-' + status.key + '">' +
        '<div class="order-v3-header">' +
          '<div>' +
            '<h3 class="order-v3-pharmacy">' + pharmacyName + '</h3>' +
            '<p class="order-v3-date">📅 ' + dateStr + '</p>' +
          '</div>' +
          '<span class="order-v3-status ' + status.key + '">' +
            '<span class="status-dot"></span>' +
            status.label +
          '</span>' +
        '</div>' +
        '<div class="order-v3-id">رقم الطلب: #' + orderId + '</div>' +
        '<div class="order-v3-items">📦 ' + itemsList + '</div>' +
        '<div class="order-v3-footer">' +
          '<span class="order-v3-total">' + total + '<small>د.ع</small></span>' +
          '<div class="order-v3-actions">' + actionsHTML + '</div>' +
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
  document.querySelectorAll('.orders-v3-tab').forEach(function (tab) {
    tab.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  if (navigator.vibrate) navigator.vibrate([20]);
  renderOrdersV2();
}

function updateOrdersTabs() {
  var tabs = document.querySelectorAll('.orders-v3-tab');
  if (!tabs || tabs.length < 4) return;

  var allCount = ordersCache.length;
  var pendingCount = ordersCache.filter(function (o) { return getOrderStatusInfo(o).key === 'pending'; }).length;
  var completedCount = ordersCache.filter(function (o) { return getOrderStatusInfo(o).key === 'completed'; }).length;
  var cancelledCount = ordersCache.filter(function (o) { return getOrderStatusInfo(o).key === 'cancelled'; }).length;

  var data = [
    { el: tabs[0], label: 'الكل', count: allCount },
    { el: tabs[1], label: 'قيد التوصيل', count: pendingCount },
    { el: tabs[2], label: 'مكتمل', count: completedCount },
    { el: tabs[3], label: 'ملغي', count: cancelledCount }
  ];

  data.forEach(function (d) {
    if (d.el) d.el.textContent = d.label + (d.count > 0 ? ' (' + d.count + ')' : '');
  });
}

function formatOrderDate(dateStr) {
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
// 📢 Posts — Pharmacy Only
// ============================================
function openAddPostModal() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') { showToast('هذه الميزة للصيدليات فقط'); return; }

  var modal = document.getElementById('addPostModal');
  if (modal) modal.classList.add('active');
}

function closeAddPostModal() {
  var modal = document.getElementById('addPostModal');
  if (modal) modal.classList.remove('active');
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

  var postId = null;
  if (isFirebaseReady()) {
    try { postId = await savePostToFirestore(postData); } catch (e) {}
  }

  if (!postId) {
    postData.id = 'LOCAL_' + Date.now();
    var localPosts = JSON.parse(localStorage.getItem('saydaliyati_posts') || '[]');
    localPosts.unshift(postData);
    localStorage.setItem('saydaliyati_posts', JSON.stringify(localPosts));
  }

  addInternalNotification('offer', '📢 تم نشر عرضك', title);
  playSuccessSound();
  showToast('✅ تم نشر العرض');
  closeAddPostModal();
}

// ============================================
// 💊 Inventory — Pharmacy
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
  if (!inv) { inv = []; }
  return inv;
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
    listEl.innerHTML = '<div class="phdash-v2-empty"><div class="phdash-v2-empty-icon">💊</div><h4>لا توجد أدوية</h4><p>اضغط "+ إضافة" للبدء</p></div>';
    return;
  }

  var html = '';
  inv.forEach(function (med) {
    html +=
      '<div class="cart-v3-item">' +
        '<div class="cart-v3-item-image">' + (med.icon || '💊') + '</div>' +
        '<div class="cart-v3-item-details">' +
          '<h4 class="cart-v3-item-name">' + med.name + '</h4>' +
          '<p class="cart-v3-item-pharmacy">📁 ' + (med.category || '-') + '</p>' +
          '<span class="cart-v3-item-price">' + (med.price || 0).toLocaleString() + '<small>د.ع</small></span>' +
        '</div>' +
      '</div>';
  });
  listEl.innerHTML = html;
}

function filterInventoryBy(filter, btn) {
  document.querySelectorAll('.inventory-v2-filter').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function filterInventory() {
  renderInventory();
}

function openAddMedicineModal() { showToast('➕ إضافة دواء قريباً'); }

// ============================================
// 🚴 Delivery Dashboard — Radar
// ============================================
var radarActive = false;
var radarInterval = null;

function toggleRadar() {
  var radar = document.getElementById('radarSimple');
  var radarTitle = document.getElementById('radarTitle');
  var btnText = document.getElementById('radarBtnText');
  var btn = document.getElementById('radarBtn');

  if (!radarActive) {
    radarActive = true;
    if (radar) radar.classList.add('active');
    if (radarTitle) radarTitle.textContent = 'جارٍ البحث...';
    if (btnText) btnText.textContent = 'إيقاف البحث';
    playRadarActivateSound();
    vibrateDevice([100, 50, 100]);
    showToast('📡 الرادار يعمل');
    if (radarInterval) clearInterval(radarInterval);
    radarInterval = setInterval(playSonarPing, 2000);
  } else {
    radarActive = false;
    if (radar) radar.classList.remove('active');
    if (radarTitle) radarTitle.textContent = 'ابدأ البحث';
    if (btnText) btnText.textContent = 'ابدأ البحث';
    if (radarInterval) { clearInterval(radarInterval); radarInterval = null; }
    showToast('⏹️ تم إيقاف الرادار');
  }
}

// ============================================
// 🚀 DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🏆 DAWAK v15 جاهز');
  document.title = 'DAWAK دواك - صحتك أولويتنا';

  loadTheme();

  var currentUserStr = localStorage.getItem('saydaliyati_current_user');
  var hasSeenOnboarding = localStorage.getItem('saydaliyati_onboarding_done') === 'true';

  if (currentUserStr) {
    goToDashboardByType();
  } else if (!hasSeenOnboarding) {
    showScreen('onboardingScreen');
    initOnboarding();
  } else {
    showScreen('splashScreen');
    setTimeout(createSplashParticles, 100);
  }

  document.body.addEventListener('click', function () { initAudio(); }, { once: true });

  setTimeout(function () {
    var splash = document.getElementById('splashScreen');
    if (splash && splash.classList.contains('active') && !currentUserStr) {
      setTimeout(function () {
        if (!localStorage.getItem('saydaliyati_current_user')) {
          showScreen('loginScreen');
        }
      }, 2500);
    }
  }, 100);
});

document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

// ============================================
// 🎉 نهاية script.js — DAWAK v15 كامل
// ============================================
console.log('🏆 DAWAK v15 — script.js اكتمل ✅');
