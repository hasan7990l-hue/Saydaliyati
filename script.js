// ============================================
// صيدليتي - Premium Gold
// ============================================

console.log('✨ صيدليتي - بدأ التحميل');

// ============================================
// إدارة الشاشات
// ============================================
function showScreen(screenId) {
  // خفي كل الشاشات
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });
  
  // أظهر الشاشة المطلوبة
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

function goToRoleSelection() {
  showScreen('roleScreen');
}

// ============================================
// اختيار الدور
// ============================================
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
// إرسال نماذج التسجيل
// ============================================
function submitPharmacy(event) {
  event.preventDefault();
  
  var data = {
    type: 'pharmacy',
    name: document.getElementById('pharmacyName').value,
    owner: document.getElementById('ownerName').value,
    phone: document.getElementById('pharmacyPhone').value,
    address: document.getElementById('pharmacyAddress').value,
    license: document.getElementById('licenseNumber').value,
    date: new Date().toISOString()
  };
  
  console.log('📝 تسجيل صيدلية:', data);
  
  // حفظ في localStorage (مؤقتاً)
  var registrations = JSON.parse(localStorage.getItem('shughli_registrations') || '[]');
  registrations.push(data);
  localStorage.setItem('shughli_registrations', JSON.stringify(registrations));
  
  showSuccessMessage('تم استلام طلب صيدليتك! ✅', 'سنتواصل معك خلال 24 ساعة');
}

function submitPatient(event) {
  event.preventDefault();
  
  var data = {
    type: 'patient',
    name: document.getElementById('patientName').value,
    phone: document.getElementById('patientPhone').value,
    address: document.getElementById('patientAddress').value,
    date: new Date().toISOString()
  };
  
  console.log('📝 تسجيل مريض:', data);
  
  var registrations = JSON.parse(localStorage.getItem('shughli_registrations') || '[]');
  registrations.push(data);
  localStorage.setItem('shughli_registrations', JSON.stringify(registrations));
  
  showSuccessMessage('أهلاً بك في صيدليتي! 🎉', 'تم إنشاء حسابك بنجاح');
}

function submitDelivery(event) {
  event.preventDefault();
  
  var data = {
    type: 'delivery',
    name: document.getElementById('deliveryName').value,
    phone: document.getElementById('deliveryPhone').value,
    area: document.getElementById('deliveryArea').value,
    vehicle: document.getElementById('vehicleType').value,
    date: new Date().toISOString()
  };
  
  console.log('📝 تسجيل دليفري:', data);
  
  var registrations = JSON.parse(localStorage.getItem('shughli_registrations') || '[]');
  registrations.push(data);
  localStorage.setItem('shughli_registrations', JSON.stringify(registrations));
  
  showSuccessMessage('مرحباً بك في فريقنا! 🛵', 'سنتواصل معك قريباً');
}

// ============================================
// رسالة النجاح
// ============================================
function showSuccessMessage(title, message) {
  var overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  overlay.innerHTML = 
    '<div class="success-box">' +
      '<div class="success-icon">✅</div>' +
      '<h2>' + title + '</h2>' +
      '<p>' + message + '</p>' +
      '<button class="btn-gold" onclick="closeSuccess()">حسناً</button>' +
    '</div>';
  document.body.appendChild(overlay);
  
  setTimeout(function() {
    overlay.classList.add('show');
  }, 100);
}

function closeSuccess() {
  var overlay = document.querySelector('.success-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function() {
      overlay.remove();
      goToSplash();
    }, 300);
  }
}

// ============================================
// التحقق من صحة رقم الهاتف
// ============================================
function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// ============================================
// عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ صيدليتي جاهز!');
  
  // عرض شاشة البداية
  showScreen('splashScreen');
  
  // تسجيل حدث فتح التطبيق
  if ('serviceWorker' in navigator) {
    console.log('📱 PWA مدعوم');
  }
});

// ============================================
// منع التكبير على الموبايل
// ============================================
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});
// ربط الأزرار يدوياً (لضمان العمل)
window.addEventListener('load', function() {
  // زر المريض
  var patientBtn = document.querySelector('#patientScreen .btn-gold');
  if (patientBtn) {
    patientBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🖱️ زر المريض اشتغل');
      
      var name = document.getElementById('patientName').value;
      var phone = document.getElementById('patientPhone').value;
      var address = document.getElementById('patientAddress').value;
      
      if (!name || !phone || !address) {
        alert('املأ كل الحقول');
        return;
      }
      
      console.log('📝 بيانات المريض:', name, phone, address);
      
      // حفظ في localStorage
      var registrations = JSON.parse(localStorage.getItem('shughli_registrations') || '[]');
      registrations.push({
        type: 'patient',
        name: name,
        phone: phone,
        address: address,
        date: new Date().toISOString()
      });
      localStorage.setItem('shughli_registrations', JSON.stringify(registrations));
      
      alert('✅ تم إنشاء حسابك بنجاح!\nأهلاً بك في صيدليتي 🎉');
      goToSplash();
    });
  }
});
