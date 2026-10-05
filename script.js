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
// 🎨 إنشاء جزيئات شاشة تسجيل الدخول
// ============================================
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
