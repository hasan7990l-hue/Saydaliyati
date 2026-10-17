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

// ⏸️ توقف هنا — الجزء 2 سيُكمل من هذه النقطة
