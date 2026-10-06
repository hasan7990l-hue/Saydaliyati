// ============================================
// توصيل طبي - Clean Medical v12
// ============================================

console.log('توصيل طبي - بدأ التحميل');

// ============================================
// 🔥 دوال Firestore
// ============================================

async function saveUserToFirestore(userData) {
  if (!window.firebaseDB || !window.firebaseSetDoc || !window.firebaseDoc) {
    console.log('⚠️ Firestore غير جاهز');
    return null;
  }
  
  try {
    const userId = userData.googleId || userData.phone || ('user_' + Date.now());
    const userRef = window.firebaseDoc(window.firebaseDB, 'users', userId);
    await window.firebaseSetDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ تم حفظ المستخدم في Firestore:', userId);
    return userId;
  } catch (error) {
    console.error('❌ خطأ حفظ المستخدم:', error);
    return null;
  }
}

async function getUserFromFirestore(userId) {
  if (!window.firebaseDB || !window.firebaseGetDoc || !window.firebaseDoc) {
    return null;
  }
  
  try {
    const userRef = window.firebaseDoc(window.firebaseDB, 'users', userId);
    const userSnap = await window.firebaseGetDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ جلب المستخدم:', error);
    return null;
  }
}

async function saveOrderToFirestore(orderData) {
  if (!window.firebaseDB || !window.firebaseAddDoc || !window.firebaseCollection) {
    return null;
  }
  
  try {
    const orderRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, 'orders'),
      {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: orderData.status || 'pending'
      }
    );
    console.log('✅ تم حفظ الطلب في Firestore:', orderRef.id);
    return orderRef.id;
  } catch (error) {
    console.error('❌ خطأ حفظ الطلب:', error);
    return null;
  }
}

async function saveRatingToFirestore(ratingData) {
  if (!window.firebaseDB || !window.firebaseAddDoc || !window.firebaseCollection) {
    return null;
  }
  
  try {
    const ratingRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDB, 'ratings'),
      {
        ...ratingData,
        createdAt: new Date().toISOString()
      }
    );
    console.log('✅ تم حفظ التقييم في Firestore:', ratingRef.id);
    return ratingRef.id;
  } catch (error) {
    console.error('❌ خطأ حفظ التقييم:', error);
    return null;
  }
}

async function savePharmacyToFirestore(pharmacyData) {
  if (!window.firebaseDB || !window.firebaseSetDoc || !window.firebaseDoc) {
    console.log('⚠️ Firestore غير جاهز');
    return null;
  }
  
  try {
    const pharmacyRef = window.firebaseDoc(
      window.firebaseDB, 
      'pharmacies', 
      pharmacyData.phone
    );
    
    await window.firebaseSetDoc(pharmacyRef, {
      name: pharmacyData.name,
      owner: pharmacyData.owner,
      phone: pharmacyData.phone,
      address: pharmacyData.address,
      license: pharmacyData.license,
      rating: pharmacyData.rating || 5.0,
      logo: pharmacyData.logo || 'ص',
      color: pharmacyData.color || 'green',
      deliveryTime: pharmacyData.deliveryTime || '30 دقيقة',
      active: pharmacyData.active !== undefined ? pharmacyData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ تم إضافة الصيدلية للمريض:', pharmacyData.name);
    return pharmacyData.phone;
  } catch (error) {
    console.error('❌ خطأ إضافة الصيدلية:', error);
    return null;
  }
}

async function loadPharmaciesFromFirestore() {
  if (!window.firebaseDB || !window.firebaseGetDocs || !window.firebaseCollection) {
    console.log('⚠️ Firestore غير جاهز');
    return [];
  }
  
  try {
    const snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, 'pharmacies')
    );
    
    const pharmacies = [];
    snapshot.forEach(function(doc) {
      const data = doc.data();
      if (data.active !== false) {
        pharmacies.push({ id: doc.id, ...data });
      }
    });
    
    console.log('✅ تم جلب', pharmacies.length, 'صيدلية من Firestore');
    return pharmacies;
    
  } catch (error) {
    console.error('❌ خطأ جلب الصيدليات:', error);
    return [];
  }
}

async function loadPharmaciesForPatient() {
  console.log('🔄 بدء loadPharmaciesForPatient...');
  
  var container = document.getElementById('pharmacyListContainer');
  if (!container) {
    console.error('❌ pharmacyListContainer غير موجود!');
    return;
  }
  
  console.log('✅ Container موجود');
  container.innerHTML = '<div style="text-align:center;padding:20px;color:#94A3B8;">⏳ جاري التحميل...</div>';
  
  try {
    var pharmacies = await loadPharmaciesFromFirestore();
    console.log('📦 عدد الصيدليات:', pharmacies.length);
    
    if (pharmacies.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#94A3B8;">لا توجد صيدليات متاحة حالياً</div>';
      return;
    }
    
    var html = '';
    pharmacies.forEach(function(pharmacy) {
      var color = pharmacy.color === 'blue' ? '#2563EB' : 
                  pharmacy.color === 'orange' ? '#F59E0B' : 
                  pharmacy.color === 'purple' ? '#8B5CF6' : '#10B981';
      var logo = pharmacy.logo || 'ص';
      var rating = pharmacy.rating || 5.0;
      var deliveryTime = pharmacy.deliveryTime || '30 دقيقة';
      var address = pharmacy.address || 'بغداد';
      
      html += 
        '<div class="pharmacy-card">' +
          '<div class="pharmacy-logo" style="background:' + color + ';color:white;">' + logo + '</div>' +
          '<div class="pharmacy-info">' +
            '<h4>' + pharmacy.name + '</h4>' +
            '<p>' + address + '</p>' +
            '<div class="pharmacy-meta">' +
              '<span class="rating">' + rating + ' ★</span>' +
              '<span class="badge">توصيل ' + deliveryTime + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="btn-order" onclick="orderFromPharmacy(\'' + pharmacy.id + '\', \'' + pharmacy.name + '\')">اطلب</button>' +
        '</div>';
    });
    
    container.innerHTML = html;
    console.log('✅ تم عرض', pharmacies.length, 'صيدلية');
    
  } catch (error) {
    console.error('❌ خطأ في loadPharmaciesForPatient:', error);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#EF4444;">حدث خطأ في التحميل: ' + error.message + '</div>';
  }
}

function orderFromPharmacy(pharmacyId, pharmacyName) {
  console.log('🛒 طلب من:', pharmacyName, '| ID:', pharmacyId);
  
  localStorage.setItem('saydaliyati_selected_pharmacy', JSON.stringify({
    id: pharmacyId,
    name: pharmacyName
  }));
  
  showToast('🛒 ستنشئ طلباً من: ' + pharmacyName);
}

// ============================================
// 🌙 نظام الوضع الليلي
// ============================================
function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var newTheme = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('saydaliyati_theme', newTheme);
  
  var icons = document.querySelectorAll('.theme-icon');
  icons.forEach(function(icon) {
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
  
  var darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = newTheme === 'dark';
  
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', newTheme === 'dark' ? '#0F172A' : '#2563EB');
  }
}

function loadTheme() {
  var saved = localStorage.getItem('saydaliyati_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  
  var icons = document.querySelectorAll('.theme-icon');
  icons.forEach(function(icon) {
    icon.textContent = saved === 'dark' ? '☀️' : '🌙';
  });
  
  var darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = saved === 'dark';
}

// ============================================
// 🔊 الأصوات
// ============================================
var audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.log('الصوت غير مدعوم');
    }
  }
  return audioCtx;
}

function playSonarPing() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var oscillator = ctx.createOscillator();
    var gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function playAlertDing() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var osc1 = ctx.createOscillator();
    var gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 1200;
    osc1.type = 'triangle';
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);
  } catch(e) {}
}

function playSuccessSound() {
  try {
    var ctx = initAudio();
    if (!ctx) return;
    var notes = [523, 659, 784];
    notes.forEach(function(freq, i) {
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
  } catch(e) {}
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
  } catch(e) {}
}

function vibrateDevice(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
// ============================================
// 🎬 الجزيئات
// ============================================
function createSplashParticles() {
  var container = document.getElementById('splashParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 35; i++) {
    var particle = document.createElement('div');
    particle.className = 'splash-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

function createLoginParticles() {
  var container = document.getElementById('loginParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 30; i++) {
    var particle = document.createElement('div');
    particle.className = 'login-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

function createRoleParticles() {
  var container = document.getElementById('roleParticles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 30; i++) {
    var particle = document.createElement('div');
    particle.className = 'role-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

function createRegParticles(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 25; i++) {
    var particle = document.createElement('div');
    particle.className = 'reg-particle' + (Math.random() > 0.6 ? ' white' : '');
    var size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

// ============================================
// 🔵 Google Sign-In
// ============================================
async function signInWithGoogleTest() {
  showToast('🔄 جاري الاتصال بـ Google...');
  
  try {
    const provider = window.firebaseProvider;
    const auth = window.firebaseAuth;
    const signInWithPopup = window.firebaseSignInWithPopup;
    
    if (!provider || !auth || !signInWithPopup) {
      showError('Firebase غير جاهز. حاول لاحقاً.');
      return;
    }
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userData = {
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
    
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(userData));
    playSuccessSound();
    showToast('✅ تم الدخول بنجاح');
    
    setTimeout(function() {
      goToDashboardByType();
    }, 800);
    
  } catch (error) {
    console.error('❌ خطأ Google Sign-In:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('⚠️ تم إغلاق نافذة Google');
    } else if (error.code === 'auth/unauthorized-domain') {
      showError('النطاق غير مصرح به.');
    } else {
      showError('فشل الدخول: ' + error.message);
    }
  }
}

async function signUpWithGoogleTest() {
  showToast('🔄 جاري الاتصال بـ Google...');
  
  try {
    const provider = window.firebaseProvider;
    const auth = window.firebaseAuth;
    const signInWithPopup = window.firebaseSignInWithPopup;
    
    if (!provider || !auth || !signInWithPopup) {
      showError('Firebase غير جاهز.');
      return;
    }
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userData = {
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
    
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(userData));
    
    if (window.firebaseDB && window.firebaseSetDoc && window.firebaseDoc) {
      try {
        const userRef = window.firebaseDoc(window.firebaseDB, 'users', user.uid);
        await window.firebaseSetDoc(userRef, userData, { merge: true });
      } catch (e) {}
    }
    
    playSuccessSound();
    showToast('✅ تم التسجيل بنجاح');
    
    setTimeout(function() {
      goToDashboardByType();
    }, 800);
    
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('⚠️ تم إغلاق نافذة Google');
    } else {
      showError('فشل التسجيل: ' + error.message);
    }
  }
}

// ============================================
// 📜 الشروط والأحكام
// ============================================
function openTerms() {
  var modal = document.createElement('div');
  modal.className = 'legal-modal';
  modal.innerHTML = 
    '<div class="legal-modal-content">' +
      '<div class="legal-modal-header">' +
        '<h2>الشروط والأحكام</h2>' +
        '<button class="legal-modal-close" onclick="closeLegalModal(this)">×</button>' +
      '</div>' +
      '<div class="legal-modal-body">' +
        '<h3>1. قبول الشروط</h3>' +
        '<p>باستخدامك لتطبيق "توصيل طبي"، فإنك توافق على جميع الشروط والأحكام المذكورة هنا.</p>' +
        '<h3>2. استخدام التطبيق</h3>' +
        '<p>يجب استخدام التطبيق للأغراض المشروعة فقط.</p>' +
        '<h3>3. الحساب</h3>' +
        '<p>أنت مسؤول عن الحفاظ على سرية حسابك.</p>' +
      '</div>' +
      '<div class="legal-modal-footer">' +
        '<button class="btn-primary" onclick="closeLegalModal(this)">فهمت</button>' +
      '</div>' +
    '</div>';
  
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 50);
  document.body.style.overflow = 'hidden';
}

function openPrivacy() {
  var modal = document.createElement('div');
  modal.className = 'legal-modal';
  modal.innerHTML = 
    '<div class="legal-modal-content">' +
      '<div class="legal-modal-header">' +
        '<h2>سياسة الخصوصية</h2>' +
        '<button class="legal-modal-close" onclick="closeLegalModal(this)">×</button>' +
      '</div>' +
      '<div class="legal-modal-body">' +
        '<h3>1. المعلومات التي نجمعها</h3>' +
        '<p>نجمع المعلومات التي تقدمها عند التسجيل.</p>' +
        '<h3>2. كيف نستخدم معلوماتك</h3>' +
        '<p>نستخدم معلوماتك لتقديم الخدمات.</p>' +
      '</div>' +
      '<div class="legal-modal-footer">' +
        '<button class="btn-primary" onclick="closeLegalModal(this)">فهمت</button>' +
      '</div>' +
    '</div>';
  
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 50);
  document.body.style.overflow = 'hidden';
}

function closeLegalModal(btn) {
  var modal = btn.closest('.legal-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(function() { 
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// ============================================
// 📱 إدارة الشاشات
// ============================================

// ✅ دالة تحديث الشريط السفلي (كانت مفقودة!)
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

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });
  
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'flex';
    window.scrollTo(0, 0);
    
    // ✅ استدعاء updateBottomNav بأمان
    if (typeof updateBottomNav === 'function') {
      updateBottomNav(screenId);
    }
    
    if (screenId === 'loginScreen') {
      setTimeout(createLoginParticles, 100);
    }
    if (screenId === 'roleScreen') {
      setTimeout(createRoleParticles, 100);
    }
    if (screenId === 'patientScreen') {
      setTimeout(function() { createRegParticles('patientParticles'); }, 100);
    }
    if (screenId === 'pharmacyScreen') {
      setTimeout(function() { createRegParticles('pharmacyParticles'); }, 100);
    }
    if (screenId === 'deliveryScreen') {
      setTimeout(function() { createRegParticles('deliveryParticles'); }, 100);
    }
    
    console.log('✅ showScreen:', screenId);
  } else {
    console.warn('❌ الشاشة غير موجودة:', screenId);
  }
  }
// ============================================
// 🔄 تبديل التبويب
// ============================================
function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  
  var activeBtn = document.querySelector('.nav-btn[data-tab="' + tab + '"]');
  if (activeBtn) activeBtn.classList.add('active');
  
  if (tab === 'home') {
    goToDashboardByType();
  } else if (tab === 'orders') {
    goToMyOrders();
  } else if (tab === 'notifications') {
    openNotifications();
  } else if (tab === 'more') {
    openSidebar();
  }
}

// ============================================
// 📋 طلباتي الديناميكية
// ============================================
function goToMyOrders() {
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
  } else {
    if (titleEl) titleEl.textContent = 'طلباتي';
    if (subtitleEl) subtitleEl.textContent = 'تتبع طلباتك الحالية والسابقة';
    if (patientContent) patientContent.style.display = 'block';
  }
  
  showScreen('myOrdersScreen');
  
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  var ordersBtn = document.querySelector('.nav-btn[data-tab="orders"]');
  if (ordersBtn) ordersBtn.classList.add('active');
}

// ============================================
// 🏪 قبول / رفض الطلبات (للصيدلية)
// ============================================
function acceptPharmacyOrder(orderId) {
  playSuccessSound();
  showToast('تم قبول الطلب #' + orderId);
  setTimeout(function() {
    showToast('تم إشعار المندوب لتوصيل الطلب');
  }, 1500);
}

function rejectPharmacyOrder(orderId) {
  if (confirm('هل تريد رفض الطلب #' + orderId + '؟')) {
    showToast('تم رفض الطلب #' + orderId);
  }
}

function switchPharmacyFilter(filter, btn) {
  document.querySelectorAll('#pharmacyOrdersContent .filter-tab').forEach(function(t) {
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
// 👤 الملف الشخصي
// ============================================
function openProfile() {
  closeSidebar();
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  
  var avatarText = 'م';
  var typeLabel = 'مريض';
  
  if (user.type === 'pharmacy') {
    avatarText = 'ص';
    typeLabel = 'صيدلية';
  } else if (user.type === 'delivery') {
    avatarText = 'د';
    typeLabel = 'دليفري';
  }
  
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
    if (user.type === 'delivery' && user.vehicle) {
      roleEl.textContent = 'دليفري • ' + user.vehicle;
    } else if (user.type === 'pharmacy') {
      roleEl.textContent = 'صيدلية';
    } else {
      roleEl.textContent = typeLabel;
    }
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
      var date = new Date(user.date);
      infoDate.textContent = date.toLocaleDateString('ar-IQ');
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

function handleAvatarUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) {
    showError('حجم الصورة كبير جداً - الحد الأقصى 2MB');
    return;
  }
  
  var reader = new FileReader();
  reader.onload = function(e) {
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
    user.avatar = imageData;
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
    
    showToast('تم تحديث الصورة');
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

function saveProfile(event) {
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
  
  if (user.type === 'delivery') {
    user.area = address;
  } else {
    user.address = address;
  }
  
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
  
  closeEditProfile();
  openProfile();
  showToast('تم حفظ التعديلات');
}

// ============================================
// ⭐ عرض تقييماتي
// ============================================
function renderMyRatings() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  
  var user = JSON.parse(userStr);
  var listEl = document.getElementById('myRatingsList');
  var countEl = document.getElementById('myRatingsCount');
  
  if (!listEl) return;
  
  var allRatings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  var myRatings = allRatings.filter(function(r) {
    return r.fromPhone === user.phone;
  });
  
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
  myRatings.forEach(function(rating) {
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<span class="my-rating-star' + (i <= rating.rating ? ' filled' : '') + '">★</span>';
    }
    
    var date = new Date(rating.date);
    var dateStr = date.toLocaleDateString('ar-IQ');
    var icon = rating.targetType === 'delivery' ? '🚴' : '🏪';
    
    html += 
      '<div class="my-rating-card">' +
        '<div class="my-rating-header">' +
          '<div class="my-rating-icon">' + icon + '</div>' +
          '<div class="my-rating-info">' +
            '<h4 class="my-rating-name">' + rating.targetName + '</h4>' +
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
  
  if (subtitleEl) {
    subtitleEl.textContent = notifs.length + ' إشعارات';
  }
  
  if (notifs.length === 0) {
    listEl.innerHTML = 
      '<div class="notif-empty">' +
        '<div class="notif-empty-icon">🔔</div>' +
        '<p>لا توجد إشعارات</p>' +
      '</div>';
    return;
  }
  
  var html = '';
  notifs.forEach(function(n) {
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
  }
  
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ' + glow + ');">' +
    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
    '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
  '</svg>';
}

function getDefaultNotifications(userType) {
  if (userType === 'delivery') {
    return [
      { icon: '🚴', type: 'order', title: 'طلب جديد متاح', message: 'صيدلية النور - 2.5 كم - 3,000 دينار', time: 'الآن', read: false },
      { icon: '💰', type: 'wallet', title: 'أرباح اليوم', message: '12,000 دينار من 12 طلب', time: 'قبل ساعة', read: false }
    ];
  } else if (userType === 'pharmacy') {
    return [
      { icon: '💊', type: 'order', title: 'طلب جديد وارد', message: 'أحمد علي - 23,000 دينار', time: 'الآن', read: false },
      { icon: '⚠️', type: 'stock', title: 'تنبيه المخزون', message: '3 أدوية قاربت على الانتهاء', time: 'قبل ساعة', read: false }
    ];
  } else {
    return [
      { icon: '✅', type: 'order', title: 'تم قبول طلبك', message: 'صيدلية النور قبلت طلبك #1234', time: 'الآن', read: false },
      { icon: '🚴', type: 'order', title: 'المندوب في الطريق', message: 'أحمد محمد سيصل خلال 15 دقيقة', time: 'قبل 5 دقائق', read: false }
    ];
  }
}

// ============================================
// ⚙️ الإعدادات + من نحن + تواصل
// ============================================
function openSettings() {
  closeSidebar();
  showScreen('settingsScreen');
}

function openAbout() {
  closeSidebar();
  showScreen('aboutScreen');
}

function openAppDetails() {
  closeSidebar();
  showScreen('aboutUsScreen');
}

function openContact() {
  closeSidebar();
  showScreen('contactScreen');
}

function openAboutUs() { showScreen('aboutUsScreen'); }
function openVision() { showScreen('visionScreen'); }
function openValues() { showScreen('valuesScreen'); }

function closeAllScreens() {
  goToDashboardByType();
}

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
    setTimeout(function() {
      loadOffers();
      loadPharmaciesForPatient();
    }, 100);
  }
}

// ============================================
// 👤 تحديث اسم المستخدم
// ============================================
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
// 🔐 تسجيل الدخول
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
  
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  var user = registrations.find(function(r) { return r.phone === phone; });
  
  if (!user) {
    try {
      var fsUser = await getUserFromFirestore(phone);
      if (fsUser) {
        user = fsUser;
        registrations.push(user);
        localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
      }
    } catch (e) {
      console.log('⚠️ خطأ البحث في Firestore:', e);
    }
  }
  
  if (user) {
    if (user.password && user.password !== password) {
      showError('كلمة المرور غير صحيحة');
      return;
    }
    
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
    playSuccessSound();
    showToast('أهلاً بك ' + (user.name || ''));
    
    setTimeout(function() {
      goToDashboardByType();
    }, 500);
    
    return;
  }
  
  showError('رقم الهاتف غير مسجل. سجل حساب جديد أولاً.');
}

// ============================================
// 🚪 تسجيل الخروج
// ============================================
function logout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    localStorage.removeItem('saydaliyati_current_user');
    closeSidebar();
    goToSplash();
    showToast('تم تسجيل الخروج');
  }
}

// ============================================
// 📝 إرسال النماذج
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
  
  saveUserToFirestore(user).catch(function(e) {
    console.log('⚠️ خطأ حفظ المستخدم:', e);
  });
  
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
  
  saveUserToFirestore(user).catch(function(e) {
    console.log('⚠️ خطأ حفظ المستخدم:', e);
  });
  
  savePharmacyToFirestore({
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
  }).catch(function(e) {
    console.log('⚠️ خطأ حفظ الصيدلية:', e);
  });
  
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
  
  saveUserToFirestore(user).catch(function(e) {
    console.log('⚠️ خطأ حفظ المستخدم:', e);
  });
  
  playSuccessSound();
  showSuccessMessage('مرحباً بك في فريقنا', 'سنتواصل معك قريباً');
}

// ============================================
// 💾 حفظ التسجيلات
// ============================================
function saveRegistration(data) {
  data.date = new Date().toISOString();
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  registrations.push(data);
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
// ✅ رسائل النجاح والخطأ
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
  
  setTimeout(function() { overlay.classList.add('show'); }, 50);
}

function closeSuccess() {
  var overlay = document.querySelector('.success-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function() { overlay.remove(); }, 300);
  }
}

function closeSuccessAndGo() {
  closeSuccess();
  setTimeout(goToDashboardByType, 300);
}

function showError(message) {
  alert('تنبيه: ' + message);
}

// ============================================
// 💬 Toast
// ============================================
function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(function() { toast.classList.add('show'); }, 50);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 2000);
}

// ============================================
// 📢 إدارة العروض (للصيدلية)
// ============================================
function openAddOfferModal() {
  var modal = document.getElementById('addOfferModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAddOfferModal() {
  var modal = document.getElementById('addOfferModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function publishOffer(event) {
  if (event) event.preventDefault();
  
  var title = document.getElementById('offerTitle').value.trim();
  var description = document.getElementById('offerDescription').value.trim();
  var expiry = document.getElementById('offerExpiry').value;
  
  if (!title || !description) {
    alert('املأ العنوان والتفاصيل');
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
  showToast('تم نشر العرض بنجاح');
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
  offers.forEach(function(offer) {
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
  
  var reader = new FileReader();
  reader.onload = function(e) {
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

function submitPrescription(event) {
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
    address: address,
    image: prescriptionImageData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  var orders = JSON.parse(localStorage.getItem('saydaliyati_prescription_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_prescription_orders', JSON.stringify(orders));
  
  addInternalNotification('order', '📸 تم إرسال روشتتك', 'ستتواصل معك صيدلية قريبة');
  
  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'ستتواصل معك صيدلية قريبة خلال دقائق');
  
  prescriptionImageData = null;
  resetPrescriptionUpload();
}

// ============================================
// 🛒 نظام سلة التسوق
// ============================================
var PHARMACY_INVENTORY = {
  'صيدلية النور': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3000, icon: '💊', stock: 50, desc: 'مسكن للألم' },
    { id: 'P002', name: 'فيتامين C', category: 'فيتامينات', price: 5000, icon: '🍊', stock: 30, desc: 'مكمل غذائي' }
  ],
  'صيدلية الحياة': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3500, icon: '💊', stock: 60, desc: 'مسكن للألم' }
  ]
};

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

function renderCart() {
  var itemsEl = document.getElementById('cartItems');
  var emptyEl = document.getElementById('cartEmpty');
  var sectionEl = document.getElementById('cartItemsSection');
  var summaryEl = document.getElementById('cartSummary');
  var badgeEl = document.getElementById('cartBadge');
  
  var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
  if (badgeEl) badgeEl.textContent = totalItems;
  
  if (cart.length === 0) {
    if (sectionEl) sectionEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }
  
  if (sectionEl) sectionEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';
  
  var html = '';
  cart.forEach(function(item, index) {
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
        '</div>' +
      '</div>';
  });
  
  if (itemsEl) itemsEl.innerHTML = html;
}

function changeQuantity(index, delta) {
  if (index < 0 || index >= cart.length) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem('saydaliyati_cart', JSON.stringify(cart));
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('مسح جميع المنتجات من السلة؟')) return;
  cart = [];
  localStorage.setItem('saydaliyati_cart', JSON.stringify(cart));
  renderCart();
  showToast('تم مسح السلة');
}

// ============================================
// ⭐ نظام التقييم
// ============================================
var currentRating = 0;

function openRatingModal(targetName, targetType, orderId) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'patient') { showToast('هذه الميزة للمرضى فقط'); return; }
  
  currentRating = 0;
  
  var nameEl = document.getElementById('ratingTargetName');
  if (nameEl) nameEl.textContent = targetName;
  
  document.getElementById('ratingTargetId').value = orderId || '';
  document.getElementById('ratingTargetType').value = targetType;
  document.getElementById('ratingComment').value = '';
  
  document.querySelectorAll('.rating-star').forEach(function(star) {
    star.classList.remove('active');
  });
  
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
  document.querySelectorAll('.rating-star').forEach(function(star, index) {
    star.classList.toggle('active', index < value);
  });
}

function submitRating() {
  if (currentRating === 0) { showError('اختر تقييماً أولاً'); return; }
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);
  
  var rating = {
    id: 'RATING_' + Date.now(),
    from: user.name,
    fromPhone: user.phone,
    targetName: document.getElementById('ratingTargetName').textContent,
    targetType: document.getElementById('ratingTargetType').value,
    rating: currentRating,
    comment: document.getElementById('ratingComment').value.trim(),
    date: new Date().toISOString()
  };
  
  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  ratings.unshift(rating);
  localStorage.setItem('saydaliyati_ratings', JSON.stringify(ratings));
  
  playSuccessSound();
  closeRatingModal();
  showToast('⭐ شكراً لتقييمك');
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
    read: false,
    date: new Date().toISOString(),
    time: 'الآن'
  };
  
  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  notifs.unshift(notif);
  if (notifs.length > 50) notifs = notifs.slice(0, 50);
  localStorage.setItem('saydaliyati_notifications', JSON.stringify(notifs));
}

// ============================================
// 📡 الرادار
// ============================================
var radarActive = false;
var radarInterval = null;
var orderSimulationInterval = null;

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
    showToast('📡 الرادار يعمل - جاري البحث...');
    
    radarInterval = setInterval(function() { playSonarPing(); }, 2000);
    
    setTimeout(function() {
      if (radarActive) {
        playAlertDing();
        openOrderSheet();
        if (radarTitle) radarTitle.textContent = '📦 تم رصد طلب!';
      }
    }, 5000);
    
  } else {
    radarActive = false;
    if (radarSimple) radarSimple.classList.remove('active');
    if (radarTitle) radarTitle.textContent = 'ابدأ البحث';
    if (btnText) btnText.textContent = 'ابدأ البحث';
    if (btn) btn.classList.remove('active');
    
    if (radarInterval) clearInterval(radarInterval);
    if (orderSimulationInterval) clearInterval(orderSimulationInterval);
    
    showToast('⏹️ تم إيقاف الرادار');
  }
}

function openOrderSheet() {
  var overlay = document.getElementById('orderSheetOverlay');
  var sheet = document.getElementById('orderSheet');
  if (overlay) overlay.classList.add('active');
  if (sheet) sheet.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderSheet() {
  var overlay = document.getElementById('orderSheetOverlay');
  var sheet = document.getElementById('orderSheet');
  if (overlay) overlay.classList.remove('active');
  if (sheet) sheet.classList.remove('active');
  document.body.style.overflow = '';
}

function acceptFromSheet() {
  playSuccessSound();
  closeOrderSheet();
  showToast('تم قبول الطلب');
}

// ============================================
// 🗺️ نظام الخريطة + GPS
// ============================================
var mainMap = null;
var trackingMap = null;
var myLocation = null;
var myMarker = null;
var routeLine = null;
var BAGHDAD_CENTER = [33.3152, 44.3661];

function openMapScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) { showToast('سجّل دخول أولاً'); return; }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'delivery') { showToast('هذه الميزة للمندوبين فقط'); return; }
  
  showScreen('mapScreen');
  
  setTimeout(function() {
    initMainMap();
    requestMyLocation();
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
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(mainMap);
  
  var loading = document.getElementById('mapLoading');
  if (loading) loading.style.display = 'none';
}

function requestMyLocation() {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم GPS');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    function(position) {
      myLocation = [position.coords.latitude, position.coords.longitude];
      if (mainMap) mainMap.setView(myLocation, 15);
      
      if (myMarker) mainMap.removeLayer(myMarker);
      var myIcon = L.divIcon({
        className: 'custom-map-marker marker-me',
        html: '<div class="custom-marker-pin"><span>📍</span></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });
      myMarker = L.marker(myLocation, { icon: myIcon })
        .addTo(mainMap)
        .bindPopup('<strong>موقعك الحالي</strong>')
        .openPopup();
    },
    function(error) {
      myLocation = BAGHDAD_CENTER;
      showToast('⚠️ تعذّر تحديد موقعك');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function centerOnMe() {
  if (!mainMap || !myLocation) { requestMyLocation(); return; }
  mainMap.setView(myLocation, 16);
  showToast('📍 تم التركيز على موقعك');
}

function refreshMyLocation() { requestMyLocation(); }

// ============================================
// 🚴 تتبع المندوب (للمريض)
// ============================================
function trackDeliveryOnMap(deliveryName, pharmacyLat, pharmacyLng) {
  showScreen('trackingScreen');
}

function closeTrackingScreen() { showScreen('myOrdersScreen'); }

// ============================================
// 🚀 عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('توصيل طبي جاهز');
  
  loadTheme();
  setTimeout(createSplashParticles, 100);
  
  document.querySelectorAll('.modal-overlay').forEach(function(modal) {
    modal.classList.remove('active');
  });
  
  document.body.addEventListener('click', function() {
    initAudio();
  }, { once: true });
  
  var currentUser = localStorage.getItem('saydaliyati_current_user');
  if (currentUser) {
    goToDashboardByType();
  } else {
    showScreen('splashScreen');
  }
});

// ============================================
// 🎉 نهاية الملف
// ============================================
console.log('توصيل طبي - اكتمل التحميل v12');
