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
