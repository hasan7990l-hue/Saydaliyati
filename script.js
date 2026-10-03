// ============================================
// صيدليتي - Clean Medical v7
// الجزء 1 من 2
// ============================================

console.log('صيدليتي - بدأ التحميل');

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
// الأصوات (Web Audio API - بدون ملفات)
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

// صوت البحث (بيييب)
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
  } catch(e) {
    console.log('صوت البحث غير متاح');
  }
}

// صوت الرصد (ديييينج)
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
    
    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1600;
    osc2.type = 'triangle';
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1);
  } catch(e) {
    console.log('صوت الرصد غير متاح');
  }
}

// صوت النجاح
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
  } catch(e) {
    console.log('صوت النجاح غير متاح');
  }
}

// صوت تفعيل الرادار
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
  } catch(e) {
    console.log('صوت الرادار غير متاح');
  }
}

// ============================================
// الرادار (للمندوب) - يستمر بعد القبول
// ============================================
var radarActive = false;
var radarInterval = null;
var orderSimulationInterval = null;

function toggleRadar() {
  var btn = document.getElementById('radarBtn');
  var btnText = document.getElementById('radarBtnText');
  
  if (!radarActive) {
    radarActive = true;
    if (btn) btn.classList.add('active');
    if (btnText) btnText.textContent = 'إيقاف الرادار';
    
    playRadarActivateSound();
    showToast('الرادار يعمل - جاري البحث...');
    
    if (radarInterval) clearInterval(radarInterval);
    radarInterval = setInterval(function() {
      playSonarPing();
    }, 2000);
    
    setTimeout(function() {
      if (radarActive) {
        playAlertDing();
        openOrderSheet();
      }
    }, 5000);
    
    startOrderSimulation();
    
  } else {
    radarActive = false;
    if (btn) btn.classList.remove('active');
    if (btnText) btnText.textContent = 'تفعيل الرادار';
    
    if (radarInterval) {
      clearInterval(radarInterval);
      radarInterval = null;
    }
    
    if (orderSimulationInterval) {
      clearInterval(orderSimulationInterval);
      orderSimulationInterval = null;
    }
    
    showToast('تم إيقاف الرادار');
  }
}

function startOrderSimulation() {
  if (orderSimulationInterval) clearInterval(orderSimulationInterval);
  
  orderSimulationInterval = setInterval(function() {
    if (radarActive) {
      var sheet = document.getElementById('orderSheet');
      if (sheet && !sheet.classList.contains('active')) {
        playAlertDing();
        openOrderSheet();
      }
    }
  }, 15000);
}

// ============================================
// Bottom Sheet (طلب جديد)
// ============================================
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
  
  if (orderTimerInterval) {
    clearInterval(orderTimerInterval);
    orderTimerInterval = null;
  }
  
  console.log('الرادار:', radarActive ? 'يعمل' : 'متوقف');
}

var orderTimerInterval = null;
var orderTimerSeconds = 10;

function startOrderTimer() {
  orderTimerSeconds = 10;
  var progressEl = document.getElementById('timerProgress');
  
  if (progressEl) progressEl.style.width = '100%';
  
  if (orderTimerInterval) clearInterval(orderTimerInterval);
  
  orderTimerInterval = setInterval(function() {
    orderTimerSeconds--;
    
    if (progressEl) {
      progressEl.style.width = (orderTimerSeconds * 10) + '%';
    }
    
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
  showToast('تم قبول الطلب - الرادار يعمل');
  
  setTimeout(function() {
    if (radarActive && !radarInterval) {
      radarInterval = setInterval(function() {
        playSonarPing();
      }, 2000);
    }
  }, 1000);
  
  setTimeout(function() {
    goToMyOrders();
  }, 500);
}

// ============================================
// قبول طلب من القائمة
// ============================================
function acceptOrder(orderId) {
  playAlertDing();
  showToast('تم قبول الطلب #' + orderId);
  
  setTimeout(function() {
    goToMyOrders();
  }, 500);
}

function startOrder(orderId) {
  playSuccessSound();
  showToast('بدء توصيل الطلب #' + orderId);
}

// ============================================
// إدارة الشاشات
// ============================================
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
    updateBottomNav(screenId);
  } else {
    console.warn('الشاشة غير موجودة:', screenId);
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

// ============================================
// تبديل التبويب
// ============================================
function switchTab(tab) {
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
  } else if (tab === 'myorders') {
    goToMyOrders();
  } else if (tab === 'notifications') {
    openNotifications();
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
// طلباتي — صفحة ديناميكية حسب نوع المستخدم
// ============================================
function goToMyOrders() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  var userType = user.type || 'patient';
  
  // إخفاء كل الأقسام أولاً
  var deliveryContent = document.getElementById('deliveryOrdersContent');
  var patientContent = document.getElementById('patientOrdersContent');
  var pharmacyContent = document.getElementById('pharmacyOrdersContent');
  
  if (deliveryContent) deliveryContent.style.display = 'none';
  if (patientContent) patientContent.style.display = 'none';
  if (pharmacyContent) pharmacyContent.style.display = 'none';
  
  var titleEl = document.getElementById('myOrdersTitle');
  var subtitleEl = document.getElementById('myOrdersSubtitle');
  
  if (userType === 'delivery') {
    // 🚴 المندوب: الرادار + AI + الأولويات
    if (titleEl) titleEl.textContent = 'طلباتي الذكية';
    if (subtitleEl) subtitleEl.textContent = 'ترتيب تلقائي حسب الأولوية';
    if (deliveryContent) deliveryContent.style.display = 'block';
    
  } else if (userType === 'pharmacy') {
    // 🏪 الصيدلية: الطلبات الواردة
    if (titleEl) titleEl.textContent = 'الطلبات الواردة';
    if (subtitleEl) subtitleEl.textContent = 'إدارة طلبات المرضى';
    if (pharmacyContent) pharmacyContent.style.display = 'block';
    
  } else {
    // 🧑 المريض: طلباته الخاصة
    if (titleEl) titleEl.textContent = 'طلباتي';
    if (subtitleEl) subtitleEl.textContent = 'تتبع طلباتك الحالية والسابقة';
    if (patientContent) patientContent.style.display = 'block';
  }
  
  showScreen('myOrdersScreen');
  
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  var myBtn = document.querySelector('.nav-btn[data-tab="myorders"]');
  if (myBtn) myBtn.classList.add('active');
}

// ============================================
// الصيدلية: قبول / رفض الطلب
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

// ============================================
// الصيدلية: تبديل الفلاتر
// ============================================
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
// فتح الصفحات
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
  
  if (user.avatar) {
    avatarEl.textContent = '';
    avatarEl.style.backgroundImage = 'url(' + user.avatar + ')';
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
  } else {
    avatarEl.textContent = avatarText;
    avatarEl.style.backgroundImage = '';
  }
  
  document.getElementById('profileName').textContent = user.name || 'مستخدم';
  document.getElementById('profileType').textContent = typeLabel;
  document.getElementById('infoName').textContent = user.name || '-';
  document.getElementById('infoPhone').textContent = user.phone || '-';
  document.getElementById('infoEmail').textContent = user.email || 'غير مضاف';
  
  var addressRow = document.getElementById('addressRow');
  var vehicleRow = document.getElementById('vehicleRow');
  var licenseRow = document.getElementById('licenseRow');
  var emailRow = document.getElementById('emailRow');
  var addressLabel = document.getElementById('addressLabel');
  
  addressRow.style.display = 'none';
  vehicleRow.style.display = 'none';
  licenseRow.style.display = 'none';
  emailRow.style.display = 'flex';
  
  if (user.type === 'patient') {
    addressLabel.textContent = 'العنوان';
    document.getElementById('infoAddress').textContent = user.address || '-';
    addressRow.style.display = 'flex';
  } else if (user.type === 'pharmacy') {
    addressLabel.textContent = 'العنوان';
    document.getElementById('infoAddress').textContent = user.address || '-';
    document.getElementById('infoLicense').textContent = user.license || '-';
    addressRow.style.display = 'flex';
    licenseRow.style.display = 'flex';
  } else if (user.type === 'delivery') {
    addressLabel.textContent = 'المنطقة';
    document.getElementById('infoAddress').textContent = user.area || '-';
    document.getElementById('infoVehicle').textContent = user.vehicle || '-';
    addressRow.style.display = 'flex';
    vehicleRow.style.display = 'flex';
  }
  
  if (user.date) {
    var date = new Date(user.date);
    document.getElementById('infoDate').textContent = date.toLocaleDateString('ar-IQ');
  } else {
    document.getElementById('infoDate').textContent = '-';
  }
  
  showScreen('profileScreen');
}

// ============================================
// تعديل صورة الملف الشخصي
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
    avatarEl.textContent = '';
    avatarEl.style.backgroundImage = 'url(' + imageData + ')';
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    
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
    
    showToast('تم تحديث الصورة');
  };
  reader.readAsDataURL(file);
}

// ============================================
// نافذة تعديل البيانات
// ============================================
function openEditProfile() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = userStr ? JSON.parse(userStr) : {};
  
  document.getElementById('editName').value = user.name || '';
  document.getElementById('editEmail').value = user.email || '';
  
  var editAddressLabel = document.getElementById('editAddressLabel');
  var editAddress = document.getElementById('editAddress');
  
  if (user.type === 'delivery') {
    editAddressLabel.textContent = 'المنطقة';
    editAddress.value = user.area || '';
  } else {
    editAddressLabel.textContent = 'العنوان';
    editAddress.value = user.address || '';
  }
  
  document.getElementById('editProfileModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditProfile() {
  document.getElementById('editProfileModal').classList.remove('active');
  document.body.style.overflow = '';
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
  
  var registrations = JSON.parse(localStorage.getItem('saydaliyati_registrations') || '[]');
  for (var i = 0; i < registrations.length; i++) {
    if (registrations[i].phone === user.phone) {
      registrations[i] = user;
      break;
    }
  }
  localStorage.setItem('saydaliyati_registrations', JSON.stringify(registrations));
  
  closeEditProfile();
  openProfile();
  showToast('تم حفظ التعديلات');
}

// ============================================
// فتح الصفحات الأخرى
// ============================================
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

function openNotifications() {
  closeSidebar();
  showScreen('notificationsScreen');
}

function openSettings() {
  closeSidebar();
  showScreen('settingsScreen');
}

function openAbout() {
  closeSidebar();
  showScreen('aboutScreen');
}

// ✅ إصلاح: ربط تفاصيل التطبيق بصفحة موجودة
function openAppDetails() {
  closeSidebar();
  showScreen('aboutUsScreen');
}

function openContact() {
  closeSidebar();
  showScreen('contactScreen');
}

function openAboutUs() {
  showScreen('aboutUsScreen');
}

function openVision() {
  showScreen('visionScreen');
}

function openValues() {
  showScreen('valuesScreen');
}

function closeAllScreens() {
  goToDashboardByType();
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
  
  // ✅ إظهار/إخفاء زر المحفظة في القائمة الجانبية
  var walletItem = document.getElementById('walletMenuItem');
  if (walletItem) {
    walletItem.style.display = (user.type === 'delivery') ? 'flex' : 'none';
  }
  
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
// صيدليتي - Clean Medical v7
// الجزء 2 من 2
// ============================================

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
    playSuccessSound();
    showToast('أهلاً بك ' + (user.name || ''));
    
    setTimeout(function() {
      if (user.type === 'pharmacy') showScreen('pharmacyDashboard');
      else if (user.type === 'delivery') showScreen('deliveryDashboard');
      else {
        showScreen('homeScreen');
        setTimeout(loadOffers, 100);
      }
    }, 500);
    
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
    
    // إيقاف الرادار
    if (radarActive) {
      radarActive = false;
      if (radarInterval) clearInterval(radarInterval);
      if (orderSimulationInterval) clearInterval(orderSimulationInterval);
    }
    
    closeSidebar();
    goToSplash();
    showToast('تم تسجيل الخروج');
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
  saveUserToFirebase(user);
  playSuccessSound();
  showSuccessMessage('تم إنشاء حسابك', 'أهلاً بك في صيدليتي، ' + name);
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
  saveUserToFirebase(user);
  playSuccessSound();
  showSuccessMessage('تم استلام طلبك', 'سنتواصل معك خلال 24 ساعة');
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
  saveUserToFirebase(user);
  playSuccessSound();
  showSuccessMessage('مرحباً بك في فريقنا', 'سنتواصل معك قريباً');
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
// Firebase
// ============================================
function saveUserToFirebase(user) {
  if (window.firebaseDB && window.firebaseDoc && window.firebaseSetDoc) {
    try {
      var userRef = window.firebaseDoc(window.firebaseDB, 'users', user.phone);
      var userData = {
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        type: user.type,
        address: user.address || user.area || '',
        license: user.license || '',
        vehicle: user.vehicle || '',
        createdAt: new Date().toISOString()
      };
      
      window.firebaseSetDoc(userRef, userData, { merge: true })
        .then(function() {
          console.log('تم حفظ المستخدم في Firebase');
        })
        .catch(function(err) {
          console.log('خطأ Firebase:', err);
        });
    } catch(e) {
      console.log('Firebase غير متاح');
    }
  }
}

// ============================================
// التحقق من رقم الهاتف
// ============================================
function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
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
  alert('تنبيه: ' + message);
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
// اهتزاز الجهاز
// ============================================
function vibrateDevice(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ============================================
// إدارة العروض (للصيدلية)
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
// عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('صيدليتي جاهز');
  
  loadTheme();
  
  // تهيئة الصوت (بعد أول تفاعل)
  document.body.addEventListener('click', function() {
    initAudio();
  }, { once: true });
  
  // تحقق من المستخدم الحالي
  var currentUser = localStorage.getItem('saydaliyati_current_user');
  if (currentUser) {
    goToDashboardByType();
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

// ============================================
// طلب إذن الإشعارات (اختياري)
// ============================================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        console.log('تم تفعيل الإشعارات');
      }
    });
  }
}

// ============================================
// نهاية الملف
// ============================================
console.log('صيدليتي - اكتمل التحميل');

// ============================================
// 🔔 نظام الإشعارات الحقيقي
// ============================================

// 1. طلب إذن الإشعارات
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('المتصفح لا يدعم الإشعارات');
    return Promise.resolve('unsupported');
  }
  
  return Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      console.log('✅ الإشعارات مفعّلة');
      showToast('الإشعارات مفعّلة ✅');
      startRadarSystem();
    } else {
      console.log('❌ الإشعارات مرفوضة');
      showToast('يجب تفعيل الإشعارات لاستقبال الطلبات');
    }
    return permission;
  });
}

// 2. إرسال إشعار عبر Service Worker
function sendNotification(options) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.log('⚠️ Service Worker غير متاح');
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
      vibrate: options.vibrate || [200, 100, 200, 100, 200],
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

// 3. الإشعارات الداخلية (احتياطي)
function addInternalNotification(type, title, message) {
  var notif = {
    id: 'NOTIF_' + Date.now(),
    type: type,
    title: title,
    message: message,
    icon: getNotifIcon(type),
    read: false,
    date: new Date().toISOString()
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
    'stock': '⚠️', 'offer': '📢', 'wallet': '💰', 'system': '⚙️'
  };
  return icons[type] || '🔔';
}

// 4. اهتزاز
function vibrateDevice(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// 5. شارة الإشعارات
function updateNotifBadge() {
  var navBtn = document.querySelector('.nav-btn[data-tab="notifications"]');
  if (!navBtn) return;
  
  var oldBadge = navBtn.querySelector('.notif-badge');
  if (oldBadge) oldBadge.remove();
  
  var notifs = JSON.parse(localStorage.getItem('saydaliyati_notifications') || '[]');
  var unreadCount = notifs.filter(function(n) { return !n.read; }).length;
  
  if (unreadCount > 0) {
    var badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    navBtn.appendChild(badge);
  }
}

// 6. نظام الرادار
var radarSystemActive = false;
var radarCheckInterval = null;

function startRadarSystem() {
  if (radarSystemActive) return;
  radarSystemActive = true;
  console.log('🚀 نظام الرادار يعمل...');
  
  if (radarCheckInterval) clearInterval(radarCheckInterval);
  radarCheckInterval = setInterval(function() {
    checkForNewOrders();
  }, 10000);
  
  checkForNewOrders();
}

function stopRadarSystem() {
  radarSystemActive = false;
  if (radarCheckInterval) {
    clearInterval(radarCheckInterval);
    radarCheckInterval = null;
  }
  console.log('🛑 نظام الرادار متوقف');
}

// 7. فحص الطلبات
function checkForNewOrders() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  
  var user = JSON.parse(userStr);
  
  if (user.type === 'delivery' && radarActive) {
    simulateDeliveryOrder(user);
  }
  if (user.type === 'pharmacy') {
    simulatePharmacyOrder(user);
  }
}

function simulateDeliveryOrder(user) {
  var now = Date.now();
  if (!window.lastDeliveryNotifTime || (now - window.lastDeliveryNotifTime) > 30000) {
    window.lastDeliveryNotifTime = now;
    
    var orderId = Math.floor(1000 + Math.random() * 9000);
    var pharmacy = ['صيدلية النور', 'صيدلية الحياة', 'صيدلية الشفاء'][Math.floor(Math.random() * 3)];
    var commission = [3000, 4000, 5000][Math.floor(Math.random() * 3)];
    var distance = (2 + Math.random() * 3).toFixed(1);
    
    sendNotification({
      title: '📦 طلب توصيل جديد #' + orderId,
      body: pharmacy + ' • ' + distance + ' كم • ' + commission + ' دينار',
      type: 'order',
      orderId: orderId,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'accept', title: '✅ قبول' },
        { action: 'reject', title: '❌ رفض' }
      ]
    });
  }
}

function simulatePharmacyOrder(user) {
  var now = Date.now();
  if (!window.lastPharmacyNotifTime || (now - window.lastPharmacyNotifTime) > 45000) {
    window.lastPharmacyNotifTime = now;
    
    var orderId = Math.floor(1000 + Math.random() * 9000);
    var patientName = ['أحمد علي', 'سارة محمد', 'علي حسن', 'فاطمة أحمد'][Math.floor(Math.random() * 4)];
    var total = [15000, 23000, 18000, 12000][Math.floor(Math.random() * 4)];
    
    sendNotification({
      title: '💊 طلب دواء جديد #' + orderId,
      body: patientName + ' • ' + total.toLocaleString() + ' دينار',
      type: 'order',
      orderId: orderId,
      vibrate: [300, 100, 300],
      requireInteraction: true,
      actions: [
        { action: 'accept', title: '✅ قبول' },
        { action: 'reject', title: '❌ رفض' }
      ]
    });
  }
}

// 8. عند الضغط على الإشعار
function handleNotificationClick(data) {
  console.log('🖱️ تم الضغط على الإشعار:', data);
  
  var action = data.action;
  var orderId = data.orderId;
  
  vibrateDevice([100]);
  
  if (action === 'reject') {
    showToast('تم رفض الطلب #' + orderId);
    return;
  }
  
  if (action === 'accept' || action === 'open') {
    acceptOrderFromNotification(orderId);
    
    setTimeout(function() {
      goToMyOrders();
      setTimeout(function() {
        scrollToOrderAndHighlight(orderId);
      }, 300);
    }, 100);
  }
}

// 9. قبول الطلب من الإشعار
function acceptOrderFromNotification(orderId) {
  showToast('✅ تم قبول الطلب #' + orderId);
  
  var acceptedOrders = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
  acceptedOrders.unshift({
    id: orderId,
    acceptedAt: new Date().toISOString()
  });
  localStorage.setItem('saydaliyati_accepted_orders', JSON.stringify(acceptedOrders));
  
  addInternalNotification('accepted', '✅ تم قبول الطلب #' + orderId, 'جاري التوصيل');
  updateNotifBadge();
}

// 10. تمرير وتمييز الطلب
function scrollToOrderAndHighlight(orderId) {
  var cards = document.querySelectorAll('.priority-card, .order-card');
  cards.forEach(function(card) {
    var text = card.textContent || '';
    if (text.indexOf('#' + orderId) !== -1 || text.indexOf(String(orderId)) !== -1) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(function() {
        card.classList.remove('highlighted');
      }, 3000);
    }
  });
}

// 11. فحص URL
function checkUrlForOrder() {
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  var action = params.get('action');
  
  if (orderId) {
    console.log('🎯 orderId من URL:', orderId, '| action:', action);
    
    if (action === 'accept') {
      acceptOrderFromNotification(orderId);
    }
    
    setTimeout(function() {
      goToMyOrders();
      setTimeout(function() {
        scrollToOrderAndHighlight(orderId);
      }, 500);
    }, 300);
    
    window.history.replaceState({}, '', '/');
  }
}

// 12. عند التحميل
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkUrlForOrder, 500);
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (userStr && Notification.permission === 'granted') {
    startRadarSystem();
  }
  
  setTimeout(function() {
    if (userStr && Notification.permission === 'default') {
      var user = JSON.parse(userStr);
      if (user.type === 'delivery' || user.type === 'pharmacy') {
        requestNotificationPermission();
      }
    }
  }, 3000);
});

// 13. تكامل مع الرادار
var originalToggleRadar = window.toggleRadar;
window.toggleRadar = function() {
  originalToggleRadar.apply(this, arguments);
  
  if (radarActive) {
    if (Notification.permission !== 'granted') {
      requestNotificationPermission();
    }
    startRadarSystem();
  } else {
    stopRadarSystem();
  }
};

// 14. تكامل مع تسجيل الخروج
var originalLogout = window.logout;
window.logout = function() {
  stopRadarSystem();
  originalLogout.apply(this, arguments);
};

// ============================================
// 📸 نظام طلب الروشتة
// ============================================

var prescriptionImageData = null;

// فتح صفحة الروشتة
function openPrescriptionScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) {
    showToast('سجّل دخول أولاً');
    return;
  }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'patient') {
    showToast('هذه الميزة للمرضى فقط');
    return;
  }
  
  // تعبئة العنوان تلقائياً
  var addressInput = document.getElementById('prescriptionAddress');
  if (addressInput && user.address) {
    addressInput.value = user.address;
  }
  
  // إعادة تعيين
  prescriptionImageData = null;
  resetPrescriptionUpload();
  
  showScreen('prescriptionScreen');
}

function closePrescriptionScreen() {
  showScreen('homeScreen');
}

// فتح منتقي الصور
function openPrescriptionPicker() {
  var input = document.getElementById('prescriptionInput');
  if (input) input.click();
}

// معالجة رفع الصورة
function handlePrescriptionUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  
  // التحقق من الحجم (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('حجم الصورة كبير جداً - الحد الأقصى 5MB');
    return;
  }
  
  // التحقق من النوع
  if (!file.type.startsWith('image/')) {
    showError('يجب أن تكون الصورة بصيغة صورة (JPG, PNG)');
    return;
  }
  
  var reader = new FileReader();
  reader.onload = function(e) {
    prescriptionImageData = e.target.result;
    
    // إظهار المعاينة
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

// إزالة الصورة
function removePrescriptionImage(event) {
  if (event) {
    event.stopPropagation();
  }
  
  prescriptionImageData = null;
  resetPrescriptionUpload();
  
  // تفريغ input
  var input = document.getElementById('prescriptionInput');
  if (input) input.value = '';
}

// إعادة تعيين منطقة الرفع
function resetPrescriptionUpload() {
  var placeholder = document.getElementById('prescriptionPlaceholder');
  var preview = document.getElementById('prescriptionPreview');
  
  if (placeholder) placeholder.style.display = 'block';
  if (preview) preview.style.display = 'none';
}

// إرسال الطلب
function submitPrescription(event) {
  if (event) event.preventDefault();
  
  // التحقق من الصورة
  if (!prescriptionImageData) {
    showError('ارفع صورة الوصفة أولاً');
    return;
  }
  
  var address = document.getElementById('prescriptionAddress').value.trim();
  var notes = document.getElementById('prescriptionNotes').value.trim();
  var pharmacy = document.getElementById('prescriptionPharmacy').value;
  var deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
  
  if (!address) {
    showError('أدخل عنوان التوصيل');
    return;
  }
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);
  
  // إنشاء الطلب
  var orderId = Math.floor(1000 + Math.random() * 9000);
  var order = {
    id: orderId,
    type: 'prescription',
    patientName: user.name,
    patientPhone: user.phone,
    address: address,
    notes: notes,
    preferredPharmacy: pharmacy || 'النظام يختار',
    deliveryType: deliveryType,
    image: prescriptionImageData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // حفظ الطلب
  var orders = JSON.parse(localStorage.getItem('saydaliyati_prescription_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_prescription_orders', JSON.stringify(orders));
  
  // إشعار داخلي
  addInternalNotification(
    'order',
    '📸 تم إرسال روشتتك',
    'صيدلية ' + (pharmacy || 'أقرب صيدلية') + ' ستتواصل معك'
  );
  
  // إشعار حقيقي
  if (typeof sendNotification === 'function') {
    sendNotification({
      title: '📸 تم إرسال روشتتك',
      body: 'طلب #' + orderId + ' - ' + (pharmacy || 'أقرب صيدلية'),
      type: 'order',
      orderId: orderId,
      vibrate: [200, 100, 200]
    });
  }
  
  // رسالة نجاح
  showSuccessMessage(
    '✅ تم إرسال طلبك',
    'صيدلية ' + (pharmacy || 'قريبة منك') + ' ستتواصل معك خلال دقائق'
  );
  
  // إعادة تعيين
  prescriptionImageData = null;
  resetPrescriptionUpload();
  
  // تنظيف الحقول
  setTimeout(function() {
    document.getElementById('prescriptionAddress').value = '';
    document.getElementById('prescriptionNotes').value = '';
    document.getElementById('prescriptionPharmacy').value = '';
  }, 500);
}

// تفعيل خيارات التوصيل
document.addEventListener('DOMContentLoaded', function() {
  var deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
  deliveryRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.querySelectorAll('.delivery-option').forEach(function(opt) {
        opt.classList.remove('active');
      });
      this.closest('.delivery-option').classList.add('active');
    });
  });
});

// ============================================
// 🛒 نظام سلة التسوق
// ============================================

// مخزون وهمي للصيدليات
var PHARMACY_INVENTORY = {
  'صيدلية النور': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3000, icon: '💊', stock: 50, desc: 'مسكن للألم وخافض للحرارة - للبالغين' },
    { id: 'P002', name: 'فيتامين C', category: 'فيتامينات', price: 5000, icon: '🍊', stock: 30, desc: 'مكمل غذائي لتقوية المناعة' },
    { id: 'P003', name: 'أموكسيسيلين', category: 'مضاد حيوي', price: 8000, icon: '💉', stock: 20, desc: 'مضاد حيوي واسع المجال' },
    { id: 'P004', name: 'فولتارين', category: 'مسكنات', price: 4500, icon: '💊', stock: 40, desc: 'مسكن للألم والالتهابات' },
    { id: 'P005', name: 'أوميغا 3', category: 'فيتامينات', price: 12000, icon: '🐟', stock: 15, desc: 'مكمل غذائي لصحة القلب' },
    { id: 'P006', name: 'شراب كحة', category: 'أطفال', price: 4000, icon: '🍯', stock: 25, desc: 'شراب مهدئ للكحة - للأطفال' }
  ],
  'صيدلية الحياة': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3500, icon: '💊', stock: 60, desc: 'مسكن للألم وخافض للحرارة' },
    { id: 'P002', name: 'فيتامين D', category: 'فيتامينات', price: 6000, icon: '☀️', stock: 35, desc: 'مكمل غذائي لتقوية العظام' },
    { id: 'P003', name: 'أوميبرازول', category: 'ضغط', price: 7000, icon: '💊', stock: 22, desc: 'لعلاج حموضة المعدة' },
    { id: 'P004', name: 'حبوب زنك', category: 'فيتامينات', price: 4500, icon: '⚡', stock: 30, desc: 'مكمل لتقوية المناعة' },
    { id: 'P005', name: 'شراب سعال', category: 'أطفال', price: 4500, icon: '🍯', stock: 20, desc: 'شراب للسعال الجاف' }
  ],
  'صيدلية الشفاء': [
    { id: 'P001', name: 'أسبرين', category: 'مسكنات', price: 2500, icon: '💊', stock: 45, desc: 'مسكن ومضاد للالتهاب' },
    { id: 'P002', name: 'ميترونيدازول', category: 'مضاد حيوي', price: 6500, icon: '💉', stock: 18, desc: 'مضاد حيوي للعدوى' },
    { id: 'P003', name: 'حديد + فوليك', category: 'فيتامينات', price: 5500, icon: '🩸', stock: 28, desc: 'لعلاج فقر الدم' },
    { id: 'P004', name: 'مسكن أطفال', category: 'أطفال', price: 3500, icon: '🧸', stock: 32, desc: 'شراب مسكن للأطفال' },
    { id: 'P005', name: 'أملوديبين', category: 'ضغط', price: 8000, icon: '💊', stock: 15, desc: 'لعلاج ضغط الدم المرتفع' }
  ]
};

var cart = [];
var currentModalProduct = null;
var modalQuantity = 1;

// ============================================
// فتح صفحة السلة
// ============================================
function openCartScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) {
    showToast('سجّل دخول أولاً');
    return;
  }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'patient') {
    showToast('هذه الميزة للمرضى فقط');
    return;
  }
  
  // تحميل السلة المحفوظة
  cart = JSON.parse(localStorage.getItem('saydaliyati_cart') || '[]');
  
  // تعبئة العنوان
  var addressInput = document.getElementById('cartAddress');
  if (addressInput && user.address) {
    addressInput.value = user.address;
  }
  
  // إظهار البانر
  document.getElementById('cartInfoBanner').style.display = 'flex';
  document.getElementById('cartProducts').style.display = 'none';
  document.getElementById('cartItemsSection').style.display = 'none';
  document.getElementById('cartEmpty').style.display = 'block';
  document.getElementById('cartSummary').style.display = 'none';
  
  renderCart();
  showScreen('cartScreen');
}

// ============================================
// عند تغيير الصيدلية
// ============================================
function onPharmacyChange() {
  var pharmacy = document.getElementById('cartPharmacySelect').value;
  
  if (!pharmacy) {
    document.getElementById('cartInfoBanner').style.display = 'flex';
    document.getElementById('cartProducts').style.display = 'none';
    return;
  }
  
  // تحقق: لا يمكن تغيير الصيدلية إذا كانت السلة تحتوي منتجات
  if (cart.length > 0 && cart[0].pharmacy !== pharmacy) {
    if (!confirm('السلة تحتوي منتجات من صيدلية أخرى. هل تريد مسحها والبدء من جديد؟')) {
      document.getElementById('cartPharmacySelect').value = cart[0].pharmacy;
      return;
    }
    cart = [];
    saveCart();
  }
  
  document.getElementById('cartInfoBanner').style.display = 'none';
  document.getElementById('cartProducts').style.display = 'block';
  
  renderProducts(pharmacy);
  renderCart();
}

// ============================================
// عرض المنتجات
// ============================================
function renderProducts(pharmacy) {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  var products = PHARMACY_INVENTORY[pharmacy] || [];
  
  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">لا توجد أدوية متوفرة</p>';
    return;
  }
  
  var html = '';
  products.forEach(function(p) {
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

// ============================================
// فتح نافذة المنتج
// ============================================
function openProductModal(productId, pharmacy) {
  var products = PHARMACY_INVENTORY[pharmacy] || [];
  var product = products.find(function(p) { return p.id === productId; });
  
  if (!product) return;
  
  currentModalProduct = { ...product, pharmacy: pharmacy };
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

// ============================================
// إضافة إلى السلة
// ============================================
function addToCartFromModal() {
  if (!currentModalProduct) return;
  
  var existingIndex = cart.findIndex(function(item) {
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
  
  // اهتزاز
  if (navigator.vibrate) navigator.vibrate([50]);
}

// ============================================
// عرض السلة
// ============================================
function renderCart() {
  var itemsEl = document.getElementById('cartItems');
  var emptyEl = document.getElementById('cartEmpty');
  var sectionEl = document.getElementById('cartItemsSection');
  var summaryEl = document.getElementById('cartSummary');
  var subtitleEl = document.getElementById('cartSubtitle');
  var countEl = document.getElementById('cartItemsCount');
  var badgeEl = document.getElementById('cartBadge');
  
  var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
  
  // تحديث الشارة
  if (badgeEl) {
    badgeEl.textContent = totalItems;
    badgeEl.setAttribute('data-count', totalItems);
  }
  
  // تحديث العنوان
  if (subtitleEl) subtitleEl.textContent = totalItems + ' منتج';
  if (countEl) countEl.textContent = totalItems;
  
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
          '<button class="cart-qty-btn remove" onclick="removeFromCart(' + index + ')">×</button>' +
        '</div>' +
      '</div>';
  });
  
  if (itemsEl) itemsEl.innerHTML = html;
  
  // حساب المجموع
  var subtotal = cart.reduce(function(sum, item) {
    return sum + (item.price * item.quantity);
  }, 0);
  var delivery = 3000;
  var total = subtotal + delivery;
  
  document.getElementById('cartSubtotal').textContent = subtotal.toLocaleString() + ' دينار';
  document.getElementById('cartDelivery').textContent = delivery.toLocaleString() + ' دينار';
  document.getElementById('cartTotal').textContent = total.toLocaleString() + ' دينار';
}

// ============================================
// تعديل الكمية
// ============================================
function changeQuantity(index, delta) {
  if (index < 0 || index >= cart.length) return;
  
  cart[index].quantity += delta;
  
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  
  saveCart();
  renderCart();
  updateCartBadge();
}

// ============================================
// حذف من السلة
// ============================================
function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم الحذف من السلة');
}

// ============================================
// مسح السلة
// ============================================
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('مسح جميع المنتجات من السلة؟')) return;
  
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم مسح السلة');
}

// ============================================
// حفظ واستعادة
// ============================================
function saveCart() {
  localStorage.setItem('saydaliyati_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  var badgeEl = document.getElementById('cartBadge');
  if (!badgeEl) return;
  
  var total = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
  badgeEl.textContent = total;
  badgeEl.setAttribute('data-count', total);
}

// ============================================
// إرسال الطلب
// ============================================
function submitCartOrder() {
  if (cart.length === 0) {
    showError('السلة فارغة');
    return;
  }
  
  var pharmacy = document.getElementById('cartPharmacySelect').value;
  var address = document.getElementById('cartAddress').value.trim();
  var notes = document.getElementById('cartNotes').value.trim();
  var payment = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  if (!pharmacy) {
    showError('اختر صيدلية');
    return;
  }
  
  if (!address) {
    showError('أدخل عنوان التوصيل');
    return;
  }
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);
  
  var subtotal = cart.reduce(function(sum, item) {
    return sum + (item.price * item.quantity);
  }, 0);
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
  
  // حفظ الطلب
  var orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_cart_orders', JSON.stringify(orders));
  
  // إشعار للصيدلية (Push)
  if (typeof sendNotification === 'function') {
    sendNotification({
      title: '🛒 طلب دواء جديد #' + orderId,
      body: user.name + ' • ' + total.toLocaleString() + ' دينار',
      type: 'order',
      orderId: orderId,
      vibrate: [300, 100, 300],
      requireInteraction: true,
      actions: [
        { action: 'accept', title: '✅ قبول' },
        { action: 'reject', title: '❌ رفض' }
      ]
    });
  }
  
  // إشعار داخلي
  if (typeof addInternalNotification === 'function') {
    addInternalNotification('order', '🛒 طلبك #' + orderId, 'في انتظار قبول الصيدلية');
    updateNotifBadge();
  }
  
  // مسح السلة
  cart = [];
  saveCart();
  updateCartBadge();
  
  // رسالة نجاح
  showSuccessMessage(
    '✅ تم إرسال طلبك',
    'طلب #' + orderId + ' - ' + pharmacy + ' ستتواصل معك قريباً'
  );
    }

// ============================================
// 💊 نظام إدارة المخزون
// ============================================

var currentInventoryFilter = 'all';
var currentInventorySearch = '';

// مفتاح تخزين المخزون (خاص بكل صيدلية)
function getInventoryKey() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return 'saydaliyati_inventory_default';
  var user = JSON.parse(userStr);
  return 'saydaliyati_inventory_' + (user.phone || 'default');
}

// تحميل المخزون
function loadInventory() {
  var key = getInventoryKey();
  var inventory = JSON.parse(localStorage.getItem(key) || 'null');
  
  // إذا لم يوجد، ابدأ بمخزون افتراضي
  if (!inventory) {
    inventory = [
      { id: 'MED_' + Date.now() + '_1', name: 'بانادول', category: 'مسكنات', price: 3000, stock: 50, icon: '💊', desc: 'مسكن للألم وخافض للحرارة' },
      { id: 'MED_' + Date.now() + '_2', name: 'فيتامين C', category: 'فيتامينات', price: 5000, stock: 30, icon: '🍊', desc: 'مكمل غذائي لتقوية المناعة' },
      { id: 'MED_' + Date.now() + '_3', name: 'أموكسيسيلين', category: 'مضاد حيوي', price: 8000, stock: 5, icon: '💉', desc: 'مضاد حيوي واسع المجال' }
    ];
    saveInventory(inventory);
  }
  
  return inventory;
}

function saveInventory(inventory) {
  var key = getInventoryKey();
  localStorage.setItem(key, JSON.stringify(inventory));
  
  // تحديث PHARMACY_INVENTORY للصيدلية الحالية (للسلة)
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (userStr && typeof PHARMACY_INVENTORY !== 'undefined') {
    try {
      var user = JSON.parse(userStr);
      var pharmacyName = user.name || 'صيدلية';
      PHARMACY_INVENTORY[pharmacyName] = inventory.map(function(med) {
        return {
          id: med.id,
          name: med.name,
          category: med.category,
          price: med.price,
          icon: med.icon,
          stock: med.stock,
          desc: med.desc
        };
      });
    } catch(e) {
      console.log('خطأ في تحديث PHARMACY_INVENTORY:', e);
    }
  }
}

// فتح صفحة المخزون
function openInventoryScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) {
    showToast('سجّل دخول أولاً');
    return;
  }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'pharmacy') {
    showToast('هذه الميزة للصيدليات فقط');
    return;
  }
  
  currentInventoryFilter = 'all';
  currentInventorySearch = '';
  
  var searchInput = document.getElementById('inventorySearch');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.inv-filter').forEach(function(btn, i) {
    btn.classList.toggle('active', i === 0);
  });
  
  renderInventory();
  showScreen('inventoryScreen');
}

function closeInventoryScreen() {
  showScreen('pharmacyDashboard');
}

// عرض المخزون
function renderInventory() {
  var inventory = loadInventory();
  var listEl = document.getElementById('inventoryList');
  var subtitleEl = document.getElementById('inventorySubtitle');
  
  if (!listEl) return;
  
  // إحصائيات
  var totalMeds = inventory.length;
  var lowStock = inventory.filter(function(m) { return m.stock > 0 && m.stock <= 10; }).length;
  var outOfStock = inventory.filter(function(m) { return m.stock === 0; }).length;
  var totalValue = inventory.reduce(function(sum, m) { return sum + (m.price * m.stock); }, 0);
  
  var elTotalMeds = document.getElementById('invTotalMeds');
  var elLowStock = document.getElementById('invLowStock');
  var elOutOfStock = document.getElementById('invOutOfStock');
  var elValue = document.getElementById('invValue');
  
  if (elTotalMeds) elTotalMeds.textContent = totalMeds;
  if (elLowStock) elLowStock.textContent = lowStock;
  if (elOutOfStock) elOutOfStock.textContent = outOfStock;
  if (elValue) elValue.textContent = (totalValue / 1000).toFixed(0) + 'K';
  
  // تنبيه
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
  
  // فلترة
  var filtered = inventory.filter(function(m) {
    if (currentInventoryFilter === 'available' && m.stock <= 10) return false;
    if (currentInventoryFilter === 'low' && (m.stock === 0 || m.stock > 10)) return false;
    if (currentInventoryFilter === 'out' && m.stock !== 0) return false;
    
    if (currentInventorySearch) {
      var search = currentInventorySearch.toLowerCase();
      if (m.name.toLowerCase().indexOf(search) === -1 &&
          m.category.toLowerCase().indexOf(search) === -1) {
        return false;
      }
    }
    
    return true;
  });
  
  if (subtitleEl) subtitleEl.textContent = filtered.length + ' من ' + totalMeds + ' دواء';
  
  if (filtered.length === 0) {
    listEl.innerHTML = 
      '<div class="cart-empty">' +
        '<div class="cart-empty-icon">💊</div>' +
        '<h3>لا توجد أدوية</h3>' +
        '<p>' + (inventory.length === 0 ? 'اضغط "+ إضافة دواء" للبدء' : 'لا توجد نتائج مطابقة') + '</p>' +
      '</div>';
    return;
  }
  
  var html = '';
  filtered.forEach(function(med) {
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
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
              '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
            '</svg>' +
          '</button>' +
          '<button class="medicine-action-btn delete" onclick="deleteMedicine(\'' + med.id + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<polyline points="3 6 5 6 21 6"/>' +
              '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';
  });
  
  listEl.innerHTML = html;
}

// فلترة
function filterInventoryBy(filter, btn) {
  currentInventoryFilter = filter;
  document.querySelectorAll('.inv-filter').forEach(function(b) {
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function filterInventory() {
  var input = document.getElementById('inventorySearch');
  currentInventorySearch = input ? input.value.trim() : '';
  renderInventory();
}

// فتح نافذة إضافة
function openAddMedicineModal() {
  var titleEl = document.getElementById('medicineModalTitle');
  if (titleEl) titleEl.textContent = 'إضافة دواء جديد';
  
  var fields = ['editMedicineId', 'medicineName', 'medicineCategory', 'medicinePrice', 'medicineStock', 'medicineDesc'];
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  var iconEl = document.getElementById('medicineIcon');
  if (iconEl) iconEl.value = '💊';
  
  var btnEl = document.getElementById('medicineSubmitBtn');
  if (btnEl) btnEl.textContent = 'إضافة إلى المخزون';
  
  document.querySelectorAll('.icon-option').forEach(function(btn, i) {
    btn.classList.toggle('active', i === 0);
  });
  
  var modal = document.getElementById('medicineModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// فتح نافذة تعديل
function openEditMedicineModal(medId) {
  var inventory = loadInventory();
  var med = inventory.find(function(m) { return m.id === medId; });
  
  if (!med) {
    showError('الدواء غير موجود');
    return;
  }
  
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
  
  document.querySelectorAll('.icon-option').forEach(function(btn) {
    var isActive = btn.textContent.trim() === med.icon;
    btn.classList.toggle('active', isActive);
  });
  
  var modal = document.getElementById('medicineModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMedicineModal() {
  var modal = document.getElementById('medicineModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function selectIcon(icon, btn) {
  var iconInput = document.getElementById('medicineIcon');
  if (iconInput) iconInput.value = icon;
  
  document.querySelectorAll('.icon-option').forEach(function(b) {
    b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
}

// حفظ الدواء
function saveMedicine(event) {
  if (event) event.preventDefault();
  
  var medId = document.getElementById('editMedicineId').value;
  var name = document.getElementById('medicineName').value.trim();
  var category = document.getElementById('medicineCategory').value;
  var price = parseInt(document.getElementById('medicinePrice').value);
  var stock = parseInt(document.getElementById('medicineStock').value);
  var desc = document.getElementById('medicineDesc').value.trim();
  var icon = document.getElementById('medicineIcon').value;
  
  if (!name || !category || isNaN(price) || isNaN(stock)) {
    showError('املأ كل الحقول المطلوبة');
    return;
  }
  
  if (price < 0 || stock < 0) {
    showError('السعر والكمية يجب أن يكونا رقمين موجبين');
    return;
  }
  
  var inventory = loadInventory();
  
  if (medId) {
    // تعديل
    var index = inventory.findIndex(function(m) { return m.id === medId; });
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
    // إضافة جديدة
    var newMed = {
      id: 'MED_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name,
      category: category,
      price: price,
      stock: stock,
      desc: desc,
      icon: icon
    };
    inventory.unshift(newMed);
    showToast('✅ تمت إضافة الدواء');
  }
  
  saveInventory(inventory);
  closeMedicineModal();
  renderInventory();
  
  if (navigator.vibrate) navigator.vibrate([50]);
}

// حذف دواء
function deleteMedicine(medId) {
  if (!confirm('هل تريد حذف هذا الدواء؟')) return;
  
  var inventory = loadInventory();
  inventory = inventory.filter(function(m) { return m.id !== medId; });
  saveInventory(inventory);
  renderInventory();
  showToast('تم حذف الدواء');
      }

// ============================================
// ⭐ نظام التقييم
// ============================================

var currentRating = 0;

// فتح نافذة التقييم
function openRatingModal(targetName, targetType, orderId) {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) {
    showToast('سجّل دخول أولاً');
    return;
  }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'patient') {
    showToast('هذه الميزة للمرضى فقط');
    return;
  }
  
  // إعادة تعيين
  currentRating = 0;
  
  // تحديد الاسم والأيقونة
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
  
  // حفظ بيانات الهدف
  document.getElementById('ratingTargetId').value = orderId || '';
  document.getElementById('ratingTargetType').value = targetType;
  document.getElementById('ratingComment').value = '';
  
  // إعادة تعيين النجوم
  document.querySelectorAll('.rating-star').forEach(function(star) {
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

// إغلاق النافذة
function closeRatingModal() {
  document.getElementById('ratingModal').classList.remove('active');
  document.body.style.overflow = '';
  currentRating = 0;
}

// اختيار التقييم
function selectRating(value) {
  currentRating = value;
  
  var stars = document.querySelectorAll('.rating-star');
  stars.forEach(function(star, index) {
    star.classList.toggle('active', index < value);
  });
  
  // نص توضيحي
  var textEl = document.getElementById('ratingText');
  var texts = {
    1: '😞 سيء جداً',
    2: '😕 ضعيف',
    3: '😐 مقبول',
    4: '😊 جيد',
    5: '🤩 ممتاز!'
  };
  var classes = {
    1: 'bad', 2: 'bad', 3: 'medium', 4: 'good', 5: 'good'
  };
  
  if (textEl) {
    textEl.textContent = texts[value];
    textEl.className = 'rating-text ' + classes[value];
  }
  
  // اهتزاز خفيف
  if (navigator.vibrate) navigator.vibrate([30]);
}

// إرسال التقييم
function submitRating() {
  if (currentRating === 0) {
    showError('اختر تقييماً أولاً');
    return;
  }
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  var user = JSON.parse(userStr);
  
  var targetName = document.getElementById('ratingTargetName').textContent;
  var targetType = document.getElementById('ratingTargetType').value;
  var orderId = document.getElementById('ratingTargetId').value;
  var comment = document.getElementById('ratingComment').value.trim();
  
  var rating = {
    id: 'RATING_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    from: user.name,
    fromPhone: user.phone,
    targetName: targetName,
    targetType: targetType, // 'pharmacy' | 'delivery'
    orderId: orderId,
    rating: currentRating,
    comment: comment,
    date: new Date().toISOString()
  };
  
  // حفظ التقييم
  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  ratings.unshift(rating);
  localStorage.setItem('saydaliyati_ratings', JSON.stringify(ratings));
  
  // إشعار داخلي
  if (typeof addInternalNotification === 'function') {
    addInternalNotification(
      'system',
      '⭐ شكراً لتقييمك',
      'قيّمت ' + targetName + ' بـ ' + currentRating + ' نجوم'
    );
  }
  
  // صوت نجاح
  if (typeof playSuccessSound === 'function') playSuccessSound();
  
  // اهتزاز
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  
  closeRatingModal();
  
  showToast('⭐ شكراً لتقييمك ' + targetName);
  
  // تحديث قائمة تقييماتي (إذا كانت مفتوحة)
  if (document.getElementById('profileScreen').classList.contains('active')) {
    renderMyRatings();
  }
}

// ============================================
// عرض تقييماتي في الملف الشخصي
// ============================================
function renderMyRatings() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return;
  
  var user = JSON.parse(userStr);
  var listEl = document.getElementById('myRatingsList');
  var countEl = document.getElementById('myRatingsCount');
  
  if (!listEl) return;
  
  // فلترة تقييمات المستخدم الحالي
  var allRatings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  var myRatings = allRatings.filter(function(r) {
    return r.fromPhone === user.phone;
  });
  
  if (countEl) countEl.textContent = myRatings.length;
  
  if (myRatings.length === 0) {
    listEl.innerHTML = 
      '<div class="my-ratings-empty">' +
        '<div class="my-ratings-empty-icon">⭐</div>' +
        '<p>لم تقم بأي تقييم بعد</p>' +
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
// تحميل التقييمات عند فتح الملف الشخصي
// ============================================
var originalOpenProfile = window.openProfile;
window.openProfile = function() {
  originalOpenProfile.apply(this, arguments);
  setTimeout(renderMyRatings, 100);
};

// ============================================
// 🗺️ نظام الخريطة + GPS
// ============================================

var mainMap = null;
var trackingMap = null;
var myLocation = null;
var myMarker = null;
var nearbyMarkers = [];
var routeLine = null;

// مواقع افتراضية في بغداد
var BAGHDAD_CENTER = [33.3152, 44.3661];

// مواقع وهمية للصيدليات والمريض
var PHARMACY_LOCATIONS = {
  'صيدلية النور': [33.3000, 44.4000],
  'صيدلية الحياة': [33.2800, 44.3800],
  'صيدلية الشفاء': [33.3300, 44.3500]
};

// ============================================
// فتح صفحة الخريطة (للمندوب)
// ============================================
function openMapScreen() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) {
    showToast('سجّل دخول أولاً');
    return;
  }
  
  var user = JSON.parse(userStr);
  if (user.type !== 'delivery') {
    showToast('هذه الميزة للمندوبين فقط');
    return;
  }
  
  showScreen('mapScreen');
  
  // تهيئة الخريطة بعد ظهور الشاشة
  setTimeout(function() {
    initMainMap();
    requestMyLocation();
    loadNearbyOrders();
  }, 300);
}

function closeMapScreen() {
  if (mainMap) {
    mainMap.remove();
    mainMap = null;
  }
  showScreen('deliveryDashboard');
}

// ============================================
// تهيئة خريطة المندوب
// ============================================
function initMainMap() {
  var mapEl = document.getElementById('leafletMap');
  if (!mapEl) return;
  
  // إذا كانت الخريطة موجودة، احذفها أولاً
  if (mainMap) {
    mainMap.remove();
  }
  
  // إنشاء الخريطة
  mainMap = L.map('leafletMap').setView(BAGHDAD_CENTER, 13);
  
  // إضافة طبقة OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(mainMap);
  
  // إخفاء رسالة التحميل
  var loading = document.getElementById('mapLoading');
  if (loading) loading.style.display = 'none';
  
  // إضافة مواقع الصيدليات
  addPharmacyMarkers();
  
  console.log('✅ تم تحميل الخريطة');
}

// ============================================
// طلب موقع المستخدم (GPS)
// ============================================
function requestMyLocation() {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم GPS');
    updateGpsInfo(null);
    return;
  }
  
  var subtitleEl = document.getElementById('mapSubtitle');
  if (subtitleEl) subtitleEl.textContent = 'جارٍ تحديد موقعك...';
  
  navigator.geolocation.getCurrentPosition(
    // نجاح
    function(position) {
      myLocation = [position.coords.latitude, position.coords.longitude];
      console.log('📍 موقعك:', myLocation);
      
      // تحديث معلومات GPS
      updateGpsInfo(position);
      
      // إضافة علامة موقعي
      addMyLocationMarker();
      
      // تحديث مركز الخريطة
      if (mainMap) {
        mainMap.setView(myLocation, 15);
      }
      
      var subtitleEl = document.getElementById('mapSubtitle');
      if (subtitleEl) subtitleEl.textContent = 'تم تحديد موقعك ✅';
    },
    // خطأ
    function(error) {
      console.log('❌ خطأ GPS:', error.message);
      
      // استخدام موقع افتراضي (بغداد)
      myLocation = BAGHDAD_CENTER;
      updateGpsInfo(null);
      addMyLocationMarker();
      
      var subtitleEl = document.getElementById('mapSubtitle');
      if (subtitleEl) subtitleEl.textContent = 'تعذّر تحديد الموقع - استخدمنا بغداد';
      
      showToast('⚠️ تعذّر تحديد موقعك، فعّل GPS');
    },
    // خيارات
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// ============================================
// تحديث معلومات GPS
// ============================================
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

// ============================================
// إضافة علامة "موقعي"
// ============================================
function addMyLocationMarker() {
  if (!mainMap || !myLocation) return;
  
  // احذف العلامة القديمة
  if (myMarker) {
    mainMap.removeLayer(myMarker);
  }
  
  // أيقونة مخصصة
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

// ============================================
// إضافة علامات الصيدليات
// ============================================
function addPharmacyMarkers() {
  if (!mainMap) return;
  
  var pharmacyIcon = L.divIcon({
    className: 'custom-map-marker marker-pharmacy',
    html: '<div class="custom-marker-pin"><span>🏪</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  for (var name in PHARMACY_LOCATIONS) {
    if (PHARMACY_LOCATIONS.hasOwnProperty(name)) {
      var loc = PHARMACY_LOCATIONS[name];
      L.marker(loc, { icon: pharmacyIcon })
        .addTo(mainMap)
        .bindPopup('<strong>' + name + '</strong><br>صيدلية');
    }
  }
}

// ============================================
// تحميل الطلبات القريبة (محاكاة)
// ============================================
function loadNearbyOrders() {
  var listEl = document.getElementById('nearbyOrdersList');
  var countEl = document.getElementById('nearbyCount');
  if (!listEl) return;
  
  // محاكاة 3 طلبات قريبة
  var nearbyOrders = [
    { id: 1234, name: 'أحمد علي', pharmacy: 'صيدلية النور', distance: '2.5 كم', commission: 3000, lat: 33.3000, lng: 44.4000 },
    { id: 1235, name: 'سارة محمد', pharmacy: 'صيدلية الحياة', distance: '3.2 كم', commission: 4000, lat: 33.2800, lng: 44.3800 },
    { id: 1236, name: 'علي حسن', pharmacy: 'صيدلية الشفاء', distance: '4.1 كم', commission: 5000, lat: 33.3300, lng: 44.3500 }
  ];
  
  if (countEl) countEl.textContent = nearbyOrders.length;
  
  var html = '';
  nearbyOrders.forEach(function(order) {
    html += 
      '<div class="nearby-order-card" onclick="focusOnOrder(' + order.lat + ',' + order.lng + ', ' + order.id + ')">' +
        '<div class="nearby-order-icon">📦</div>' +
        '<div class="nearby-order-info">' +
          '<h4 class="nearby-order-name">طلب #' + order.id + ' - ' + order.name + '</h4>' +
          '<div class="nearby-order-meta">' +
            '<span>📍 ' + order.distance + '</span>' +
            '<span>💰 ' + order.commission.toLocaleString() + ' د</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  });
  
  listEl.innerHTML = html;
}

// ============================================
// التركيز على طلب معين
// ============================================
function focusOnOrder(lat, lng, orderId) {
  if (!mainMap) return;
  
  mainMap.setView([lat, lng], 16);
  
  // أضف علامة الطلب
  var orderIcon = L.divIcon({
    className: 'custom-map-marker marker-patient',
    html: '<div class="custom-marker-pin"><span>🏠</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  var marker = L.marker([lat, lng], { icon: orderIcon })
    .addTo(mainMap)
    .bindPopup('<strong>طلب #' + orderId + '</strong><br>موقع التسليم')
    .openPopup();
  
  // ارسم المسار من موقعي إلى الطلب
  drawRoute(myLocation, [lat, lng]);
  
  showToast('📍 تم تحديد موقع الطلب #' + orderId);
}

// ============================================
// رسم المسار بين نقطتين
// ============================================
function drawRoute(from, to) {
  if (!mainMap || !from || !to) return;
  
  // احذف المسار القديم
  if (routeLine) {
    mainMap.removeLayer(routeLine);
  }
  
  // خط وهمي (في الحقيقة نستخدم OSRM API)
  routeLine = L.polyline([from, to], {
    color: '#2563EB',
    weight: 4,
    opacity: 0.7,
    dashArray: '10, 10',
    lineCap: 'round'
  }).addTo(mainMap);
  
  // احسب المسافة التقريبية
  var distance = calculateDistance(from[0], from[1], to[0], to[1]);
  console.log('📏 المسافة:', distance.toFixed(2), 'كم');
}

// ============================================
// حساب المسافة بين نقطتين (Haversine)
// ============================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // نصف قطر الأرض بالكيلومتر
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// ============================================
// التركيز على موقعي
// ============================================
function centerOnMe() {
  if (!mainMap || !myLocation) {
    showToast('جاري تحديد موقعك...');
    requestMyLocation();
    return;
  }
  
  mainMap.setView(myLocation, 16);
  if (myMarker) myMarker.openPopup();
  showToast('📍 تم التركيز على موقعك');
}

// ============================================
// إظهار كل الطلبات على الخريطة
// ============================================
function showAllOrders() {
  if (!mainMap) return;
  
  // ارسم مسارات لكل الطلبات
  var orders = [
    { lat: 33.3000, lng: 44.4000 },
    { lat: 33.2800, lng: 44.3800 },
    { lat: 33.3300, lng: 44.3500 }
  ];
  
  orders.forEach(function(order) {
    drawRoute(myLocation, [order.lat, order.lng]);
  });
  
  // ضع الخريطة على مستوى يعرض كل الطلبات
  var group = new L.featureGroup([
    L.marker(myLocation),
    L.marker([33.3000, 44.4000]),
    L.marker([33.2800, 44.3800]),
    L.marker([33.3300, 44.3500])
  ]);
  mainMap.fitBounds(group.getBounds().pad(0.2));
  
  showToast('🗺️ عرض كل الطلبات');
}

// ============================================
// تحديث الموقع
// ============================================
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
  if (user.type !== 'patient') {
    showToast('هذه الميزة للمرضى فقط');
    return;
  }
  
  showScreen('trackingScreen');
  
  // تحديث اسم المندوب
  var nameEl = document.getElementById('trackingDeliveryName');
  if (nameEl) nameEl.textContent = deliveryName;
  
  // تهيئة الخريطة
  setTimeout(function() {
    initTrackingMap(pharmacyLat, pharmacyLng);
  }, 300);
}

function closeTrackingScreen() {
  if (trackingMap) {
    trackingMap.remove();
    trackingMap = null;
  }
  showScreen('myOrdersScreen');
}

function initTrackingMap(pharmacyLat, pharmacyLng) {
  var mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  
  if (trackingMap) trackingMap.remove();
  
  // موقع المريض (افتراضي)
  var patientLoc = [33.3152, 44.3661];
  var pharmacyLoc = [pharmacyLat, pharmacyLng];
  
  trackingMap = L.map('trackingMap').setView(patientLoc, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(trackingMap);
  
  // علامة موقع المريض
  var patientIcon = L.divIcon({
    className: 'custom-map-marker marker-patient',
    html: '<div class="custom-marker-pin"><span>🏠</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  L.marker(patientLoc, { icon: patientIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>موقعك</strong>');
  
  // علامة موقع الصيدلية
  var pharmacyIcon = L.divIcon({
    className: 'custom-map-marker marker-pharmacy',
    html: '<div class="custom-marker-pin"><span>🏪</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  L.marker(pharmacyLoc, { icon: pharmacyIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>الصيدلية</strong>');
  
  // علامة موقع المندوب (افتراضي - في المنتصف)
  var midLat = (patientLoc[0] + pharmacyLoc[0]) / 2;
  var midLng = (patientLoc[1] + pharmacyLoc[1]) / 2;
  var deliveryIcon = L.divIcon({
    className: 'custom-map-marker marker-delivery',
    html: '<div class="custom-marker-pin"><span>🚴</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  var deliveryMarker = L.marker([midLat, midLng], { icon: deliveryIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>المندوب</strong><br>في الطريق')
    .openPopup();
  
  // رسم المسار
  L.polyline([pharmacyLoc, [midLat, midLng], patientLoc], {
    color: '#10B981',
    weight: 4,
    opacity: 0.7
  }).addTo(trackingMap);
  
  // ضبط الحدود
  var group = new L.featureGroup([
    L.marker(patientLoc),
    L.marker(pharmacyLoc),
    L.marker([midLat, midLng])
  ]);
  trackingMap.fitBounds(group.getBounds().pad(0.2));
  
  // حركة المندوب (محاكاة)
  simulateDeliveryMovement(deliveryMarker, [midLat, midLng], patientLoc);
}

// ============================================
// محاكاة حركة المندوب
// ============================================
function simulateDeliveryMovement(marker, start, end) {
  var steps = 30;
  var currentStep = 0;
  
  var interval = setInterval(function() {
    currentStep++;
    
    if (currentStep > steps) {
      clearInterval(interval);
      return;
    }
    
    var ratio = currentStep / steps;
    var lat = start[0] + (end[0] - start[0]) * ratio;
    var lng = start[1] + (end[1] - start[1]) * ratio;
    
    marker.setLatLng([lat, lng]);
    
    // تحديث الوقت المتوقع والمسافة
    var distance = calculateDistance(lat, lng, end[0], end[1]);
    var eta = Math.max(1, Math.round(distance * 3));
    
    var etaEl = document.getElementById('trackingETA');
    var distEl = document.getElementById('trackingDistance');
    var progEl = document.getElementById('trackingProgressFill');
    
    if (etaEl) etaEl.textContent = eta + ' دقيقة';
    if (distEl) distEl.textContent = distance.toFixed(1) + ' كم';
    if (progEl) progEl.style.width = (40 + (ratio * 55)) + '%';
    
  }, 2000); // كل 2 ثانية يتحرك المندوب
}

function refreshTracking() {
  showToast('🔄 جارٍ تحديث موقع المندوب...');
  // في الواقع، هنا نطلب الموقع من Firebase
}
