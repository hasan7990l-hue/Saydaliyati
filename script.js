// ============================================
// صيدليتي - Clean Medical
// ============================================

console.log('✨ صيدليتي - بدأ التحميل');

// ============================================
// نظام الوضع الليلي / النهاري
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
  
  console.log('🎨 الوضع:', newTheme);
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
// إدارة الشاشات
// ============================================
function showScreen(screenId) {
  console.log('🔄 تحويل إلى:', screenId);
  
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });
  
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'flex';
    window.scrollTo(0, 0);
    updateBottomNav(screenId);
  } else {
    console.error('❌ شاشة غير موجودة:', screenId);
  }
}

function updateBottomNav(screenId) {
  var nav = document.getElementById('mainBottomNav');
  if (!nav) return;
  
  var navScreens = ['homeScreen', 'pharmacyDashboard', 'deliveryDashboard', 'ordersScreen'];
  
  if (navScreens.indexOf(screenId) !== -1) {
    nav.style.display = 'flex';
  } else {
    nav.style.display = 'none';
  }
}

// ============================================
// تبديل التبويب
// ============================================
function switchTab(tab) {
  console.log('📌 تبويب:', tab);
  
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  
  var activeBtn = document.querySelector('.nav-btn[data-tab="' + tab + '"]');
  if (activeBtn) activeBtn.classList.add('active');
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';
  
  if (tab === 'home') {
    if (userType === 'pharmacy') goToPharmacyDashboard(user);
    else if (userType === 'delivery') goToDeliveryDashboard(user);
    else goToPatientHome(user);
  } else if (tab === 'orders') {
    if (userType === 'delivery') {
      showScreen('ordersScreen');
    } else {
      showToast('🚧 قريباً - قائمة الطلبات');
    }
  } else if (tab === 'notifications') {
    showToast('🚧 قريباً - التنبيهات');
  } else if (tab === 'profile') {
    openSettings();
  }
}

// ============================================
// القائمة الجانبية
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

function closeAllScreens() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';
  
  if (userType === 'pharmacy') goToPharmacyDashboard(user);
  else if (userType === 'delivery') goToDeliveryDashboard(user);
  else goToPatientHome(user);
}

// ============================================
// صفحات القائمة
// ============================================
function openProfile() {
  closeSidebar();
  showToast('🚧 الملف الشخصي - قريباً');
}

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
  showScreen('appDetailsScreen');
}

// ============================================
// التنقل
// ============================================
function goToSplash() { showScreen('splashScreen'); }
function goToLogin() { showScreen('loginScreen'); }
function goToRoleSelection() { showScreen('roleScreen'); }
function goToOrdersPage() { showScreen('ordersScreen'); }

function selectRole(role) {
  console.log('👤 دور:', role);
  if (role === 'patient') showScreen('patientScreen');
  else if (role === 'pharmacy') showScreen('pharmacyScreen');
  else if (role === 'delivery') showScreen('deliveryScreen');
}

// ============================================
// التوجيه حسب نوع المستخدم
// ============================================
function goToPatientHome(user) {
  var greetEl = document.getElementById('userGreeting');
  if (greetEl) greetEl.textContent = user.name || 'أحمد';
  showScreen('homeScreen');
  setTimeout(loadOffers, 100);
}

function goToPharmacyDashboard(user) {
  var greetEl = document.getElementById('pharmacyGreeting');
  if (greetEl) greetEl.textContent = user.name || 'صيدلية النور';
  showScreen('pharmacyDashboard');
}

function goToDeliveryDashboard(user) {
  var greetEl = document.getElementById('deliveryGreeting');
  if (greetEl) greetEl.textContent = user.name || 'أحمد';
  showScreen('deliveryDashboard');
}

// ============================================
// تسجيل الدخول
// ============================================
function submitLogin(event) {
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
  
  if (user) {
    if (user.password && user.password !== password) {
      showError('كلمة المرور غير صحيحة');
      return;
    }
    
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
    
    if (user.type === 'pharmacy') goToPharmacyDashboard(user);
    else if (user.type === 'delivery') goToDeliveryDashboard(user);
    else goToPatientHome(user);
    
    return;
  }
  
  showError('رقم الهاتف غير مسجل. سجل حساب جديد أولاً.');
}

// ============================================
// تسجيل الخروج
// ============================================
function logout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    localStorage.removeItem('saydaliyati_current_user');
    closeSidebar();
    goToSplash();
    showToast('✅ تم تسجيل الخروج');
  }
}

// ============================================
// إرسال النماذج
// ============================================
function submitPatient(event) {
  if (event) event.preventDefault();
  
  var name = document.getElementById('patientName').value.trim();
  var phone = document.getElementById('patientPhone').value.trim();
  var address = document.getElementById('patientAddress').value.trim();
  var password = document.getElementById('patientPassword').value.trim();
  
  if (!name || !phone || !address || !password) {
    showError('املأ كل الحقول المطلوبة');
    return;
  }
  
  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح (07XXXXXXXXX)');
    return;
  }
  
  var user = {
    type: 'patient',
    name: name,
    phone: phone,
    address: address,
    password: password,
    date: new Date().toISOString()
  };
  
  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
  
  showSuccessMessage('تم إنشاء حسابك! 🎉', 'أهلاً بك في صيدليتي، ' + name);
}

function submitPharmacy(event) {
  if (event) event.preventDefault();
  
  var name = document.getElementById('pharmacyName').value.trim();
  var owner = document.getElementById('ownerName').value.trim();
  var phone = document.getElementById('pharmacyPhone').value.trim();
  var address = document.getElementById('pharmacyAddress').value.trim();
  var license = document.getElementById('licenseNumber').value.trim();
  var password = document.getElementById('pharmacyPassword') ? document.getElementById('pharmacyPassword').value.trim() : '';
  
  if (!name || !owner || !phone || !address || !license) {
    showError('املأ كل الحقول المطلوبة');
    return;
  }
  
  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح');
    return;
  }
  
  var user = {
    type: 'pharmacy',
    name: name,
    owner: owner,
    phone: phone,
    address: address,
    license: license,
    password: password,
    date: new Date().toISOString()
  };
  
  saveRegistration(user);
  localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
  
  showSuccessMessage('تم استلام طلبك! ✅', 'سنتواصل معك خلال 24 ساعة');
}

function submitDelivery(event) {
  if (event) event.preventDefault();
  
  var name = document.getElementById('deliveryName').value.trim();
  var phone = document.getElementById('deliveryPhone').value.trim();
  var area = document.getElementById('deliveryArea').value.trim();
  var vehicle = document.getElementById('vehicleType').value;
  var password = document.getElementById('deliveryPassword') ? document.getElementById('deliveryPassword').value.trim() : '';
  
  if (!name || !phone || !area || !vehicle) {
    showError('املأ كل الحقول المطلوبة');
    return;
  }
  
  if (!validatePhone(phone)) {
    showError('رقم الهاتف غير صحيح');
    return;
  }
  
  var user = {
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
  
  showSuccessMessage('مرحباً بك في فريقنا! 🛵', 'سنتواصل معك قريباً');
}

// ============================================
// حفظ التسجيلات
// ============================================
function saveRegistration(data) {
  data.date = new Date().toISOString();
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  registrations.push(data);
  localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
}

// ============================================
// التحقق من رقم الهاتف
// ============================================
function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// ============================================
// رسائل النجاح والخطأ
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
  setTimeout(function() {
    var currentUser = localStorage.getItem('saydaliyati_current_user');
    if (currentUser) {
      var user = JSON.parse(currentUser);
      if (user.type === 'pharmacy') goToPharmacyDashboard(user);
      else if (user.type === 'delivery') goToDeliveryDashboard(user);
      else goToPatientHome(user);
    } else {
      goToSplash();
    }
  }, 300);
}

function showError(message) {
  alert('⚠️ ' + message);
}

// ============================================
// Toast
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
// إدارة العروض
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
  var type = document.getElementById('offerType').value;
  
  if (!title || !description) {
    alert('⚠️ املأ العنوان والتفاصيل');
    return;
  }
  
  var currentUser = JSON.parse(localStorage.getItem('saydaliyati_current_user') || '{}');
  var pharmacyName = currentUser.name || 'صيدلية';
  
  var offer = {
    id: 'OFFER_' + Date.now(),
    title: title,
    description: description,
    expiry: expiry,
    type: type,
    pharmacy: pharmacyName,
    pharmacyPhone: currentUser.phone || '',
    date: new Date().toISOString(),
    active: true
  };
  
  var offers = JSON.parse(localStorage.getItem('saydaliyati_offers') || '[]');
  offers.unshift(offer);
  localStorage.setItem('saydaliyati_offers', JSON.stringify(offers));
  
  closeAddOfferModal();
  
  document.getElementById('offerTitle').value = '';
  document.getElementById('offerDescription').value = '';
  document.getElementById('offerExpiry').value = '';
  
  showToast('✅ تم نشر العرض بنجاح');
  if (document.getElementById('offersList')) loadOffers();
}

function loadOffers() {
  var offersList = document.getElementById('offersList');
  if (!offersList) return;
  
  var offers = JSON.parse(localStorage.getItem('saydaliyati_offers') || '[]');
  
  if (offers.length === 0) {
    offersList.innerHTML = '<div class="offer-empty">لا توجد عروض حالياً</div>';
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
// عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ صيدليتي جاهز!');
  
  loadTheme();
  
  var currentUser = localStorage.getItem('saydaliyati_current_user');
  if (currentUser) {
    var user = JSON.parse(currentUser);
    if (user.type === 'pharmacy') goToPharmacyDashboard(user);
    else if (user.type === 'delivery') goToDeliveryDashboard(user);
    else goToPatientHome(user);
  } else {
    showScreen('splashScreen');
  }
});

document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});
