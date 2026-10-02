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
}

// ============================================
// إدارة الشاشات
// ============================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });
  
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
    console.log('📱 شاشة:', screenId);
  }
}

// ============================================
// التنقل
// ============================================
function goToSplash() {
  showScreen('splashScreen');
}

function goToLogin() {
  showScreen('loginScreen');
}

function goToRoleSelection() {
  showScreen('roleScreen');
}

function goToOrdersPage() {
  showScreen('ordersScreen');
}

function selectRole(role) {
  console.log('👤 دور:', role);
  
  if (role === 'patient') {
    showScreen('patientScreen');
  } else if (role === 'pharmacy') {
    showScreen('pharmacyScreen');
  } else if (role === 'delivery') {
    showScreen('deliveryScreen');
  }
}

// ============================================
// التوجيه حسب نوع المستخدم
// ============================================
function goToPatientHome(user) {
  var greetEl = document.getElementById('userGreeting');
  if (greetEl) greetEl.textContent = user.name || 'أحمد';
  showScreen('homeScreen');
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
  
  console.log('🔐 محاولة تسجيل دخول:', phone);
  
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  var user = registrations.find(function(r) {
    return r.phone === phone;
  });
  
  if (user) {
    if (user.password && user.password !== password) {
      showError('كلمة المرور غير صحيحة');
      return;
    }
    
    localStorage.setItem('saydaliyati_current_user', JSON.stringify(user));
    
    if (user.type === 'pharmacy') {
      console.log('🏥 دخول صيدلية');
      goToPharmacyDashboard(user);
    } else if (user.type === 'delivery') {
      console.log('🛵 دخول دليفري');
      goToDeliveryDashboard(user);
    } else {
      console.log('👤 دخول مريض');
      goToPatientHome(user);
    }
    
    return;
  }
  
  showError('رقم الهاتف غير مسجل. سجل حساب جديد أولاً.');
}

// ============================================
// تسجيل الخروج
// ============================================
function logout() {
  localStorage.removeItem('saydaliyati_current_user');
  goToSplash();
  console.log('🚪 تسجيل خروج');
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
  
  showSuccessMessage(
    'تم إنشاء حسابك! 🎉',
    'أهلاً بك في صيدليتي، ' + name,
    'homeScreen'
  );
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
  
  showSuccessMessage(
    'تم استلام طلبك! ✅',
    'سنتواصل معك خلال 24 ساعة',
    'pharmacyDashboard'
  );
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
  
  showSuccessMessage(
    'مرحباً بك في فريقنا! 🛵',
    'سنتواصل معك قريباً',
    'deliveryDashboard'
  );
}

// ============================================
// حفظ التسجيلات
// ============================================
function saveRegistration(data) {
  data.date = new Date().toISOString();
  
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  registrations.push(data);
  localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
  
  console.log('💾 تم الحفظ:', data);
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
function showSuccessMessage(title, message, nextScreen) {
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
  
  setTimeout(function() {
    overlay.classList.add('show');
  }, 50);
}

function closeSuccess() {
  var overlay = document.querySelector('.success-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function() {
      overlay.remove();
    }, 300);
  }
}

function closeSuccessAndGo() {
  closeSuccess();
  setTimeout(function() {
    var currentUser = localStorage.getItem('saydaliyati_current_user');
    if (currentUser) {
      var user = JSON.parse(currentUser);
      if (user.type === 'pharmacy') {
        goToPharmacyDashboard(user);
      } else if (user.type === 'delivery') {
        goToDeliveryDashboard(user);
      } else {
        goToPatientHome(user);
      }
    } else {
      goToSplash();
    }
  }, 300);
}

function showError(message) {
  alert('⚠️ ' + message);
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
    if (user.type === 'pharmacy') {
      goToPharmacyDashboard(user);
    } else if (user.type === 'delivery') {
      goToDeliveryDashboard(user);
    } else {
      goToPatientHome(user);
    }
  } else {
    showScreen('splashScreen');
  }
});

// ============================================
// منع التكبير على الجوال
// ============================================
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});
