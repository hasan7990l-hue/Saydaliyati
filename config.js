// ============================================
// ⚙️ CONFIG.JS — Wassilha App Configuration v2
// ============================================

const CONFIG = {
  APP: {
    name: 'وصّلها',
    nameEn: 'Wassilha',
    tagline: 'خدمة توصيل موثوقة',
    taglineEn: 'Reliable Delivery Service',
    version: '1.0.0',
    region: 'الرصافة، بغداد',
    regionEn: 'Rusafa, Baghdad',
    currency: 'د.ع',
    currencyEn: 'IQD',
    defaultLang: 'ar',
    availableLangs: ['ar', 'en']
  },

  SUPABASE: {
  url: 'https://plcxknqhukdzgwkuocrp.supabase.co',
  key: 'sb_publishable_KJ4CfCpq47M3XdVzFYQ5hA_3UVEheGf'
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
  defaultCenter: { lat: 33.3152, lng: 44.3661 },
  defaultZoom: 13,
  // ═══ LocationIQ — بحث وعناوين دقيقة ═══
  locationiq: {
    key: 'pk.650f569f9e1b17cebb209086fd67291b',
    baseUrl: 'https://us1.locationiq.com/v1'
  }
},

  SUPPORT: {
    phone: '+9647751459130',
    whatsapp: '+9647761090465',
    email: 'hasan7990l@gmail.com',
    telegram: '@lb2_c'
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
    lang: 'wassilha_lang',
    mapProvider: 'wassilha_map',
    location: 'wassilha_location',
    locationCoords: 'wassilha_location_coords',
    dropoffCoords: 'wassilha_dropoff_coords',
    sound: 'wassilha_sound',
    notifications: 'wassilha_notifications',
    appRating: 'wassilha_app_rating'
  },

  SERVICES: [
    { id: 'food',     icon: 'food',     color: 'orange' },
    { id: 'grocery',  icon: 'grocery',  color: 'green'  },
    { id: 'pharmacy', icon: 'pharmacy', color: 'red'    },
    { id: 'package',  icon: 'package',  color: 'purple' }
  ]
};

window.CONFIG = CONFIG;
console.log('⚙️ Config loaded:', CONFIG.APP.name);
