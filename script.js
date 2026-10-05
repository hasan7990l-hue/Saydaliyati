// ============================================
// صيدليتي - Clean Medical v9
// الجزء 1 من 3
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
// الأصوات (Web Audio API)
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

// صوت البحث (Sonar)
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

// صوت الرصد
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
  } catch(e) {}
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
  } catch(e) {}
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
  } catch(e) {}
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
// 🎬 إنشاء جزيئات شاشة البداية (Splash)
// ============================================
function createSplashParticles() {
  var container = document.getElementById('splashParticles');
  if (!container) return;
  
  container.innerHTML = '';
  
  var particleCount = 35;
  
  for (var i = 0; i < particleCount; i++) {
    var particle = document.createElement('div');
    particle.className = 'splash-particle' + (Math.random() > 0.6 ? ' white' : '');
    
    var size = Math.random() * 4 + 2;
    var top = Math.random() * 100;
    var left = Math.random() * 100;
    var delay = Math.random() * 6;
    var duration = 4 + Math.random() * 4;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = top + '%';
    particle.style.left = left + '%';
    particle.style.animationDelay = delay + 's';
    particle.style.animationDuration = duration + 's';
    
    container.appendChild(particle);
  }
}

function createLoginParticles() {
  var container = document.getElementById('loginParticles');
  if (!container) return;
  
  container.innerHTML = '';
  
  var particleCount = 30;
  
  for (var i = 0; i < particleCount; i++) {
    var particle = document.createElement('div');
    particle.className = 'login-particle' + (Math.random() > 0.6 ? ' white' : '');
    
    var size = Math.random() * 4 + 2;
    var top = Math.random() * 100;
    var left = Math.random() * 100;
    var delay = Math.random() * 6;
    var duration = 4 + Math.random() * 4;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.top = top + '%';
    particle.style.left = left + '%';
    particle.style.animationDelay = delay + 's';
    particle.style.animationDuration = duration + 's';
    
    container.appendChild(particle);
  }
}

// ============================================
// 📡 الرادار (نسخة جديدة)
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
    // ✅ تفعيل الرادار
    radarActive = true;
    
    if (radarSimple) radarSimple.classList.add('active');
    if (radarTitle) radarTitle.textContent = 'جارٍ البحث...';
    if (btnText) btnText.textContent = 'إيقاف البحث';
    if (btn) btn.classList.add('active');
    
    playRadarActivateSound();
    vibrateDevice([100, 50, 100]);
    showToast('📡 الرادار يعمل - جاري البحث...');
    
    // صوت السونار كل ثانيتين
    if (radarInterval) clearInterval(radarInterval);
    radarInterval = setInterval(function() {
      playSonarPing();
    }, 2000);
    
    // محاكاة ظهور طلب بعد 5 ثواني
    setTimeout(function() {
      if (radarActive) {
        playAlertDing();
        vibrateDevice([200, 100, 200]);
        openOrderSheet();
        if (radarTitle) radarTitle.textContent = '📦 تم رصد طلب!';
      }
    }, 5000);
    
    startOrderSimulation();
    
  } else {
    // ❌ إيقاف الرادار
    radarActive = false;
    
    if (radarSimple) radarSimple.classList.remove('active');
    if (radarTitle) radarTitle.textContent = 'ابدأ البحث';
    if (btnText) btnText.textContent = 'ابدأ البحث';
    if (btn) btn.classList.remove('active');
    
    if (radarInterval) {
      clearInterval(radarInterval);
      radarInterval = null;
    }
    
    if (orderSimulationInterval) {
      clearInterval(orderSimulationInterval);
      orderSimulationInterval = null;
    }
    
    showToast('⏹️ تم إيقاف الرادار');
  }
}

function startOrderSimulation() {
  if (orderSimulationInterval) clearInterval(orderSimulationInterval);
  
  orderSimulationInterval = setInterval(function() {
    if (radarActive) {
      var sheet = document.getElementById('orderSheet');
      if (sheet && !sheet.classList.contains('active')) {
        playAlertDing();
        vibrateDevice([200, 100, 200]);
        openOrderSheet();
      }
    }
  }, 15000);
}

// ============================================
// Bottom Sheet الطلب (القديم)
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
  
  // إعادة النص الأصلي
  var radarTitle = document.getElementById('radarTitle');
  if (radarTitle && radarActive) {
    radarTitle.textContent = 'جارٍ البحث...';
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

function acceptOrder(orderId) {
  playAlertDing();
  showToast('تم قبول الطلب #' + orderId);
  
  setTimeout(function() {
    goToMyOrders();
  }, 500);
}

// ============================================
// 🧭 Bottom Sheet التنقل (Waze/Google)
// ============================================
var pendingOrderDestination = null;

function openNavSheet(lat, lng, destinationType) {
  pendingOrderDestination = { 
    lat: lat, 
    lng: lng, 
    type: destinationType || 'صيدلية'
  };
  
  var destEl = document.getElementById('navDestination');
  if (destEl) {
    destEl.textContent = '📍 الوجهة: ' + (destinationType || 'صيدلية');
  }
  
  var sheet = document.getElementById('navSheet');
  var overlay = document.getElementById('navSheetOverlay');
  
  if (overlay) overlay.classList.add('active');
  if (sheet) sheet.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  if (navigator.vibrate) navigator.vibrate([50]);
}

function closeNavSheet() {
  var sheet = document.getElementById('navSheet');
  var overlay = document.getElementById('navSheetOverlay');
  
  if (overlay) overlay.classList.remove('active');
  if (sheet) sheet.classList.remove('active');
  document.body.style.overflow = '';
}

function chooseNavigation(type) {
  if (!pendingOrderDestination) {
    showToast('⚠️ لا توجد وجهة');
    closeNavSheet();
    return;
  }
  
  var lat = pendingOrderDestination.lat;
  var lng = pendingOrderDestination.lng;
  
  closeNavSheet();
  
  setTimeout(function() {
    if (type === 'waze') {
      openWazeDirect(lat, lng);
    } else if (type === 'google') {
      openGoogleDirect(lat, lng);
    } else if (type === 'map') {
      openMapDirect(lat, lng);
    }
  }, 400);
}

function openWazeDirect(lat, lng) {
  var wazeUrl = 'https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes&zoom=17';
  
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /android/i.test(ua);
  
  if (isIOS) {
    window.location.href = 'waze://?ll=' + lat + ',' + lng + '&navigate=yes';
    setTimeout(function() { window.open(wazeUrl, '_blank'); }, 1500);
  } else if (isAndroid) {
    window.location.href = 'intent://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes#Intent;scheme=https;package=com.waze;end';
    setTimeout(function() { window.open(wazeUrl, '_blank'); }, 1500);
  } else {
    window.open(wazeUrl, '_blank');
  }
  
  showToast('🚗 جارٍ فتح Waze...');
}

function openGoogleDirect(lat, lng) {
  var googleUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '&travelmode=driving';
  window.open(googleUrl, '_blank');
  showToast('🗺️ جارٍ فتح Google Maps...');
}

function openMapDirect(lat, lng) {
  openMapScreen();
  
  setTimeout(function() {
    if (mainMap) {
      mainMap.setView([lat, lng], 16);
      setDestination(lat, lng);
    }
  }, 500);
  
  showToast('📍 عرض على الخريطة');
}

// ============================================
// بدء الطلب (للمندوب)
// ============================================
function startOrder(orderId) {
  var orderLocations = {
    1234: { 
      pharmacy: { lat: 33.3000, lng: 44.4000, name: 'صيدلية النور' },
      customer: { lat: 33.3152, lng: 44.3661, name: 'أحمد علي - الجادرية' }
    },
    1235: { 
      pharmacy: { lat: 33.2800, lng: 44.3800, name: 'صيدلية الحياة' },
      customer: { lat: 33.3200, lng: 44.3700, name: 'سارة محمد - الكرادة' }
    },
    1236: { 
      pharmacy: { lat: 33.3300, lng: 44.3500, name: 'صيدلية الشفاء' },
      customer: { lat: 33.3100, lng: 44.3900, name: 'علي حسن - الكاظمية' }
    }
  };
  
  var order = orderLocations[orderId];
  if (!order) {
    showToast('⚠️ الطلب غير موجود');
    return;
  }
  
  localStorage.setItem('saydaliyati_active_order', JSON.stringify({
    id: orderId,
    pharmacy: order.pharmacy,
    customer: order.customer,
    stage: 'pickup'
  }));
  
  if (navigator.vibrate) navigator.vibrate([50]);
  
  openNavSheet(order.pharmacy.lat, order.pharmacy.lng, order.pharmacy.name);
  
  showToast('📍 الوجهة: ' + order.pharmacy.name);
}

function goToPickup() {
  var activeOrder = JSON.parse(localStorage.getItem('saydaliyati_active_order') || '{}');
  if (!activeOrder.pharmacy) {
    showToast('⚠️ لا يوجد طلب نشط');
    return;
  }
  
  openNavSheet(activeOrder.pharmacy.lat, activeOrder.pharmacy.lng, activeOrder.pharmacy.name);
}

function goToCustomer() {
  var activeOrder = JSON.parse(localStorage.getItem('saydaliyati_active_order') || '{}');
  if (!activeOrder.customer) {
    showToast('⚠️ لا يوجد طلب نشط');
    return;
  }
  
  openNavSheet(activeOrder.customer.lat, activeOrder.customer.lng, activeOrder.customer.name);
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
    
    // إنشاء جزيئات شاشة الدخول إذا كانت هي المفتوحة
    if (screenId === 'loginScreen') {
      setTimeout(createLoginParticles, 100);
    }
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
// تبديل التبويب (بدون زر "طلباتي")
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
    goToMyOrders();
  } else if (tab === 'notifications') {
    openNotifications();
  } else if (tab === 'more') {
    openSidebar();
  }
}

// ============================================
// طلباتي الديناميكية
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
// الصيدلية: قبول / رفض
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
// فتح الملف الشخصي
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
// تعديل البيانات
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
// عرض تقييماتي
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
// فتح الطلبات (السجل)
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
// التنبيهات الديناميكية
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
    subtitleEl.textContent = notifs.length + ' إشعار';
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
    var unreadClass = n.read ? '' : ' unread';
    html += 
      '<div class="notif-card' + unreadClass + '">' +
        '<div class="notif-icon">' + (n.icon || '🔔') + '</div>' +
        '<div class="notif-content">' +
          '<h4 class="notif-title">' + n.title + '</h4>' +
          '<p class="notif-message">' + n.message + '</p>' +
          '<span class="notif-time">' + (n.time || 'الآن') + '</span>' +
        '</div>' +
      '</div>';
  });
  
  listEl.innerHTML = html;
}

function getDefaultNotifications(userType) {
  if (userType === 'delivery') {
    return [
      { icon: '🚴', title: 'طلب جديد متاح', message: 'صيدلية النور - 2.5 كم - 3,000 دينار', time: 'الآن', read: false },
      { icon: '💰', title: 'أرباح اليوم', message: '12,000 دينار من 12 طلب', time: 'قبل ساعة', read: false },
      { icon: '⭐', title: 'تقييم جديد', message: 'حصلت على 5 نجوم من أحمد علي', time: 'قبل 3 ساعات', read: true }
    ];
  } else if (userType === 'pharmacy') {
    return [
      { icon: '💊', title: 'طلب جديد وارد', message: 'أحمد علي - 23,000 دينار', time: 'الآن', read: false },
      { icon: '⚠️', title: 'تنبيه المخزون', message: '3 أدوية قاربت على الانتهاء', time: 'قبل ساعة', read: false },
      { icon: '⭐', title: 'تقييم جديد', message: 'حصلت على 4.8 من سارة محمد', time: 'قبل 3 ساعات', read: true }
    ];
  } else {
    return [
      { icon: '✅', title: 'تم قبول طلبك', message: 'صيدلية النور قبلت طلبك #1234', time: 'الآن', read: false },
      { icon: '🚴', title: 'المندوب في الطريق', message: 'أحمد محمد سيصل خلال 15 دقيقة', time: 'قبل 5 دقائق', read: false },
      { icon: '🎉', title: 'تم توصيل طلبك', message: 'طلب #1220 وصل بأمان', time: 'قبل 3 أيام', read: true }
    ];
  }
}

// ============================================
// الإعدادات + من نحن + تواصل
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
// عند التحميل + إخفاء Bottom Sheets
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('صيدليتي جاهز');
  
  loadTheme();
  
  // إخفاء جميع Bottom Sheets عند التحميل
  var orderSheet = document.getElementById('orderSheet');
  var orderSheetOverlay = document.getElementById('orderSheetOverlay');
  if (orderSheet) orderSheet.classList.remove('active');
  if (orderSheetOverlay) orderSheetOverlay.classList.remove('active');
  
  var navSheet = document.getElementById('navSheet');
  var navSheetOverlay = document.getElementById('navSheetOverlay');
  if (navSheet) navSheet.classList.remove('active');
  if (navSheetOverlay) navSheetOverlay.classList.remove('active');
  
  // إخفاء جميع النوافذ المنبثقة
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
// منع التكبير
// ============================================
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

// ============================================
// طلب إذن الإشعارات
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
// 📸 نظام طلب الروشتة
// ============================================
var prescriptionImageData = null;

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
  
  var addressInput = document.getElementById('prescriptionAddress');
  if (addressInput && user.address) {
    addressInput.value = user.address;
  }
  
  prescriptionImageData = null;
  resetPrescriptionUpload();
  
  showScreen('prescriptionScreen');
}

function closePrescriptionScreen() {
  showScreen('homeScreen');
}

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
  
  if (!file.type.startsWith('image/')) {
    showError('يجب أن تكون الصورة بصيغة صورة');
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
  
  var orders = JSON.parse(localStorage.getItem('saydaliyati_prescription_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_prescription_orders', JSON.stringify(orders));
  
  addInternalNotification('order', '📸 تم إرسال روشتتك', 'صيدلية ' + (pharmacy || 'قريبة منك') + ' ستتواصل معك');
  
  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'صيدلية ' + (pharmacy || 'قريبة منك') + ' ستتواصل معك خلال دقائق');
  
  prescriptionImageData = null;
  resetPrescriptionUpload();
  
  setTimeout(function() {
    document.getElementById('prescriptionAddress').value = '';
    document.getElementById('prescriptionNotes').value = '';
    document.getElementById('prescriptionPharmacy').value = '';
  }, 500);
}

// ============================================
// 🛒 نظام سلة التسوق
// ============================================
var PHARMACY_INVENTORY = {
  'صيدلية النور': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3000, icon: '💊', stock: 50, desc: 'مسكن للألم وخافض للحرارة' },
    { id: 'P002', name: 'فيتامين C', category: 'فيتامينات', price: 5000, icon: '🍊', stock: 30, desc: 'مكمل غذائي لتقوية المناعة' },
    { id: 'P003', name: 'أموكسيسيلين', category: 'مضاد حيوي', price: 8000, icon: '💉', stock: 20, desc: 'مضاد حيوي واسع المجال' },
    { id: 'P004', name: 'فولتارين', category: 'مسكنات', price: 4500, icon: '💊', stock: 40, desc: 'مسكن للألم والالتهابات' },
    { id: 'P005', name: 'أوميغا 3', category: 'فيتامينات', price: 12000, icon: '🐟', stock: 15, desc: 'مكمل لصحة القلب' },
    { id: 'P006', name: 'شراب كحة', category: 'أطفال', price: 4000, icon: '🍯', stock: 25, desc: 'شراب مهدئ للكحة' }
  ],
  'صيدلية الحياة': [
    { id: 'P001', name: 'بانادول', category: 'مسكنات', price: 3500, icon: '💊', stock: 60, desc: 'مسكن للألم' },
    { id: 'P002', name: 'فيتامين D', category: 'فيتامينات', price: 6000, icon: '☀️', stock: 35, desc: 'لتقوية العظام' },
    { id: 'P003', name: 'أوميبرازول', category: 'ضغط', price: 7000, icon: '💊', stock: 22, desc: 'لعلاج حموضة المعدة' },
    { id: 'P004', name: 'حبوب زنك', category: 'فيتامينات', price: 4500, icon: '⚡', stock: 30, desc: 'لتقوية المناعة' },
    { id: 'P005', name: 'شراب سعال', category: 'أطفال', price: 4500, icon: '🍯', stock: 20, desc: 'للسعال الجاف' }
  ],
  'صيدلية الشفاء': [
    { id: 'P001', name: 'أسبرين', category: 'مسكنات', price: 2500, icon: '💊', stock: 45, desc: 'مسكن ومضاد للالتهاب' },
    { id: 'P002', name: 'ميترونيدازول', category: 'مضاد حيوي', price: 6500, icon: '💉', stock: 18, desc: 'مضاد حيوي للعدوى' },
    { id: 'P003', name: 'حديد + فوليك', category: 'فيتامينات', price: 5500, icon: '🩸', stock: 28, desc: 'لعلاج فقر الدم' },
    { id: 'P004', name: 'مسكن أطفال', category: 'أطفال', price: 3500, icon: '🧸', stock: 32, desc: 'شراب للأطفال' },
    { id: 'P005', name: 'أملوديبين', category: 'ضغط', price: 8000, icon: '💊', stock: 15, desc: 'لعلاج الضغط' }
  ]
};

var cart = [];
var currentModalProduct = null;
var modalQuantity = 1;

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
  
  cart = JSON.parse(localStorage.getItem('saydaliyati_cart') || '[]');
  
  var addressInput = document.getElementById('cartAddress');
  if (addressInput && user.address) {
    addressInput.value = user.address;
  }
  
  var infoBanner = document.getElementById('cartInfoBanner');
  var productsSection = document.getElementById('cartProducts');
  var itemsSection = document.getElementById('cartItemsSection');
  var emptySection = document.getElementById('cartEmpty');
  var summarySection = document.getElementById('cartSummary');
  
  if (infoBanner) infoBanner.style.display = 'flex';
  if (productsSection) productsSection.style.display = 'none';
  if (itemsSection) itemsSection.style.display = 'none';
  if (emptySection) emptySection.style.display = 'block';
  if (summarySection) summarySection.style.display = 'none';
  
  renderCart();
  showScreen('cartScreen');
}

function onPharmacyChange() {
  var pharmacy = document.getElementById('cartPharmacySelect').value;
  
  if (!pharmacy) {
    var infoBanner = document.getElementById('cartInfoBanner');
    var productsSection = document.getElementById('cartProducts');
    if (infoBanner) infoBanner.style.display = 'flex';
    if (productsSection) productsSection.style.display = 'none';
    return;
  }
  
  if (cart.length > 0 && cart[0].pharmacy !== pharmacy) {
    if (!confirm('السلة تحتوي منتجات من صيدلية أخرى. هل تريد مسحها والبدء من جديد؟')) {
      document.getElementById('cartPharmacySelect').value = cart[0].pharmacy;
      return;
    }
    cart = [];
    saveCart();
  }
  
  var infoBanner = document.getElementById('cartInfoBanner');
  var productsSection = document.getElementById('cartProducts');
  if (infoBanner) infoBanner.style.display = 'none';
  if (productsSection) productsSection.style.display = 'block';
  
  renderProducts(pharmacy);
  renderCart();
}

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

function openProductModal(productId, pharmacy) {
  var products = PHARMACY_INVENTORY[pharmacy] || [];
  var product = products.find(function(p) { return p.id === productId; });
  
  if (!product) return;
  
  currentModalProduct = Object.assign({}, product, { pharmacy: pharmacy });
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
  
  if (navigator.vibrate) navigator.vibrate([50]);
}

function renderCart() {
  var itemsEl = document.getElementById('cartItems');
  var emptyEl = document.getElementById('cartEmpty');
  var sectionEl = document.getElementById('cartItemsSection');
  var summaryEl = document.getElementById('cartSummary');
  var subtitleEl = document.getElementById('cartSubtitle');
  var countEl = document.getElementById('cartItemsCount');
  var badgeEl = document.getElementById('cartBadge');
  
  var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
  
  if (badgeEl) {
    badgeEl.textContent = totalItems;
    badgeEl.setAttribute('data-count', totalItems);
  }
  
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
  
  var subtotal = cart.reduce(function(sum, item) {
    return sum + (item.price * item.quantity);
  }, 0);
  var delivery = 3000;
  var total = subtotal + delivery;
  
  document.getElementById('cartSubtotal').textContent = subtotal.toLocaleString() + ' دينار';
  document.getElementById('cartDelivery').textContent = delivery.toLocaleString() + ' دينار';
  document.getElementById('cartTotal').textContent = total.toLocaleString() + ' دينار';
}

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

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم الحذف من السلة');
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('مسح جميع المنتجات من السلة؟')) return;
  
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('تم مسح السلة');
}

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
  
  var orders = JSON.parse(localStorage.getItem('saydaliyati_cart_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('saydaliyati_cart_orders', JSON.stringify(orders));
  
  addInternalNotification('order', '🛒 طلبك #' + orderId, 'في انتظار قبول الصيدلية');
  
  cart = [];
  saveCart();
  updateCartBadge();
  
  playSuccessSound();
  showSuccessMessage('✅ تم إرسال طلبك', 'طلب #' + orderId + ' - ' + pharmacy + ' ستتواصل معك قريباً');
}

// ============================================
// 💊 نظام المخزون
// ============================================
var currentInventoryFilter = 'all';
var currentInventorySearch = '';

function getInventoryKey() {
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (!userStr) return 'saydaliyati_inventory_default';
  var user = JSON.parse(userStr);
  return 'saydaliyati_inventory_' + (user.phone || 'default');
}

function loadInventory() {
  var key = getInventoryKey();
  var inventory = JSON.parse(localStorage.getItem(key) || 'null');
  
  if (!inventory) {
    inventory = [
      { id: 'MED_' + Date.now() + '_1', name: 'بانادول', category: 'مسكنات', price: 3000, stock: 50, icon: '💊', desc: 'مسكن للألم' },
      { id: 'MED_' + Date.now() + '_2', name: 'فيتامين C', category: 'فيتامينات', price: 5000, stock: 30, icon: '🍊', desc: 'مكمل غذائي' },
      { id: 'MED_' + Date.now() + '_3', name: 'أموكسيسيلين', category: 'مضاد حيوي', price: 8000, stock: 5, icon: '💉', desc: 'مضاد حيوي' }
    ];
    saveInventory(inventory);
  }
  
  return inventory;
}

function saveInventory(inventory) {
  var key = getInventoryKey();
  localStorage.setItem(key, JSON.stringify(inventory));
  
  var userStr = localStorage.getItem('saydaliyati_current_user');
  if (userStr && typeof PHARMACY_INVENTORY !== 'undefined') {
    try {
      var user = JSON.parse(userStr);
      var pharmacyName = user.name || 'صيدلية';
      PHARMACY_INVENTORY[pharmacyName] = inventory.map(function(med) {
        return {
          id: med.id, name: med.name, category: med.category,
          price: med.price, icon: med.icon, stock: med.stock, desc: med.desc
        };
      });
    } catch(e) {}
  }
}

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

function renderInventory() {
  var inventory = loadInventory();
  var listEl = document.getElementById('inventoryList');
  var subtitleEl = document.getElementById('inventorySubtitle');
  
  if (!listEl) return;
  
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
  
  var filtered = inventory.filter(function(m) {
    if (currentInventoryFilter === 'available' && m.stock <= 10) return false;
    if (currentInventoryFilter === 'low' && (m.stock === 0 || m.stock > 10)) return false;
    if (currentInventoryFilter === 'out' && m.stock !== 0) return false;
    
    if (currentInventorySearch) {
      var search = currentInventorySearch.toLowerCase();
      if (m.name.toLowerCase().indexOf(search) === -1 && m.category.toLowerCase().indexOf(search) === -1) {
        return false;
      }
    }
    return true;
  });
  
  if (subtitleEl) subtitleEl.textContent = filtered.length + ' من ' + totalMeds + ' دواء';
  
  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">💊</div><h3>لا توجد أدوية</h3><p>اضغط "+ إضافة دواء" للبدء</p></div>';
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
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
          '<button class="medicine-action-btn delete" onclick="deleteMedicine(\'' + med.id + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
  });
  
  listEl.innerHTML = html;
}

function filterInventoryBy(filter, btn) {
  currentInventoryFilter = filter;
  document.querySelectorAll('.inv-filter').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function filterInventory() {
  var input = document.getElementById('inventorySearch');
  currentInventorySearch = input ? input.value.trim() : '';
  renderInventory();
}

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
    btn.classList.toggle('active', btn.textContent.trim() === med.icon);
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
  
  document.querySelectorAll('.icon-option').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
}

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
    showError('السعر والكمية يجب أن يكونا موجبين');
    return;
  }
  
  var inventory = loadInventory();
  
  if (medId) {
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
    var newMed = {
      id: 'MED_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name, category: category, price: price, stock: stock, desc: desc, icon: icon
    };
    inventory.unshift(newMed);
    showToast('✅ تمت إضافة الدواء');
  }
  
  saveInventory(inventory);
  closeMedicineModal();
  renderInventory();
  
  if (navigator.vibrate) navigator.vibrate([50]);
}

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
  
  currentRating = 0;
  
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
  
  document.getElementById('ratingTargetId').value = orderId || '';
  document.getElementById('ratingTargetType').value = targetType;
  document.getElementById('ratingComment').value = '';
  
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

function closeRatingModal() {
  document.getElementById('ratingModal').classList.remove('active');
  document.body.style.overflow = '';
  currentRating = 0;
}

function selectRating(value) {
  currentRating = value;
  
  var stars = document.querySelectorAll('.rating-star');
  stars.forEach(function(star, index) {
    star.classList.toggle('active', index < value);
  });
  
  var textEl = document.getElementById('ratingText');
  var texts = { 1: '😞 سيء جداً', 2: '😕 ضعيف', 3: '😐 مقبول', 4: '😊 جيد', 5: '🤩 ممتاز!' };
  var classes = { 1: 'bad', 2: 'bad', 3: 'medium', 4: 'good', 5: 'good' };
  
  if (textEl) {
    textEl.textContent = texts[value];
    textEl.className = 'rating-text ' + classes[value];
  }
  
  if (navigator.vibrate) navigator.vibrate([30]);
}

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
    targetType: targetType,
    orderId: orderId,
    rating: currentRating,
    comment: comment,
    date: new Date().toISOString()
  };
  
  var ratings = JSON.parse(localStorage.getItem('saydaliyati_ratings') || '[]');
  ratings.unshift(rating);
  localStorage.setItem('saydaliyati_ratings', JSON.stringify(ratings));
  
  addInternalNotification('system', '⭐ شكراً لتقييمك', 'قيّمت ' + targetName + ' بـ ' + currentRating + ' نجوم');
  
  playSuccessSound();
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  
  closeRatingModal();
  showToast('⭐ شكراً لتقييمك ' + targetName);
  
  if (document.getElementById('profileScreen').classList.contains('active')) {
    renderMyRatings();
  }
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

var PHARMACY_LOCATIONS = {
  'صيدلية النور': [33.3000, 44.4000],
  'صيدلية الحياة': [33.2800, 44.3800],
  'صيدلية الشفاء': [33.3300, 44.3500]
};

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

function initMainMap() {
  var mapEl = document.getElementById('leafletMap');
  if (!mapEl) return;
  
  if (mainMap) mainMap.remove();
  
  mainMap = L.map('leafletMap').setView(BAGHDAD_CENTER, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(mainMap);
  
  var loading = document.getElementById('mapLoading');
  if (loading) loading.style.display = 'none';
  
  addPharmacyMarkers();
  console.log('✅ تم تحميل الخريطة');
}

function requestMyLocation() {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم GPS');
    updateGpsInfo(null);
    return;
  }
  
  var subtitleEl = document.getElementById('mapSubtitle');
  if (subtitleEl) subtitleEl.textContent = 'جارٍ تحديد موقعك...';
  
  navigator.geolocation.getCurrentPosition(
    function(position) {
      myLocation = [position.coords.latitude, position.coords.longitude];
      
      updateGpsInfo(position);
      addMyLocationMarker();
      
      if (mainMap) mainMap.setView(myLocation, 15);
      
      if (subtitleEl) subtitleEl.textContent = 'تم تحديد موقعك ✅';
    },
    function(error) {
      myLocation = BAGHDAD_CENTER;
      updateGpsInfo(null);
      addMyLocationMarker();
      
      if (subtitleEl) subtitleEl.textContent = 'تعذّر تحديد الموقع - استخدمنا بغداد';
      showToast('⚠️ تعذّر تحديد موقعك');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

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

function addMyLocationMarker() {
  if (!mainMap || !myLocation) return;
  
  if (myMarker) mainMap.removeLayer(myMarker);
  
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

function loadNearbyOrders() {
  var listEl = document.getElementById('nearbyOrdersList');
  var countEl = document.getElementById('nearbyCount');
  if (!listEl) return;
  
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

function focusOnOrder(lat, lng, orderId) {
  if (!mainMap) return;
  
  mainMap.setView([lat, lng], 16);
  
  var orderIcon = L.divIcon({
    className: 'custom-map-marker marker-patient',
    html: '<div class="custom-marker-pin"><span>🏠</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  L.marker([lat, lng], { icon: orderIcon })
    .addTo(mainMap)
    .bindPopup('<strong>طلب #' + orderId + '</strong><br>موقع التسليم')
    .openPopup();
  
  drawRoute(myLocation, [lat, lng]);
  showToast('📍 تم تحديد موقع الطلب #' + orderId);
}

function drawRoute(from, to) {
  if (!mainMap || !from || !to) return;
  
  if (routeLine) mainMap.removeLayer(routeLine);
  
  routeLine = L.polyline([from, to], {
    color: '#2563EB',
    weight: 4,
    opacity: 0.7,
    dashArray: '10, 10',
    lineCap: 'round'
  }).addTo(mainMap);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

function showAllOrders() {
  if (!mainMap || !myLocation) return;
  
  var orders = [
    { lat: 33.3000, lng: 44.4000 },
    { lat: 33.2800, lng: 44.3800 },
    { lat: 33.3300, lng: 44.3500 }
  ];
  
  orders.forEach(function(order) {
    drawRoute(myLocation, [order.lat, order.lng]);
  });
  
  var group = new L.featureGroup([
    L.marker(myLocation),
    L.marker([33.3000, 44.4000]),
    L.marker([33.2800, 44.3800]),
    L.marker([33.3300, 44.3500])
  ]);
  
  mainMap.fitBounds(group.getBounds().pad(0.2));
  showToast('🗺️ عرض كل الطلبات');
}

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
  
  var nameEl = document.getElementById('trackingDeliveryName');
  if (nameEl) nameEl.textContent = deliveryName;
  
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
  
  var patientLoc = [33.3152, 44.3661];
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
  var deliveryMarker = L.marker([midLat, midLng], { icon: deliveryIcon })
    .addTo(trackingMap)
    .bindPopup('<strong>المندوب</strong><br>في الطريق')
    .openPopup();
  
  L.polyline([pharmacyLoc, [midLat, midLng], patientLoc], {
    color: '#10B981', weight: 4, opacity: 0.7
  }).addTo(trackingMap);
  
  var group = new L.featureGroup([
    L.marker(patientLoc), L.marker(pharmacyLoc), L.marker([midLat, midLng])
  ]);
  trackingMap.fitBounds(group.getBounds().pad(0.2));
  
  simulateDeliveryMovement(deliveryMarker, [midLat, midLng], patientLoc);
}

function simulateDeliveryMovement(marker, start, end) {
  var steps = 30;
  var currentStep = 0;
  
  var interval = setInterval(function() {
    currentStep++;
    if (currentStep > steps) { clearInterval(interval); return; }
    
    var ratio = currentStep / steps;
    var lat = start[0] + (end[0] - start[0]) * ratio;
    var lng = start[1] + (end[1] - start[1]) * ratio;
    
    marker.setLatLng([lat, lng]);
    
    var distance = calculateDistance(lat, lng, end[0], end[1]);
    var eta = Math.max(1, Math.round(distance * 3));
    
    var etaEl = document.getElementById('trackingETA');
    var distEl = document.getElementById('trackingDistance');
    var progEl = document.getElementById('trackingProgressFill');
    
    if (etaEl) etaEl.textContent = eta + ' دقيقة';
    if (distEl) distEl.textContent = distance.toFixed(1) + ' كم';
    if (progEl) progEl.style.width = (40 + (ratio * 55)) + '%';
  }, 2000);
}

function refreshTracking() {
  showToast('🔄 جارٍ تحديث موقع المندوب...');
}

// ============================================
// 🔔 التنبيهات الداخلية + Push
// ============================================
function addInternalNotification(type, title, message) {
  var notif = {
    id: 'NOTIF_' + Date.now(),
    type: type,
    title: title,
    message: message,
    icon: getNotifIcon(type),
    read: false,
    date: new Date().toISOString(),
    time: 'الآن'
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

// ============================================
// إشعارات Push
// ============================================
function sendNotification(options) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
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
      vibrate: options.vibrate || [200, 100, 200],
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

function acceptOrderFromNotification(orderId) {
  showToast('✅ تم قبول الطلب #' + orderId);
  
  var acceptedOrders = JSON.parse(localStorage.getItem('saydaliyati_accepted_orders') || '[]');
  acceptedOrders.unshift({ id: orderId, acceptedAt: new Date().toISOString() });
  localStorage.setItem('saydaliyati_accepted_orders', JSON.stringify(acceptedOrders));
  
  addInternalNotification('accepted', '✅ تم قبول الطلب #' + orderId, 'جاري التوصيل');
  updateNotifBadge();
}

function scrollToOrderAndHighlight(orderId) {
  var cards = document.querySelectorAll('.priority-card, .order-card, .delivery-order-card');
  cards.forEach(function(card) {
    var text = card.textContent || '';
    if (text.indexOf('#' + orderId) !== -1) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(function() { card.classList.remove('highlighted'); }, 3000);
    }
  });
}

function checkUrlForOrder() {
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  var action = params.get('action');
  
  if (orderId) {
    console.log('🎯 orderId من URL:', orderId, '| action:', action);
    
    if (action === 'accept') acceptOrderFromNotification(orderId);
    
    setTimeout(function() {
      goToMyOrders();
      setTimeout(function() { scrollToOrderAndHighlight(orderId); }, 500);
    }, 300);
    
    window.history.replaceState({}, '', '/');
  }
}

// ============================================
// نظام الرادار الخلفي
// ============================================
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
    }
    return permission;
  });
}

// ============================================
// عند التحميل
// ============================================
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
  
  updateNotifBadge();
});

var originalToggleRadar = window.toggleRadar;
window.toggleRadar = function() {
  if (originalToggleRadar) originalToggleRadar.apply(this, arguments);
  
  if (radarActive) {
    if (Notification.permission !== 'granted') {
      requestNotificationPermission();
    }
    startRadarSystem();
  } else {
    stopRadarSystem();
  }
};

var originalLogout = window.logout;
window.logout = function() {
  stopRadarSystem();
  if (originalLogout) originalLogout.apply(this, arguments);
};

// ============================================
// نهاية الملف
// ============================================
console.log('صيدليتي - اكتمل التحميل v9');
