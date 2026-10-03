// ============================================
// صيدليتي - Clean Medical v5
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
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// صوت البحث (بيييب)
function playSonarPing() {
  try {
    var ctx = initAudio();
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
    
    // نغمة أولى
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
    
    // نغمة ثانية (أعلى)
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
    var notes = [523, 659, 784]; // C, E, G
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

// صوت فتح الرادار
function playRadarActivateSound() {
  try {
    var ctx = initAudio();
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
// الرادار (للمندوب)
// ============================================
var radarActive = false;
var radarInterval = null;

function toggleRadar() {
  var btn = document.getElementById('radarBtn');
  var btnText = document.getElementById('radarBtnText');
  
  if (!radarActive) {
    // تفعيل
    radarActive = true;
    if (btn) btn.classList.add('active');
    if (btnText) btnText.textContent = 'إيقاف الرادار';
    
    playRadarActivateSound();
    showToast('الرادار يعمل - جاري البحث...');
    
    // صوت بحث متكرر
    radarInterval = setInterval(function() {
      playSonarPing();
    }, 2000);
    
    // محاكاة رصد طلب بعد 5 ثواني
    setTimeout(function() {
      if (radarActive) {
        playAlertDing();
        openOrderSheet();
      }
    }, 5000);
    
  } else {
    // إلغاء
    radarActive = false;
    if (btn) btn.classList.remove('active');
    if (btnText) btnText.textContent = 'تفعيل الرادار';
    
    if (radarInterval) {
      clearInterval(radarInterval);
      radarInterval = null;
    }
    
    showToast('تم إيقاف الرادار');
  }
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
  
  // بدء المؤقت
  startOrderTimer();
}

function closeOrderSheet() {
  var overlay = document.getElementById('orderSheetOverlay');
  var sheet = document.getElementById('orderSheet');
  
  if (overlay) overlay.classList.remove('active');
  if (sheet) sheet.classList.remove('active');
  document.body.style.overflow = '';
  
  // إلغاء المؤقت
  if (orderTimerInterval) {
    clearInterval(orderTimerInterval);
    orderTimerInterval = null;
  }
  
  // إذا رفض، يوقف الرادار
  if (radarActive) {
    radarActive = false;
    var btn = document.getElementById('radarBtn');
    var btnText = document.getElementById('radarBtnText');
    if (btn) btn.classList.remove('active');
    if (btnText) btnText.textContent = 'تفعيل الرادار';
    if (radarInterval) {
      clearInterval(radarInterval);
      radarInterval = null;
    }
  }
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
  showToast('تم قبول الطلب');
  
  // نقل الطلب إلى "طلباتي"
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
  }
}

function updateBottomNav(screenId) {
  var nav = document.getElementById('mainBottomNav');
  if (!nav) return;
  
  var navScreens = ['homeScreen', 'pharmacyDashboard', 'deliveryDashboard', 'ordersScreen', 'myOrdersScreen', 'notificationsScreen'];
  
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
// طلباتي الذكية
// ============================================
function goToMyOrders() {
  showScreen('myOrdersScreen');
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  var myBtn = document.querySelector('.nav-btn[data-tab="myorders"]');
  if (myBtn) myBtn.classList.add('active');
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

function openAppDetails() {
  closeSidebar();
  showScreen('appDetailsScreen');
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
  
  if (user.type === 'pharmacy') {
    showScreen('pharmacyDashboard');
  } else if (user.type === 'delivery') {
    showScreen('deliveryDashboard');
  } else {
    showScreen('homeScreen');
    setTimeout(loadOffers, 100);
  }
  }
