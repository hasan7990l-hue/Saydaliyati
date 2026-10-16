// ============================================
// 🌐 LANGUAGE.JS — Wassilha v2
// نظام تبديل اللغة (AR + EN)
// ============================================

let currentLang = 'ar';

// ═══════════════════════════════════════
// 🎯 الحصول على اللغة المحفوظة
// ═══════════════════════════════════════
function getSavedLang() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || CONFIG.APP.defaultLang;
}

// ═══════════════════════════════════════
// 🌐 تطبيق اللغة على الصفحة
// ═══════════════════════════════════════
function applyLanguage(lang) {
  if (!TRANSLATIONS[lang]) {
    console.warn('Language not found:', lang, '→ falling back to ar');
    lang = 'ar';
  }

  currentLang = lang;
  localStorage.setItem(CONFIG.STORAGE_KEYS.lang, lang);

  // ═══ الاتجاه ═══
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);

  // ═══ كلاس على Body ═══
  document.body.classList.remove('lang-ar', 'lang-en');
  document.body.classList.add('lang-' + lang);

  // ═══ ترجمة العناصر data-i18n ═══
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = TRANSLATIONS[lang][key];

    if (translation) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.setAttribute('placeholder', translation);
        }
      } else if (el.tagName === 'OPTION') {
        el.textContent = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  // ═══ Placeholders — data-i18n-placeholder ═══
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = TRANSLATIONS[lang][key];
    if (translation) {
      el.setAttribute('placeholder', translation);
    }
  });

  // ═══ Titles — data-i18n-title ═══
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = TRANSLATIONS[lang][key];
    if (translation) {
      el.setAttribute('title', translation);
    }
  });

  console.log('🌐 Language applied:', lang, '(' + dir + ')');

  // ═══ حدث للاستماع ═══
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));

  // ═══ تحديث قيم الأصوات (إن وُجدت) ═══
  if (typeof updateSoundValues === 'function') {
    setTimeout(updateSoundValues, 50);
  }
}

// ═══════════════════════════════════════
// 🔄 تبديل اللغة (AR ↔ EN)
// ═══════════════════════════════════════
function toggleLanguage() {
  const newLang = currentLang === 'ar' ? 'en' : 'ar';
  applyLanguage(newLang);

  if (typeof showToast === 'function') {
    const msg = newLang === 'ar'
      ? 'تم تغيير اللغة إلى العربية'
      : 'Language changed to English';
    showToast(msg);
  }
}

// ═══════════════════════════════════════
// 🎯 تعيين لغة محددة
// ═══════════════════════════════════════
function setLanguage(lang) {
  applyLanguage(lang);

  if (typeof showToast === 'function') {
    const msg = lang === 'ar'
      ? 'تم تغيير اللغة إلى العربية'
      : 'Language changed to English';
    showToast(msg);
  }

  // تحديث أزرار الاختيار
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === lang);
  });
}

// ═══════════════════════════════════════
// 📖 الحصول على ترجمة
// ═══════════════════════════════════════
function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.ar?.[key] || key;
}

// ═══════════════════════════════════════
// 📊 حالة اللغة
// ═══════════════════════════════════════
function getCurrentLang() {
  return currentLang;
}

function isArabic() {
  return currentLang === 'ar';
}

// ═══════════════════════════════════════
// 🚀 تطبيق اللغة عند التحميل
// ═══════════════════════════════════════
function initLanguage() {
  const savedLang = getSavedLang();
  applyLanguage(savedLang);
  console.log('🌐 Initial language:', savedLang);
}

// ═══════════════════════════════════════
// 🌐 Export
// ═══════════════════════════════════════
window.Lang = {
  apply: applyLanguage,
  toggle: toggleLanguage,
  set: setLanguage,
  current: getCurrentLang,
  isArabic: isArabic,
  t: t,
  init: initLanguage
};

// Global shortcuts
window.toggleLanguage = toggleLanguage;
window.setLanguage = setLanguage;
window.t = t;
window.currentLang = () => currentLang;

console.log('🌐 Language.js loaded');
