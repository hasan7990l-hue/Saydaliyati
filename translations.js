// ============================================
// 🌐 TRANSLATIONS.JS — عربي + إنجليزي
// ============================================

const TRANSLATIONS = {
  ar: {
    // ═══ App ═══
    appName: 'وصّلها',
    tagline: 'خدمة توصيل موثوقة',
    version: 'الإصدار',

    // ═══ Splash ═══
    splashReady: 'جاهز للانطلاق',

    // ═══ Login ═══
    welcomeBack: 'أهلاً بعودتك 👋',
    signIn: 'تسجيل الدخول',
    phone: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXXX',
    continue: 'متابعة',
    or: 'أو',
    createNewAccount: 'إنشاء حساب جديد',
    termsNote: 'بالمتابعة أنت توافق على',
    terms: 'الشروط والأحكام',
    noAccount: 'عندك حساب؟',
    loginLink: 'سجل دخول',

    // ═══ Role ═══
    chooseAccountType: 'اختر نوع حسابك',
    howUse: 'كيف تريد استخدام وصّلها؟',
    customer: 'عميل',
    customerDesc: 'اطلب توصيل لأي مكان',
    driver: 'مندوب',
    driverDesc: 'استقبل طلبات واكسب',
    store: 'متجر',
    storeDesc: 'سجل متجرك وابدأ البيع',

    // ═══ Register ═══
    registerTitle: 'إنشاء حساب',
    registerSubtitle: 'أكمل بياناتك للبدء',
    fullName: 'الاسم الكامل',
    vehicleType: 'نوع المركبة',
    selectVehicle: 'اختر نوع المركبة',
    motorcycle: 'دراجة نارية',
    bicycle: 'دراجة هوائية',
    car: 'سيارة',
    password: 'كلمة المرور',
    agreeTerms: 'أوافق على',
    createAccount: 'إنشاء الحساب',

    // ═══ OTP ═══
    verifyPhone: 'التحقق من الهاتف',
    otpSent: 'أدخل الكود المرسل إلى',
    verify: 'تحقق',
    resendIn: 'إعادة الإرسال خلال',
    seconds: 'ثانية',
    resend: 'إعادة إرسال الكود',

    // ═══ Home ═══
    hello: 'مرحباً',
    location: 'الرصافة، بغداد',
    searchService: 'ابحث عن خدمة...',
    orderNow: 'اطلب توصيل الآن',
    deliverIn30: 'توصيل خلال 30 دقيقة',
    start: 'ابدأ',
    orderService: 'اطلب خدمة',
    food: 'توصيل طعام',
    grocery: 'بقالة',
    pharmacy: 'صيدلية',
    package: 'طرود',
    myRecentOrders: 'طلباتي الأخيرة',
    viewAll: 'عرض الكل',
    noOrders: 'لا توجد طلبات بعد',
    startFirstOrder: 'ابدأ أول طلب لك الآن',

    // ═══ Bottom Nav ═══
    home: 'الرئيسية',
    myOrders: 'طلباتي',
    myAccount: 'حسابي',

    // ═══ New Order ═══
    newDelivery: 'طلب توصيل جديد',
    from: 'من',
    to: 'إلى',
    selectPickup: 'اضغط لتحديد موقع الانطلاق',
    selectDropoff: 'اضغط لتحديد مكان الوصول',
    packageType: 'نوع الطرد',
    normal: 'عادي',
    medicine: 'دواء',
    documents: 'وثائق',
    notes: 'ملاحظات (اختياري)',
    notesPlaceholder: 'أي ملاحظة للمندوب...',
    distance: 'المسافة',
    basePrice: 'الرسم الأساسي',
    pricePerKm: 'سعر الكيلو',
    total: 'الإجمالي',
    sendOrder: 'إرسال الطلب',

    // ═══ Order Success ═══
    orderSent: 'تم إرسال طلبك',
    willContact: 'سيتم التواصل معك قريباً',
    orderNumber: 'رقم الطلب',
    price: 'السعر',
    trackOrder: 'تتبع الطلب',
    backHome: 'العودة للرئيسية',

    // ═══ Tracking ═══
    tracking: 'تتبع الطلب',
    arriving15: 'يصل خلال 15 دقيقة',
    driver: 'المندوب',
    motorcycle: 'دراجة نارية',
    orderConfirmed: 'تم التأكيد',
    orderConfirmedDesc: 'طلبك في النظام',
    driverAccepted: 'قبول المندوب',
    driverAcceptedDesc: 'في انتظار',
    onTheWay: 'في الطريق',
    onTheWayDesc: 'سيتم تحديث الحالة',
    delivered: 'تم التوصيل',
    deliveredDesc: 'شكراً لك',
    cancel: 'إلغاء',
    chat: 'دردشة',

    // ═══ Orders ═══
    all: 'الكل',
    active: 'جارية',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    order: 'طلب',
    pending: 'قيد الانتظار',
    accepted: 'تم القبول',
    pickedUp: 'في الطريق',
    track: 'تتبع',

    // ═══ Profile ═══
    myProfile: 'حسابي',
    orders: 'طلب',
    balance: 'د.ع',
    rating: 'تقييم',
    addresses: 'العناوين',
    paymentMethods: 'طرق الدفع',
    settings: 'الإعدادات',
    help: 'المساعدة والدعم',
    logout: 'تسجيل الخروج',
    logoutConfirm: 'هل تريد تسجيل الخروج؟',

    // ═══ Driver ═══
    driverWelcome: 'مرحباً',
    offline: 'غير متصل',
    online: 'متصل الآن',
    activateConnection: 'فعّل الاتصال لاستقبال الطلبات',
    startWork: 'ابدأ العمل',
    stop: 'إيقاف',
    today: 'اليوم',
    earnings: 'الأرباح',
    nearbyOrders: 'الطلبات القريبة',
    noNearbyOrders: 'لا توجد طلبات',
    accept: 'قبول',
    km: 'كم',

    // ═══ Map Picker ═══
    selectLocation: 'حدد الموقع',
    selectPickupTitle: 'حدد موقع الانطلاق',
    selectDropoffTitle: 'حدد مكان الوصول',
    searchAddress: 'ابحث عن عنوان...',
    selectedAddress: 'العنوان المحدد',
    detecting: 'جاري التحديد...',
    myLocation: 'موقعي',
    confirmLocation: 'تثبيت هذا الموقع',

    // ═══ Notifications ═══
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    notifWillAppear: 'ستظهر الإشعارات هنا',

    // ═══ Settings ═══
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    auto: 'تلقائي',
    language: 'اللغة',
    currency: 'العملة',
    aboutApp: 'عن التطبيق',
    about: 'حول',
    arabic: 'العربية',
    english: 'English',
    iraqiDinar: 'دينار عراقي',
    sound: 'الصوت',
    privacy: 'الخصوصية',
    privacyPolicy: 'سياسة الخصوصية',

    // ═══ Toasts ═══
    invalidPhone: 'رقم الهاتف غير صحيح',
    phoneNotRegistered: 'الرقم غير مسجل — سجل حساب جديد',
    codeSent: 'تم إرسال الكود',
    enterFullCode: 'أدخل الكود كاملاً',
    wrongCode: 'الكود غير صحيح أو منتهي',
    welcomeUser: 'أهلاً',
    nameTooShort: 'الاسم قصير جداً',
    passwordMin: 'كلمة المرور 6 أحرف على الأقل',
    selectVehicleType: 'اختر نوع المركبة',
    agreeTermsFirst: 'وافق على الشروط',
    phoneRegistered: 'الرقم مسجل مسبقاً',
    accountCreated: 'تم إنشاء حسابك',
    registerFailed: 'فشل التسجيل',
    sendFailed: 'فشل الإرسال',
    selectPickupFirst: 'حدد مكان الانطلاق',
    selectDropoffFirst: 'حدد مكان الوصول',
    orderSentSuccess: 'تم إرسال طلبك!',
    orderNotFound: 'الطلب غير موجود',
    orderAccepted: 'تم قبول الطلب — توجه للموقع',
    acceptFailed: 'فشل قبول الطلب',
    locationSet: 'تم تثبيت الموقع',
    locationNotSet: 'لم يتم تحديد موقع',
    gpsUnavailable: 'GPS غير متاح',
    detectingLocation: 'جاري تحديد موقعك...',
    locationDetected: 'تم تحديد موقعك',
    locationFailed: 'تعذّر تحديد موقعك',
    themeChanged: 'تم تغيير المظهر',
    langChanged: 'تم تغيير اللغة',
    comingSoon: 'قريباً',
    callSupport: 'الدعم: 07751459130',
    logoutSuccess: 'تم تسجيل الخروج',

    // ═══ Time ═══
    now: 'الآن',
    minsAgo: 'منذ',
    minsAgoSuffix: 'دقيقة',
    hoursAgoSuffix: 'ساعة',

    // ═══ Direction ═══
    dir: 'rtl'
  },

  en: {
    // ═══ App ═══
    appName: 'Wassilha',
    tagline: 'Reliable Delivery Service',
    version: 'Version',

    // ═══ Splash ═══
    splashReady: 'Ready to go',

    // ═══ Login ═══
    welcomeBack: 'Welcome back 👋',
    signIn: 'Sign In',
    phone: 'Phone Number',
    phonePlaceholder: '07XXXXXXXXX',
    continue: 'Continue',
    or: 'OR',
    createNewAccount: 'Create New Account',
    termsNote: 'By continuing you agree to the',
    terms: 'Terms & Conditions',
    noAccount: 'Have an account?',
    loginLink: 'Sign in',

    // ═══ Role ═══
    chooseAccountType: 'Choose Account Type',
    howUse: 'How do you want to use Wassilha?',
    customer: 'Customer',
    customerDesc: 'Request delivery anywhere',
    driver: 'Driver',
    driverDesc: 'Accept orders and earn',
    store: 'Store',
    storeDesc: 'Register your store and sell',

    // ═══ Register ═══
    registerTitle: 'Create Account',
    registerSubtitle: 'Complete your details to start',
    fullName: 'Full Name',
    vehicleType: 'Vehicle Type',
    selectVehicle: 'Select Vehicle Type',
    motorcycle: 'Motorcycle',
    bicycle: 'Bicycle',
    car: 'Car',
    password: 'Password',
    agreeTerms: 'I agree to the',
    createAccount: 'Create Account',

    // ═══ OTP ═══
    verifyPhone: 'Verify Phone',
    otpSent: 'Enter the code sent to',
    verify: 'Verify',
    resendIn: 'Resend in',
    seconds: 'seconds',
    resend: 'Resend Code',

    // ═══ Home ═══
    hello: 'Hello',
    location: 'Rusafa, Baghdad',
    searchService: 'Search for a service...',
    orderNow: 'Order Delivery Now',
    deliverIn30: 'Delivery within 30 minutes',
    start: 'Start',
    orderService: 'Order Service',
    food: 'Food Delivery',
    grocery: 'Grocery',
    pharmacy: 'Pharmacy',
    package: 'Packages',
    myRecentOrders: 'My Recent Orders',
    viewAll: 'View All',
    noOrders: 'No orders yet',
    startFirstOrder: 'Start your first order now',

    // ═══ Bottom Nav ═══
    home: 'Home',
    myOrders: 'My Orders',
    myAccount: 'Account',

    // ═══ New Order ═══
    newDelivery: 'New Delivery',
    from: 'From',
    to: 'To',
    selectPickup: 'Tap to select pickup location',
    selectDropoff: 'Tap to select dropoff location',
    packageType: 'Package Type',
    normal: 'Normal',
    medicine: 'Medicine',
    documents: 'Documents',
    notes: 'Notes (Optional)',
    notesPlaceholder: 'Any note for the driver...',
    distance: 'Distance',
    basePrice: 'Base Price',
    pricePerKm: 'Price per KM',
    total: 'Total',
    sendOrder: 'Send Order',

    // ═══ Order Success ═══
    orderSent: 'Order Sent',
    willContact: 'We will contact you soon',
    orderNumber: 'Order Number',
    price: 'Price',
    trackOrder: 'Track Order',
    backHome: 'Back to Home',

    // ═══ Tracking ═══
    tracking: 'Track Order',
    arriving15: 'Arriving in 15 minutes',
    driver: 'Driver',
    motorcycle: 'Motorcycle',
    orderConfirmed: 'Confirmed',
    orderConfirmedDesc: 'Your order is in the system',
    driverAccepted: 'Driver Accepted',
    driverAcceptedDesc: 'Waiting',
    onTheWay: 'On the Way',
    onTheWayDesc: 'Status will be updated',
    delivered: 'Delivered',
    deliveredDesc: 'Thank you',
    cancel: 'Cancel',
    chat: 'Chat',

    // ═══ Orders ═══
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    order: 'Order',
    pending: 'Pending',
    accepted: 'Accepted',
    pickedUp: 'On the way',
    track: 'Track',

    // ═══ Profile ═══
    myProfile: 'My Account',
    orders: 'Orders',
    balance: 'IQD',
    rating: 'Rating',
    addresses: 'Addresses',
    paymentMethods: 'Payment Methods',
    settings: 'Settings',
    help: 'Help & Support',
    logout: 'Logout',
    logoutConfirm: 'Do you want to logout?',

    // ═══ Driver ═══
    driverWelcome: 'Welcome',
    offline: 'Offline',
    online: 'Online Now',
    activateConnection: 'Activate connection to receive orders',
    startWork: 'Start Work',
    stop: 'Stop',
    today: 'Today',
    earnings: 'Earnings',
    nearbyOrders: 'Nearby Orders',
    noNearbyOrders: 'No orders',
    accept: 'Accept',
    km: 'km',

    // ═══ Map Picker ═══
    selectLocation: 'Select Location',
    selectPickupTitle: 'Select Pickup Location',
    selectDropoffTitle: 'Select Dropoff Location',
    searchAddress: 'Search for address...',
    selectedAddress: 'Selected Address',
    detecting: 'Detecting...',
    myLocation: 'My Location',
    confirmLocation: 'Confirm This Location',

    // ═══ Notifications ═══
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    notifWillAppear: 'Notifications will appear here',

    // ═══ Settings ═══
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    language: 'Language',
    currency: 'Currency',
    aboutApp: 'About App',
    about: 'About',
    arabic: 'العربية',
    english: 'English',
    iraqiDinar: 'Iraqi Dinar',
    sound: 'Sound',
    privacy: 'Privacy',
    privacyPolicy: 'Privacy Policy',

    // ═══ Toasts ═══
    invalidPhone: 'Invalid phone number',
    phoneNotRegistered: 'Not registered — create an account',
    codeSent: 'Code sent',
    enterFullCode: 'Enter full code',
    wrongCode: 'Wrong or expired code',
    welcomeUser: 'Welcome',
    nameTooShort: 'Name is too short',
    passwordMin: 'Password must be 6+ characters',
    selectVehicleType: 'Select vehicle type',
    agreeTermsFirst: 'Agree to terms',
    phoneRegistered: 'Phone already registered',
    accountCreated: 'Account created',
    registerFailed: 'Registration failed',
    sendFailed: 'Send failed',
    selectPickupFirst: 'Select pickup location',
    selectDropoffFirst: 'Select dropoff location',
    orderSentSuccess: 'Order sent!',
    orderNotFound: 'Order not found',
    orderAccepted: 'Order accepted — go to location',
    acceptFailed: 'Accept failed',
    locationSet: 'Location confirmed',
    locationNotSet: 'No location selected',
    gpsUnavailable: 'GPS unavailable',
    detectingLocation: 'Detecting your location...',
    locationDetected: 'Location detected',
    locationFailed: 'Could not detect location',
    themeChanged: 'Theme changed',
    langChanged: 'Language changed',
    comingSoon: 'Coming soon',
    callSupport: 'Support: 07751459130',
    logoutSuccess: 'Logged out',

    // ═══ Time ═══
    now: 'Now',
    minsAgo: '',
    minsAgoSuffix: 'min ago',
    hoursAgoSuffix: 'hr ago',

    // ═══ Direction ═══
    dir: 'ltr'
  }
};

window.TRANSLATIONS = TRANSLATIONS;

console.log('🌐 Translations loaded: AR + EN');
