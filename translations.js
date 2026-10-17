// ============================================
// 🌐 TRANSLATIONS.JS — Wassilha v3
// ============================================

const TRANSLATIONS = {
  ar: {
    // ═══ App ═══
    appName: 'وصّلها', tagline: 'خدمة توصيل موثوقة', version: 'الإصدار',
    
    // ═══ Splash ═══
    splashReady: 'جاهز للانطلاق',

    // ═══ Login ═══
    welcomeBack: 'أهلاً بعودتك 👋', signIn: 'تسجيل الدخول', phone: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXXX', continue: 'متابعة', or: 'أو',
    createNewAccount: 'إنشاء حساب جديد', termsNote: 'بالمتابعة أنت توافق على',
    terms: 'الشروط والأحكام', noAccount: 'عندك حساب؟', loginLink: 'سجل دخول',

    // ═══ Role ═══
    chooseAccountType: 'اختر نوع حسابك', howUse: 'كيف تريد استخدام وصّلها؟',
    customer: 'عميل', customerDesc: 'اطلب توصيل لأي مكان',
    driver: 'مندوب', driverDesc: 'استقبل طلبات واكسب',
    store: 'متجر', storeDesc: 'سجل متجرك وابدأ البيع',

    // ═══ Register ═══
    registerTitle: 'إنشاء حساب', registerSubtitle: 'أكمل بياناتك للبدء',
    fullName: 'الاسم الكامل', vehicleType: 'نوع المركبة', selectVehicle: 'اختر نوع المركبة',
    motorcycle: 'دراجة نارية', bicycle: 'دراجة هوائية', car: 'سيارة',
    password: 'كلمة المرور', agreeTerms: 'أوافق على', createAccount: 'إنشاء الحساب',

    // ═══ OTP ═══
    verifyPhone: 'التحقق من الهاتف', otpSent: 'أدخل الكود المرسل إلى',
    verify: 'تحقق', resendIn: 'إعادة الإرسال خلال', seconds: 'ثانية', resend: 'إعادة إرسال الكود',

    // ═══ Home ═══
    hello: 'مرحباً', location: 'الرصافة، بغداد', searchService: 'ابحث عن خدمة...',
    orderNow: 'اطلب توصيل الآن', deliverIn30: 'توصيل خلال 30 دقيقة', start: 'ابدأ',
    orderService: 'اطلب خدمة', food: 'توصيل طعام', grocery: 'بقالة', pharmacy: 'صيدلية', package: 'طرود',
    myRecentOrders: 'طلباتي الأخيرة', viewAll: 'عرض الكل', noOrders: 'لا توجد طلبات بعد', startFirstOrder: 'ابدأ أول طلب لك الآن',

    // ═══ Bottom Nav ═══
    home: 'الرئيسية', myOrders: 'طلباتي', myAccount: 'حسابي',

    // ═══ New Order ═══
    newDelivery: 'طلب توصيل جديد', from: 'من', to: 'إلى',
    selectPickup: 'اضغط لتحديد موقع الانطلاق', selectDropoff: 'اضغط لتحديد مكان الوصول',
    packageType: 'نوع الطرد', normal: 'عادي', medicine: 'دواء', documents: 'وثائق',
    notes: 'ملاحظات (اختياري)', notesPlaceholder: 'أي ملاحظة للمندوب...',
    distance: 'المسافة', basePrice: 'الرسم الأساسي', pricePerKm: 'سعر الكيلو', total: 'الإجمالي', sendOrder: 'إرسال الطلب',

    // ═══ Order Success ═══
    orderSent: 'تم إرسال طلبك', willContact: 'سيتم التواصل معك قريباً',
    orderNumber: 'رقم الطلب', price: 'السعر', trackOrder: 'تتبع الطلب', backHome: 'العودة للرئيسية',

    // ═══ Tracking ═══
    tracking: 'تتبع الطلب', arriving15: 'يصل خلال 15 دقيقة', driver: 'المندوب',
    orderConfirmed: 'تم التأكيد', orderConfirmedDesc: 'طلبك في النظام',
    driverAccepted: 'قبول المندوب', driverAcceptedDesc: 'في انتظار',
    onTheWay: 'في الطريق', onTheWayDesc: 'سيتم تحديث الحالة',
    delivered: 'تم التوصيل', deliveredDesc: 'شكراً لك',
    cancel: 'إلغاء', chat: 'دردشة', cancelOrderConfirm: 'هل تريد إلغاء الطلب؟',
    
    // ═══ Driver Identity (جديد) ═══
    driverIdentity: 'هوية المندوب',
    callDriver: 'اتصال',
    whatsappDriver: 'واتساب',
    chatDriver: 'دردشة',
    driverVerified: 'موثق',
    driverPending: 'قيد التوثيق',
    driverPhoneUnavailable: 'رقم المندوب غير متوفر',
    
    // ═══ GPS Delivery (جديد) ═══
    markAsDelivered: 'تم التسليم',
    checkingLocation: 'جاري التحقق من موقعك...',
    tooFarFromCustomer: 'أنت بعيد عن العميل، اقترب للتسليم',
    gpsFailedConfirm: 'تعذّر تحديد موقعك. هل أنت متأكد من التسليم؟',
    deliverySuccess: 'تم التسليم بنجاح',
    metersAway: 'متر',
    youAreClose: 'أنت في نطاق التسليم',

    // ═══ Chat Screen (جديد) ═══
    chatTitle: 'الدردشة',
    chatPlaceholder: 'اكتب رسالة...',
    typeMessage: 'اكتب رسالة...',
    online: 'متصل الآن',
    offline: 'غير متصل',
    typing: 'يكتب...',
    noMessages: 'لا توجد رسائل بعد',
    startChat: 'ابدأ المحادثة',
    today: 'اليوم',
    yesterday: 'أمس',
    chatComingSoon: 'الدردشة قريباً',

    // ═══ Orders ═══
    all: 'الكل', active: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة',
    order: 'طلب', pending: 'قيد الانتظار', accepted: 'تم القبول', pickedUp: 'في الطريق', track: 'تتبع',

    // ═══ Profile ═══
    myProfile: 'حسابي', orders: 'طلب', balance: 'د.ع', rating: 'تقييم',
    addresses: 'العناوين', paymentMethods: 'طرق الدفع', settings: 'الإعدادات', help: 'المساعدة والدعم',
    logout: 'تسجيل الخروج', logoutConfirm: 'هل تريد تسجيل الخروج؟',

    // ═══ Driver Dashboard ═══
    driverWelcome: 'مرحباً', activateConnection: 'فعّل الاتصال لاستقبال الطلبات',
    startWork: 'ابدأ العمل', stop: 'إيقاف', todayLabel: 'اليوم', earnings: 'الأرباح',
    nearbyOrders: 'الطلبات القريبة', noNearbyOrders: 'لا توجد طلبات', accept: 'قبول', km: 'كم', min: 'دقيقة',

    // ═══ Map Picker ═══
    selectLocation: 'حدد الموقع', selectPickupTitle: 'حدد موقع الانطلاق', selectDropoffTitle: 'حدد مكان الوصول',
    searchAddress: 'ابحث عن عنوان...', selectedAddress: 'العنوان المحدد', detecting: 'جاري التحديد...',
    detectingAddress: 'جاري تحديد العنوان...', myLocation: 'موقعي', confirmLocation: 'تثبيت هذا الموقع',
    confirmAndContinue: 'تأكيد ومتابعة', locationConfirmed: 'تم تحديد الموقع', fullAddress: 'العنوان الكامل',
    area: 'المنطقة', street: 'الشارع', buildingNumber: 'رقم الدار', coordinates: 'الإحداثيات',
    noteOptional: 'ملاحظة (اختياري)', notePlaceholder: 'اكتب ملاحظة للمندوب...',

    // ═══ Search & Category ═══
    searchAnything: 'ابحث عن متجر، مطعم، دواء...', popularSearches: 'الأكثر بحثاً', categories: 'الأقسام',
    searchInCategory: 'ابحث...', noResults: 'لا توجد نتائج', tryOtherSearch: 'جرب كلمة أخرى', noStores: 'لا توجد متاجر',
    category: 'القسم', near: 'قريب', topRated: 'الأعلى تقييم', fastest: 'الأسرع',

    // ═══ Notifications ═══
    notifications: 'الإشعارات', noNotifications: 'لا توجد إشعارات', notifWillAppear: 'ستظهر الإشعارات هنا',

    // ═══ Settings ═══
    theme: 'المظهر', light: 'فاتح', dark: 'داكن', auto: 'تلقائي', language: 'اللغة', currency: 'العملة',
    general: 'عام', aboutApp: 'عن التطبيق', about: 'حول', arabic: 'العربية', english: 'English',
    iraqiDinar: 'دينار عراقي', sound: 'الصوت', notifSound: 'صوت الإشعارات', orderSound: 'رنين الطلبات',
    defaultSound: 'افتراضي', tapToListen: 'اضغط للاستماع', noSound: 'بدون صوت',
    privacy: 'الخصوصية', privacyPolicy: 'سياسة الخصوصية', rateApp: 'قيّم التطبيق', shareApp: 'شارك التطبيق',

    // ═══ Contact & About ═══
    contactUs: 'تواصل معنا', contactIntro: 'نحن هنا لمساعدتك!', whatsapp: 'واتساب', email: 'البريد الإلكتروني',
    telegramChannel: 'القناة الرسمية', workingHours: 'ساعات العمل', workingHoursValue: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
    aboutUs: 'من نحن', aboutUsText: 'وصّلها تطبيق عراقي لتوصيل الطلبات من المحلات والصيدليات والمطاعم إلى باب بيتك.',
    features: 'مميزاتنا', feature1: 'توصيل خلال 30 دقيقة', feature2: 'مندوبين موثقين', feature3: 'تتبع مباشر للطلب',
    feature4: 'الدفع عند التسليم', feature5: 'أسعار تنافسية', serviceArea: 'منطقة الخدمة',
    serviceAreaText: '📍 الرصافة، بغداد (قابل للتوسع قريباً)', developer: 'عن المطوّر',
    devName: 'حسن عدنان', devRole: 'مؤسس ومطوّر وصّلها', madeInIraq: 'صُنع بحب في العراق 💜',
    // ═══ Legal (Terms & Privacy) ═══
lastUpdate: 'آخر تحديث:',
terms1Title: '1. قبول الشروط', terms1Text: 'باستخدامك لتطبيق وصّلها، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى التوقف عن استخدام التطبيق.',
terms2Title: '2. الأهلية', terms2Text: 'يجب أن يكون عمرك 18 سنة على الأقل لاستخدام الخدمات. إذا كنت أصغر، يجب الإشراف الأبوي.',
terms3Title: '3. الحساب', terms3_1: 'أنت مسؤول عن سرية حسابك.', terms3_2: 'البيانات يجب أن تكون صحيحة.', terms3_3: 'يُمنع الحسابات الوهمية.', terms3_4: 'يحق لنا إيقاف الحسابات المخالفة.',
terms4Title: '4. خدمات التوصيل', terms4_1: 'نربط بين العملاء والمندوبين.', terms4_2: 'نضمن سلامة التوصيل.', terms4_3: 'المندوب يلتزم بالمواعيد.', terms4_4: 'لسنا مسؤولين عن جودة المنتجات.',
terms5Title: '5. الدفع', terms5_1: 'الدفع نقداً عند التسليم.', terms5_2: 'الأسعار واضحة قبل التأكيد.', terms5_3: 'لا رسوم خفية.',
terms6Title: '6. الإلغاء', terms6_1: 'الإلغاء مجاني قبل قبول المندوب.', terms6_2: 'بعد القبول قد تُطبق رسوم.', terms6_3: 'التأخير الشديد يسمح بالإلغاء مجاناً.',
terms7Title: '7. المسؤولية', terms7_1: 'لسنا مسؤولين عن الظروف القاهرة.', terms7_2: 'المندوب مسؤول عن سلامة الطرد.',
terms8Title: '8. التواصل', terms8Text: 'للاستفسار تواصل معنا:',
terms9Title: '9. التعديلات', terms9Text: 'نحتفظ بحق تعديل الشروط في أي وقت.',

privacy1Title: '1. المعلومات التي نجمعها', privacy1_1: '📱 رقم الهاتف للتحقق.', privacy1_2: '👤 الاسم للتوصيل.', privacy1_3: '📍 العناوين للحفظ.', privacy1_4: '🗺️ GPS لتحديد الموقع.', privacy1_5: '🚗 معلومات المركبة (للمندوب).',
privacy2Title: '2. كيف نستخدمها', privacy2_1: 'توصيل الطلبات.', privacy2_2: 'التواصل بينك وبين المندوب.', privacy2_3: 'تحسين الخدمة.', privacy2_4: 'الأمان ومنع الاحتيال.',
privacy3Title: '3. ما لا نفعله', privacy3_1: '❌ لا نبيع بياناتك.', privacy3_2: '❌ لا نشاركها بدون إذن.', privacy3_3: '❌ لا نستخدمها لأغراض إعلانية.',
privacy4Title: '4. الحماية', privacy4_1: '🔐 تشفير كامل (SSL).', privacy4_2: '🛡️ سيرفرات آمنة.', privacy4_3: '🚫 لا نحتفظ ببيانات الدفع.',
privacy5Title: '5. الصلاحيات', privacy5_1: '📍 الموقع للتوصيل.', privacy5_2: '📷 الكاميرا (اختياري).', privacy5_3: '🔔 الإشعارات للتحديثات.',
privacy6Title: '6. حقوقك', privacy6_1: 'طلب نسخة من بياناتك.', privacy6_2: 'حذف حسابك نهائياً.', privacy6_3: 'تعديل معلوماتك.',
privacy7Title: '7. التواصل',
    // ═══ Toasts & Messages ═══
    invalidPhone: 'رقم الهاتف غير صحيح', phoneNotRegistered: 'الرقم غير مسجل — سجل حساب جديد',
    codeSent: 'تم إرسال الكود', enterFullCode: 'أدخل الكود كاملاً', wrongCode: 'الكود غير صحيح أو منتهي',
    welcomeUser: 'أهلاً', nameTooShort: 'الاسم قصير جداً', passwordMin: 'كلمة المرور 6 أحرف على الأقل',
    selectVehicleType: 'اختر نوع المركبة', agreeTermsFirst: 'وافق على الشروط', phoneRegistered: 'الرقم مسجل مسبقاً',
    accountCreated: 'تم إنشاء حسابك', storeCreated: 'تم إنشاء متجرك بنجاح ✅', registerFailed: 'فشل التسجيل',
    sendFailed: 'فشل الإرسال', selectPickupFirst: 'حدد مكان الانطلاق', selectDropoffFirst: 'حدد مكان الوصول',
    orderSentSuccess: 'تم إرسال طلبك!', orderNotFound: 'الطلب غير موجود', orderAccepted: 'تم قبول الطلب',
    acceptFailed: 'فشل قبول الطلب', locationSet: 'تم تثبيت الموقع', locationNotSet: 'لم يتم تحديد موقع',
    gpsUnavailable: 'GPS غير متاح', detectingLocation: 'جاري تحديد موقعك...', locationDetected: 'تم تحديد موقعك',
    locationFailed: 'تعذّر تحديد موقعك', permissionDenied: 'اسمح بالوصول للموقع', themeChanged: 'تم تغيير المظهر',
    langChanged: 'تم تغيير اللغة', comingSoon: 'قريباً', callSupport: 'الدعم: 07751459130', logoutSuccess: 'تم تسجيل الخروج',
    rateAppPrompt: 'قيّم التطبيق من 1 إلى 5:', invalidRating: 'تقييم غير صحيح', thanksForRating: 'شكراً لتقييمك!',
    thanksForSharing: 'شكراً للمشاركة!', linkCopied: 'تم نسخ الرابط', notifEnabled: 'تم تفعيل الإشعارات',
    notifInternalEnabled: 'الإشعارات الداخلية مفعلة', notifDisabled: 'تم تعطيل الإشعارات',
    soundEnabled: 'الصوت مفعل', soundDisabled: 'الصوت معطل', loading: 'جاري التحميل...',

    // ═══ Time ═══
    now: 'الآن', minsAgo: 'منذ', minsAgoSuffix: 'دقيقة', hoursAgoSuffix: 'ساعة',
    dir: 'rtl'
  },

  en: {
    // ═══ App ═══
    appName: 'Wassilha', tagline: 'Reliable Delivery Service', version: 'Version',
    
    // ═══ Splash ═══
    splashReady: 'Ready to go',

    // ═══ Login ═══
    welcomeBack: 'Welcome back 👋', signIn: 'Sign In', phone: 'Phone Number',
    phonePlaceholder: '07XXXXXXXXX', continue: 'Continue', or: 'OR',
    createNewAccount: 'Create New Account', termsNote: 'By continuing you agree to the',
    terms: 'Terms & Conditions', noAccount: 'Have an account?', loginLink: 'Sign in',

    // ═══ Role ═══
    chooseAccountType: 'Choose Account Type', howUse: 'How do you want to use Wassilha?',
    customer: 'Customer', customerDesc: 'Request delivery anywhere',
    driver: 'Driver', driverDesc: 'Accept orders and earn',
    store: 'Store', storeDesc: 'Register your store and sell',

    // ═══ Register ═══
    registerTitle: 'Create Account', registerSubtitle: 'Complete your details to start',
    fullName: 'Full Name', vehicleType: 'Vehicle Type', selectVehicle: 'Select Vehicle Type',
    motorcycle: 'Motorcycle', bicycle: 'Bicycle', car: 'Car',
    password: 'Password', agreeTerms: 'I agree to the', createAccount: 'Create Account',

    // ═══ OTP ═══
    verifyPhone: 'Verify Phone', otpSent: 'Enter the code sent to',
    verify: 'Verify', resendIn: 'Resend in', seconds: 'seconds', resend: 'Resend Code',

    // ═══ Home ═══
    hello: 'Hello', location: 'Rusafa, Baghdad', searchService: 'Search for a service...',
    orderNow: 'Order Delivery Now', deliverIn30: 'Delivery within 30 minutes', start: 'Start',
    orderService: 'Order Service', food: 'Food Delivery', grocery: 'Grocery', pharmacy: 'Pharmacy', package: 'Packages',
    myRecentOrders: 'My Recent Orders', viewAll: 'View All', noOrders: 'No orders yet', startFirstOrder: 'Start your first order now',

    // ═══ Bottom Nav ═══
    home: 'Home', myOrders: 'My Orders', myAccount: 'Account',

    // ═══ New Order ═══
    newDelivery: 'New Delivery', from: 'From', to: 'To',
    selectPickup: 'Tap to select pickup location', selectDropoff: 'Tap to select dropoff location',
    packageType: 'Package Type', normal: 'Normal', medicine: 'Medicine', documents: 'Documents',
    notes: 'Notes (Optional)', notesPlaceholder: 'Any note for the driver...',
    distance: 'Distance', basePrice: 'Base Price', pricePerKm: 'Price per KM', total: 'Total', sendOrder: 'Send Order',

    // ═══ Order Success ═══
    orderSent: 'Order Sent', willContact: 'We will contact you soon',
    orderNumber: 'Order Number', price: 'Price', trackOrder: 'Track Order', backHome: 'Back to Home',

    // ═══ Tracking ═══
    tracking: 'Track Order', arriving15: 'Arriving in 15 minutes', driver: 'Driver',
    orderConfirmed: 'Confirmed', orderConfirmedDesc: 'Your order is in the system',
    driverAccepted: 'Driver Accepted', driverAcceptedDesc: 'Waiting',
    onTheWay: 'On the Way', onTheWayDesc: 'Status will be updated',
    delivered: 'Delivered', deliveredDesc: 'Thank you',
    cancel: 'Cancel', chat: 'Chat', cancelOrderConfirm: 'Cancel this order?',
    
    // ═══ Driver Identity (New) ═══
    driverIdentity: 'Driver Identity',
    callDriver: 'Call',
    whatsappDriver: 'WhatsApp',
    chatDriver: 'Chat',
    driverVerified: 'Verified',
    driverPending: 'Pending',
    driverPhoneUnavailable: 'Driver phone unavailable',
    
    // ═══ GPS Delivery (New) ═══
    markAsDelivered: 'Mark as Delivered',
    checkingLocation: 'Checking your location...',
    tooFarFromCustomer: 'You are too far from the customer',
    gpsFailedConfirm: 'Could not detect location. Are you sure?',
    deliverySuccess: 'Delivered successfully',
    metersAway: 'meters',
    youAreClose: 'You are in delivery range',

    // ═══ Chat Screen (New) ═══
    chatTitle: 'Chat',
    chatPlaceholder: 'Type a message...',
    typeMessage: 'Type a message...',
    online: 'Online now',
    offline: 'Offline',
    typing: 'typing...',
    noMessages: 'No messages yet',
    startChat: 'Start chat',
    today: 'Today',
    yesterday: 'Yesterday',
    chatComingSoon: 'Chat coming soon',

    // ═══ Orders ═══
    all: 'All', active: 'Active', completed: 'Completed', cancelled: 'Cancelled',
    order: 'Order', pending: 'Pending', accepted: 'Accepted', pickedUp: 'On the way', track: 'Track',

    // ═══ Profile ═══
    myProfile: 'My Account', orders: 'Orders', balance: 'IQD', rating: 'Rating',
    addresses: 'Addresses', paymentMethods: 'Payment Methods', settings: 'Settings', help: 'Help & Support',
    logout: 'Logout', logoutConfirm: 'Do you want to logout?',

    // ═══ Driver Dashboard ═══
    driverWelcome: 'Welcome', activateConnection: 'Activate connection to receive orders',
    startWork: 'Start Work', stop: 'Stop', todayLabel: 'Today', earnings: 'Earnings',
    nearbyOrders: 'Nearby Orders', noNearbyOrders: 'No orders', accept: 'Accept', km: 'km', min: 'min',

    // ═══ Map Picker ═══
    selectLocation: 'Select Location', selectPickupTitle: 'Select Pickup Location', selectDropoffTitle: 'Select Dropoff Location',
    searchAddress: 'Search for address...', selectedAddress: 'Selected Address', detecting: 'Detecting...',
    detectingAddress: 'Detecting address...', myLocation: 'My Location', confirmLocation: 'Confirm This Location',
    confirmAndContinue: 'Confirm & Continue', locationConfirmed: 'Location Confirmed', fullAddress: 'Full Address',
    area: 'Area', street: 'Street', buildingNumber: 'Building No.', coordinates: 'Coordinates',
    noteOptional: 'Note (Optional)', notePlaceholder: 'Add a note for the driver...',

    // ═══ Search & Category ═══
    searchAnything: 'Search for store, restaurant, medicine...', popularSearches: 'Popular Searches', categories: 'Categories',
    searchInCategory: 'Search...', noResults: 'No results found', tryOtherSearch: 'Try another keyword', noStores: 'No stores available',
    category: 'Category', near: 'Near', topRated: 'Top Rated', fastest: 'Fastest',

    // ═══ Notifications ═══
    notifications: 'Notifications', noNotifications: 'No notifications', notifWillAppear: 'Notifications will appear here',

    // ═══ Settings ═══
    theme: 'Theme', light: 'Light', dark: 'Dark', auto: 'Auto', language: 'Language', currency: 'Currency',
    general: 'General', aboutApp: 'About App', about: 'About', arabic: 'العربية', english: 'English',
    iraqiDinar: 'Iraqi Dinar', sound: 'Sound', notifSound: 'Notification Sound', orderSound: 'Order Ringtone',
    defaultSound: 'Default', tapToListen: 'Tap to listen', noSound: 'No sound',
    privacy: 'Privacy', privacyPolicy: 'Privacy Policy', rateApp: 'Rate App', shareApp: 'Share App',

    // ═══ Contact & About ═══
    contactUs: 'Contact Us', contactIntro: 'We are here to help!', whatsapp: 'WhatsApp', email: 'Email',
    telegramChannel: 'Official Channel', workingHours: 'Working Hours', workingHoursValue: 'Sat - Thu: 9 AM - 9 PM',
    aboutUs: 'About Us', aboutUsText: 'Wassilha is an Iraqi app for delivering orders to your doorstep.',
    features: 'Features', feature1: 'Delivery within 30 minutes', feature2: 'Verified drivers', feature3: 'Live order tracking',
    feature4: 'Cash on delivery', feature5: 'Competitive prices', serviceArea: 'Service Area',
    serviceAreaText: '📍 Rusafa, Baghdad (Expanding soon)', developer: 'Developer',
    devName: 'Hasan Adnan', devRole: 'Founder & Developer of Wassilha', madeInIraq: 'Made with love in Iraq 💜',

    // ═══ Legal ═══
    lastUpdate: 'Last updated:',
    terms1Title: '1. Acceptance of Terms', terms1Text: 'By using Wassilha, you agree to comply with these terms.',
    terms2Title: '2. Eligibility', terms2Text: 'You must be at least 18 years old to use delivery services.',
    terms3Title: '3. Account', terms3_1: 'You are responsible for your account security', terms3_2: 'Data must be accurate', terms3_3: 'Fake accounts are prohibited', terms3_4: 'We may suspend violating accounts',
    terms4Title: '4. Delivery Services', terms4_1: 'We connect customers with drivers', terms4_2: 'We ensure safe delivery', terms4_3: 'Driver commits to agreed times', terms4_4: 'We are not responsible for product quality',
    terms5Title: '5. Payment', terms5_1: 'Cash payment on delivery', terms5_2: 'Prices are clear before confirmation', terms5_3: 'No hidden fees',
    terms6Title: '6. Cancellation', terms6_1: 'Order can be cancelled before driver accepts', terms6_2: 'After acceptance, fees may apply', terms6_3: 'If driver delays, cancellation is free',
    terms7Title: '7. Liability', terms7_1: 'We are not liable for force majeure delays', terms7_2: 'Driver is responsible for package safety',
    terms8Title: '8. Contact', terms8Text: 'For inquiries, contact us:',
    terms9Title: '9. Modifications', terms9Text: 'We reserve the right to modify terms anytime.',
    
    privacy1Title: '1. Information We Collect', privacy1_1: '📱 Phone number', privacy1_2: '👤 Name', privacy1_3: '📍 Address', privacy1_4: '🗺️ Location', privacy1_5: '🚗 Vehicle info (drivers)',
    privacy2Title: '2. How We Use Your Info', privacy2_1: 'Deliver orders', privacy2_2: 'Connect customer with driver', privacy2_3: 'Improve service quality', privacy2_4: 'Security & fraud prevention',
    privacy3Title: '3. What We Don\'t Do', privacy3_1: '❌ We don\'t sell your data', privacy3_2: '❌ We don\'t share without permission', privacy3_3: '❌ We don\'t use for undefined purposes',
    privacy4Title: '4. Security', privacy4_1: '🔐 Full data encryption', privacy4_2: '🛡️ Secure servers', privacy4_3: '🚫 We don\'t store payment info',
    privacy5Title: '5. Permissions', privacy5_1: '📍 Location: for delivery', privacy5_2: '📷 Camera: for photos', privacy5_3: '🔔 Notifications: for order updates',
    privacy6Title: '6. Your Rights', privacy6_1: 'Request a copy of your data', privacy6_2: 'Delete your account permanently', privacy6_3: 'Edit your info anytime',
    privacy7Title: '7. Contact',

    // ═══ Toasts ═══
    invalidPhone: 'Invalid phone number', phoneNotRegistered: 'Not registered — create an account',
    codeSent: 'Code sent', enterFullCode: 'Enter full code', wrongCode: 'Wrong or expired code',
    welcomeUser: 'Welcome', nameTooShort: 'Name is too short', passwordMin: 'Password must be 6+ characters',
    selectVehicleType: 'Select vehicle type', agreeTermsFirst: 'Agree to terms', phoneRegistered: 'Phone already registered',
    accountCreated: 'Account created', storeCreated: 'Store created successfully ✅', registerFailed: 'Registration failed',
    sendFailed: 'Send failed', selectPickupFirst: 'Select pickup location', selectDropoffFirst: 'Select dropoff location',
    orderSentSuccess: 'Order sent!', orderNotFound: 'Order not found', orderAccepted: 'Order accepted',
    acceptFailed: 'Accept failed', locationSet: 'Location confirmed', locationNotSet: 'No location selected',
    gpsUnavailable: 'GPS unavailable', detectingLocation: 'Detecting your location...', locationDetected: 'Location detected',
    locationFailed: 'Could not detect location', permissionDenied: 'Allow location access', themeChanged: 'Theme changed',
    langChanged: 'Language changed', comingSoon: 'Coming soon', callSupport: 'Support: 07751459130', logoutSuccess: 'Logged out',
    rateAppPrompt: 'Rate the app from 1 to 5:', invalidRating: 'Invalid rating', thanksForRating: 'Thanks for rating!',
    thanksForSharing: 'Thanks for sharing!', linkCopied: 'Link copied', notifEnabled: 'Notifications enabled',
    notifInternalEnabled: 'Internal notifications enabled', notifDisabled: 'Notifications disabled',
    soundEnabled: 'Sound enabled', soundDisabled: 'Sound disabled', loading: 'Loading...',

    // ═══ Time ═══
    now: 'Now', minsAgo: '', minsAgoSuffix: 'min ago', hoursAgoSuffix: 'hr ago',
    dir: 'ltr'
  }
};

window.TRANSLATIONS = TRANSLATIONS;
console.log('🌐 Translations loaded: AR + EN —', Object.keys(TRANSLATIONS.ar).length, 'keys');
