// ============================================
// ⚙️ SCRIPT.JS — Wassilha v6.0 (Part 1/3)
// State + Screens + Auth + Home + Map
// ============================================

console.log('🚀 Wassilha v6.0 loading...');

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
let mapPickerDetails = null;
let currentCategory = 'food';
let ordersFilter = 'all';

// Chat State
let currentChatOrder = null;
let chatPollingInterval = null;

// ═══════════════════════════════════════
// 📱 Screens Management
// ═══════════════════════════════════════
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = document.getElementById(screenId);
  if (!target) return;
  target.classList.add('active');
  target.style.display = 'flex';
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════
// 🎬 Splash & Init
// ═══════════════════════════════════════
function initSplash() {
  if (window.Lang) Lang.init();
  setTimeout(async () => {
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.user);
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
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

// ═══════════════════════════════════════
// 🔐 Login & OTP
// ═══════════════════════════════════════
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
      const allFilled = Array.from(inputs).every(i => i.value.length === 1);
      if (allFilled) setTimeout(() => handleVerifyOTP(), 300);
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
  btn.disabled = true; const originalHTML = btn.innerHTML; btn.innerHTML = '<span>...</span>';

  const result = await DB.verifyOTP(currentOTPPhone, code);
  if (!result.success) {
    btn.disabled = false; btn.innerHTML = originalHTML;
    showToast(t('wrongCode'));
    inputs.forEach(i => i.value = ''); inputs[0].focus();
    return;
  }
  const userResult = await DB.getUserByPhone(currentOTPPhone);
  if (userResult.success && userResult.user) {
    currentUser = userResult.user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));
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

// ═══════════════════════════════════════
// 👥 Role & Register
// ═══════════════════════════════════════
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
  btn.disabled = true; const originalHTML = btn.innerHTML; btn.innerHTML = '<span>...</span>';

  const result = await DB.createUser({ name, phone, role: currentRole });
  if (!result.success) {
    btn.disabled = false; btn.innerHTML = originalHTML;
    showToast(t('registerFailed') + ': ' + result.error); return;
  }

  if (currentRole === 'driver') await DB.createDriverProfile(result.user.id, vehicle);
  else if (currentRole === 'store') await DB.createStoreProfile(result.user.id, { name, phone, category: 'general' });

  await DB.getWallet(result.user.id);
  currentUser = result.user;
  localStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(currentUser));

  btn.disabled = false; btn.innerHTML = originalHTML;
  showToast(t('accountCreated'));

  setTimeout(() => {
    if (currentRole === 'driver') { showScreen('driverScreen'); loadDriverData(); }
    else if (currentRole === 'store') { showToast(t('storeCreated')); showScreen('homeScreen'); loadHomeData(); }
    else { showScreen('homeScreen'); loadHomeData(); }
  }, 1000);
}
// ============================================
// ⚙️ SCRIPT.JS — Wassilha v6.0 (Part 2/3)
// Home + Orders + Tracking + Map + Chat
// ============================================

// ═══════════════════════════════════════
// 🏠 Home
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
  if (!list || !currentUser) return;
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
    'pending':   { label: t('pending'),   class: 'pending'   },
    'accepted':  { label: t('accepted'),  class: 'accepted'  },
    'picked_up': { label: t('pickedUp'),  class: 'accepted'  },
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
// 🔍 Search & Category
// ═══════════════════════════════════════
function openSearchScreen() {
  showScreen('searchScreen');
  const input = document.getElementById('mainSearchInput');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 300); }
  resetSearchUI();
}

function closeSearch() { goHome(); }

function resetSearchUI() {
  const popular = document.getElementById('searchPopular');
  const cats = document.getElementById('searchCategories');
  const results = document.getElementById('searchResults');
  if (popular) popular.style.display = 'block';
  if (cats) cats.style.display = 'block';
  if (results) results.innerHTML = '';
}

function handleMainSearch(event) {
  const query = event.target.value.trim();
  const popular = document.getElementById('searchPopular');
  const cats = document.getElementById('searchCategories');
  const results = document.getElementById('searchResults');

  if (query.length < 2) { resetSearchUI(); return; }
  if (popular) popular.style.display = 'none';
  if (cats) cats.style.display = 'none';

  const mockResults = getMockSearchResults(query);
  if (!mockResults.length) {
    results.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <h4>${t('noResults')}</h4><p>${t('tryOtherSearch')}</p>
      </div>`;
    return;
  }
  results.innerHTML = mockResults.map(r => `
    <div class="store-card" onclick="openCategory('${r.category}')">
      <div class="store-logo">${r.icon}</div>
      <div class="store-info">
        <h4 class="store-name">${r.name}</h4>
        <div class="store-meta">
          <span class="store-rating">⭐ ${r.rating}</span>
          <span>📍 ${r.distance} ${t('km')}</span>
        </div>
      </div>
    </div>`).join('');
}

function quickSearch(term) {
  const input = document.getElementById('mainSearchInput');
  if (input) { input.value = term; handleMainSearch({ target: { value: term } }); }
}

function getMockSearchResults(query) {
  const all = [
    { name: 'صيدلية النور', icon: '💊', rating: 4.8, distance: 1.2, category: 'pharmacy' },
    { name: 'مطعم البصرة', icon: '🍕', rating: 4.7, distance: 1.8, category: 'food' },
    { name: 'بقالة الرصافة', icon: '🛒', rating: 4.4, distance: 2.0, category: 'grocery' }
  ];
  return all.filter(s => s.name.includes(query) || query.includes(s.name.split(' ')[0]));
}

function openCategory(category) {
  currentCategory = category;
  const titleEl = document.getElementById('categoryTitle');
  if (titleEl) titleEl.textContent = { 'food': t('food'), 'grocery': t('grocery'), 'pharmacy': t('pharmacy'), 'package': t('package') }[category] || t('category');
  showScreen('categoryScreen');
  loadCategoryStores(category);
}

function loadCategoryStores(category) {
  const list = document.getElementById('categoryList');
  if (!list) return;
  const mockStores = {
    'food': [{ name: 'مطعم البصرة', icon: '🍕', rating: 4.7, distance: 1.8, time: 25 }],
    'pharmacy': [{ name: 'صيدلية النور', icon: '💊', rating: 4.8, distance: 1.2, time: 15 }],
    'grocery': [{ name: 'بقالة الرصافة', icon: '🛒', rating: 4.4, distance: 2.0, time: 20 }],
    'package': [{ name: 'توصيل عام', icon: '📦', rating: 4.9, distance: 0, time: 30 }]
  };
  const stores = mockStores[category] || [];
  if (!stores.length) { list.innerHTML = `<div class="empty-state"><h4>${t('noStores')}</h4><p>${t('comingSoon')}</p></div>`; return; }
  list.innerHTML = stores.map(s => `
    <div class="store-card" onclick="openNewOrder()">
      <div class="store-logo">${s.icon}</div>
      <div class="store-info">
        <h4 class="store-name">${s.name}</h4>
        <div class="store-meta"><span class="store-rating">⭐ ${s.rating}</span>${s.distance > 0 ? `<span>📍 ${s.distance} ${t('km')}</span>` : ''}<span>⏱️ ${s.time} ${t('min')}</span></div>
      </div>
    </div>`).join('');
}

function filterCategory(event) {
  const q = event.target.value.trim().toLowerCase();
  document.querySelectorAll('#categoryList .store-card').forEach(c => {
    c.style.display = c.querySelector('.store-name').textContent.toLowerCase().includes(q) ? 'flex' : 'none';
  });
}
function applyFilter(f, b) { document.querySelectorAll('.category-filter').forEach(x => x.classList.remove('active')); b.classList.add('active'); }

// ═══════════════════════════════════════
// 🛵 New Order
// ═══════════════════════════════════════
function openNewOrder() { showScreen('newOrderScreen'); resetOrderForm(); }

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
  if (!from) { showToast(t('selectPickupFirst')); return; }
  if (!to) { showToast(t('selectDropoffFirst')); return; }

  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true; const originalHTML = btn.innerHTML; btn.innerHTML = '<span>...</span>';

  const distance = Math.floor(Math.random() * 8) + 2;
  const base = CONFIG.PRICING.basePrice;
  const kmCost = distance * CONFIG.PRICING.pricePerKm;
  const total = Math.max(base + kmCost, CONFIG.PRICING.minPrice);
  const driverShare = Math.round(total * CONFIG.PRICING.driverShare);
  const platformShare = total - driverShare;

  const pickupCoords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.locationCoords) || 'null');
  const dropoffCoords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.dropoffCoords) || 'null');

  const result = await DB.createOrder({
    customerId: currentUser.id, pickupAddress: from,
    pickupLat: pickupCoords?.lat || null, pickupLng: pickupCoords?.lng || null,
    dropoffAddress: to, dropoffLat: dropoffCoords?.lat || null, dropoffLng: dropoffCoords?.lng || null,
    packageType: selectedPackageType, notes: document.getElementById('orderNotes').value,
    distance, basePrice: base, totalPrice: total, driverShare, platformShare
  });

  btn.disabled = false; btn.innerHTML = originalHTML;

  if (!result.success) { showToast('❌ ' + result.error); return; }
  showToast(t('orderSentSuccess'));

  await DB.createNotification(currentUser.id, '🛵 ' + t('orderSent'), t('willContact'), 'order');
  setTimeout(() => openTracking(result.order.id), 1000);
}

// ═══════════════════════════════════════
// 🗺️ Map Picker
// ═══════════════════════════════════════
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
  document.getElementById('mapFloatingLabel').classList.remove('active');
  
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

  mapPickerInstance.on('movestart', () => showFloatingLabel());
  mapPickerInstance.on('moveend', () => updateMapLocation());
  mapPickerInstance.on('zoomstart', () => showFloatingLabel());

  setTimeout(() => { updateMapLocation(); mapPickerInstance.invalidateSize(); }, 500);
}

function showFloatingLabel() {
  const label = document.getElementById('mapFloatingLabel');
  if (!label) return;
  label.classList.add('active');
  clearTimeout(window._floatingLabelTimer);
  window._floatingLabelTimer = setTimeout(() => label.classList.remove('active'), 800);
}
// ============================================
// ⚙️ SCRIPT.JS — Wassilha v6.0 (Part 3/3)
// LocationIQ + GPS Delivery + Chat + Driver + Settings
// ============================================

// ═══════════════════════════════════════
// 📍 Reverse Geocoding (LocationIQ)
// ═══════════════════════════════════════
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
      const building = addr.house_number || '';
      const road = addr.road || addr.street || addr.pedestrian || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || '';
      const district = addr.city_district || addr.district || addr.county || '';
      const city = addr.city || addr.town || addr.village || '';
      const state = addr.state || '';

      const fullParts = [building, road, suburb, district, city].filter(Boolean);
      const fullAddress = fullParts.length > 0 ? fullParts.slice(0, 4).join('، ') : (liqData.display_name || '').split(', ').slice(0, 4).join('، ');

      details = {
        fullAddress: fullAddress || 'موقع محدد',
        area: suburb || district || city || state || 'العراق',
        street: road || 'غير محدد',
        building: building || '—',
        coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        lat: center.lat, lng: center.lng
      };
    }
  } catch (e) { console.warn('LocationIQ failed:', e); }

  if (!details) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1&accept-language=${Lang.current()}`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        details = {
          fullAddress: data.display_name ? data.display_name.split(', ').slice(0, 4).join('، ') : 'موقع محدد',
          area: addr.suburb || addr.city_district || addr.city || '—',
          street: addr.road || 'غير محدد',
          building: addr.house_number || '—',
          coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
          lat: center.lat, lng: center.lng
        };
      }
    } catch (e) { console.warn('Nominatim failed:', e); }
  }

  if (!details) {
    details = { fullAddress: 'موقع محدد على الخريطة', area: '—', street: 'غير محدد', building: '—', coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`, lat: center.lat, lng: center.lng };
  }

  mapPickerDetails = details;
  document.getElementById('mapSelectedAddress').textContent = details.fullAddress;
}

function locateUserOnMap() {
  if (!navigator.geolocation) { showToast('⚠️ ' + t('gpsUnavailable')); return; }
  if (!mapPickerInstance) { showToast('⏳ ' + t('detecting')); return; }
  
  const btn = document.querySelector('.map-locate-btn');
  btn.classList.add('loading');
  showToast('📍 ' + t('detectingLocation'));

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude; const lng = position.coords.longitude;
      mapPickerInstance.flyTo([lat, lng], 16, { duration: 1.5, easeLinearity: 0.25 });
      mapPickerLocation = { lat, lng };
      localStorage.setItem(CONFIG.STORAGE_KEYS.locationCoords, JSON.stringify({ lat, lng }));
      setTimeout(async () => { await updateMapLocation(); btn.classList.remove('loading'); showToast('✅ ' + t('locationDetected')); }, 1600);
    },
    (error) => {
      btn.classList.remove('loading');
      let errorMsg = '⚠️ ' + t('locationFailed');
      if (error.code === 1) errorMsg = '⚠️ ' + t('permissionDenied');
      else if (error.code === 2) errorMsg = '⚠️ ' + t('gpsUnavailable');
      showToast(errorMsg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

// ═══════════════════════════════════════
// 🔍 Map Search (LocationIQ)
// ═══════════════════════════════════════
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
            const parts = [r.address?.road, r.address?.suburb || r.address?.neighbourhood, r.address?.city || r.address?.town, r.address?.state].filter(Boolean);
            return {
              name: r.address?.name || r.display_name?.split(', ')[0] || query,
              subtitle: parts.join('، ') || r.display_name?.split(', ').slice(1, 4).join('، ') || 'العراق',
              lat: parseFloat(r.lat), lng: parseFloat(r.lon)
            };
          });
        }
      }
    } catch (e) { console.warn('LocationIQ search failed:', e); }

    if (allResults.length === 0) {
      try {
        const nomiRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${Lang.current()}&limit=8&countrycodes=iq`);
        const nomiData = await nomiRes.json();
        if (nomiData.length > 0) {
          allResults = nomiData.map(r => ({
            name: r.display_name.split(', ')[0], subtitle: r.display_name.split(', ').slice(1, 4).join('، '),
            lat: parseFloat(r.lat), lng: parseFloat(r.lon)
          }));
        }
      } catch (e) { console.warn('Nominatim failed:', e); }
    }

    if (allResults.length === 0) {
      resultsEl.innerHTML = `<div class="search-result-item" style="text-align:center;color:var(--text-3);padding:20px;"><div style="font-size:32px;margin-bottom:8px;">🔍</div><div style="font-weight:800;color:var(--text);margin-bottom:4px;">${t('noResults')}</div></div>`;
      return;
    }

    const uniqueResults = []; const seen = new Set();
    allResults.forEach(r => {
      const key = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
      if (!seen.has(key)) { seen.add(key); uniqueResults.push(r); }
    });

    resultsEl.innerHTML = uniqueResults.slice(0, 6).map(r => {
      const safeName = r.name.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      return `<div class="search-result-item" onclick="selectMapSearchResult(${r.lat}, ${r.lng}, '${safeName}')"><strong>📍 ${r.name}</strong><small>${r.subtitle}</small></div>`;
    }).join('');
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
    if (!mapPickerDetails) { showToast('⏳ جاري التحميل...'); return; }
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

  if (note) { const notesField = document.getElementById('orderNotes'); if (notesField && !notesField.value) notesField.value = note; }
  calculatePreviewPrice();
  showToast('✅ ' + t('locationConfirmed'));
  setTimeout(() => closeMapPicker(), 500);
}

// ═══════════════════════════════════════
// 🗺️ Tracking & Driver Identity
// ═══════════════════════════════════════
async function openTracking(orderId) {
  if (!currentUser) return;
  showScreen('trackingScreen');
  const result = await DB.getOrderById(orderId);
  const order = result.order;
  if (!order) { showToast(t('orderNotFound')); goHome(); return; }

  currentOrder = order;
  document.getElementById('trackingOrderId').textContent = order.order_number || '—';

  const steps = ['created', 'accepted', 'pickedup', 'delivered'];
  const statusIndex = { 'pending': 0, 'accepted': 1, 'picked_up': 2, 'delivered': 3, 'cancelled': -1 };
  const currentIndex = statusIndex[order.status] ?? 0;

  steps.forEach((step, i) => {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;
    el.classList.remove('done', 'active');
    if (i < currentIndex) { el.classList.add('done'); el.querySelector('.step-dot').textContent = '✓'; }
    else if (i === currentIndex) { el.classList.add('active'); el.querySelector('.step-dot').textContent = '●'; }
    else { el.querySelector('.step-dot').textContent = '○'; }
  });

  const etaEl = document.getElementById('trackingETA');
  if (etaEl) etaEl.textContent = order.status === 'delivered' ? t('delivered') + ' ✓' : t('arriving15');

  if (order.driver_id) {
    await renderDriverIdentity(order);
  } else {
    document.getElementById('driverIdentityCard').style.display = 'none';
  }

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
  const vehicleType = driverProfile?.driver?.vehicle_type || 'motorcycle';
  document.getElementById('driverIdVehicle').textContent = vehicles[vehicleType] || vehicles.motorcycle;

  const isVerified = driverProfile?.driver?.is_verified;
  document.getElementById('driverIdVerified').textContent = isVerified ? '✅ ' + t('driverVerified') : '⏳ ' + t('driverPending');

  card.dataset.driverPhone = driver.phone || '';
  card.dataset.driverName = driver.name || t('driver');
  card.style.display = 'block';
}

function initTrackingMap(order) {
  const mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  if (trackingMap) { trackingMap.remove(); trackingMap = null; }
  if (typeof L === 'undefined') return;

  const coords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.locationCoords) || 'null');
  const center = coords ? [coords.lat, coords.lng] : [CONFIG.MAPS.defaultCenter.lat, CONFIG.MAPS.defaultCenter.lng];

  trackingMap = L.map('trackingMap').setView(center, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(trackingMap);

  L.marker(center).addTo(trackingMap).bindPopup('📍 ' + t('myLocation'));
  const driverCoords = [center[0] + 0.005, center[1] + 0.005];
  L.marker(driverCoords, { icon: L.divIcon({ className: 'marker-driver', html: '<div style="font-size:30px;">🛵</div>', iconSize: [40, 40] }) }).addTo(trackingMap).bindPopup(t('driver'));

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

// ═══════════════════════════════════════
// 📞 Communication (Call/WhatsApp/Chat)
// ═══════════════════════════════════════
function callDriver() {
  const card = document.getElementById('driverIdentityCard');
  const phone = card?.dataset.driverPhone;
  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  window.location.href = `tel:${phone}`;
}

function whatsappDriver() {
  const card = document.getElementById('driverIdentityCard');
  const phone = card?.dataset.driverPhone;
  const driverName = card?.dataset.driverName;
  const orderId = currentOrder?.order_number || '';

  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  
  let intlPhone = phone.replace(/\D/g, '');
  if (intlPhone.startsWith('0')) intlPhone = '964' + intlPhone.substring(1);
  
  const message = encodeURIComponent(`مرحباً ${driverName}، أنا عميلك في تطبيق وصّلها.\nطلب رقم: #${orderId}\nأرجو التواصل بخصوص التوصيل.`);
  window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
}

async function chatWithDriver() {
  if (!currentOrder || !currentOrder.driver_id) {
    showToast('⚠️ ' + t('driverAcceptedDesc'));
    return;
  }
  openChat(currentOrder.id, currentOrder.driver_id, document.getElementById('driverIdName').textContent);
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
  const { orderId, otherUserId } = currentChatOrder;
  const result = await DB.getOrderMessages(orderId);
  
  if (result.success) {
    renderChatMessages(result.messages, otherUserId);
  }
}

function renderChatMessages(messages, otherUserId) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  const isAr = (window.Lang?.current?.() || 'ar') === 'ar';
  
  if (!messages || messages.length === 0) {
    container.innerHTML = `
      <div class="chat-empty">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h4>${t('noMessages')}</h4>
        <p>${t('startChat')}</p>
      </div>`;
    return;
  }

  let lastDate = null;
  container.innerHTML = messages.map(msg => {
    const isMine = msg.sender_id === currentUser.id;
    const time = new Date(msg.created_at);
    const timeStr = time.toLocaleTimeString(isAr ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    const msgDate = time.toDateString();
    let dateSeparator = '';
    if (msgDate !== lastDate) {
      lastDate = msgDate;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const dateLabel = msgDate === today ? t('today') : (msgDate === yesterday ? t('yesterday') : time.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US'));
      dateSeparator = `<div class="chat-date-separator"><span>${dateLabel}</span></div>`;
    }

    return `
      ${dateSeparator}
      <div class="chat-bubble-wrapper ${isMine ? 'mine' : 'other'}">
        <div class="chat-bubble ${isMine ? 'mine' : 'other'}">
          ${msg.message}
        </div>
        <div class="chat-time">${timeStr}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentChatOrder) return;

  input.value = '';
  
  await DB.sendMessage(
    currentChatOrder.orderId, 
    currentUser.id, 
    currentChatOrder.otherUserId, 
    text
  );
  
  await loadChatMessages();
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function closeChat() {
  if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }
  currentChatOrder = null;
  openTracking(currentOrder?.id); // ارجع لشاشة التتبع
}
// ============================================
// ⚙️ SCRIPT.JS — Wassilha v6.0 (Part 3/3)
// LocationIQ + GPS Delivery + Chat + Driver + Settings
// ============================================

// ═══════════════════════════════════════
// 📍 Reverse Geocoding (LocationIQ)
// ═══════════════════════════════════════
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
      const building = addr.house_number || '';
      const road = addr.road || addr.street || addr.pedestrian || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || '';
      const district = addr.city_district || addr.district || addr.county || '';
      const city = addr.city || addr.town || addr.village || '';
      const state = addr.state || '';

      const fullParts = [building, road, suburb, district, city].filter(Boolean);
      const fullAddress = fullParts.length > 0 ? fullParts.slice(0, 4).join('، ') : (liqData.display_name || '').split(', ').slice(0, 4).join('، ');

      details = {
        fullAddress: fullAddress || 'موقع محدد',
        area: suburb || district || city || state || 'العراق',
        street: road || 'غير محدد',
        building: building || '—',
        coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        lat: center.lat, lng: center.lng
      };
    }
  } catch (e) { console.warn('LocationIQ failed:', e); }

  if (!details) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1&accept-language=${Lang.current()}`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        details = {
          fullAddress: data.display_name ? data.display_name.split(', ').slice(0, 4).join('، ') : 'موقع محدد',
          area: addr.suburb || addr.city_district || addr.city || '—',
          street: addr.road || 'غير محدد',
          building: addr.house_number || '—',
          coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
          lat: center.lat, lng: center.lng
        };
      }
    } catch (e) { console.warn('Nominatim failed:', e); }
  }

  if (!details) {
    details = { fullAddress: 'موقع محدد على الخريطة', area: '—', street: 'غير محدد', building: '—', coordinates: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`, lat: center.lat, lng: center.lng };
  }

  mapPickerDetails = details;
  document.getElementById('mapSelectedAddress').textContent = details.fullAddress;
}

function locateUserOnMap() {
  if (!navigator.geolocation) { showToast('⚠️ ' + t('gpsUnavailable')); return; }
  if (!mapPickerInstance) { showToast('⏳ ' + t('detecting')); return; }
  
  const btn = document.querySelector('.map-locate-btn');
  btn.classList.add('loading');
  showToast('📍 ' + t('detectingLocation'));

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude; const lng = position.coords.longitude;
      mapPickerInstance.flyTo([lat, lng], 16, { duration: 1.5, easeLinearity: 0.25 });
      mapPickerLocation = { lat, lng };
      localStorage.setItem(CONFIG.STORAGE_KEYS.locationCoords, JSON.stringify({ lat, lng }));
      setTimeout(async () => { await updateMapLocation(); btn.classList.remove('loading'); showToast('✅ ' + t('locationDetected')); }, 1600);
    },
    (error) => {
      btn.classList.remove('loading');
      let errorMsg = '⚠️ ' + t('locationFailed');
      if (error.code === 1) errorMsg = '⚠️ ' + t('permissionDenied');
      else if (error.code === 2) errorMsg = '⚠️ ' + t('gpsUnavailable');
      showToast(errorMsg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

// ═══════════════════════════════════════
// 🔍 Map Search (LocationIQ)
// ═══════════════════════════════════════
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
            const parts = [r.address?.road, r.address?.suburb || r.address?.neighbourhood, r.address?.city || r.address?.town, r.address?.state].filter(Boolean);
            return {
              name: r.address?.name || r.display_name?.split(', ')[0] || query,
              subtitle: parts.join('، ') || r.display_name?.split(', ').slice(1, 4).join('، ') || 'العراق',
              lat: parseFloat(r.lat), lng: parseFloat(r.lon)
            };
          });
        }
      }
    } catch (e) { console.warn('LocationIQ search failed:', e); }

    if (allResults.length === 0) {
      try {
        const nomiRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${Lang.current()}&limit=8&countrycodes=iq`);
        const nomiData = await nomiRes.json();
        if (nomiData.length > 0) {
          allResults = nomiData.map(r => ({
            name: r.display_name.split(', ')[0], subtitle: r.display_name.split(', ').slice(1, 4).join('، '),
            lat: parseFloat(r.lat), lng: parseFloat(r.lon)
          }));
        }
      } catch (e) { console.warn('Nominatim failed:', e); }
    }

    if (allResults.length === 0) {
      resultsEl.innerHTML = `<div class="search-result-item" style="text-align:center;color:var(--text-3);padding:20px;"><div style="font-size:32px;margin-bottom:8px;">🔍</div><div style="font-weight:800;color:var(--text);margin-bottom:4px;">${t('noResults')}</div></div>`;
      return;
    }

    const uniqueResults = []; const seen = new Set();
    allResults.forEach(r => {
      const key = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
      if (!seen.has(key)) { seen.add(key); uniqueResults.push(r); }
    });

    resultsEl.innerHTML = uniqueResults.slice(0, 6).map(r => {
      const safeName = r.name.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      return `<div class="search-result-item" onclick="selectMapSearchResult(${r.lat}, ${r.lng}, '${safeName}')"><strong>📍 ${r.name}</strong><small>${r.subtitle}</small></div>`;
    }).join('');
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
    if (!mapPickerDetails) { showToast('⏳ جاري التحميل...'); return; }
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

  if (note) { const notesField = document.getElementById('orderNotes'); if (notesField && !notesField.value) notesField.value = note; }
  calculatePreviewPrice();
  showToast('✅ ' + t('locationConfirmed'));
  setTimeout(() => closeMapPicker(), 500);
}

// ═══════════════════════════════════════
// 🗺️ Tracking & Driver Identity
// ═══════════════════════════════════════
async function openTracking(orderId) {
  if (!currentUser) return;
  showScreen('trackingScreen');
  const result = await DB.getOrderById(orderId);
  const order = result.order;
  if (!order) { showToast(t('orderNotFound')); goHome(); return; }

  currentOrder = order;
  document.getElementById('trackingOrderId').textContent = order.order_number || '—';

  const steps = ['created', 'accepted', 'pickedup', 'delivered'];
  const statusIndex = { 'pending': 0, 'accepted': 1, 'picked_up': 2, 'delivered': 3, 'cancelled': -1 };
  const currentIndex = statusIndex[order.status] ?? 0;

  steps.forEach((step, i) => {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;
    el.classList.remove('done', 'active');
    if (i < currentIndex) { el.classList.add('done'); el.querySelector('.step-dot').textContent = '✓'; }
    else if (i === currentIndex) { el.classList.add('active'); el.querySelector('.step-dot').textContent = '●'; }
    else { el.querySelector('.step-dot').textContent = '○'; }
  });

  const etaEl = document.getElementById('trackingETA');
  if (etaEl) etaEl.textContent = order.status === 'delivered' ? t('delivered') + ' ✓' : t('arriving15');

  if (order.driver_id) {
    await renderDriverIdentity(order);
  } else {
    document.getElementById('driverIdentityCard').style.display = 'none';
  }

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
  const vehicleType = driverProfile?.driver?.vehicle_type || 'motorcycle';
  document.getElementById('driverIdVehicle').textContent = vehicles[vehicleType] || vehicles.motorcycle;

  const isVerified = driverProfile?.driver?.is_verified;
  document.getElementById('driverIdVerified').textContent = isVerified ? '✅ ' + t('driverVerified') : '⏳ ' + t('driverPending');

  card.dataset.driverPhone = driver.phone || '';
  card.dataset.driverName = driver.name || t('driver');
  card.style.display = 'block';
}

function initTrackingMap(order) {
  const mapEl = document.getElementById('trackingMap');
  if (!mapEl) return;
  if (trackingMap) { trackingMap.remove(); trackingMap = null; }
  if (typeof L === 'undefined') return;

  const coords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.locationCoords) || 'null');
  const center = coords ? [coords.lat, coords.lng] : [CONFIG.MAPS.defaultCenter.lat, CONFIG.MAPS.defaultCenter.lng];

  trackingMap = L.map('trackingMap').setView(center, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(trackingMap);

  L.marker(center).addTo(trackingMap).bindPopup('📍 ' + t('myLocation'));
  const driverCoords = [center[0] + 0.005, center[1] + 0.005];
  L.marker(driverCoords, { icon: L.divIcon({ className: 'marker-driver', html: '<div style="font-size:30px;">🛵</div>', iconSize: [40, 40] }) }).addTo(trackingMap).bindPopup(t('driver'));

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

// ═══════════════════════════════════════
// 📞 Communication (Call/WhatsApp/Chat)
// ═══════════════════════════════════════
function callDriver() {
  const card = document.getElementById('driverIdentityCard');
  const phone = card?.dataset.driverPhone;
  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  window.location.href = `tel:${phone}`;
}

function whatsappDriver() {
  const card = document.getElementById('driverIdentityCard');
  const phone = card?.dataset.driverPhone;
  const driverName = card?.dataset.driverName;
  const orderId = currentOrder?.order_number || '';

  if (!phone) { showToast('⚠️ ' + t('driverPhoneUnavailable')); return; }
  
  let intlPhone = phone.replace(/\D/g, '');
  if (intlPhone.startsWith('0')) intlPhone = '964' + intlPhone.substring(1);
  
  const message = encodeURIComponent(`مرحباً ${driverName}، أنا عميلك في تطبيق وصّلها.\nطلب رقم: #${orderId}\nأرجو التواصل بخصوص التوصيل.`);
  window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
}

async function chatWithDriver() {
  if (!currentOrder || !currentOrder.driver_id) {
    showToast('⚠️ ' + t('driverAcceptedDesc'));
    return;
  }
  openChat(currentOrder.id, currentOrder.driver_id, document.getElementById('driverIdName').textContent);
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
  const { orderId, otherUserId } = currentChatOrder;
  const result = await DB.getOrderMessages(orderId);
  
  if (result.success) {
    renderChatMessages(result.messages, otherUserId);
  }
}

function renderChatMessages(messages, otherUserId) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  const isAr = (window.Lang?.current?.() || 'ar') === 'ar';
  
  if (!messages || messages.length === 0) {
    container.innerHTML = `
      <div class="chat-empty">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h4>${t('noMessages')}</h4>
        <p>${t('startChat')}</p>
      </div>`;
    return;
  }

  let lastDate = null;
  container.innerHTML = messages.map(msg => {
    const isMine = msg.sender_id === currentUser.id;
    const time = new Date(msg.created_at);
    const timeStr = time.toLocaleTimeString(isAr ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    const msgDate = time.toDateString();
    let dateSeparator = '';
    if (msgDate !== lastDate) {
      lastDate = msgDate;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const dateLabel = msgDate === today ? t('today') : (msgDate === yesterday ? t('yesterday') : time.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US'));
      dateSeparator = `<div class="chat-date-separator"><span>${dateLabel}</span></div>`;
    }

    return `
      ${dateSeparator}
      <div class="chat-bubble-wrapper ${isMine ? 'mine' : 'other'}">
        <div class="chat-bubble ${isMine ? 'mine' : 'other'}">
          ${msg.message}
        </div>
        <div class="chat-time">${timeStr}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentChatOrder) return;

  input.value = '';
  
  await DB.sendMessage(
    currentChatOrder.orderId, 
    currentUser.id, 
    currentChatOrder.otherUserId, 
    text
  );
  
  await loadChatMessages();
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function closeChat() {
  if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }
  currentChatOrder = null;
  openTracking(currentOrder?.id); // ارجع لشاشة التتبع
}
// ============================================
// ⚙️ SCRIPT.JS — Wassilha v6.0 (Part 4/4)
// Driver Dashboard + Settings + Utilities + Exports
// ============================================

// ═══════════════════════════════════════
// 🛵 Driver Dashboard
// ═══════════════════════════════════════
async function loadDriverData() {
  if (!currentUser) return;

  const nameEl = document.getElementById('driverName');
  if (nameEl) nameEl.textContent = currentUser.name;

  const avatarEl = document.getElementById('driverAvatarLetter');
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0);

  const driverResult = await DB.getDriverProfile(currentUser.id);
  if (driverResult.success && driverResult.driver) {
    driverOnline = driverResult.driver.is_online || false;
    updateDriverToggleUI();
  }

  await loadAvailableOrders();
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
  driverOnline = !driverOnline;
  updateDriverToggleUI();

  if (driverOnline) {
    showToast('✅ ' + t('online'));
    let lat = CONFIG.MAPS.defaultCenter.lat;
    let lng = CONFIG.MAPS.defaultCenter.lng;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          lat = pos.coords.latitude; lng = pos.coords.longitude;
          await DB.updateDriverStatus(currentUser.id, true, lat, lng);
        },
        async () => await DB.updateDriverStatus(currentUser.id, true, lat, lng),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      await DB.updateDriverStatus(currentUser.id, true, lat, lng);
    }

    setTimeout(() => { if (driverOnline) loadAvailableOrders(); }, 2000);
  } else {
    showToast('⏹️ ' + t('offline'));
    await DB.updateDriverStatus(currentUser.id, false);
    if (typeof stopOrderSound === 'function') stopOrderSound();
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
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <h4>${t('noNearbyOrders')}</h4>
        <p>${t('activateConnection')}</p>
      </div>`;
    if (count) count.textContent = '0';
    return;
  }

  if (count) count.textContent = result.orders.length;

  if (driverOnline && result.orders.length > 0) {
    if (typeof playOrderSound === 'function') playOrderSound(true);
  }

  list.innerHTML = result.orders.map(o => renderAvailableOrder(o)).join('');
}

function renderAvailableOrder(order) {
  const distance = (1 + Math.random() * 5).toFixed(1);
  const distanceNum = parseFloat(distance);
  const badgeClass = distanceNum < 2 ? 'delivered' : distanceNum < 5 ? 'pending' : 'cancelled';

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
  if (!result.success) { showToast(t('acceptFailed')); return; }

  if (typeof stopOrderSound === 'function') stopOrderSound();
  showToast('✅ ' + t('orderAccepted'));

  if (result.order?.customer_id) {
    await DB.createNotification(result.order.customer_id, '✅ ' + t('accepted'), currentUser.name + ' — ' + t('onTheWay'), 'order');
  }
  await loadAvailableOrders();
}

// ═══════════════════════════════════════
// 📍 GPS Delivery Confirmation (للمندوب)
// ═══════════════════════════════════════
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function markAsDelivered() {
  if (!currentOrder) return;
  const order = currentOrder;

  if (!navigator.geolocation) {
    if (confirm(t('gpsFailedConfirm'))) {
      await DB.updateOrderStatus(order.id, 'delivered');
      showToast('✅ ' + t('deliverySuccess'));
      goHome();
    }
    return;
  }

  showToast('📍 ' + t('checkingLocation'));

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const driverLat = position.coords.latitude;
      const driverLng = position.coords.longitude;
      const distance = getDistanceInMeters(driverLat, driverLng, order.dropoff_lat, order.dropoff_lng);

      if (distance !== null && distance > 100) {
        showToast(`⚠️ ${t('tooFarFromCustomer')} (${distance.toFixed(0)} ${t('metersAway')})`);
        return;
      }

      const result = await DB.markOrderDeliveredWithGPS(order.id, driverLat, driverLng, distance || 0);
      if (result.success) {
        showToast('✅ ' + t('deliverySuccess'));
        await DB.createNotification(order.customer_id, '✅ ' + t('delivered'), 'طلبك وصل بنجاح', 'order');
        goHome();
      }
    },
    (error) => {
      if (confirm(t('gpsFailedConfirm'))) {
        DB.updateOrderStatus(order.id, 'delivered').then(() => {
          showToast('✅ ' + t('deliverySuccess'));
          goHome();
        });
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// ═══════════════════════════════════════
// ⚙️ Settings & Theme
// ═══════════════════════════════════════
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
  // إخفاء خيارات الصوت لغير المندوبين
const orderSoundRow = document.querySelector('[onclick="openSoundPicker(\'order\')"]');
const notifSoundRow = document.querySelector('[onclick="openSoundPicker(\'notification\')"]');

if (currentUser && currentUser.role !== 'driver') {
  if (orderSoundRow) orderSoundRow.style.display = 'none';
  if (notifSoundRow) notifSoundRow.style.display = 'none';
} else {
  if (orderSoundRow) orderSoundRow.style.display = 'flex';
  if (notifSoundRow) notifSoundRow.style.display = 'flex';
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
  let appliedTheme = theme;
  if (theme === 'auto') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', appliedTheme);
}

function initSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handleSystemThemeChange);
  else if (mediaQuery.addListener) mediaQuery.addListener(handleSystemThemeChange);
}

function handleSystemThemeChange(e) {
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'auto';
  if (savedTheme !== 'auto') return;
  const newTheme = e.matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
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

// ═══════════════════════════════════════
// 👤 Profile & Misc
// ═══════════════════════════════════════
async function openProfile() {
  showScreen('profileScreen');
  if (!currentUser) return;
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profilePhone').textContent = currentUser.phone;
  document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0);
  
  const result = await DB.getUserOrders(currentUser.id);
  document.getElementById('profileOrderCount').textContent = result.success ? result.orders.length : 0;
  
  const walletResult = await DB.getWallet(currentUser.id);
  if (walletResult.success) document.getElementById('profileBalance').textContent = (walletResult.wallet.balance || 0).toLocaleString();
  document.getElementById('profileRating').textContent = currentUser.rating || '5.0';
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
  list.innerHTML = result.notifications.map(n => `
    <div class="notif-card ${n.is_read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
      <div class="notif-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
      <div class="notif-content"><h4>${n.title}</h4><p>${n.message}</p><span class="notif-time">${formatDate(n.created_at)}</span></div>
    </div>`).join('');
}

async function markNotifRead(id) { await DB.markNotificationRead(id); }

function openOrders() { showScreen('ordersScreen'); loadOrdersList(); }

async function loadOrdersList() {
  const list = document.getElementById('ordersList');
  if (!list || !currentUser) return;
  const result = await DB.getUserOrders(currentUser.id);
  if (!result.success || !result.orders.length) {
    list.innerHTML = `<div class="empty-state"><h4>${t('noOrders')}</h4></div>`;
    return;
  }
  let filtered = result.orders;
  if (ordersFilter === 'pending') filtered = result.orders.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
  else if (ordersFilter === 'delivered') filtered = result.orders.filter(o => o.status === 'delivered');
  else if (ordersFilter === 'cancelled') filtered = result.orders.filter(o => o.status === 'cancelled');
  
  if (!filtered.length) { list.innerHTML = `<div class="empty-state"><h4>${t('noResults')}</h4></div>`; return; }
  list.innerHTML = filtered.map(o => renderOrderCard(o)).join('');
}

function filterOrders(filter, btn) {
  ordersFilter = filter;
  document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadOrdersList();
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
  if (typeof stopOrderSound === 'function') stopOrderSound();
  showToast('✅ ' + t('logoutSuccess'));
  setTimeout(() => showScreen('loginScreen'), 500);
}

// ═══════════════════════════════════════
// 🛠️ Utilities
// ═══════════════════════════════════════
function validatePhone(phone) { return /^07[0-9]{9}$/.test(phone.replace(/\s/g, '')); }

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr); const now = new Date();
  const diff = Math.floor((now - date) / 60000);
  if (diff < 1) return t('now');
  if (diff < 60) return t('minsAgo') + ' ' + diff + ' ' + t('minsAgoSuffix');
  if (diff < 1440) return t('minsAgo') + ' ' + Math.floor(diff / 60) + ' ' + t('hoursAgoSuffix');
  return date.toLocaleDateString(Lang.current() === 'ar' ? 'ar-IQ' : 'en-US');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text'; btn.innerHTML = '<span>🙈</span>'; }
  else { input.type = 'password'; btn.innerHTML = '<span>👁️</span>'; }
}

function openContactUs() { showScreen('contactScreen'); }
function openWhatsApp() { window.open(`https://wa.me/${CONFIG.SUPPORT.whatsapp.replace('+', '')}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن تطبيق وصّلها')}`, '_blank'); }
function openEmail() { window.location.href = `mailto:${CONFIG.SUPPORT.email}?subject=استفسار`; }
function openTelegram() { window.open('https://t.me/' + CONFIG.SUPPORT.telegram.replace('@', ''), '_blank'); }
function openAbout() { showScreen('aboutScreen'); }
function openTerms() { showScreen('termsScreen'); }
function openPrivacy() { showScreen('privacyScreen'); }
function openRateApp() { const r = prompt(t('rateAppPrompt'), '5'); if (r) showToast('⭐ ' + t('thanksForRating')); }
function shareApp() { if (navigator.share) navigator.share({ title: 'وصّلها', url: window.location.origin }); }
function openAddresses() { showToast(t('comingSoon')); }
function openPaymentMethods() { showToast(t('comingSoon')); }
function openDriverEarnings() { showToast(t('comingSoon')); }

// ═══════════════════════════════════════
// 🌐 Language Integration
// ═══════════════════════════════════════
window.addEventListener('language-changed', (e) => {
  const lang = e.detail.lang;
  const langBtnText = document.getElementById('langBtnText');
  if (langBtnText) langBtnText.textContent = lang === 'ar' ? 'EN' : 'ع';
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === lang);
  });
});

// ═══════════════════════════════════════
// 🚀 Initialize
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Wassilha v6.0 initialized');
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'auto';
  applyTheme(savedTheme);
  initSystemThemeListener();

  if (window.Lang) {
    Lang.init();
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) langBtnText.textContent = Lang.current() === 'ar' ? 'EN' : 'ع';
  }
  window.addEventListener('supabase-ready', () => console.log('✅ Supabase ready'));
  initSplash();
});

// ═══════════════════════════════════════
// 🌐 Global Exports
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
window.openOrders = openOrders;
window.selectPackageType = selectPackageType;
window.submitOrder = submitOrder;
window.filterOrders = filterOrders;
window.openTracking = openTracking;
window.cancelOrder = cancelOrder;
window.markAsDelivered = markAsDelivered;
window.chatWithDriver = chatWithDriver;
window.callDriver = callDriver;
window.whatsappDriver = whatsappDriver;
window.openChat = openChat;
window.sendChatMessage = sendChatMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.closeChat = closeChat;
window.openProfile = openProfile;
window.openAddresses = openAddresses;
window.openPaymentMethods = openPaymentMethods;
window.openNotifications = openNotifications;
window.markNotifRead = markNotifRead;
window.toggleDriverOnline = toggleDriverOnline;
window.acceptOrder = acceptOrder;
window.openDriverEarnings = openDriverEarnings;
window.openMapPicker = openMapPicker;
window.closeMapPicker = closeMapPicker;
window.locateUserOnMap = locateUserOnMap;
window.handleMapSearch = handleMapSearch;
window.selectMapSearchResult = selectMapSearchResult;
window.confirmMapLocation = confirmMapLocation;
window.openSearchScreen = openSearchScreen;
window.closeSearch = closeSearch;
window.handleMainSearch = handleMainSearch;
window.quickSearch = quickSearch;
window.openCategory = openCategory;
window.filterCategory = filterCategory;
window.applyFilter = applyFilter;
window.openSettings = openSettings;
window.setTheme = setTheme;
window.toggleNotifications = toggleNotifications;
window.toggleSound = toggleSound;
window.openContactUs = openContactUs;
window.openWhatsApp = openWhatsApp;
window.openEmail = openEmail;
window.openTelegram = openTelegram;
window.openAbout = openAbout;
window.openTerms = openTerms;
window.openPrivacy = openPrivacy;
window.openRateApp = openRateApp;
window.shareApp = shareApp;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.showToast = showToast;
window.applyTheme = applyTheme;
window.initSystemThemeListener = initSystemThemeListener;

console.log('✅ Script.js loaded — Wassilha v6.0');
// ═══════════════════════════════════════
// 🛠️ إجباري: تفعيل أزرار اختيار الحساب
// ═══════════════════════════════════════
document.addEventListener('click', function(e) {
  // البحث عن أقرب بطاقة دور (عميل، مندوب، متجر) تم الضغط عليها
  const roleCard = e.target.closest('.role-card');
  if (roleCard) {
    e.preventDefault();
    e.stopPropagation();
    
    // معرفة أي زر تم الضغط عليه بناءً على النص أو الترتيب
    const text = roleCard.innerText;
    if (text.includes('عميل') || text.includes('Customer')) {
      selectRole('customer');
    } else if (text.includes('مندوب') || text.includes('Driver')) {
      selectRole('driver');
    } else if (text.includes('متجر') || text.includes('Store')) {
      selectRole('store');
    }
  }
}, true); // true تعني أن الحدث يعمل في مرحلة الالتقاط (Capture Phase) لتجاوز أي عوائق
