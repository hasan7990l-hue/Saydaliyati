// ============================================
// ⚙️ CONFIG.JS — Wassilha App Config
// ============================================

const CONFIG = {
  APP: {
    name: 'وصّلها',
    nameEn: 'Wassilha',
    tagline: 'خدمة توصيل موثوقة',
    version: '1.0.0',
    region: 'الرصافة - بغداد',
    currency: 'د.ع',
    language: 'ar',
    direction: 'rtl'
  },

  SUPABASE: {
    url: 'https://fprcpijjbwnknebbcwns.supabase.co',
    key: 'sb_publishable_LFHm7iks01yrN59-mBIjZw_OdQkwuk7'
  },

  PRICING: {
    basePrice: 1000,
    pricePerKm: 500,
    minPrice: 1500,
    maxPrice: 20000,
    driverShare: 0.80,
    platformShare: 0.20
  },

  RANGES: {
    ultraNear: 2,
    near: 5,
    medium: 8,
    far: 15
  },

  MAPS: {
    default: 'osm',
    defaultCenter: {
      lat: 33.3152,
      lng: 44.3661
    },
    defaultZoom: 13
  },

  SUPPORT: {
    phone: '+9647751459130',
    whatsapp: '+9647751459130',
    email: 'support@wassilha.iq',
    telegram: '@wassilha_iraq'
  },

  TIMERS: {
    otpExpiry: 300000,
    orderTimeout: 60000,
    refreshInterval: 30000
  },

  OFFERS: {
    welcome: 30,
    inviteFriend: 5000,
    firstOrders: 3
  },

  STORAGE_KEYS: {
    user: 'wassilha_user',
    token: 'wassilha_token',
    theme: 'wassilha_theme',
    mapProvider: 'wassilha_map',
    location: 'wassilha_location'
  }
};

window.CONFIG = CONFIG;

console.log('⚙️ Config loaded:', CONFIG.APP.name);
