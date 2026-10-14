// ============================================
// ⚙️ SCRIPT.JS — وظائف تطبيق وصّلها
// ============================================

console.log('🚀 Wassilha v1.0 loading...');

// ═══════════════════════════════════════
// 🎯 Global State
// ═══════════════════════════════════════
let currentUser = null;
let currentRole = 'customer';
let currentOrder = null;
let otpTimer = null;
let otpSeconds = 60;
let currentOTPPhone = '';
let currentOTPCode = '';
let selectedPackageType = 'normal';
let driverOnline = false;
let driverWatchId = null;
let trackingMap = null;

// ═══════════════════════════════════════
// 📱 Screens Management
// ═══════════════════════════════════════
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  
  const target = document.getElementById(screenId);
  if (!target) {
    console.error('Screen not found:', screenId);
    return;
  }
  
  target.classList.add('active');
  target.style.display = 'flex';
  window.scrollTo(0, 0);
  
  console.log('✅ Screen:', screenId);
}

// ═══════════════════════════════════════
// 🎬 Splash → Auto Navigate
// ═══════════════════════════════════════
function initSplash() {
  createParticles();
  
  setTimeout(async () => {
    // فحص المستخدم المحفوظ
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.user);
    
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        console.log('✅ User found:', currentUser.name);
        
        // تحديث الحالة
        if (currentUser.role === 'customer') {
          showScreen('homeScreen');
          loadHomeData();
        } else if (currentUser.role === 'driver') {
          showScreen('driverScreen');
          loadDriverData();
        }
      } catch (e) {
        console.error('Invalid user:', e);
        showScreen('loginScreen');
      }
    } else {
      showScreen('loginScreen');
    }
  }, 2500);
}

// ═══════════════════════════════════════
// ✨ Splash Particles
// ═══════════════════════════════════════
function createParticles() {
  const container = document.getElementById('splashParticles');
  if (!container) return;
  
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'splash-particle';
    const size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

// ═══════════════════════════════════════
// 🔐 Login Flow
// ═══════════════════════════════════════
async function handleLogin(e) {
  e.preventDefault();
  
  const phone = document.getElementById('loginPhone').value.trim();
  
  if (!validatePhone(phone)) {
    showToast('⚠️ رقم الهاتف غير صحيح');
    return;
  }
  
  // فحص المستخدم موجود
  const result = await DB.getUserByPhone(phone);
  
  if (!result.success || !result.user) {
    showToast('⚠️ الرقم غير مسجل — سجل حساب جديد');
    setTimeout(() => goToRoleSelection(), 1000);
    return;
  }
  
  // إرسال OTP
  await sendOTPForLogin(phone);
}

async function sendOTPForLogin(phone) {
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري الإرسال...</span>';
  
  const result = await DB.sendOTP(phone);
  
  btn.disabled = false;
  btn.innerHTML = '<span>متابعة</span>';
  
  if (!result.success) {
    showToast('❌ فشل إرسال الكود');
    return;
  }
  
  currentOTPPhone = phone;
  currentOTPCode = result.code;
  
  // عرض كود التطوير (للتطبيق الفعلي نستخدم SMS)
  console.log('🔑 OTP:', result.code);
  showToast('📱 الكود: ' + result.code); // للتطوير فقط
  
  document.getElementById('otpPhone').textContent = phone;
  goToOTPScreen();
}

// ═══════════════════════════════════════
// 📱 OTP Screen
// ═══════════════════════════════════════
function goToOTPScreen() {
  showScreen('otpScreen');
  startOTPTimer();
  setupOTPInputs();
  
  setTimeout(() => {
    document.querySelector('.otp-input')?.focus();
  }, 300);
}

function setupOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  
  inputs.forEach((input, index) => {
    input.value = '';
    
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      if (value.length === inputs.length) {
        // تلقائي التحقق عند اكتمال
        setTimeout(() => handleVerifyOTP(), 300);
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

async function handleVerifyOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  const code = Array.from(inputs).map(i => i.value).join('');
  
  if (code.length !== 4) {
    showToast('⚠️ أدخل الكود كاملاً');
    return;
  }
  
  const btn = document.getElementById('verifyBtn');
  btn.disabled = true;
  btn.textContent = 'جاري التحقق...';
  
  const result = await DB.verifyOTP(currentOTPPhone, code);
  
  if (!result.success) {
    btn.disabled = false;
    btn.textContent = 'تحقق';
    showToast('❌ ' + result.error);
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
    return;
  }
  
  // نجح — جلب المستخدم
  const userResult = await DB.getUserByPhone(currentOTPPhone);
  
  if (userResult.success && userResult.user) {
    currentUser = userResult.user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
    
    showToast('✅ أهلاً ' + currentUser.name);
    
    setTimeout(() => {
      if (currentUser.role === 'customer') {
        showScreen('homeScreen');
        loadHomeData();
      } else if (currentUser.role === 'driver') {
        showScreen('driverScreen');
        loadDriverData();
      }
    }, 800);
  }
}

function startOTPTimer() {
  otpSeconds = 60;
  const timerEl = document.getElementById('otpTimer');
  const resendBtn = document.getElementById('resendBtn');
  
  if (otpTimer) clearInterval(otpTimer);
  resendBtn.disabled = true;
  
  timerEl.textContent = otpSeconds;
  
  otpTimer = setInterval(() => {
    otpSeconds--;
    timerEl.textContent = otpSeconds;
    
    if (otpSeconds <= 0) {
      clearInterval(otpTimer);
      resendBtn.disabled = false;
    }
  }, 1000);
}

async function handleResendOTP() {
  const result = await DB.sendOTP(currentOTPPhone);
  
  if (result.success) {
    currentOTPCode = result.code;
    showToast('📱 الكود: ' + result.code);
    startOTPTimer();
  } else {
    showToast('❌ فشل الإرسال');
  }
}

// ═══════════════════════════════════════
// 👥 Role Selection
// ═══════════════════════════════════════
function goToRoleSelection() {
  showScreen('roleScreen');
}

function selectRole(role) {
  currentRole = role;
  
  const title = document.getElementById('registerTitle');
  const subtitle = document.getElementById('registerSubtitle');
  const vehicleField = document.getElementById('vehicleField');
  
  if (role === 'customer') {
    title.textContent = 'تسجيل عميل';
    subtitle.textContent = 'اطلب توصيل لأي مكان';
    vehicleField.style.display = 'none';
  } else {
    title.textContent = 'تسجيل مندوب';
    subtitle.textContent = 'استقبل طلبات واكسب';
    vehicleField.style.display = 'flex';
  }
  
  showScreen('registerScreen');
}

// ═══════════════════════════════════════
// 📝 Register
// ═══════════════════════════════════════
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const vehicle = document.getElementById('registerVehicle').value;
  const terms = document.getElementById('termsCheckbox').checked;
  
  // التحقق
  if (!name || name.length < 3) {
    showToast('⚠️ الاسم قصير جداً');
    return;
  }
  
  if (!validatePhone(phone)) {
    showToast('⚠️ رقم الهاتف غير صحيح');
    return;
  }
  
  if (password.length < 6) {
    showToast('⚠️ كلمة المرور 6 أحرف على الأقل');
    return;
  }
  
  if (currentRole === 'driver' && !vehicle) {
    showToast('⚠️ اختر نوع المركبة');
    return;
  }
  
  if (!terms) {
    showToast('⚠️ وافق على الشروط');
    return;
  }
  
  // فحص الرقم موجود
  const existing = await DB.getUserByPhone(phone);
  if (existing.success && existing.user) {
    showToast('⚠️ الرقم مسجل مسبقاً');
    return;
  }
  
  // إنشاء المستخدم
  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري التسجيل...</span>';
  
  const result = await DB.createUser({
    name: name,
    phone: phone,
    role: currentRole
  });
  
  if (!result.success) {
    btn.disabled = false;
    btn.innerHTML = '<span>إنشاء الحساب</span>';
    showToast('❌ فشل التسجيل: ' + result.error);
    return;
  }
  
  // إنشاء ملف مندوب إذا لزم
  if (currentRole === 'driver') {
    await DB.createDriverProfile(result.user.id, vehicle);
  }
  
  // إنشاء محفظة
  await DB.getWallet(result.user.id);
  
  // حفظ المستخدم
  currentUser = result.user;
  currentUser.password = password; // للتطوير فقط
  localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
  
  btn.disabled = false;
  btn.innerHTML = '<span>إنشاء الحساب</span>';
  
  showToast('✅ تم إنشاء حسابك!');
  
  setTimeout(() => {
    if (currentRole === 'customer') {
      showScreen('homeScreen');
      loadHomeData();
    } else {
      showScreen('driverScreen');
      loadDriverData();
    }
  }, 1000);
}

// ═══════════════════════════════════════
// 🏠 Home Functions
// ═══════════════════════════════════════
async function loadHomeData() {
  if (!currentUser) return;
  
  // الاسم
  document.getElementById('homeUserName').textContent = currentUser.name;
  document.getElementById('homeAvatarLetter').textContent = currentUser.name.charAt(0);
  
  // الموقع
  const loc = localStorage.getItem('wassilha_location') || 'الرصافة، بغداد';
  document.getElementById('homeLocation').textContent = loc;
  
  // الطلبات
  await loadUserOrders();
}

async function loadUserOrders() {
  const list = document.getElementById('homeOrdersList');
  if (!list) return;
  
  const result = await DB.getUserOrders(currentUser.id);
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h4>لا توجد طلبات بعد</h4>
        <p>ابدأ أول طلب لك الآن</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = result.orders.slice(0, 3).map(o => renderOrderCard(o)).join('');
}

function renderOrderCard(order) {
  const statusMap = {
    'pending': { label: 'قيد الانتظار', class: 'pending' },
    'accepted': { label: 'تم القبول', class: 'accepted' },
    'picked_up': { label: 'في الطريق', class: 'picked_up' },
    'delivered': { label: 'تم التوصيل', class: 'delivered' },
    'cancelled': { label: 'ملغي', class: 'cancelled' }
  };
  
  const status = statusMap[order.status] || statusMap.pending;
  
  return `
    <div class="order-card-item status-${order.status}" onclick="openTracking('${order.id}')">
      <div class="order-card-header">
        <div>
          <div class="order-card-number">طلب #${order.order_number || '—'}</div>
          <div class="order-card-date">${formatDate(order.created_at)}</div>
        </div>
        <span class="order-status-badge ${status.class}">${status.label}</span>
      </div>
      <div class="order-route">
        <div class="order-route-item">📍 <strong>${order.pickup_address || '—'}</strong></div>
        <div class="order-route-item">🎯 <strong>${order.dropoff_address || '—'}</strong></div>
      </div>
      <div class="order-card-footer">
        <span class="order-price">${(order.total_price || 0).toLocaleString()}<small>د.ع</small></span>
        <div class="order-card-actions">
          <button class="order-action-btn primary">تتبع</button>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════
// 🛵 New Order
// ═══════════════════════════════════════
function openNewOrder() {
  showScreen('newOrderScreen');
  resetOrderForm();
}

function resetOrderForm() {
  document.getElementById('orderFrom').value = '';
  document.getElementById('orderTo').value = '';
  document.getElementById('orderNotes').value = '';
  document.getElementById('previewDistance').textContent = '— كم';
  document.getElementById('previewKmCost').textContent = '— د.ع';
  document.getElementById('previewTotal').textContent = '— د.ع';
  selectedPackageType = 'normal';
  
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.type-chip[data-type="normal"]')?.classList.add('active');
}

function selectPackageType(type, btn) {
  selectedPackageType = type;
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('⚠️ المتصفح لا يدعم GPS');
    return;
  }
  
  showToast('📍 جاري تحديد موقعك...');
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
        const data = await res.json();
        const address = data.address?.suburb || data.address?.city || 'موقعك الحالي';
        
        document.getElementById('orderFrom').value = address;
        localStorage.setItem('wassilha_location', address);
        localStorage.setItem('wassilha_location_coords', JSON.stringify({ lat, lng }));
        
        showToast('✅ تم تحديد موقعك');
      } catch (e) {
        document.getElementById('orderFrom').value = 'موقعك الحالي';
        localStorage.setItem('wassilha_location_coords', JSON.stringify({ lat, lng }));
      }
    },
    () => showToast('⚠️ تعذّر تحديد موقعك'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function openAddressPicker() {
  const address = prompt('أدخل عنوان الوصول:');
  if (address && address.trim()) {
    document.getElementById('orderTo').value = address.trim();
    calculatePreviewPrice();
  }
}

function calculatePreviewPrice() {
  const distance = Math.floor(Math.random() * 8) + 2; // للتطوير — نستخدم مسافة عشوائية
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.pricePerKm;
  const total = Math.max(base + kmCost, CONFIG.PRICING.minPrice);
  
  document.getElementById('previewDistance').textContent = distance + ' كم';
  document.getElementById('previewKmCost').textContent = kmCost.toLocaleString() + ' د.ع';
  document.getElementById('previewTotal').textContent = total.toLocaleString() + ' د.ع';
}

async function submitOrder() {
  const from = document.getElementById('orderFrom').value.trim();
  const to = document.getElementById('orderTo').value.trim();
  
  if (!from) {
    showToast('⚠️ حدد مكان الانطلاق');
    return;
  }
  
  if (!to) {
    showToast('⚠️ حدد مكان الوصول');
    return;
  }
  
  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري الإرسال...</span>';
  
  const distance = Math.floor(Math.random() * 8) + 2;
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.pricePerKm;
  const total = Math.max(base + kmCost, CONFIG.PRICING.minPrice);
  const driverShare = Math.round(total * CONFIG.PRICING.driverShare);
  const platformShare = total - driverShare;
  
  const result = await DB.createOrder({
    customerId: currentUser.id,
    pickupAddress: from,
    dropoffAddress: to,
    packageType: selectedPackageType,
    notes: document.getElementById('orderNotes').value,
    distance: distance,
    basePrice: base,
    totalPrice: total,
    driverShare: driverShare,
    platformShare: platformShare
  });
  
  btn.disabled = false;
  btn.innerHTML = '<span>🛵 إرسال الطلب</span>';
  
  if (!result.success) {
    showToast('❌ فشل إرسال الطلب: ' + result.error);
    return;
  }
  
  showToast('✅ تم إرسال طلبك!');
  
  // إشعار
  await DB.createNotification(
    currentUser.id,
    '🛵 تم إرسال طلبك',
    'في انتظار قبول مندوب',
    'order'
  );
  
  setTimeout(() => {
    openTracking(result.order.id);
  }, 1000);
}

// ═══════════════════════════════════════
// 📋 Orders List
// ═══════════════════════════════════════
async function loadOrdersList() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  
  const result = await DB.getUserOrders(currentUser.id);
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h4>لا توجد طلبات</h4>
        <p>ستظهر طلباتك هنا</p>
        <button class="btn-primary btn-small" onclick="openNewOrder()">ابدأ طلب</button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = result.orders.map(o => renderOrderCard(o)).join('');
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // TODO: filter logic
  loadOrdersList();
}

// ═══════════════════════════════════════
// 🗺️ Tracking
// ═══════════════════════════════════════
async function openTracking(orderId) {
  showScreen('trackingScreen');
  
  // جلب الطلب
  const result = await DB.getUserOrders(currentUser.id);
  const order = result.orders?.find(o => o.id === orderId);
  
  if (!order) {
    showToast('⚠️ الطلب غير موجود');
    goHome();
    return;
  }
  
  currentOrder = order;
  
  document.getElementById('trackingOrderId').textContent = order.order_number || '—';
  
  // Timeline
  const steps = ['created', 'accepted', 'pickedup', 'delivered'];
  const statusIndex = {
    'pending': 0,
    'accepted': 1,
    'picked_up': 2,
    'delivered': 3
  };
  
  const currentIndex = statusIndex[order.status] ?? 0;
  
  steps.forEach((step, i) => {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;
    
    if (i < currentIndex) {
      el.className = 'timeline-step done';
      el.querySelector('.step-dot').textContent = '✓';
    } else if (i === currentIndex) {
      el.className = 'timeline-step active';
      el.querySelector('.step-dot').textContent = '●';
    } else {
      el.className = 'timeline-step';
      el.querySelector('.step-dot').textContent = '○';
    }
  });
  
  // ETA
  document.getElementById('trackingETA').textContent = 
    order.status === 'delivered' ? 'تم التوصيل ✅' : 'يصل خلال 15 دقيقة';
  
  // Map
  setTimeout(() => initTrackingMap(order), 300);
}

function initTrackingMap(order) {
  const mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  
  if (trackingMap) {
    trackingMap.remove();
    trackingMap = null;
  }
  
  if (typeof L === 'undefined') return;
  
  const userCoords = JSON.parse(localStorage.getItem('wassilha_location_coords') || 'null');
  const center = userCoords ? [userCoords.lat, userCoords.lng] : [33.3152, 44.3661];
  
  trackingMap = L.map('trackingMap').setView(center, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(trackingMap);
  
  // Marker للموقع
  L.marker(center).addTo(trackingMap).bindPopup('موقعك');
  
  // Marker للمندوب (وهمي للتطوير)
  const driverCoords = [center[0] + 0.005, center[1] + 0.005];
  L.marker(driverCoords, {
    icon: L.divIcon({
      className: 'marker-driver',
      html: '<div style="font-size:30px;">🛵</div>',
      iconSize: [40, 40]
    })
  }).addTo(trackingMap).bindPopup('المندوب');
  
  setTimeout(() => trackingMap.invalidateSize(), 300);
}

// ═══════════════════════════════════════
// 🛵 Driver Functions
// ═══════════════════════════════════════
async function loadDriverData() {
  if (!currentUser) return;
  
  document.getElementById('driverName').textContent = currentUser.name;
  document.getElementById('driverAvatarLetter').textContent = currentUser.name.charAt(0);
  
  // جلب الطلبات المتاحة
  await loadAvailableOrders();
}

async function toggleDriverOnline() {
  driverOnline = !driverOnline;
  
  const card = document.getElementById('driverToggleCard');
  const title = document.getElementById('toggleTitle');
  const subtitle = document.getElementById('toggleSubtitle');
  const btn = document.getElementById('toggleBtn');
  const status = document.getElementById('driverStatus');
  
  if (driverOnline) {
    card.classList.add('online');
    title.textContent = '🟢 متصل الآن';
    subtitle.textContent = 'جاري البحث عن طلبات...';
    btn.textContent = 'إيقاف';
    btn.classList.add('online');
    status.textContent = 'متصل الآن';
    
    showToast('✅ أنت متصل — استقبل الطلبات');
    
    // تحديث Supabase
    await DB.updateDriverStatus(currentUser.id, true, 33.3152, 44.3661);
    
    // محاكاة وصول طلبات
    startDriverSimulation();
  } else {
    card.classList.remove('online');
    title.textContent = '🔴 غير متصل';
    subtitle.textContent = 'فعّل الاتصال لاستقبال الطلبات';
    btn.textContent = 'ابدأ العمل';
    btn.classList.remove('online');
    status.textContent = 'غير متصل';
    
    showToast('⏹️ تم إيقاف الاستقبال');
    
    await DB.updateDriverStatus(currentUser.id, false);
  }
}

function startDriverSimulation() {
  // للتطوير — نعرض طلبات تجريبية
  setTimeout(() => {
    if (driverOnline) loadAvailableOrders();
  }, 2000);
}

async function loadAvailableOrders() {
  const list = document.getElementById('driverOrdersList');
  const count = document.getElementById('ordersCount');
  
  if (!list) return;
  
  const result = await DB.getAvailableOrders();
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📡</div>
        <h4>لا توجد طلبات</h4>
        <p>فعّل الاتصال لاستقبال الطلبات</p>
      </div>
    `;
    if (count) count.textContent = '0';
    return;
  }
  
  if (count) count.textContent = result.orders.length;
  
  list.innerHTML = result.orders.map(o => renderAvailableOrder(o)).join('');
}

function renderAvailableOrder(order) {
  const distance = 1 + Math.random() * 5;
  const badgeClass = distance < 2 ? 'ultra' : distance < 5 ? 'near' : 'medium';
  const badgeLabel = distance < 2 ? '🟢 قريب جداً' : distance < 5 ? '🟡 قريب' : '🟠 متوسط';
  
  return `
    <div class="available-order-card near-${badgeClass}">
      <div class="order-card-header">
        <div>
          <div class="order-card-number">طلب #${order.order_number || '—'}</div>
          <div class="order-card-date">${formatDate(order.created_at)}</div>
        </div>
        <span class="order-distance-badge ${badgeClass}">${badgeLabel} (${distance.toFixed(1)} كم)</span>
      </div>
      <div class="order-route">
        <div class="order-route-item">📍 <strong>${order.pickup_address || '—'}</strong></div>
        <div class="order-route-item">🎯 <strong>${order.dropoff_address || '—'}</strong></div>
      </div>
      <div class="order-card-footer">
        <span class="order-price">${(order.total_price || 0).toLocaleString()}<small>د.ع</small></span>
        <div class="order-card-actions">
          <button class="order-action-btn primary" onclick="acceptOrder('${order.id}')">✅ قبول</button>
        </div>
      </div>
    </div>
  `;
}

async function acceptOrder(orderId) {
  const result = await DB.acceptOrder(orderId, currentUser.id);
  
  if (!result.success) {
    showToast('❌ فشل قبول الطلب');
    return;
  }
  
  showToast('✅ تم قبول الطلب — توجه للموقع');
  
  // إشعار للعميل
  if (result.order?.customer_id) {
    await DB.createNotification(
      result.order.customer_id,
      '✅ تم قبول طلبك',
      currentUser.name + ' في الطريق',
      'order'
    );
  }
  
  await loadAvailableOrders();
}

// ═══════════════════════════════════════
// 👤 Profile
// ═══════════════════════════════════════
async function openProfile() {
  showScreen('profileScreen');
  
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profilePhone').textContent = currentUser.phone;
  document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0);
  
  // عدد الطلبات
  const result = await DB.getUserOrders(currentUser.id);
  document.getElementById('profileOrderCount').textContent = 
    result.success ? result.orders.length : 0;
}

// ═══════════════════════════════════════
// 🎯 Navigation
// ═══════════════════════════════════════
function goHome() {
  if (currentUser?.role === 'driver') {
    showScreen('driverScreen');
    loadDriverData();
  } else {
    showScreen('homeScreen');
    loadHomeData();
  }
}

function goToLogin() {
  showScreen('loginScreen');
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-tab="${tab}"]`)?.classList.add('active');
  
  if (tab === 'home') {
    showScreen('homeScreen');
    loadHomeData();
  } else if (tab === 'orders') {
    showScreen('ordersScreen');
    loadOrdersList();
  } else if (tab === 'profile') {
    openProfile();
  }
}

// ═══════════════════════════════════════
// 🚪 Logout
// ═══════════════════════════════════════
async function handleLogout() {
  if (!confirm('هل تريد تسجيل الخروج؟')) return;
  
  localStorage.removeItem(CONFIG.STORAGE_KEYS.user);
  currentUser = null;
  showToast('✅ تم تسجيل الخروج');
  setTimeout(() => showScreen('loginScreen'), 500);
}

// ═══════════════════════════════════════
// 🛠️ Utilities
// ═══════════════════════════════════════
function validatePhone(phone) {
  return /^07[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000);
  
  if (diff < 1) return 'الآن';
  if (diff < 60) return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
  return date.toLocaleDateString('ar-IQ');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<span>🙈</span>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<span>👁️</span>';
  }
}

// ═══════════════════════════════════════
// 🚀 Initialize
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Wassilha initialized');
  
  // فحص Supabase
  window.addEventListener('supabase-ready', () => {
    console.log('✅ Supabase ready');
  });
  
  // بدء Splash
  initSplash();
});

// ═══════════════════════════════════════
// 🌐 Global Functions
// ═══════════════════════════════════════
window.showScreen = showScreen;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleVerifyOTP = handleVerifyOTP;
window.handleResendOTP = handleResendOTP;
window.goToRoleSelection = goToRoleSelection;
window.goToLogin = goToLogin;
window.goHome = goHome;
window.selectRole = selectRole;
window.switchTab = switchTab;
window.openNewOrder = openNewOrder;
window.useCurrentLocation = useCurrentLocation;
window.openAddressPicker = openAddressPicker;
window.selectPackageType = selectPackageType;
window.submitOrder = submitOrder;
window.filterOrders = filterOrders;
window.openTracking = openTracking;
window.openProfile = openProfile;
window.toggleDriverOnline = toggleDriverOnline;
window.acceptOrder = acceptOrder;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.showToast = showToast;

console.log('✅ Script.js loaded');
