// ============================================
// ⚙️ SCRIPT.JS — Wassilha v4
// State + Utils + Splash + Login + Register + OTP
// ============================================

console.log('🚀 Wassilha v4.0 loading...');

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
  
  if (window.Lang) {
    setTimeout(() => Lang.apply(Lang.current()), 30);
  }
}

// ═══════════════════════════════════════
// 🎬 Splash → Auto Navigate
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
        console.error('Invalid user:', e);
        showScreen('loginScreen');
      }
    } else {
      showScreen('loginScreen');
    }
  }, 2500);
}

// ═══════════════════════════════════════
// 🔐 Login
// ═══════════════════════════════════════
async function handleLogin(e) {
  e.preventDefault();
  
  const phone = document.getElementById('loginPhone').value.trim();
  
  if (!validatePhone(phone)) {
    showToast(t('invalidPhone'));
    return;
  }
  
  const btn = document.getElementById('loginBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>...</span>';
  
  const result = await DB.getUserByPhone(phone);
  
  btn.disabled = false;
  btn.innerHTML = originalHTML;
  
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
// 📱 OTP
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
    startOTPTimer();
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
// 🔍 Search Screen
// ═══════════════════════════════════════
function openSearchScreen() {
  showScreen('searchScreen');
  
  const input = document.getElementById('mainSearchInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 300);
  }
  
  resetSearchUI();
}

function closeSearch() {
  goHome();
}

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
  
  if (query.length < 2) {
    resetSearchUI();
    return;
  }
  
  if (popular) popular.style.display = 'none';
  if (cats) cats.style.display = 'none';
  
  // ═══ نتائج البحث (mock للآن) ═══
  const mockResults = getMockSearchResults(query);
  
  if (!mockResults.length) {
    results.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h4>${t('noResults') || 'لا توجد نتائج'}</h4>
        <p>${t('tryOtherSearch') || 'جرب كلمة أخرى'}</p>
      </div>
    `;
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
    </div>
  `).join('');
}

function quickSearch(term) {
  const input = document.getElementById('mainSearchInput');
  if (input) {
    input.value = term;
    handleMainSearch({ target: { value: term } });
  }
}

function getMockSearchResults(query) {
  const allStores = [
    { name: 'صيدلية النور', icon: '💊', rating: 4.8, distance: 1.2, category: 'pharmacy' },
    { name: 'صيدلية الحياة', icon: '💊', rating: 4.6, distance: 2.5, category: 'pharmacy' },
    { name: 'مطعم البصرة', icon: '🍕', rating: 4.7, distance: 1.8, category: 'food' },
    { name: 'مطعم بغداد', icon: '🍔', rating: 4.5, distance: 3.1, category: 'food' },
    { name: 'بقالة الرصافة', icon: '🛒', rating: 4.4, distance: 2.0, category: 'grocery' },
    { name: 'سوبر ماركت المدينة', icon: '🛒', rating: 4.6, distance: 3.5, category: 'grocery' }
  ];
  
  return allStores.filter(s => 
    s.name.includes(query) || query.includes(s.name.split(' ')[0])
  );
}

// ═══════════════════════════════════════
// 🏪 Category Screen
// ═══════════════════════════════════════
function openCategory(category) {
  currentCategory = category;
  
  const titleEl = document.getElementById('categoryTitle');
  if (titleEl) {
    const titles = {
      'food': t('food'),
      'grocery': t('grocery'),
      'pharmacy': t('pharmacy'),
      'package': t('package')
    };
    titleEl.textContent = titles[category] || t('category');
  }
  
  showScreen('categoryScreen');
  loadCategoryStores(category);
}

function loadCategoryStores(category) {
  const list = document.getElementById('categoryList');
  if (!list) return;
  
  // ═══ بيانات تجريبية (تستخدم لاحقاً من Supabase) ═══
  const mockStores = {
    'food': [
      { name: 'مطعم البصرة', icon: '🍕', rating: 4.7, distance: 1.8, time: 25 },
      { name: 'مطعم بغداد', icon: '🍔', rating: 4.5, distance: 3.1, time: 30 },
      { name: 'مطعم الشرق', icon: '🍗', rating: 4.6, distance: 2.2, time: 28 }
    ],
    'grocery': [
      { name: 'بقالة الرصافة', icon: '🛒', rating: 4.4, distance: 2.0, time: 20 },
      { name: 'سوبر ماركت المدينة', icon: '🛒', rating: 4.6, distance: 3.5, time: 30 }
    ],
    'pharmacy': [
      { name: 'صيدلية النور', icon: '💊', rating: 4.8, distance: 1.2, time: 15 },
      { name: 'صيدلية الحياة', icon: '💊', rating: 4.6, distance: 2.5, time: 20 }
    ],
    'package': [
      { name: 'توصيل عام', icon: '📦', rating: 4.9, distance: 0, time: 30 }
    ]
  };
  
  const stores = mockStores[category] || [];
  
  if (!stores.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4v18"/>
          </svg>
        </div>
        <h4>${t('noStores') || 'لا توجد متاجر'}</h4>
        <p>${t('comingSoon')}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = stores.map(s => `
    <div class="store-card" onclick="openNewOrder()">
      <div class="store-logo">${s.icon}</div>
      <div class="store-info">
        <h4 class="store-name">${s.name}</h4>
        <div class="store-meta">
          <span class="store-rating">⭐ ${s.rating}</span>
          ${s.distance > 0 ? `<span>📍 ${s.distance} ${t('km')}</span>` : ''}
          <span>⏱️ ${s.time} ${t('min')}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(event) {
  const query = event.target.value.trim().toLowerCase();
  const cards = document.querySelectorAll('#categoryList .store-card');
  
  cards.forEach(card => {
    const name = card.querySelector('.store-name').textContent.toLowerCase();
    card.style.display = name.includes(query) ? 'flex' : 'none';
  });
}

function applyFilter(filter, btn) {
  document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // TODO: Apply real filter
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
// 🗺️ Map Picker — 3 States
// ═══════════════════════════════════════
function openMapPicker(mode) {
  mapPickerMode = mode;
  
  const title = document.getElementById('mapPickerTitle');
  if (title) {
    title.textContent = mode === 'from' ? t('selectPickupTitle') : t('selectDropoffTitle');
  }
  
  showScreen('mapPickerScreen');
  
  // Reset states
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
  }).setView(defaultCenter, 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(mapPickerInstance);
  
  // ═══ Events ═══
  mapPickerInstance.on('movestart', () => {
    showFloatingLabel();
  });
  
  mapPickerInstance.on('moveend', () => {
    updateMapLocation();
  });
  
  mapPickerInstance.on('zoomstart', () => {
    showFloatingLabel();
  });
  
  setTimeout(() => {
    updateMapLocation();
    mapPickerInstance.invalidateSize();
  }, 500);
}

function showFloatingLabel() {
  const label = document.getElementById('mapFloatingLabel');
  if (!label) return;
  
  label.classList.add('active');
  
  clearTimeout(window._floatingLabelTimer);
  window._floatingLabelTimer = setTimeout(() => {
    label.classList.remove('active');
  }, 800);
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
    
    if (data.address) {
      const addr = data.address;
      
      // ═══ استخراج التفاصيل ═══
      const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || '';
      const street = addr.road || addr.street || '';
      const building = addr.house_number || '';
      
      mapPickerDetails = {
        fullAddress: data.display_name ? data.display_name.split(', ').slice(0, 3).join('، ') : '',
        area: area,
        street: street,
        building: building,
        coordinates: `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
        lat: center.lat,
        lng: center.lng
      };
      
      const addressText = mapPickerDetails.fullAddress || t('myLocation');
      document.getElementById('mapSelectedAddress').textContent = addressText;
    } else {
      mapPickerLocation = { lat: center.lat, lng: center.lng };
      document.getElementById('mapSelectedAddress').textContent = t('myLocation');
    }
  } catch (e) {
    console.error(e);
    document.getElementById('mapSelectedAddress').textContent = t('myLocation');
  }
}

function locateUserOnMap() {
  if (!navigator.geolocation) {
    showToast('⚠️ ' + t('gpsUnavailable'));
    return;
  }
  
  if (!mapPickerInstance) {
    showToast('⏳ ' + t('detecting'));
    return;
  }
  
  const btn = document.querySelector('.map-locate-btn');
  btn.classList.add('loading');
  showToast('📍 ' + t('detectingLocation'));
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      mapPickerInstance.flyTo([lat, lng], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      mapPickerLocation = { lat, lng };
      localStorage.setItem('wassilha_location_coords', JSON.stringify({ lat, lng }));
      
      setTimeout(async () => {
        await updateMapLocation();
        btn.classList.remove('loading');
        showToast('✅ ' + t('locationDetected'));
      }, 1600);
    },
    (error) => {
      btn.classList.remove('loading');
      let errorMsg = '⚠️ ' + t('locationFailed');
      
      if (error.code === 1) {
        errorMsg = '⚠️ اسمح بالوصول للموقع';
      } else if (error.code === 2) {
        errorMsg = '⚠️ GPS غير متاح';
      } else if (error.code === 3) {
        errorMsg = '⚠️ انتهت مدة الانتظار';
      }
      
      showToast(errorMsg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

async function handleMapSearch(event) {
  const query = event.target.value.trim();
  const resultsEl = document.getElementById('mapSearchResults');
  
  if (query.length < 3) {
    resultsEl.classList.remove('active');
    return;
  }
  
  clearTimeout(window._mapSearchTimeout);
  window._mapSearchTimeout = setTimeout(async () => {
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
          <div class="search-result-item" onclick="selectMapSearchResult(${r.lat}, ${r.lon}, '${name.replace(/'/g, '')}')">
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

function selectMapSearchResult(lat, lng, name) {
  if (!mapPickerInstance) return;
  
  mapPickerInstance.flyTo([lat, lng], 16, { duration: 1.2 });
  document.getElementById('mapSearchResults').classList.remove('active');
  document.getElementById('mapSearchInput').value = name;
}

// ═══════════════════════════════════════
// ✅ Confirm Map Location
// ═══════════════════════════════════════
function confirmMapLocation() {
  if (!mapPickerLocation) {
    showToast(t('locationNotSet'));
    return;
  }
  
  const confirmBtn = document.getElementById('mapConfirmBtn');
  const isConfirmed = confirmBtn.classList.contains('confirmed');
  
  // ═══ المرحلة 1: عرض التفاصيل ═══
  if (!isConfirmed) {
    if (!mapPickerDetails) {
      showToast('⏳ جاري التحميل...');
      return;
    }
    
    // تعبئة التفاصيل
    document.getElementById('detailFullAddress').textContent = mapPickerDetails.fullAddress || '—';
    document.getElementById('detailArea').textContent = mapPickerDetails.area || '—';
    document.getElementById('detailStreet').textContent = mapPickerDetails.street || '—';
    document.getElementById('detailBuilding').textContent = mapPickerDetails.building || '—';
    document.getElementById('detailCoordinates').textContent = mapPickerDetails.coordinates || '—';
    
    // عرض
    document.getElementById('addressSimple').style.display = 'none';
    document.getElementById('addressDetailed').style.display = 'block';
    
    confirmBtn.classList.add('confirmed');
    document.getElementById('mapConfirmText').textContent = t('confirmAndContinue');
    
    return;
  }
  
  // ═══ المرحلة 2: التأكيد النهائي ═══
  const address = document.getElementById('detailFullAddress').textContent;
  const note = document.getElementById('mapNoteInput').value.trim();
  
  // حفظ
  if (mapPickerMode === 'from') {
    document.getElementById('orderFrom').value = address;
    localStorage.setItem(CONFIG.STORAGE_KEYS.location, address);
    localStorage.setItem('wassilha_location_coords', JSON.stringify(mapPickerLocation));
  } else {
    document.getElementById('orderTo').value = address;
    localStorage.setItem('wassilha_dropoff_coords', JSON.stringify(mapPickerLocation));
  }
  
  if (note) {
    const notesField = document.getElementById('orderNotes');
    if (notesField && !notesField.value) {
      notesField.value = note;
    }
  }
  
  calculatePreviewPrice();
  showToast('✅ ' + t('locationConfirmed'));
  
  setTimeout(() => closeMapPicker(), 500);
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
  
  list.innerHTML = result.orders.map(o => renderOrderCard(o)).join('');
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.order-tab').forEach(tab => tab.classList.remove('active'));
  btn.classList.add('active');
  
  // TODO: Apply real filter
  loadOrdersList();
}

// ═══════════════════════════════════════
// 🗺️ Tracking
// ═══════════════════════════════════════
async function openTracking(orderId) {
  if (!currentUser) return;
  
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
  
  if (confirm(t('cancelOrderConfirm') || 'هل تريد إلغاء الطلب؟')) {
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

function openAddresses() {
  showToast(t('comingSoon'));
}

function openPaymentMethods() {
  showToast(t('comingSoon'));
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

function openDriverEarnings() {
  showToast(t('comingSoon'));
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
  
  // تحديث أزرار الثيم
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'dark';
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === savedTheme);
  });
  
  // تحديث toggle الإشعارات
  const notifToggle = document.getElementById('notifToggle');
  if (notifToggle) {
    notifToggle.checked = Notification.permission === 'granted' && 
      localStorage.getItem('wassilha_notifications') !== 'false';
  }
  
  // تحديث toggle الصوت
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.checked = localStorage.getItem('wassilha_sound') !== 'false';
  }
}

function setTheme(theme, btn) {
  document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  let appliedTheme = theme;
  if (theme === 'auto') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', appliedTheme);
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, theme);
  
  showToast('✅ ' + t('themeChanged'));
}

async function toggleNotifications() {
  const toggle = document.getElementById('notifToggle');
  if (!toggle) return;
  
  if (toggle.checked) {
    // طلب إذن
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          localStorage.setItem('wassilha_notifications', 'true');
          showToast('✅ ' + t('notificationsEnabled'));
          
          // إشعار اختباري
          new Notification('وصّلها', {
            body: 'تم تفعيل الإشعارات بنجاح',
            icon: '/icon-192.png'
          });
        } else {
          toggle.checked = false;
          localStorage.setItem('wassilha_notifications', 'false');
          showToast('⚠️ لم يتم تفعيل الإشعارات');
        }
      } catch (e) {
        toggle.checked = false;
        showToast('⚠️ ' + t('notSupported'));
      }
    } else {
      toggle.checked = false;
      showToast('⚠️ ' + t('notSupported'));
    }
  } else {
    localStorage.setItem('wassilha_notifications', 'false');
    showToast('🔕 ' + t('notificationsDisabled'));
  }
}

function toggleSound() {
  const toggle = document.getElementById('soundToggle');
  if (!toggle) return;
  
  localStorage.setItem('wassilha_sound', toggle.checked ? 'true' : 'false');
  showToast(toggle.checked ? '🔊 الصوت مفعل' : '🔇 الصوت معطل');
}

// ═══════════════════════════════════════
// 📞 Contact Us
// ═══════════════════════════════════════
function openContactUs() {
  showScreen('contactScreen');
}

function openWhatsApp() {
  const phone = '+9647761090465';
  const message = encodeURIComponent('مرحباً، أريد الاستفسار عن تطبيق وصّلها');
  window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
}

function openEmail() {
  window.location.href = 'mailto:hasan7990l@gmail.com?subject=استفسار عن تطبيق وصّلها';
}

function openTelegram() {
  window.open('https://t.me/lb2_c', '_blank');
}

// ═══════════════════════════════════════
// 📄 About
// ═══════════════════════════════════════
function openAbout() {
  showScreen('aboutScreen');
}

// ═══════════════════════════════════════
// 📜 Legal
// ═══════════════════════════════════════
function openTerms() {
  showScreen('termsScreen');
}

function openPrivacy() {
  showScreen('privacyScreen');
}

// ═══════════════════════════════════════
// ⭐ Rate App
// ═══════════════════════════════════════
function openRateApp() {
  const rating = prompt(t('rateAppPrompt') || 'قيّم التطبيق من 1 إلى 5:', '5');
  
  if (!rating) return;
  
  const num = parseInt(rating);
  if (isNaN(num) || num < 1 || num > 5) {
    showToast('⚠️ ' + t('invalidRating'));
    return;
  }
  
  // حفظ التقييم محلياً
  localStorage.setItem('wassilha_app_rating', num);
  
  showToast('⭐ ' + t('thanksForRating'));
}

// ═══════════════════════════════════════
// 📤 Share App
// ═══════════════════════════════════════
async function shareApp() {
  const shareData = {
    title: 'وصّلها - Wassilha',
    text: '🛵 جرب تطبيق وصّلها\nخدمة توصيل موثوقة في بغداد\nأسرع توصيل — أقل سعر',
    url: window.location.origin
  };
  
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast('✅ ' + t('thanksForSharing'));
    } catch (e) {
      if (e.name !== 'AbortError') {
        copyToClipboard(shareData.url + '\n\n' + shareData.text);
      }
    }
  } else {
    copyToClipboard(shareData.url + '\n\n' + shareData.text);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 تم نسخ الرابط');
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 تم نسخ الرابط');
  }
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
  
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
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
  
  const langBtnText = document.getElementById('langBtnText');
  if (langBtnText) {
    langBtnText.textContent = lang === 'ar' ? 'EN' : 'ع';
  }
  
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === lang);
  });
  
  console.log('🌐 Language changed to:', lang);
});

// ═══════════════════════════════════════
// 🚀 Initialize
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Wassilha v4.0 initialized');
  
  // ═══ تطبيق الثيم ═══
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'dark';
  let appliedTheme = savedTheme;
  if (savedTheme === 'auto') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', appliedTheme);
  console.log('🎨 Theme:', appliedTheme);
  
  // ═══ تطبيق اللغة ═══
  if (window.Lang) {
    Lang.init();
    
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) {
      langBtnText.textContent = Lang.current() === 'ar' ? 'EN' : 'ع';
    }
  }
  
  // ═══ Supabase Ready ═══
  window.addEventListener('supabase-ready', () => {
    console.log('✅ Supabase ready');
  });
  
  // ═══ بدء ═══
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
window.openOrders = openOrders;
window.selectPackageType = selectPackageType;
window.submitOrder = submitOrder;
window.filterOrders = filterOrders;
window.openTracking = openTracking;
window.cancelOrder = cancelOrder;
window.chatWithDriver = chatWithDriver;
window.callDriver = callDriver;
window.openProfile = openProfile;
window.openAddresses = openAddresses;
window.openPaymentMethods = openPaymentMethods;
window.openNotifications = openNotifications;
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

console.log('✅ Script.js loaded — Wassilha v4.0');
