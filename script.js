// ============================================
// صيدليتي - Clean Medical v2
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
// إظهار/إخفاء كلمة المرور
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
// فحص قوة كلمة المرور
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
  
  strengthEl.className = 'password-strength';
  
  if (password.length === 0) {
    strengthEl.textContent = '';
  } else if (score <= 2) {
    strengthEl.textContent = '🔴 ضعيفة - استخدم 6 أحرف على الأقل';
    strengthEl.classList.add('weak');
  } else if (score <= 4) {
    strengthEl.textContent = '🟡 متوسطة';
    strengthEl.classList.add('medium');
  } else {
    strengthEl.textContent = '🟢 قوية';
    strengthEl.classList.add('strong');
  }
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
    goToDashboardByType();
  } else if (tab === 'orders') {
    openOrders();
  } else if (tab === 'notifications') {
    showToast('🚧 التنبيهات - قريباً');
  } else if (tab === 'myaccount') {
    if (userType === 'delivery') {
      openWallet();
    } else {
      openProfile();
    }
  } else if (tab === 'more') {
    openSidebar();
  }
}

// ============================================
// فتح الصفحات
// ============================================
function openProfile() {
  closeSidebar();
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  
  var avatarEmoji = '👤';
  var typeLabel = 'مريض';
  
  if (user.type === 'pharmacy') {
    avatarEmoji = '🏥';
    typeLabel = 'صيدلية';
  } else if (user.type === 'delivery') {
    avatarEmoji = '🛵';
    typeLabel = 'دليفري';
  }
  
  document.getElementById('profileAvatar').textContent = avatarEmoji;
  document.getElementById('profileName').textContent = user.name || 'مستخدم';
  document.getElementById('profileType').textContent = typeLabel;
  document.getElementById('infoName').textContent = user.name || '-';
  document.getElementById('infoPhone').textContent = user.phone || '-';
  document.getElementById('infoEmail').textContent = user.email || 'غير مضاف';
  
  var addressItem = document.getElementById('addressItem');
  var vehicleItem = document.getElementById('vehicleItem');
  var licenseItem = document.getElementById('licenseItem');
  var addressLabel = document.getElementById('addressLabel');
  var emailItem = document.getElementById('emailItem');
  
  addressItem.style.display = 'none';
  vehicleItem.style.display = 'none';
  licenseItem.style.display = 'none';
  emailItem.style.display = 'flex';
  
  if (user.type === 'patient') {
    addressLabel.textContent = 'العنوان';
    document.getElementById('infoAddress').textContent = user.address || '-';
    addressItem.style.display = 'flex';
  } else if (user.type === 'pharmacy') {
    addressLabel.textContent = 'العنوان';
    document.getElementById('infoAddress').textContent = user.address || '-';
    document.getElementById('infoLicense').textContent = user.license || '-';
    addressItem.style.display = 'flex';
    licenseItem.style.display = 'flex';
  } else if (user.type === 'delivery') {
    addressLabel.textContent = 'المنطقة';
    document.getElementById('infoAddress').textContent = user.area || '-';
    document.getElementById('infoVehicle').textContent = user.vehicle || '-';
    addressItem.style.display = 'flex';
    vehicleItem.style.display = 'flex';
  }
  
  if (user.date) {
    var date = new Date(user.date);
    document.getElementById('infoDate').textContent = date.toLocaleDateString('ar-IQ');
  } else {
    document.getElementById('infoDate').textContent = '-';
  }
  
  showScreen('profileScreen');
}

function openWallet() {
  closeSidebar();
  showScreen('walletScreen');
}

function openOrders() {
  closeSidebar();
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';
  
  var titleEl = document.getElementById('ordersTitle');
  var subtitleEl = document.getElementById('ordersSubtitle');
  
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
  
  showScreen('ordersScreen');
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

function closeAllScreens() {
  goToDashboardByType();
}

function editField(field) {
  showToast('🚧 قريباً');
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

// ============================================
// التنقل
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
// التوجيه حسب نوع المستخدم
// ============================================
function goToDashboardByType() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  
  if (user.type === 'pharmacy') {
    showScreen('pharmacyDashboard');
  } else if (user.type === 'delivery') {
    showScreen('deliveryDashboard');
  } else {
    showScreen('homeScreen');
    setTimeout(loadOffers, 100);
  }
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
    
    if (user.type === 'pharmacy') showScreen('pharmacyDashboard');
    else if (user.type === 'delivery') showScreen('deliveryDashboard');
    else {
      showScreen('homeScreen');
      setTimeout(loadOffers, 100);
    }
    
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
  
  showSuccessMessage('تم إنشاء حسابك! 🎉', 'أهلاً بك في صيدليتي، ' + name);
}

function submitPharmacy(event) {
  if (event) event.preventDefault();
  
  var name = document.getElementById('pharmacyName').value.trim();
  var owner = document.getElementById('ownerName').value.trim();
  var phone = document.getElementById('pharmacyPhone').value.trim();
  var email = document.getElementById('pharmacyEmail').value.trim();
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
    email: email,
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
  setTimeout(goToDashboardByType, 300);
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
  
  if (!title || !description) {
    alert('⚠️ املأ العنوان والتفاصيل');
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
  
  showToast('✅ تم نشر العرض بنجاح');
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
// عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ صيدليتي جاهز!');
  
  loadTheme();
  
  var currentUser = localStorage.getItem('saydaliyati_current_user');
  if (currentUser) {
    goToDashboardByType();
  } else {
    showScreen('splashScreen');
  }
});

// منع التكبير على الجوال
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});
