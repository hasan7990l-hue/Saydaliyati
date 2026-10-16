// ============================================
// ⚙️ SCRIPT.JS — Wassilha App Logic v3
// ============================================

console.log('🚀 Wassilha v3.0 loading...');

// ═══════════════════════════════════════
// 🎯 Global State
// ═══════════════════════════════════════
let currentUser = null;
let currentRole = 'customer';
let currentOrder = null;
let otpTimer = null;
let otpSeconds = 60;
let currentOTPPhone = '';
let selectedPackageType = 'normal';
let driverOnline = false;
let trackingMap = null;
let mapPickerInstance = null;
let mapPickerMode = 'from';
let mapPickerLocation = null;

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
  
  // إعادة تطبيق اللغة بعد عرض الشاشة
  if (window.Lang) {
    setTimeout(() => Lang.apply(Lang.current()), 50);
  }
}

// ═══════════════════════════════════════
// 🎬 Splash → Auto Navigate
// ═══════════════════════════════════════
function initSplash() {
  // تطبيق اللغة أولاً
  if (window.Lang) Lang.init();
  
  setTimeout(async () => {
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.user);
    
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        
        if (currentUser.role === 'customer') {
          showScreen('homeScreen');
          loadHomeData();
        } else if (currentUser.role === 'driver') {
          showScreen('driverScreen');
          loadDriverData();
        } else {
          showScreen('homeScreen');
          loadHomeData();
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
// 🔐 Login Flow
// ═══════════════════════════════════════
async function handleLogin(e) {
  e.preventDefault();
  
  const phone = document.getElementById('loginPhone').value.trim();
  
  if (!validatePhone(phone)) {
    showToast(t('invalidPhone'));
    return;
  }
  
  const result = await DB.getUserByPhone(phone);
  
  if (!result.success || !result.user) {
    showToast(t('phoneNotRegistered'));
    setTimeout(() => goToRoleSelection(), 1200);
    return;
  }
  
  await sendOTPForLogin(phone);
}

async function sendOTPForLogin(phone) {
  const btn = document.getElementById('loginBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>...</span>';
  
  const result = await DB.sendOTP(phone);
  
  btn.disabled = false;
  btn.innerHTML = originalHTML;
  
  if (!result.success) {
    showToast(t('sendFailed'));
    return;
  }
  
  currentOTPPhone = phone;
  console.log('🔑 OTP:', result.code);
  showToast('📱 ' + t('codeSent') + ': ' + result.code);
  
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
    showToast(t('enterFullCode'));
    return;
  }
  
  const btn = document.getElementById('verifyBtn');
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span>...</span>';
  
  const result = await DB.verifyOTP(currentOTPPhone, code);
  
  if (!result.success) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    showToast(t('wrongCode'));
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
    return;
  }
  
  const userResult = await DB.getUserByPhone(currentOTPPhone);
  
  if (userResult.success && userResult.user) {
    currentUser = userResult.user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
    
    showToast(t('welcomeUser') + ' ' + currentUser.name);
    
    setTimeout(() => {
      if (currentUser.role === 'driver') {
        showScreen('driverScreen');
        loadDriverData();
      } else {
        showScreen('homeScreen');
        loadHomeData();
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
    showToast('📱 ' + t('codeSent') + ': ' + result.code);
    startOTPimer();
  } else {
    showToast(t('sendFailed'));
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
    title.textContent = t('customer');
    subtitle.textContent = t('customerDesc');
    vehicleField.style.display = 'none';
  } else if (role === 'driver') {
    title.textContent = t('driver');
    subtitle.textContent = t('driverDesc');
    vehicleField.style.display = 'flex';
  } else {
    title.textContent = t('store');
    subtitle.textContent = t('storeDesc');
    vehicleField.style.display = 'none';
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
  
  if (!name || name.length < 3) {
    showToast(t('nameTooShort'));
    return;
  }
  
  if (!validatePhone(phone)) {
    showToast(t('invalidPhone'));
    return;
  }
  
  if (password.length < 6) {
    showToast(t('passwordMin'));
    return;
  }
  
  if (currentRole === 'driver' && !vehicle) {
    showToast(t('selectVehicleType'));
    return;
  }
  
  if (!terms) {
    showToast(t('agreeTermsFirst'));
    return;
  }
  
  const existing = await DB.getUserByPhone(phone);
  if (existing.success && existing.user) {
    showToast(t('phoneRegistered'));
    return;
  }
  
  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span>...</span>';
  
  const result = await DB.createUser({
    name: name,
    phone: phone,
    role: currentRole
  });
  
  if (!result.success) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    showToast(t('registerFailed'));
    return;
  }
  
  if (currentRole === 'driver') {
    await DB.createDriverProfile(result.user.id, vehicle);
  }
  
  await DB.getWallet(result.user.id);
  
  currentUser = result.user;
  localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
  
  btn.disabled = false;
  btn.innerHTML = originalHTML;
  
  showToast(t('accountCreated'));
  
  setTimeout(() => {
    if (currentRole === 'driver') {
      showScreen('driverScreen');
      loadDriverData();
    } else {
      showScreen('homeScreen');
      loadHomeData();
    }
  }, 1000);
}

// ═══════════════════════════════════════
// 🏠 Home Functions
// ═══════════════════════════════════════
async function loadHomeData() {
  if (!currentUser) return;
  
  const nameEl = document.getElementById('homeUserName');
  if (nameEl) nameEl.textContent = currentUser.name;
  
  const avatarEl = document.getElementById('homeAvatarLetter');
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0);
  
  const loc = localStorage.getItem(CONFIG.STORAGE_KEYS.location);
  const locEl = document.getElementById('homeLocation');
  if (locEl && loc) locEl.textContent = loc;
  
  await loadUserOrders();
}

async function loadUserOrders() {
  const list = document.getElementById('homeOrdersList');
  if (!list) return;
  
  const result = await DB.getUserOrders(currentUser.id);
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h4>${t('noOrders')}</h4>
        <p>${t('startFirstOrder')}</p>
        <button class="btn-primary btn-small" onclick="openNewOrder()">${t('orderNow')}</button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = result.orders.slice(0, 3).map(o => renderOrderCard(o)).join('');
}

function renderOrderCard(order) {
  const statusMap = {
    'pending': { label: t('pending'), class: 'pending' },
    'accepted': { label: t('accepted'), class: 'accepted' },
    'picked_up': { label: t('pickedUp'), class: 'accepted' },
    'delivered': { label: t('delivered'), class: 'delivered' },
    'cancelled': { label: t('cancelled'), class: 'cancelled' }
  };
  
  const status = statusMap[order.status] || statusMap.pending;
  
  return `
    <div class="order-card-item" onclick="openTracking('${order.id}')">
      <div class="order-card-header">
        <div>
          <div class="order-card-number">${t('order')} #${order.order_number || '—'}</div>
          <div class="order-card-date">${formatDate(order.created_at)}</div>
        </div>
        <span class="order-status-badge ${status.class}">${status.label}</span>
      </div>
      <div class="order-route">
        <div class="order-route-item">📍 <strong>${order.pickup_address || '—'}</strong></div>
        <div class="order-route-item">🎯 <strong>${order.dropoff_address || '—'}</strong></div>
      </div>
      <div class="order-card-footer">
        <span class="order-price">${(order.total_price || 0).toLocaleString()}<small> ${t('balance')}</small></span>
        <button class="order-action-btn primary">${t('track')}</button>
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
  document.getElementById('previewDistance').textContent = '—';
  document.getElementById('previewKmCost').textContent = '—';
  document.getElementById('previewTotal').textContent = '—';
  selectedPackageType = 'normal';
  
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.type-chip[data-type="normal"]')?.classList.add('active');
}

function selectPackageType(type, btn) {
  selectedPackageType = type;
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

function calculatePreviewPrice() {
  const distance = Math.floor(Math.random() * 8) + 2;
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.pricePerKm;
  const total = Math.max(base + kmCost, CONFIG.PRICING.minPrice);
  
  document.getElementById('previewDistance').textContent = distance + ' ' + t('km');
  document.getElementById('previewKmCost').textContent = kmCost.toLocaleString() + ' ' + t('balance');
  document.getElementById('previewTotal').textContent = total.toLocaleString() + ' ' + t('balance');
}

async function submitOrder() {
  const from = document.getElementById('orderFrom').value.trim();
  const to = document.getElementById('orderTo').value.trim();
  
  if (!from) {
    showToast(t('selectPickupFirst'));
    return;
  }
  
  if (!to) {
    showToast(t('selectDropoffFirst'));
    return;
  }
  
  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span>...</span>';
  
  const distance = Math.floor(Math.random() * 8) + 2;
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.perKm;
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
  btn.innerHTML = originalHTML;
  
  if (!result.success) {
    showToast('❌ ' + result.error);
    return;
  }
  
  showToast(t('orderSentSuccess'));
  
  await DB.createNotification(
    currentUser.id,
    '🛵 ' + t('orderSent'),
    t('willContact'),
    'order'
  );
  
  setTimeout(() => {
    openTracking(result.order.id);
  }, 1000);
}

// ═══════════════════════════════════════
// 📋 Orders List
// ═══════════════════════════════════════
function openOrders() {
  showScreen('ordersScreen');
  loadOrdersList();
}

async function loadOrdersList() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  
  const result = await DB.getUserOrders(currentUser.id);
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h4>${t('noOrders')}</h4>
        <p>${t('startFirstOrder')}</p>
        <button class="btn-primary btn-small" onclick="openNewOrder()">${t('orderNow')}</button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = result.orders.map(o => renderOrderCard(o)).join('');
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadOrdersList();
}

// ═══════════════════════════════════════
// 🗺️ Tracking
// ═══════════════════════════════════════
async function openTracking(orderId) {
  showScreen('trackingScreen');
  
  const result = await DB.getUserOrders(currentUser.id);
  const order = result.orders?.find(o => o.id === orderId);
  
  if (!order) {
    showToast(t('orderNotFound'));
    goHome();
    return;
  }
  
  currentOrder = order;
  
  document.getElementById('trackingOrderId').textContent = order.order_number || '—';
  
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
    
    el.classList.remove('done', 'active');
    
    if (i < currentIndex) {
      el.classList.add('done');
      el.querySelector('.step-dot').textContent = '✓';
    } else if (i === currentIndex) {
      el.classList.add('active');
      el.querySelector('.step-dot').textContent = '●';
    } else {
      el.querySelector('.step-dot').textContent = '○';
    }
  });
  
  const etaEl = document.getElementById('trackingETA');
  if (etaEl) {
    etaEl.textContent = order.status === 'delivered' ? t('delivered') + ' ✓' : t('arriving15');
  }
  
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
  
  const coords = JSON.parse(localStorage.getItem('wassilha_location_coords') || 'null');
  const center = coords ? [coords.lat, coords.lng] : [33.3152, 44.3661];
  
  trackingMap = L.map('trackingMap').setView(center, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(trackingMap);
  
  L.marker(center).addTo(trackingMap).bindPopup('📍 ' + t('myLocation'));
  
  const driverCoords = [center[0] + 0.005, center[1] + 0.005];
  L.marker(driverCoords, {
    icon: L.divIcon({
      className: 'marker-driver',
      html: '<div style="font-size:30px;">🛵</div>',
      iconSize: [40, 40]
    })
  }).addTo(trackingMap).bindPopup(t('driver'));
  
  setTimeout(() => trackingMap.invalidateSize(), 300);
}

async function cancelOrder() {
  if (!currentOrder) return;
  
  if (confirm(t('cancel') + '؟')) {
    await DB.updateOrderStatus(currentOrder.id, 'cancelled');
    showToast(t('cancelled'));
    goHome();
  }
}

function chatWithDriver() {
  showToast(t('comingSoon'));
}

function callDriver() {
  showToast(t('comingSoon'));
}
// ═══════════════════════════════════════
// 🛵 Driver Dashboard
// ═══════════════════════════════════════
async function loadDriverData() {
  if (!currentUser) return;
  
  const nameEl = document.getElementById('driverName');
  if (nameEl) nameEl.textContent = currentUser.name;
  
  const avatarEl = document.getElementById('driverAvatarLetter');
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0);
  
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
    title.textContent = t('online');
    subtitle.textContent = t('nearbyOrders') + '...';
    btn.textContent = t('stop');
    btn.classList.add('online');
    status.textContent = t('online');
    
    showToast('✅ ' + t('online'));
    
    await DB.updateDriverStatus(currentUser.id, true, 33.3152, 44.3661);
    
    setTimeout(() => {
      if (driverOnline) loadAvailableOrders();
    }, 2000);
  } else {
    card.classList.remove('online');
    title.textContent = t('offline');
    subtitle.textContent = t('activateConnection');
    btn.textContent = t('startWork');
    btn.classList.remove('online');
    status.textContent = t('offline');
    
    showToast('⏹️ ' + t('offline'));
    
    await DB.updateDriverStatus(currentUser.id, false);
  }
}

async function loadAvailableOrders() {
  const list = document.getElementById('driverOrdersList');
  const count = document.getElementById('ordersCount');
  
  if (!list) return;
  
  const result = await DB.getAvailableOrders();
  
  if (!result.success || !result.orders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <h4>${t('noNearbyOrders')}</h4>
        <p>${t('activateConnection')}</p>
      </div>
    `;
    if (count) count.textContent = '0';
    return;
  }
  
  if (count) count.textContent = result.orders.length;
  
  list.innerHTML = result.orders.map(o => renderAvailableOrder(o)).join('');
}

function renderAvailableOrder(order) {
  const distance = (1 + Math.random() * 5).toFixed(1);
  const distanceNum = parseFloat(distance);
  const badgeClass = distanceNum < 2 ? 'accepted' : distanceNum < 5 ? 'pending' : 'cancelled';
  
  return `
    <div class="available-order-card">
      <div class="order-card-header">
        <div>
          <div class="order-card-number">${t('order')} #${order.order_number || '—'}</div>
          <div class="order-card-date">${formatDate(order.created_at)}</div>
        </div>
        <span class="order-status-badge ${badgeClass}">${distance} ${t('km')}</span>
      </div>
      <div class="order-route">
        <div class="order-route-item">📍 <strong>${order.pickup_address || '—'}</strong></div>
        <div class="order-route-item">🎯 <strong>${order.dropoff_address || '—'}</strong></div>
      </div>
      <div class="order-card-footer">
        <span class="order-price">${(order.total_price || 0).toLocaleString()}<small> ${t('balance')}</small></span>
        <button class="order-action-btn primary" onclick="acceptOrder('${order.id}')">${t('accept')}</button>
      </div>
    </div>
  `;
}

async function acceptOrder(orderId) {
  const result = await DB.acceptOrder(orderId, currentUser.id);
  
  if (!result.success) {
    showToast(t('acceptFailed'));
    return;
  }
  
  showToast('✅ ' + t('orderAccepted'));
  
  if (result.order?.customer_id) {
    await DB.createNotification(
      result.order.customer_id,
      '✅ ' + t('accepted'),
      currentUser.name + ' — ' + t('onTheWay'),
      'order'
    );
  }
  
  await loadAvailableOrders();
}

// ═══════════════════════════════════════
// 🗺️ Map Picker
// ═══════════════════════════════════════
function openMapPicker(mode) {
  mapPickerMode = mode;
  
  const title = document.getElementById('mapPickerTitle');
  if (title) {
    title.textContent = mode === 'from' ? t('selectPickupTitle') : t('selectDropoffTitle');
  }
  
  showScreen('mapPickerScreen');
  
  document.getElementById('mapSearchInput').value = '';
  document.getElementById('mapSearchResults').classList.remove('active');
  document.getElementById('mapSelectedAddress').textContent = t('detecting');
  
  setTimeout(() => initMapPicker(), 400);
}

function closeMapPicker() {
  if (mapPickerInstance) {
    mapPickerInstance.remove();
    mapPickerInstance = null;
  }
  showScreen('newOrderScreen');
}

function initMapPicker() {
  const mapEl = document.getElementById('mapPickerMap');
  if (!mapEl) return;
  
  if (mapPickerInstance) {
    mapPickerInstance.remove();
    mapPickerInstance = null;
  }
  
  if (typeof L === 'undefined') return;
  
  const defaultCenter = [33.3152, 44.3661];
  
  mapPickerInstance = L.map('mapPickerMap', {
    zoomControl: true,
    attributionControl: false
  }).setView(defaultCenter, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(mapPickerInstance);
  
  mapPickerInstance.on('moveend', () => {
    updateMapLocation();
  });
  
  setTimeout(() => {
    updateMapLocation();
    mapPickerInstance.invalidateSize();
  }, 500);
}

async function updateMapLocation() {
  if (!mapPickerInstance) return;
  
  const center = mapPickerInstance.getCenter();
  mapPickerLocation = { lat: center.lat, lng: center.lng };
  
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&accept-language=${Lang.current()}`
    );
    const data = await res.json();
    
    if (data.display_name) {
      const parts = data.display_name.split(', ');
      const address = parts.slice(0, 3).join('، ');
      document.getElementById('mapSelectedAddress').textContent = address;
    } else {
      document.getElementById('mapSelectedAddress').textContent = t('myLocation');
    }
  } catch (e) {
    document.getElementById('mapSelectedAddress').textContent = t('myLocation');
  }
}

function locateUserOnMap() {
  if (!navigator.geolocation || !mapPickerInstance) {
    showToast(t('gpsUnavailable'));
    return;
  }
  
  showToast('📍 ' + t('detectingLocation'));
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const loc = [position.coords.latitude, position.coords.longitude];
      mapPickerInstance.setView(loc, 16);
      showToast('✅ ' + t('locationDetected'));
    },
    () => showToast('⚠️ ' + t('locationFailed')),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function handleMapSearch(event) {
  const query = event.target.value.trim();
  const resultsEl = document.getElementById('mapSearchResults');
  
  if (query.length < 3) {
    resultsEl.classList.remove('active');
    return;
  }
  
  clearTimeout(window._searchTimeout);
  window._searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' بغداد')}&accept-language=${Lang.current()}&limit=5`
      );
      const data = await res.json();
      
      if (!data.length) {
        resultsEl.classList.remove('active');
        return;
      }
      
      resultsEl.innerHTML = data.map(r => {
        const name = r.display_name.split(', ')[0];
        const addr = r.display_name.split(', ').slice(1, 3).join('، ');
        return `
          <div class="search-result-item" onclick="selectSearchResult(${r.lat}, ${r.lon}, '${name.replace(/'/g, '')}')">
            <strong>${name}</strong>
            <small>${addr}</small>
          </div>
        `;
      }).join('');
      
      resultsEl.classList.add('active');
    } catch (e) {
      console.error(e);
    }
  }, 500);
}

function selectSearchResult(lat, lng, name) {
  if (!mapPickerInstance) return;
  
  mapPickerInstance.setView([lat, lng], 16);
  document.getElementById('mapSearchResults').classList.remove('active');
  document.getElementById('mapSearchInput').value = name;
}

function confirmMapLocation() {
  if (!mapPickerLocation) {
    showToast(t('locationNotSet'));
    return;
  }
  
  const address = document.getElementById('mapSelectedAddress').textContent;
  
  if (mapPickerMode === 'from') {
    document.getElementById('orderFrom').value = address;
    localStorage.setItem(CONFIG.STORAGE_KEYS.location, address);
    localStorage.setItem('wassilha_location_coords', JSON.stringify(mapPickerLocation));
  } else {
    document.getElementById('orderTo').value = address;
    localStorage.setItem('wassilha_dropoff_coords', JSON.stringify(mapPickerLocation));
  }
  
  calculatePreviewPrice();
  showToast('✅ ' + t('locationSet'));
  
  setTimeout(() => closeMapPicker(), 500);
}

// ═══════════════════════════════════════
// 👤 Profile
// ═══════════════════════════════════════
async function openProfile() {
  showScreen('profileScreen');
  
  if (!currentUser) return;
  
  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = currentUser.name;
  
  const phoneEl = document.getElementById('profilePhone');
  if (phoneEl) phoneEl.textContent = currentUser.phone;
  
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0);
  
  const result = await DB.getUserOrders(currentUser.id);
  const countEl = document.getElementById('profileOrderCount');
  if (countEl) countEl.textContent = result.success ? result.orders.length : 0;
}

// ═══════════════════════════════════════
// 🔔 Notifications
// ═══════════════════════════════════════
function openNotifications() {
  showScreen('notificationsScreen');
  loadNotifications();
}

async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  if (!list || !currentUser) return;
  
  const result = await DB.getUserNotifications(currentUser.id);
  
  if (!result.success || !result.notifications.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <h4>${t('noNotifications')}</h4>
        <p>${t('notifWillAppear')}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = result.notifications.map(n => `
    <div class="notif-card ${n.is_read ? '' : 'unread'}">
      <div class="notif-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div class="notif-content">
        <h4>${n.title || t('notifications')}</h4>
        <p>${n.message || ''}</p>
        <span class="notif-time">${formatDate(n.created_at)}</span>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════
// ⚙️ Settings
// ═══════════════════════════════════════
function openSettings() {
  showScreen('settingsScreen');
  
  // تحديث أزرار اللغة
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === Lang.current());
  });
}

function setTheme(theme, btn) {
  document.querySelectorAll('.settings-theme-btn').forEach(b => {
    if (!b.hasAttribute('data-lang-btn')) b.classList.remove('active');
  });
  btn.classList.add('active');
  
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, theme);
  showToast('✅ ' + t('themeChanged'));
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
    goHome();
  } else if (tab === 'orders') {
    openOrders();
  } else if (tab === 'profile') {
    openProfile();
  }
}

function quickOrder(type) {
  openNewOrder();
  setTimeout(() => {
    const chip = document.querySelector(`.type-chip[data-type="${type}"]`);
    if (chip) selectPackageType(type, chip);
  }, 300);
}

// ═══════════════════════════════════════
// 🚪 Logout
// ═══════════════════════════════════════
async function handleLogout() {
  if (!confirm(t('logoutConfirm'))) return;
  
  localStorage.removeItem(CONFIG.STORAGE_KEYS.user);
  currentUser = null;
  showToast('✅ ' + t('logoutSuccess'));
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
  
  if (diff < 1) return t('now');
  if (diff < 60) return t('minsAgo') + ' ' + diff + ' ' + t('minsAgoSuffix');
  if (diff < 1440) return t('minsAgo') + ' ' + Math.floor(diff / 60) + ' ' + t('hoursAgoSuffix');
  
  const locale = Lang.current() === 'ar' ? 'ar-IQ' : 'en-US';
  return date.toLocaleDateString(locale);
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
// 🌐 Language Integration
// ═══════════════════════════════════════
window.addEventListener('language-changed', (e) => {
  const lang = e.detail.lang;
  
  // تحديث زر اللغة العلوي
  const langBtnText = document.getElementById('langBtnText');
  if (langBtnText) {
    langBtnText.textContent = lang === 'ar' ? 'EN' : 'ع';
  }
  
  // تحديث أزرار اللغة في الإعدادات
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === lang);
  });
  
  console.log('🌐 Language changed to:', lang);
});

// ═══════════════════════════════════════
// 🚀 Initialize
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Wassilha v3.0 initialized');
  
  // تطبيق اللغة
  if (window.Lang) {
    Lang.init();
    
    // تحديث زر اللغة
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) {
      langBtnText.textContent = Lang.current() === 'ar' ? 'EN' : 'ع';
    }
  }
  
  window.addEventListener('supabase-ready', () => {
    console.log('✅ Supabase ready');
  });
  
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
window.quickOrder = quickOrder;
window.openNewOrder = openNewOrder;
window.openOrders = openOrders;
window.selectPackageType = selectPackageType;
window.submitOrder = submitOrder;
window.filterOrders = filterOrders;
window.openTracking = openTracking;
window.cancelOrder = cancelOrder;
window.chatWithDriver = chatWithDriver;
window.callDriver = callDriver;
window.openProfile = openProfile;
window.toggleDriverOnline = toggleDriverOnline;
window.acceptOrder = acceptOrder;
window.openMapPicker = openMapPicker;
window.closeMapPicker = closeMapPicker;
window.locateUserOnMap = locateUserOnMap;
window.handleMapSearch = handleMapSearch;
window.selectSearchResult = selectSearchResult;
window.confirmMapLocation = confirmMapLocation;
window.openNotifications = openNotifications;
window.openSettings = openSettings;
window.setTheme = setTheme;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.showToast = showToast;

console.log('✅ Script.js loaded — Wassilha v3.0');
