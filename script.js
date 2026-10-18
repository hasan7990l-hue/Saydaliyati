// ============================================
// ⚙️ SCRIPT.JS — Wassilha v9.0 (Part 1/2)
// State + Screens + Auth + Home + Map + Orders
// ============================================

console.log('🚀 Wassilha v9.0 loading...');

// ═══ Global State ═══
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
let mapPickerDetails = null;
let currentCategory = 'food';
let ordersFilter = 'all';
let currentChatOrder = null;
let chatPollingInterval = null;
let blindTimerInterval = null;
let selectedPlan = null;

// ═══ Screens ═══
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'flex';
    window.scrollTo(0, 0);
  }
}

// ═══ Splash & Init ═══
function initSplash() {
  if (window.Lang) Lang.init();
  // Splash يظهر 2.5 ثانية ثم نتحقق من المستخدم
  setTimeout(async () => {
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.user);
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        
        if (currentUser.role === 'driver') {
          document.body.classList.add('role-driver');
        } else {
          document.body.classList.remove('role-driver');
        }
        
        if (currentUser.role === 'driver') {
          showScreen('driverScreen');
          loadDriverData();
        } else {
          showScreen('homeScreen');
          loadHomeData();
        }
      } catch (e) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.user);
        showScreen('loginScreen');
      }
    } else {
      showScreen('loginScreen');
    }
  }, 2500);
}

// ═══ Login & OTP ═══
async function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  if (!validatePhone(phone)) { showToast(t('invalidPhone')); return; }

  const btn = document.getElementById('loginBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span>...</span>';

  const result = await DB.getUserByPhone(phone);
  btn.disabled = false; btn.innerHTML = originalHTML;

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
  btn.disabled = true; btn.innerHTML = '<span>...</span>';

  const result = await DB.sendOTP(phone);
  btn.disabled = false; btn.innerHTML = originalHTML;

  if (!result.success) { showToast(t('sendFailed')); return; }
  currentOTPPhone = phone;
  showToast('📱 ' + t('codeSent') + ': ' + result.code);
  document.getElementById('otpPhone').textContent = phone;
  goToOTPScreen();
}

function goToOTPScreen() {
  showScreen('otpScreen');
  startOTPTimer();
  setupOTPInputs();
  setTimeout(() => document.querySelector('.otp-input')?.focus(), 300);
}

function setupOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach((input, index) => {
    input.value = '';
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
      if (Array.from(inputs).every(i => i.value.length === 1)) setTimeout(() => handleVerifyOTP(), 300);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
    });
  });
}

async function handleVerifyOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  const code = Array.from(inputs).map(i => i.value).join('');
  if (code.length !== 4) { showToast(t('enterFullCode')); return; }

  const btn = document.getElementById('verifyBtn');
  btn.disabled = true; btn.innerHTML = '<span>...</span>';

  const result = await DB.verifyOTP(currentOTPPhone, code);
  if (!result.success) {
    btn.disabled = false; btn.innerHTML = t('verify');
    showToast(t('wrongCode'));
    inputs.forEach(i => i.value = ''); inputs[0].focus();
    return;
  }

  const userResult = await DB.getUserByPhone(currentOTPPhone);
  if (userResult.success && userResult.user) {
    currentUser = userResult.user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
    
    if (currentUser.role === 'driver') {
      document.body.classList.add('role-driver');
    } else {
      document.body.classList.remove('role-driver');
    }
    
    showToast(t('welcomeUser') + ' ' + currentUser.name);
    setTimeout(() => {
      if (currentUser.role === 'driver') { showScreen('driverScreen'); loadDriverData(); }
      else { showScreen('homeScreen'); loadHomeData(); }
    }, 800);
  }
}

function startOTPTimer() {
  otpSeconds = 60;
  const timerEl = document.getElementById('otpTimer');
  const resendBtn = document.getElementById('resendBtn');
  if (otpTimer) clearInterval(otpTimer);
  resendBtn.disabled = true; timerEl.textContent = otpSeconds;
  otpTimer = setInterval(() => {
    otpSeconds--; timerEl.textContent = otpSeconds;
    if (otpSeconds <= 0) { clearInterval(otpTimer); resendBtn.disabled = false; }
  }, 1000);
}

async function handleResendOTP() {
  const result = await DB.sendOTP(currentOTPPhone);
  if (result.success) { showToast('📱 ' + t('codeSent') + ': ' + result.code); startOTPTimer(); }
  else showToast(t('sendFailed'));
}

function goToRoleSelection() { showScreen('roleScreen'); }

function selectRole(role) {
  currentRole = role;
  const title = document.getElementById('registerTitle');
  const subtitle = document.getElementById('registerSubtitle');
  const vehicleField = document.getElementById('vehicleField');
  if (role === 'customer') { title.textContent = t('customer'); subtitle.textContent = t('customerDesc'); vehicleField.style.display = 'none'; }
  else if (role === 'driver') { title.textContent = t('driver'); subtitle.textContent = t('driverDesc'); vehicleField.style.display = 'flex'; }
  else { title.textContent = t('store'); subtitle.textContent = t('storeDesc'); vehicleField.style.display = 'none'; }
  showScreen('registerScreen');
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const vehicle = document.getElementById('registerVehicle')?.value;
  const terms = document.getElementById('termsCheckbox').checked;

  if (!name || name.length < 3) { showToast(t('nameTooShort')); return; }
  if (!validatePhone(phone)) { showToast(t('invalidPhone')); return; }
  if (password.length < 6) { showToast(t('passwordMin')); return; }
  if (currentRole === 'driver' && !vehicle) { showToast(t('selectVehicleType')); return; }
  if (!terms) { showToast(t('agreeTermsFirst')); return; }

  const existing = await DB.getUserByPhone(phone);
  if (existing.success && existing.user) { showToast(t('phoneRegistered')); return; }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.innerHTML = '<span>...</span>';

  const result = await DB.createUser({ name, phone, role: currentRole });
  if (!result.success) {
    btn.disabled = false; btn.innerHTML = t('createAccount');
    showToast(t('registerFailed') + ': ' + result.error); return;
  }

  if (currentRole === 'driver') await DB.createDriverProfile(result.user.id, vehicle);
  else if (currentRole === 'store') await DB.createStoreProfile(result.user.id, { name, phone, category: 'general' });

  await DB.getWallet(result.user.id);

  currentUser = result.user;
  localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
  
  if (currentUser.role === 'driver') {
    document.body.classList.add('role-driver');
  } else {
    document.body.classList.remove('role-driver');
  }

  btn.disabled = false; btn.innerHTML = t('createAccount');
  showToast(t('accountCreated'));

  setTimeout(() => {
    if (currentRole === 'driver') { showScreen('driverScreen'); loadDriverData(); }
    else if (currentRole === 'store') { showToast(t('storeCreated')); showScreen('homeScreen'); loadHomeData(); }
    else { showScreen('homeScreen'); loadHomeData(); }
  }, 1000);
}

// ═══ Home ═══
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
  if (!list || !currentUser) return;
  const result = await DB.getUserOrders(currentUser.id);
  if (!result.success || !result.orders.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><h4>${t('noOrders')}</h4><p>${t('startFirstOrder')}</p><button class="btn-primary btn-small" onclick="openNewOrder()">${t('orderNow')}</button></div>`;
    return;
  }
  list.innerHTML = result.orders.slice(0, 3).map(o => renderOrderCard(o)).join('');
}

function renderOrderCard(order) {
  const statusMap = { 'pending': { label: t('pending'), class: 'pending' }, 'accepted': { label: t('accepted'), class: 'accepted' }, 'picked_up': { label: t('pickedUp'), class: 'accepted' }, 'delivered': { label: t('delivered'), class: 'delivered' }, 'cancelled': { label: t('cancelled'), class: 'cancelled' } };
  const status = statusMap[order.status] || statusMap.pending;
  return `<div class="order-card-item" onclick="openTracking('${order.id}')"><div class="order-card-header"><div><div class="order-card-number">${t('order')} #${order.order_number || '—'}</div><div class="order-card-date">${formatDate(order.created_at)}</div></div><span class="order-status-badge ${status.class}">${status.label}</span></div><div class="order-route"><div class="order-route-item">📍 <strong>${order.pickup_address || '—'}</strong></div><div class="order-route-item">🎯 <strong>${order.dropoff_address || '—'}</strong></div></div><div class="order-card-footer"><span class="order-price">${(order.total_price || 0).toLocaleString()}<small> ${t('balance')}</small></span><button class="order-action-btn primary">${t('track')}</button></div></div>`;
}

function openProfile() {
  showScreen('profileScreen');
  if (!currentUser) return;
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profilePhone').textContent = currentUser.phone;
  document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0);
  DB.getUserOrders(currentUser.id).then(res => {
    document.getElementById('profileOrderCount').textContent = res.success ? res.orders.length : 0;
  });
  DB.getWallet(currentUser.id).then(res => {
    if (res.success) document.getElementById('profileBalance').textContent = (res.wallet.balance || 0).toLocaleString();
  });
  document.getElementById('profileRating').textContent = currentUser.rating || '5.0';
}
// ============================================
// ⚙️ SCRIPT.JS — Wassilha v9.0 (Part 2/2)
// Map + Orders + Chat + Driver + Settings + Blind Acceptance + Subscription
// ============================================

// ═══ Map Picker ═══
function openMapPicker(mode) {
  mapPickerMode = mode;
  const title = document.getElementById('mapPickerTitle');
  if (title) title.textContent = mode === 'from' ? t('selectPickupTitle') : t('selectDropoffTitle');
  showScreen('mapPickerScreen');
  document.getElementById('mapSearchInput').value = '';
  document.getElementById('mapSearchResults').classList.remove('active');
  document.getElementById('mapSelectedAddress').textContent = t('detecting');
  document.getElementById('addressSimple').style.display = 'flex';
  document.getElementById('addressDetailed').style.display = 'none';
  document.getElementById('mapNoteInput').value = '';
  const confirmBtn = document.getElementById('mapConfirmBtn');
  confirmBtn.classList.remove('confirmed');
  document.getElementById('mapConfirmText').textContent = t('confirmLocation');
  setTimeout(() => initMapPicker(), 400);
}

function closeMapPicker() {
  if (mapPickerInstance) { mapPickerInstance.remove(); mapPickerInstance = null; }
  showScreen('newOrderScreen');
}

function initMapPicker() {
  const mapEl = document.getElementById('mapPickerMap');
  if (!mapEl) return;
  if (mapPickerInstance) { mapPickerInstance.remove(); mapPickerInstance = null; }
  if (typeof L === 'undefined') return;
  const defaultCenter = [CONFIG.MAPS.defaultCenter.lat, CONFIG.MAPS.defaultCenter.lng];
  mapPickerInstance = L.map('mapPickerMap', { zoomControl: true, attributionControl: false }).setView(defaultCenter, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapPickerInstance);
  mapPickerInstance.on('movestart', () => document.getElementById('mapFloatingLabel').classList.add('active'));
  mapPickerInstance.on('moveend', () => { document.getElementById('mapFloatingLabel').classList.remove('active'); updateMapLocation(); });
  setTimeout(() => { updateMapLocation(); mapPickerInstance.invalidateSize(); }, 500);
}

async function updateMapLocation() {
  if (!mapPickerInstance) return;
  const center = mapPickerInstance.getCenter();
  mapPickerLocation = { lat: center.lat, lng: center.lng };
  let details = null;
  try {
    const liqUrl = `${CONFIG.MAPS.locationiq.baseUrl}/reverse?key=${CONFIG.MAPS.locationiq.key}&lat=${center.lat}&lon=${center.lng}&format=json&accept-language=${Lang.current()}&addressdetails=1&zoom=18`;
    const liqRes = await fetch(liqUrl);
    if (liqRes.ok) {
      const liqData = await liqRes.json();
      const addr = liqData.address || {};
      const fullParts = [addr.house_number, addr.road, addr.suburb || addr.neighbourhood, addr.city].filter(Boolean);
      details = {
        fullAddress: fullParts.length > 0 ? fullParts.join('، ') : (liqData.display_name || '').split(', ').slice(0, 4).join('، '),
        area: addr.suburb || addr.city_district || addr.city || '—',
        street: addr.road || 'غير محدد',
        building: addr.house_number || '—',
        coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        lat: center.lat, lng: center.lng
      };
    }
  } catch (e) { console.warn('LocationIQ failed'); }
  if (!details) {
    details = { fullAddress: 'موقع محدد على الخريطة', area: '—', street: 'غير محدد', building: '—', coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`, lat: center.lat, lng: center.lng };
  }
  mapPickerDetails = details;
  document.getElementById('mapSelectedAddress').textContent = details.fullAddress;
}

function locateUserOnMap() {
  if (!navigator.geolocation) { showToast('⚠️ ' + t('gpsUnavailable')); return; }
  if (!mapPickerInstance) return;
  const btn = document.querySelector('.map-locate-btn');
  btn.classList.add('loading');
  showToast('📍 ' + t('detectingLocation'));
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      mapPickerInstance.flyTo([lat, lng], 16, { duration: 1.5 });
      mapPickerLocation = { lat, lng };
      localStorage.setItem(CONFIG.STORAGE_KEYS.locationCoords, JSON.stringify({ lat, lng }));
      setTimeout(async () => { await updateMapLocation(); btn.classList.remove('loading'); showToast('✅ ' + t('locationDetected')); }, 1600);
    },
    (err) => { btn.classList.remove('loading'); showToast('⚠️ ' + t('locationFailed')); },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

async function handleMapSearch(event) {
  const query = event.target.value.trim();
  const resultsEl = document.getElementById('mapSearchResults');
  if (query.length < 2) { resultsEl.classList.remove('active'); return; }
  clearTimeout(window._mapSearchTimeout);
  window._mapSearchTimeout = setTimeout(async () => {
    resultsEl.innerHTML = `<div class="search-result-item" style="text-align:center;color:var(--text-3);">⏳ جاري البحث...</div>`;
    resultsEl.classList.add('active');
    let allResults = [];
    try {
      const liqUrl = `${CONFIG.MAPS.locationiq.baseUrl}/autocomplete?key=${CONFIG.MAPS.locationiq.key}&q=${encodeURIComponent(query)}&limit=8&countrycodes=iq&accept-language=${Lang.current()}`;
      const liqRes = await fetch(liqUrl);
      if (liqRes.ok) {
        const liqData = await liqRes.json();
        if (Array.isArray(liqData) && liqData.length > 0) {
          allResults = liqData.map(r => {
            const parts = [r.address?.road, r.address?.suburb || r.address?.neighbourhood, r.address?.city].filter(Boolean);
            return { name: r.address?.name || r.display_name?.split(', ')[0] || query, subtitle: parts.join('، ') || 'العراق', lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
          });
        }
      }
    } catch (e) { console.warn('Search failed'); }
    if (allResults.length === 0) {
      resultsEl.innerHTML = `<div class="search-result-item" style="text-align:center;color:var(--text-3);padding:20px;"><div style="font-size:32px;">🔍</div><div>${t('noResults')}</div></div>`;
      return;
    }
    const unique = []; const seen = new Set();
    allResults.forEach(r => { const k = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`; if (!seen.has(k)) { seen.add(k); unique.push(r); } });
    resultsEl.innerHTML = unique.slice(0, 6).map(r => `<div class="search-result-item" onclick="selectMapSearchResult(${r.lat}, ${r.lng}, '${r.name.replace(/'/g, '')}')"><strong>📍 ${r.name}</strong><small>${r.subtitle}</small></div>`).join('');
  }, 400);
}

function selectMapSearchResult(lat, lng, name) {
  if (!mapPickerInstance) return;
  mapPickerInstance.flyTo([lat, lng], 16, { duration: 1.2 });
  document.getElementById('mapSearchResults').classList.remove('active');
  document.getElementById('mapSearchInput').value = name;
}

function confirmMapLocation() {
  if (!mapPickerLocation) { showToast(t('locationNotSet')); return; }
  const confirmBtn = document.getElementById('mapConfirmBtn');
  const isConfirmed = confirmBtn.classList.contains('confirmed');
  if (!isConfirmed) {
    if (!mapPickerDetails) { showToast('⏳'); return; }
    document.getElementById('detailFullAddress').textContent = mapPickerDetails.fullAddress || '—';
    document.getElementById('detailArea').textContent = mapPickerDetails.area || '—';
    document.getElementById('detailStreet').textContent = mapPickerDetails.street || '—';
    document.getElementById('detailBuilding').textContent = mapPickerDetails.building || '—';
    document.getElementById('detailCoordinates').textContent = mapPickerDetails.coordinates || '—';
    document.getElementById('addressSimple').style.display = 'none';
    document.getElementById('addressDetailed').style.display = 'block';
    confirmBtn.classList.add('confirmed');
    document.getElementById('mapConfirmText').textContent = t('confirmAndContinue');
    return;
  }
  const address = document.getElementById('detailFullAddress').textContent;
  const note = document.getElementById('mapNoteInput').value.trim();
  if (mapPickerMode === 'from') {
    document.getElementById('orderFrom').value = address;
    localStorage.setItem(CONFIG.STORAGE_KEYS.location, address);
    localStorage.setItem(CONFIG.STORAGE_KEYS.locationCoords, JSON.stringify(mapPickerLocation));
  } else {
    document.getElementById('orderTo').value = address;
    localStorage.setItem(CONFIG.STORAGE_KEYS.dropoffCoords, JSON.stringify(mapPickerLocation));
  }
  if (note) { const n = document.getElementById('orderNotes'); if (n && !n.value) n.value = note; }
  showToast('✅ ' + t('locationConfirmed'));
  setTimeout(() => closeMapPicker(), 500);
}

// ═══ Submit Order ═══
async function submitOrder() {
  const from = document.getElementById('orderFrom').value.trim();
  const to = document.getElementById('orderTo').value.trim();
  if (!from) { showToast(t('selectPickupFirst')); return; }
  if (!to) { showToast(t('selectDropoffFirst')); return; }
  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true; btn.innerHTML = '<span>...</span>';
  const distance = Math.floor(Math.random() * 8) + 2;
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.pricePerKm;
  const total = Math.max(base + kmCost, CONFIG.PRICING.minPrice);
  const driverShare = Math.round(total * CONFIG.PRICING.driverShare);
  const pickupCoords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.locationCoords) || 'null');
  const dropoffCoords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.dropoffCoords) || 'null');
  const result = await DB.createOrder({
    customerId: currentUser.id, pickupAddress: from,
    pickupLat: pickupCoords?.lat, pickupLng: pickupCoords?.lng,
    dropoffAddress: to, dropoffLat: dropoffCoords?.lat, dropoffLng: dropoffCoords?.lng,
    packageType: selectedPackageType, notes: document.getElementById('orderNotes').value,
    distance, basePrice: base, totalPrice: total, driverShare, platformShare: total - driverShare
  });
  btn.disabled = false; btn.innerHTML = t('sendOrder');
  if (!result.success) { showToast('❌ ' + result.error); return; }
  showToast(t('orderSentSuccess'));
  await DB.createNotification(currentUser.id, '🛵 ' + t('orderSent'), t('willContact'), 'order');
  setTimeout(() => openTracking(result.order.id), 1000);
}

// ═══ Tracking (مع القبول الأعمى) ═══
async function openTracking(orderId) {
  if (!currentUser) return;
  showScreen('trackingScreen');
  const result = await DB.getOrderById(orderId);
  const order = result.order;
  if (!order) { showToast(t('orderNotFound')); goHome(); return; }
  currentOrder = order;
  document.getElementById('trackingOrderId').textContent = order.order_number || '—';

  const isDriver = currentUser.role === 'driver';
  const blindContainer = document.getElementById('blindAcceptContainer');
  const normalContainer = document.getElementById('normalTrackingContainer');

  if (blindTimerInterval) { clearInterval(blindTimerInterval); blindTimerInterval = null; }

  if (isDriver && order.status === 'pending') {
    blindContainer.classList.add('active');
    normalContainer.style.display = 'none';
    document.getElementById('blindOrderId').textContent = '#' + (order.order_number || '—');
    document.getElementById('blindRestaurantName').textContent = 'مطعم برجر هاوس'; 
    document.getElementById('blindCustomerAddress').textContent = order.dropoff_address || 'سيظهر بعد القبول';
    document.getElementById('blindEarnings').textContent = (order.driver_share || 4500).toLocaleString();
    
    let timeLeft = 45;
    const timerEl = document.getElementById('blindTimer');
    timerEl.textContent = timeLeft;
    blindTimerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(blindTimerInterval);
        rejectOrderBlind();
        showToast('⏰ انتهى الوقت، تم إعادة توجيه الطلب لمندوب آخر');
      }
    }, 1000);
    return;
  }

  if (isDriver && order.status !== 'pending') {
    blindContainer.classList.remove('active');
    normalContainer.style.display = 'block';
    const customerCard = document.getElementById('driverIdentityCard');
    customerCard.style.display = 'block';
    const customerResult = await DB.getUserById(order.customer_id);
    if (customerResult.success && customerResult.user) {
      const customer = customerResult.user;
      document.getElementById('driverIdAvatar').textContent = customer.name.charAt(0);
      document.getElementById('driverIdName').textContent = customer.name;
      document.getElementById('driverIdRating').textContent = customer.rating || '5.0';
      document.getElementById('driverIdVehicle').textContent = '📞 ' + customer.phone;
      document.getElementById('driverIdVerified').textContent = '✅ موثق';
      customerCard.dataset.driverPhone = customer.phone;
      customerCard.dataset.driverName = customer.name;
    }
  } 
  else if (!isDriver) {
    blindContainer.classList.remove('active');
    normalContainer.style.display = 'block';
    if (order.driver_id) {
      await renderDriverIdentity(order);
    } else {
      document.getElementById('driverIdentityCard').style.display = 'none';
    }
  }

  const statusIndex = { 'pending': 0, 'accepted': 1, 'picked_up': 2, 'delivered': 3, 'cancelled': -1 };
  const currentIndex = statusIndex[order.status] ?? 0;
  ['created', 'accepted', 'pickedup', 'delivered'].forEach((step, i) => {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;
    el.classList.remove('done', 'active');
    if (i < currentIndex) { el.classList.add('done'); el.querySelector('.step-dot').textContent = '✓'; }
    else if (i === currentIndex) { el.classList.add('active'); el.querySelector('.step-dot').textContent = '●'; }
    else { el.querySelector('.step-dot').textContent = '○'; }
  });

  setTimeout(() => initTrackingMap(order), 300);
}

async function renderDriverIdentity(order) {
  const card = document.getElementById('driverIdentityCard');
  if (!card) return;
  if (!order.driver_id) { card.style.display = 'none'; return; }
  const result = await DB.getUserById(order.driver_id);
  if (!result.success || !result.user) { card.style.display = 'none'; return; }
  const driver = result.user;
  const driverProfile = await DB.getDriverProfile(order.driver_id);
  document.getElementById('driverIdAvatar').textContent = driver.name?.charAt(0) || 'م';
  document.getElementById('driverIdName').textContent = driver.name || t('driver');
  document.getElementById('driverIdRating').textContent = driver.rating || '5.0';
  const vehicles = { motorcycle: '🛵 دراجة نارية', bicycle: '🚲 دراجة هوائية', car: '🚗 سيارة' };
  document.getElementById('driverIdVehicle').textContent = vehicles[driverProfile?.driver?.vehicle_type || 'motorcycle'];
  document.getElementById('driverIdVerified').textContent = driverProfile?.driver?.is_verified ? '✅ ' + t('driverVerified') : '⏳ ' + t('driverPending');
  card.dataset.driverPhone = driver.phone || '';
  card.dataset.driverName = driver.name || t('driver');
  card.style.display = 'block';
}

function initTrackingMap(order) {
  const mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  if (trackingMap) { trackingMap.remove(); trackingMap = null; }
  if (typeof L === 'undefined') return;
  const center = [CONFIG.MAPS.defaultCenter.lat, CONFIG.MAPS.defaultCenter.lng];
  trackingMap = L.map('trackingMap').setView(center, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(trackingMap);
  L.marker(center).addTo(trackingMap).bindPopup('📍 ' + t('myLocation'));
  setTimeout(() => trackingMap.invalidateSize(), 300);
}

async function cancelOrder() {
  if (!currentOrder) return;
  if (confirm(t('cancelOrderConfirm'))) {
    await DB.updateOrderStatus(currentOrder.id, 'cancelled');
    showToast(t('cancelled'));
    goHome();
  }
}

// ═══ القبول والرفض الأعمى ═══
async function acceptOrderBlind() {
  if (!currentOrder || !currentUser) return;
  if (blindTimerInterval) { clearInterval(blindTimerInterval); blindTimerInterval = null; }
  const result = await DB.acceptOrder(currentOrder.id, currentUser.id);
  if (result.success) {
    showToast('✅ تم قبول الطلب! توجه إلى المطعم');
    await DB.createNotification(currentOrder.customer_id, '✅ تم قبول طلبك', currentUser.name + ' في الطريق إليك', 'order');
    openTracking(currentOrder.id);
  } else {
    showToast('❌ فشل قبول الطلب');
  }
}

function rejectOrderBlind() {
  if (blindTimerInterval) { clearInterval(blindTimerInterval); blindTimerInterval = null; }
  showToast('تم رفض الطلب');
  goHome();
}

// ═══ Communication ═══
function callDriver() {
  const phone = document.getElementById('driverIdentityCard')?.dataset.driverPhone;
  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  window.location.href = `tel:${phone}`;
}

function whatsappDriver() {
  const card = document.getElementById('driverIdentityCard');
  const phone = card?.dataset.driverPhone;
  const name = card?.dataset.driverName;
  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  let intl = phone.replace(/\D/g, '');
  if (intl.startsWith('0')) intl = '964' + intl.substring(1);
  const msg = encodeURIComponent(`مرحباً ${name}، أنا عميلك في وصّلها. طلب رقم #${currentOrder?.order_number}`);
  window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
}

async function chatWithDriver() {
  if (!currentOrder || !currentOrder.driver_id) { showToast('⚠️'); return; }
  const otherName = document.getElementById('driverIdName').textContent;
  openChat(currentOrder.id, currentOrder.driver_id, otherName);
}

function openChat(orderId, otherUserId, otherUserName) {
  currentChatOrder = { orderId, otherUserId, otherUserName };
  showScreen('chatScreen');
  document.getElementById('chatUserName').textContent = otherUserName;
  document.getElementById('chatUserAvatar').textContent = otherUserName?.charAt(0) || 'م';
  loadChatMessages();
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(loadChatMessages, 3000);
}

async function loadChatMessages() {
  if (!currentChatOrder) return;
  const result = await DB.getOrderMessages(currentChatOrder.orderId);
  if (result.success) renderChatMessages(result.messages);
}

function renderChatMessages(messages) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;
  if (!messages || messages.length === 0) {
    container.innerHTML = `<div class="empty-state"><h4>${t('noMessages')}</h4><p>${t('startChat')}</p></div>`;
    return;
  }
  container.innerHTML = messages.map(msg => {
    const isMine = msg.sender_id === currentUser.id;
    const time = new Date(msg.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    return `<div class="chat-bubble-wrapper ${isMine ? 'mine' : 'other'}"><div class="chat-bubble ${isMine ? 'mine' : 'other'}">${msg.message}</div><div class="chat-time">${time}</div></div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentChatOrder) return;
  input.value = '';
  await DB.sendMessage(currentChatOrder.orderId, currentUser.id, currentChatOrder.otherUserId, text);
  await loadChatMessages();
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

function closeChat() {
  if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }
  currentChatOrder = null;
  openTracking(currentOrder?.id);
}

// ═══ Driver Dashboard ═══
async function loadDriverData() {
  if (!currentUser) return;
  document.getElementById('driverName').textContent = currentUser.name;
  document.getElementById('driverAvatarLetter').textContent = currentUser.name.charAt(0);
  const driverResult = await DB.getDriverProfile(currentUser.id);
  if (driverResult.success && driverResult.driver) {
    driverOnline = driverResult.driver.is_online || false;
    updateDriverToggleUI();
  }
  await loadAvailableOrders();
  await checkTrialBanner();
}

function updateDriverToggleUI() {
  const card = document.getElementById('driverToggleCard');
  const title = document.getElementById('toggleTitle');
  const subtitle = document.getElementById('toggleSubtitle');
  const btn = document.getElementById('toggleBtn');
  const status = document.getElementById('driverStatus');
  if (driverOnline) {
    card?.classList.add('online');
    if (title) title.textContent = t('online');
    if (subtitle) subtitle.textContent = t('nearbyOrders') + '...';
    if (btn) { btn.textContent = t('stop'); btn.classList.add('online'); }
    if (status) status.textContent = t('online');
  } else {
    card?.classList.remove('online');
    if (title) title.textContent = t('offline');
    if (subtitle) subtitle.textContent = t('activateConnection');
    if (btn) { btn.textContent = t('startWork'); btn.classList.remove('online'); }
    if (status) status.textContent = t('offline');
  }
}

async function toggleDriverOnline() {
  if (driverOnline) {
    driverOnline = false;
    updateDriverToggleUI();
    showToast('⏹️ ' + t('offline'));
    await DB.updateDriverStatus(currentUser.id, false);
    if (typeof stopOrderSound === 'function') stopOrderSound();
    return;
  }

  const sb = window.sb;
  try {
    const { data: driver, error } = await sb.from('drivers')
      .select('is_subscribed, subscription_end_date, trial_end_date, is_trial_used')
      .eq('user_id', currentUser.id).single();
    if (error) throw error;
    const now = new Date();

    if (driver.is_subscribed && driver.subscription_end_date && new Date(driver.subscription_end_date) > now) {
      // مسموح
    }
    else if (driver.is_trial_used && driver.trial_end_date && new Date(driver.trial_end_date) > now) {
      const daysLeft = Math.ceil((new Date(driver.trial_end_date) - now) / (1000 * 60 * 60 * 24));
      showToast(`🎁 لديك ${daysLeft} أيام مجانية متبقية`);
    }
    else if (!driver.is_trial_used) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 3);
      await sb.from('drivers').update({
        is_trial_used: true,
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString()
      }).eq('user_id', currentUser.id);
      showToast('🎉 مرحباً بك! لديك 3 أيام تجريبية مجانية');
    }
    else {
      showToast('⚠️ انتهى اشتراكك. يرجى الاشتراك للاستمرار');
      setTimeout(() => goToSubscription(), 1500);
      return;
    }
  } catch (err) {
    console.error('Subscription check failed:', err);
    showToast('❌ حدث خطأ في التحقق من الاشتراك');
    return;
  }

  driverOnline = true;
  updateDriverToggleUI();
  showToast('✅ ' + t('online'));

  let lat = CONFIG.MAPS.defaultCenter.lat;
  let lng = CONFIG.MAPS.defaultCenter.lng;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; await DB.updateDriverStatus(currentUser.id, true, lat, lng); },
      async () => await DB.updateDriverStatus(currentUser.id, true, lat, lng),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  } else {
    await DB.updateDriverStatus(currentUser.id, true, lat, lng);
  }

  setTimeout(() => { if (driverOnline) loadAvailableOrders(); }, 2000);
}

async function loadAvailableOrders() {
  const list = document.getElementById('driverOrdersList');
  const count = document.getElementById('ordersCount');
  if (!list) return;
  const result = await DB.getAvailableOrders();
  if (!result.success || !result.orders.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></div><h4>${t('noNearbyOrders')}</h4><p>${t('activateConnection')}</p></div>`;
    if (count) count.textContent = '0';
    return;
  }
  if (count) count.textContent = result.orders.length;
  if (driverOnline && result.orders.length > 0 && typeof playOrderSound === 'function') playOrderSound(true);
  list.innerHTML = result.orders.map(o => `<div class="available-order-card"><div class="order-card-header"><div><div class="order-card-number">${t('order')} #${o.order_number || '—'}</div><div class="order-card-date">${formatDate(o.created_at)}</div></div></div><div class="order-route"><div class="order-route-item">📍 <strong>${o.pickup_address || '—'}</strong></div><div class="order-route-item">🎯 <strong>${o.dropoff_address || '—'}</strong></div></div><div class="order-card-footer"><span class="order-price">${(o.total_price || 0).toLocaleString()}<small> ${t('balance')}</small></span><button class="order-action-btn primary" onclick="openTracking('${o.id}')">${t('accept')}</button></div></div>`).join('');
}

async function acceptOrder(orderId) {
  const result = await DB.acceptOrder(orderId, currentUser.id);
  if (!result.success) { showToast(t('acceptFailed')); return; }
  if (typeof stopOrderSound === 'function') stopOrderSound();
  showToast('✅ ' + t('orderAccepted'));
  if (result.order?.customer_id) {
    await DB.createNotification(result.order.customer_id, '✅ ' + t('accepted'), currentUser.name + ' — ' + t('onTheWay'), 'order');
  }
  await loadAvailableOrders();
}

// ═══ Settings ═══
function openSettings() {
  showScreen('settingsScreen');
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === Lang.current());
  });
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'auto';
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === savedTheme);
  });
  const notifToggle = document.getElementById('notifToggle');
  if (notifToggle) notifToggle.checked = localStorage.getItem(CONFIG.STORAGE_KEYS.notifications) !== 'false';
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) soundToggle.checked = localStorage.getItem(CONFIG.STORAGE_KEYS.sound) !== 'false';
  if (typeof updateSoundValues === 'function') updateSoundValues();
  
  const subRow = document.getElementById('subscriptionRow');
  if (subRow) {
    subRow.style.display = (currentUser && currentUser.role === 'driver') ? 'flex' : 'none';
  }
}

function setTheme(theme, btn) {
  document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, theme);
  applyTheme(theme);
  showToast('✅ ' + t('themeChanged'));
}

function applyTheme(theme) {
  let applied = theme;
  if (theme === 'auto') applied = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', applied);
}

function initSystemThemeListener() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', handleSystemThemeChange);
  else if (mq.addListener) mq.addListener(handleSystemThemeChange);
}

function handleSystemThemeChange(e) {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'auto';
  if (saved !== 'auto') return;
  document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
}

async function toggleNotifications() {
  const toggle = document.getElementById('notifToggle');
  if (!toggle) return;
  if (toggle.checked) {
    let perm = false;
    if ('Notification' in window) {
      try { perm = (await Notification.requestPermission()) === 'granted'; } catch(e){}
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.notifications, 'true');
    showToast(perm ? '✅ ' + t('notifEnabled') : '✅ ' + t('notifInternalEnabled'));
  } else {
    localStorage.setItem(CONFIG.STORAGE_KEYS.notifications, 'false');
    showToast('🔕 ' + t('notifDisabled'));
  }
}

function toggleSound() {
  const toggle = document.getElementById('soundToggle');
  if (!toggle) return;
  localStorage.setItem(CONFIG.STORAGE_KEYS.sound, toggle.checked ? 'true' : 'false');
  if (!toggle.checked && typeof stopOrderSound === 'function') stopOrderSound();
  showToast(toggle.checked ? '🔊 ' + t('soundEnabled') : '🔇 ' + t('soundDisabled'));
}

// ═══ Utils ═══
function validatePhone(phone) { return /^07[0-9]{9}$/.test(phone.replace(/\s/g, '')); }
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr); const diff = Math.floor((new Date() - d) / 60000);
  if (diff < 1) return t('now');
  if (diff < 60) return `${diff} ${t('minsAgoSuffix')}`;
  if (diff < 1440) return `${Math.floor(diff/60)} ${t('hoursAgoSuffix')}`;
  return d.toLocaleDateString('ar-IQ');
}
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
function togglePassword(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.innerHTML = input.type === 'password' ? '<span>👁️</span>' : '<span>🙈</span>';
}

function goHome() {
  if (currentUser?.role === 'driver') { showScreen('driverScreen'); loadDriverData(); }
  else { showScreen('homeScreen'); loadHomeData(); }
}
function goToLogin() { showScreen('loginScreen'); }
function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-tab="${tab}"]`)?.classList.add('active');
  if (tab === 'home') goHome();
  else if (tab === 'orders') openOrders();
  else if (tab === 'profile') openProfile();
}

async function handleLogout() {
  if (!confirm(t('logoutConfirm'))) return;
  localStorage.removeItem(CONFIG.STORAGE_KEYS.user);
  currentUser = null; currentOrder = null; driverOnline = false;
  document.body.classList.remove('role-driver');
  if (typeof stopOrderSound === 'function') stopOrderSound();
  showToast('✅ ' + t('logoutSuccess'));
  setTimeout(() => showScreen('loginScreen'), 500);
}

function openNotifications() { showScreen('notificationsScreen'); loadNotifications(); }
async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  if (!list || !currentUser) return;
  const result = await DB.getUserNotifications(currentUser.id);
  if (!result.success || !result.notifications.length) {
    list.innerHTML = `<div class="empty-state"><h4>${t('noNotifications')}</h4><p>${t('notifWillAppear')}</p></div>`;
    return;
  }
  list.innerHTML = result.notifications.map(n => `<div class="notif-card ${n.is_read ? '' : 'unread'}"><div class="notif-content"><h4>${n.title}</h4><p>${n.message}</p></div></div>`).join('');
}

function openOrders() { showScreen('ordersScreen'); loadOrdersList(); }
async function loadOrdersList() {
  const list = document.getElementById('ordersList');
  if (!list || !currentUser) return;
  const result = await DB.getUserOrders(currentUser.id);
  if (!result.success || !result.orders.length) { list.innerHTML = `<div class="empty-state"><h4>${t('noOrders')}</h4></div>`; return; }
  list.innerHTML = result.orders.map(o => renderOrderCard(o)).join('');
}
function filterOrders(f, b) { ordersFilter = f; document.querySelectorAll('.order-tab').forEach(x => x.classList.remove('active')); b.classList.add('active'); loadOrdersList(); }

function openContactUs() { showScreen('contactScreen'); }
function openWhatsApp() { window.open(`https://wa.me/9647761090465?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن تطبيق وصّلها')}`, '_blank'); }
function openEmail() { window.location.href = `mailto:hasan7990l@gmail.com?subject=استفسار`; }
function openTelegram() { window.open('https://t.me/lb2_c', '_blank'); }
function openAbout() { showScreen('aboutScreen'); }
function openTerms() { showScreen('termsScreen'); }
function openPrivacy() { showScreen('privacyScreen'); }
function openAddresses() { showToast(t('comingSoon')); }
function openPaymentMethods() { showToast(t('comingSoon')); }
function openDriverEarnings() { showToast(t('comingSoon')); }
function openRateApp() { showToast('⭐ ' + t('thanksForRating')); }
function shareApp() { if (navigator.share) navigator.share({ title: 'وصّلها', url: window.location.origin }); }

function openSearchScreen() { showScreen('searchScreen'); document.getElementById('mainSearchInput').value = ''; }
function closeSearch() { goHome(); }
function handleMainSearch(e) {
  const q = e.target.value.trim();
  const results = document.getElementById('searchResults');
  if (q.length < 2) { results.innerHTML = ''; return; }
  results.innerHTML = `<div class="store-card"><div class="store-logo">🔍</div><div class="store-info"><h4 class="store-name">نتائج البحث عن: ${q}</h4></div></div>`;
}
function quickSearch(term) { document.getElementById('mainSearchInput').value = term; handleMainSearch({target: {value: term}}); }
function openCategory(cat) { showScreen('categoryScreen'); document.getElementById('categoryTitle').textContent = t(cat); }
function filterCategory() {}
function applyFilter(f, b) { document.querySelectorAll('.category-filter').forEach(x => x.classList.remove('active')); b.classList.add('active'); }

function openNewOrder() {
  showScreen('newOrderScreen');
  document.getElementById('orderFrom').value = '';
  document.getElementById('orderTo').value = '';
  document.getElementById('orderNotes').value = '';
  selectedPackageType = 'normal';
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.type-chip[data-type="normal"]')?.classList.add('active');
}
function selectPackageType(t, b) { selectedPackageType = t; document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active')); b.classList.add('active'); }

// ═══ Subscription & Free Trial ═══
function goToSubscription() { showScreen('subscriptionScreen'); }

async function activateFreeTrial() {
  if (!currentUser) return;
  if (!confirm('🎁 هل تريد تفعيل التجربة المجانية لمدة 3 أيام؟')) return;
  showToast('⏳ جاري التفعيل...');
  try {
    const sb = window.sb;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);
    const { error } = await sb.from('drivers').update({
      is_trial_used: true,
      trial_start_date: new Date().toISOString(),
      trial_end_date: trialEnd.toISOString(),
      is_subscribed: true,
      subscription_plan: 'trial',
      subscription_end_date: trialEnd.toISOString()
    }).eq('user_id', currentUser.id);
    if (error) throw error;
    showScreen('successScreen');
    setTimeout(() => launchConfetti(), 500);
  } catch (err) {
    console.error(err);
    showToast('❌ فشل التفعيل: ' + err.message);
  }
}

async function checkTrialBanner() {
  if (!currentUser || currentUser.role !== 'driver') return;
  try {
    const sb = window.sb;
    const { data: driver } = await sb.from('drivers').select('is_trial_used').eq('user_id', currentUser.id).single();
    const banner = document.getElementById('trialBanner');
    if (banner && driver && !driver.is_trial_used) {
      banner.style.display = 'flex';
    } else if (banner) {
      banner.style.display = 'none';
    }
  } catch (err) { console.error(err); }
}

function openSupportForPlan(planName, price) {
  const sheet = document.createElement('div');
  sheet.className = 'modal-overlay active';
  sheet.innerHTML = `
    <div class="modal-sheet" style="padding: 24px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(37, 211, 102, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </div>
      <h3 style="font-size: 20px; font-weight: 900; margin-bottom: 8px;">تفعيل باقة ${planName}</h3>
      <p style="color: var(--text-2); margin-bottom: 24px; line-height: 1.6;">للاشتراك في <strong>${planName}</strong> بمبلغ <strong>${price.toLocaleString()} د.ع</strong>، يرجى التواصل مع الدعم عبر الواتساب لإتمام عملية الدفع.</p>
      <button onclick="contactSupportWhatsApp('${planName}', ${price})" style="width: 100%; padding: 16px; background: #25D366; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; margin-bottom: 12px; cursor: pointer;">📱 التواصل عبر واتساب</button>
      <button onclick="this.closest('.modal-overlay').remove()" style="width: 100%; padding: 16px; background: transparent; color: var(--text-2); border: none; font-size: 14px; font-weight: 700; cursor: pointer;">إلغاء</button>
    </div>
  `;
  document.body.appendChild(sheet);
}

function contactSupportWhatsApp(planName, price) {
  const message = encodeURIComponent(`مرحباً، أريد الاشتراك في تطبيق وصّلها.\n\n📋 الباقة: ${planName}\n💰 السعر: ${price.toLocaleString()} د.ع\n\nأرجو إرسال تفاصيل الدفع لتفعيل الاشتراك.`);
  window.open(`https://wa.me/9647761090465?text=${message}`, '_blank');
}

function launchConfetti() {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed; width: 10px; height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw; top: -10px; z-index: 999999;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none; animation: fall ${Math.random() * 2 + 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

// ═══ Language Listener ═══
window.addEventListener('language-changed', (e) => {
  const lang = e.detail.lang;
  const btn = document.getElementById('langBtnText');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';
});

// ═══ Init ═══
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Wassilha v9.0 initialized');
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'auto';
  applyTheme(savedTheme);
  initSystemThemeListener();
  if (window.Lang) {
    Lang.init();
    const btn = document.getElementById('langBtnText');
    if (btn) btn.textContent = Lang.current() === 'ar' ? 'EN' : 'ع';
  }
  initSplash();
});

// ═══ Global Exports ═══
['showScreen','handleLogin','handleRegister','handleVerifyOTP','handleResendOTP','goToRoleSelection','goToLogin','goHome','selectRole','switchTab','openNewOrder','openOrders','selectPackageType','submitOrder','filterOrders','openTracking','cancelOrder','chatWithDriver','callDriver','whatsappDriver','openChat','sendChatMessage','handleChatKeyPress','closeChat','openProfile','openAddresses','openPaymentMethods','openNotifications','toggleDriverOnline','acceptOrder','acceptOrderBlind','rejectOrderBlind','openDriverEarnings','openMapPicker','closeMapPicker','locateUserOnMap','handleMapSearch','selectMapSearchResult','confirmMapLocation','openSearchScreen','closeSearch','handleMainSearch','quickSearch','openCategory','filterCategory','applyFilter','openSettings','setTheme','toggleNotifications','toggleSound','openContactUs','openWhatsApp','openEmail','openTelegram','openAbout','openTerms','openPrivacy','openRateApp','shareApp','handleLogout','togglePassword','showToast','applyTheme','initSystemThemeListener','goToSubscription','activateFreeTrial','checkTrialBanner','openSupportForPlan','contactSupportWhatsApp','launchConfetti'].forEach(fn => {
  if (typeof window[fn] === 'function' || typeof eval(fn) === 'function') window[fn] = eval(fn);
});
// ═══ Accordion Logic ═══
function toggleAccordion(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.acc-arrow');
  const item = header.parentElement;

  // إغلاق الباقي (اختياري)
  document.querySelectorAll('.accordion-body.active').forEach(el => {
    if (el !== body) {
      el.classList.remove('active');
      el.parentElement.querySelector('.acc-arrow').style.transform = 'rotate(0deg)';
    }
  });

  body.classList.toggle('active');
  arrow.style.transform = body.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
}

window.toggleAccordion = toggleAccordion;
console.log('✅ Script.js loaded — Wassilha v9.0');
