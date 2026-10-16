// ============================================
// 🔊 SOUNDS.JS — Wassilha Sound System v1
// نظام الأصوات — إشعارات + طلبات
// ============================================

console.log('🔊 Sounds.js loading...');

// ═══════════════════════════════════════
// 🌐 Base URL
// ═══════════════════════════════════════
const AUDIO_BASE = 'https://cdn.jsdelivr.net/gh/hasan7990l-hue/Saydaliyati@main/sounds';
// ═══════════════════════════════════════
// 🔔 نغمات الإشعارات — 7 أصوات
// ═══════════════════════════════════════
const NOTIFICATION_SOUNDS = [
  {
    id: 'notif_1',
    name: 'تنبيه ناعم',
    nameEn: 'Soft Chime',
    icon: '🔔',
    url: `${AUDIO_BASE}/notifications/notif_1.mp3`
  },
  {
    id: 'notif_2',
    name: 'تنبيه قوي',
    nameEn: 'Strong Alert',
    icon: '🚨',
    url: `${AUDIO_BASE}/notifications/notif_2.mp3`
  },
  {
    id: 'notif_3',
    name: 'تنبيه رقمي',
    nameEn: 'Digital Beep',
    icon: '📱',
    url: `${AUDIO_BASE}/notifications/notif_3.mp3`
  },
  {
    id: 'notif_4',
    name: 'جرس هادئ',
    nameEn: 'Calm Bell',
    icon: '🔕',
    url: `${AUDIO_BASE}/notifications/notif_4.mp3`
  },
  {
    id: 'notif_5',
    name: 'تنبيه كلاسيكي',
    nameEn: 'Classic Tone',
    icon: '⏰',
    url: `${AUDIO_BASE}/notifications/notif_5.mp3`
  },
  {
    id: 'notif_6',
    name: 'تنبيه حديث',
    nameEn: 'Modern Pop',
    icon: '💫',
    url: `${AUDIO_BASE}/notifications/notif_6.mp3`
  },
  {
    id: 'notif_7',
    name: 'تنبيه مميز',
    nameEn: 'Premium Alert',
    icon: '⭐',
    url: `${AUDIO_BASE}/notifications/notif_7.mp3`
  },
  {
    id: 'silent',
    name: 'صامت',
    nameEn: 'Silent',
    icon: '🔇',
    url: null
  }
];

// ═══════════════════════════════════════
// 🛎️ نغمات الطلبات — 10 أصوات
// ═══════════════════════════════════════
const ORDER_SOUNDS = [
  {
    id: 'order_1',
    name: 'رنين سريع',
    nameEn: 'Quick Ring',
    icon: '⚡',
    url: `${AUDIO_BASE}/orders/order_1.m4a`,
    duration: 5
  },
  {
    id: 'order_2',
    name: 'جرس متوسط',
    nameEn: 'Medium Bell',
    icon: '🔔',
    url: `${AUDIO_BASE}/orders/order_2.m4a`,
    duration: 8
  },
  {
    id: 'order_3',
    name: 'رنين طويل',
    nameEn: 'Long Ring',
    icon: '🎼',
    url: `${AUDIO_BASE}/orders/order_3.m4a`,
    duration: 30
  },
  {
    id: 'order_4',
    name: 'تنبيه قوي',
    nameEn: 'Strong Alert',
    icon: '📢',
    url: `${AUDIO_BASE}/orders/order_4.m4a`,
    duration: 5
  },
  {
    id: 'order_5',
    name: '🚨 طوارئ',
    nameEn: 'Emergency',
    icon: '🚨',
    url: `${AUDIO_BASE}/orders/order_5.m4a`,
    duration: 69,
    noLoop: true  // ← طويل جداً — لا يتكرر
  },
  {
    id: 'order_6',
    name: 'جرس ممتد',
    nameEn: 'Extended Bell',
    icon: '🛎️',
    url: `${AUDIO_BASE}/orders/order_6.m4a`,
    duration: 26
  },
  {
    id: 'order_7',
    name: 'تنبيه خفيف',
    nameEn: 'Light Alert',
    icon: '💫',
    url: `${AUDIO_BASE}/orders/order_7.m4a`,
    duration: 4
  },
  {
    id: 'order_8',
    name: 'رنين قصير',
    nameEn: 'Short Ring',
    icon: '🔔',
    url: `${AUDIO_BASE}/orders/order_8.m4a`,
    duration: 5
  },
  {
    id: 'order_9',
    name: 'رنين كلاسيكي',
    nameEn: 'Classic Ring',
    icon: '📣',
    url: `${AUDIO_BASE}/orders/order_9.m4a`,
    duration: 34
  },
  {
    id: 'order_10',
    name: 'رنين مميز',
    nameEn: 'Premium Ring',
    icon: '⭐',
    url: `${AUDIO_BASE}/orders/order_10.m4a`,
    duration: 14
  },
  {
    id: 'silent',
    name: 'صامت',
    nameEn: 'Silent',
    icon: '🔇',
    url: null
  }
];

// ═══════════════════════════════════════
// 📦 Object موحّد
// ═══════════════════════════════════════
const SOUNDS = {
  notification: NOTIFICATION_SOUNDS,
  order: ORDER_SOUNDS
};

// ═══════════════════════════════════════
// 🎵 متغيرات التشغيل
// ═══════════════════════════════════════
let _currentAudio = null;
let _orderLoopInterval = null;
let currentSoundType = 'notification';

// ═══════════════════════════════════════
// ▶️ تشغيل نغمة
// ═══════════════════════════════════════
function playSound(type, soundId) {
  const sound = SOUNDS[type]?.find(s => s.id === soundId);
  if (!sound || !sound.url) return;

  try {
    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
    }

    _currentAudio = new Audio(sound.url);
    _currentAudio.volume = 0.8;
    _currentAudio.play().catch(e => {
      console.log('Sound play blocked:', e.message);
    });
  } catch (e) {
    console.log('Sound error:', e);
  }
}

// ═══════════════════════════════════════
// 🔔 نغمة إشعارات (مرة واحدة)
// ═══════════════════════════════════════
function playNotificationSound() {
  if (localStorage.getItem('wassilha_sound') === 'false') return;
  if (localStorage.getItem('wassilha_notifications') === 'false') return;

  const soundId = localStorage.getItem('wassilha_sound_notification') || 'notif_1';
  playSound('notification', soundId);
}

// ═══════════════════════════════════════
// 🛎️ نغمة طلب (مع تكرار تلقائي)
// ═══════════════════════════════════════
function playOrderSound(onLoop = true) {
  if (localStorage.getItem('wassilha_sound') === 'false') return;

  const soundId = localStorage.getItem('wassilha_sound_order') || 'order_1';
  const sound = SOUNDS.order.find(s => s.id === soundId);

  playSound('order', soundId);

  // 🔁 تكرار ذكي حسب مدة النغمة
  if (onLoop && sound && !sound.noLoop && sound.url) {
    stopOrderSound();

    const duration = sound.duration || 5;
    const interval = Math.max(duration + 2, 5) * 1000; // على الأقل 5 ثواني

    _orderLoopInterval = setInterval(() => {
      playSound('order', soundId);
    }, interval);
  }
}

// ═══════════════════════════════════════
// ⏹️ إيقاف تكرار نغمة الطلب
// ═══════════════════════════════════════
function stopOrderSound() {
  if (_orderLoopInterval) {
    clearInterval(_orderLoopInterval);
    _orderLoopInterval = null;
  }
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio.currentTime = 0;
    _currentAudio = null;
  }
}

// ═══════════════════════════════════════
// 🎨 Sound Picker (Modal)
// ═══════════════════════════════════════
function openSoundPicker(type) {
  currentSoundType = type;

  const modal = document.getElementById('soundPickerModal');
  const title = document.getElementById('soundPickerTitle');
  const list = document.getElementById('soundList');

  if (!modal || !list || !title) {
    console.warn('Sound picker elements not found');
    return;
  }

  const isAr = (window.Lang?.current?.() || 'ar') === 'ar';

  title.textContent = type === 'notification'
    ? (isAr ? '🔔 صوت الإشعارات' : '🔔 Notification Sound')
    : (isAr ? '🛎️ رنين الطلبات' : '🛎️ Order Ringtone');

  const savedSound = localStorage.getItem(`wassilha_sound_${type}`)
    || SOUNDS[type][0].id;
  const sounds = SOUNDS[type];

  list.innerHTML = sounds.map(sound => {
    const displayName = isAr ? sound.name : (sound.nameEn || sound.name);
    const subtitle = sound.id === 'silent'
      ? (isAr ? 'بدون صوت' : 'No sound')
      : (isAr ? 'اضغط للاستماع' : 'Tap to listen');

    return `
      <div class="sound-item ${sound.id === savedSound ? 'selected' : ''}"
           onclick="selectSound('${sound.id}', event)">
        <div class="sound-item-icon">${sound.icon}</div>
        <div class="sound-item-info">
          <strong>${displayName}</strong>
          <span>${subtitle}</span>
        </div>
        ${sound.id !== 'silent' ? `
          <button class="sound-item-play"
                  onclick="event.stopPropagation(); playSound('${type}', '${sound.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        ` : ''}
        <div class="sound-item-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    `;
  }).join('');

  modal.classList.add('active');
}

function closeSoundPicker() {
  const modal = document.getElementById('soundPickerModal');
  if (modal) modal.classList.remove('active');

  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
}

function selectSound(soundId, event) {
  localStorage.setItem(`wassilha_sound_${currentSoundType}`, soundId);

  document.querySelectorAll('#soundList .sound-item').forEach(item => {
    item.classList.remove('selected');
  });
  if (event?.currentTarget) {
    event.currentTarget.classList.add('selected');
  }

  if (soundId !== 'silent') {
    playSound(currentSoundType, soundId);
  }

  const sound = SOUNDS[currentSoundType].find(s => s.id === soundId);
  const isAr = (window.Lang?.current?.() || 'ar') === 'ar';
  const displayName = isAr ? sound?.name : (sound?.nameEn || sound?.name);

  const valueEl = document.getElementById(
    currentSoundType === 'notification' ? 'notifSoundValue' : 'orderSoundValue'
  );
  if (valueEl && displayName) valueEl.textContent = displayName;

  if (typeof showToast === 'function' && displayName) {
    showToast('✅ ' + displayName);
  }

  setTimeout(closeSoundPicker, 800);
}

// ═══════════════════════════════════════
// 📝 تحديث القيم في الإعدادات
// ═══════════════════════════════════════
function updateSoundValues() {
  const isAr = (window.Lang?.current?.() || 'ar') === 'ar';

  const notifId = localStorage.getItem('wassilha_sound_notification') || 'notif_1';
  const orderId = localStorage.getItem('wassilha_sound_order') || 'order_1';

  const notifObj = SOUNDS.notification.find(s => s.id === notifId);
  const orderObj = SOUNDS.order.find(s => s.id === orderId);

  const notifEl = document.getElementById('notifSoundValue');
  const orderEl = document.getElementById('orderSoundValue');

  if (notifEl && notifObj) {
    notifEl.textContent = isAr ? notifObj.name : (notifObj.nameEn || notifObj.name);
  }
  if (orderEl && orderObj) {
    orderEl.textContent = isAr ? orderObj.name : (orderObj.nameEn || orderObj.name);
  }
}

// ═══════════════════════════════════════
// 🌐 Global Exports
// ═══════════════════════════════════════
window.SOUNDS = SOUNDS;
window.NOTIFICATION_SOUNDS = NOTIFICATION_SOUNDS;
window.ORDER_SOUNDS = ORDER_SOUNDS;

window.openSoundPicker = openSoundPicker;
window.closeSoundPicker = closeSoundPicker;
window.selectSound = selectSound;
window.playSound = playSound;
window.playNotificationSound = playNotificationSound;
window.playOrderSound = playOrderSound;
window.stopOrderSound = stopOrderSound;
window.updateSoundValues = updateSoundValues;

console.log('✅ Sounds.js loaded —', NOTIFICATION_SOUNDS.length - 1, 'notifications +', ORDER_SOUNDS.length - 1, 'orders');
