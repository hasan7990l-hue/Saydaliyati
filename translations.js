// ============================================
// 🌐 TRANSLATIONS.JS — Wassilha v8.0 (FULL)
// ============================================

const TRANSLATIONS = {
  ar: {
    // ═══ App ═══
    appName: 'وصّلها', tagline: 'خدمة توصيل موثوقة', version: 'الإصدار',
    splashReady: 'جاهز للانطلاق',
    
    // ═══ Login & Auth ═══
    welcomeBack: 'أهلاً بعودتك 👋', signIn: 'تسجيل الدخول', phone: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXXX', continue: 'متابعة', or: 'أو',
    createNewAccount: 'إنشاء حساب جديد', termsNote: 'بالمتابعة أنت توافق على',
    terms: 'الشروط والأحكام', noAccount: 'عندك حساب؟', loginLink: 'سجل دخول',
    chooseAccountType: 'اختر نوع حسابك', howUse: 'كيف تريد استخدام وصّلها؟',
    customer: 'عميل', customerDesc: 'اطلب توصيل لأي مكان',
    driver: 'مندوب', driverDesc: 'استقبل طلبات واكسب',
    store: 'متجر', storeDesc: 'سجل متجرك وابدأ البيع',
    registerTitle: 'إنشاء حساب', registerSubtitle: 'أكمل بياناتك للبدء',
    fullName: 'الاسم الكامل', vehicleType: 'نوع المركبة', selectVehicle: 'اختر نوع المركبة',
    motorcycle: 'دراجة نارية', bicycle: 'دراجة هوائية', car: 'سيارة',
    password: 'كلمة المرور', agreeTerms: 'أوافق على', createAccount: 'إنشاء الحساب',
    verifyPhone: 'التحقق من الهاتف', otpSent: 'أدخل الكود المرسل إلى',
    verify: 'تحقق', resendIn: 'إعادة الإرسال خلال', seconds: 'ثانية', resend: 'إعادة إرسال الكود',

    // ═══ Home & Navigation ═══
    hello: 'مرحباً', location: 'الرصافة، بغداد', searchService: 'ابحث عن خدمة...',
    orderNow: 'اطلب توصيل الآن', deliverIn30: 'توصيل خلال 30 دقيقة', start: 'ابدأ',
    orderService: 'اطلب خدمة', food: 'توصيل طعام', grocery: 'بقالة', pharmacy: 'صيدلية', package: 'طرود',
    myRecentOrders: 'طلباتي الأخيرة', viewAll: 'عرض الكل', noOrders: 'لا توجد طلبات بعد', startFirstOrder: 'ابدأ أول طلب لك الآن',
    home: 'الرئيسية', myOrders: 'طلباتي', myAccount: 'حسابي',

    // ═══ New Order ═══
    newDelivery: 'طلب توصيل جديد', from: 'من', to: 'إلى',
    selectPickup: 'اضغط لتحديد موقع الانطلاق', selectDropoff: 'اضغط لتحديد مكان الوصول',
    packageType: 'نوع الطرد', normal: 'عادي', medicine: 'دواء', documents: 'وثائق',
    notes: 'ملاحظات (اختياري)', notesPlaceholder: 'أي ملاحظة للمندوب...',
    distance: 'المسافة', basePrice: 'الرسم الأساسي', pricePerKm: 'سعر الكيلو', total: 'الإجمالي', sendOrder: 'إرسال الطلب',

    // ═══ Order Success & Tracking ═══
    orderSent: 'تم إرسال طلبك', willContact: 'سيتم التواصل معك قريباً',
    orderNumber: 'رقم الطلب', price: 'السعر', trackOrder: 'تتبع الطلب', backHome: 'العودة للرئيسية',
    tracking: 'تتبع الطلب', arriving15: 'يصل خلال 15 دقيقة', driver: 'المندوب',
    orderConfirmed: 'تم التأكيد', orderConfirmedDesc: 'طلبك في النظام',
    driverAccepted: 'قبول المندوب', driverAcceptedDesc: 'في انتظار',
    onTheWay: 'في الطريق', onTheWayDesc: 'سيتم تحديث الحالة',
    delivered: 'تم التوصيل', deliveredDesc: 'شكراً لك',
    cancel: 'إلغاء', chat: 'دردشة', cancelOrderConfirm: 'هل تريد إلغاء الطلب؟',

    // ═══ Driver Identity & Chat ═══
    driverIdentity: 'هوية المندوب', callDriver: 'اتصال', whatsappDriver: 'واتساب', chatDriver: 'دردشة',
    driverVerified: 'موثق', driverPending: 'قيد التوثيق', driverPhoneUnavailable: 'رقم المندوب غير متوفر',
    markAsDelivered: 'تم التسليم', checkingLocation: 'جاري التحقق من موقعك...',
    tooFarFromCustomer: 'أنت بعيد عن العميل، اقترب للتسليم', gpsFailedConfirm: 'تعذّر تحديد موقعك. هل أنت متأكد من التسليم؟',
    deliverySuccess: 'تم التسليم بنجاح', metersAway: 'متر', youAreClose: 'أنت في نطاق التسليم',
    chatTitle: 'الدردشة', chatPlaceholder: 'اكتب رسالة...', typeMessage: 'اكتب رسالة...',
    online: 'متصل الآن', offline: 'غير متصل', typing: 'يكتب...', noMessages: 'لا توجد رسائل بعد', startChat: 'ابدأ المحادثة',
    today: 'اليوم', yesterday: 'أمس', chatComingSoon: 'الدردشة قريباً',

    // ═══ Orders List ═══
    all: 'الكل', active: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة',
    order: 'طلب', pending: 'قيد الانتظار', accepted: 'تم القبول', pickedUp: 'في الطريق', track: 'تتبع',

    // ═══ Profile & Settings ═══
    myProfile: 'حسابي', orders: 'طلب', balance: 'د.ع', rating: 'تقييم',
    addresses: 'العناوين', paymentMethods: 'طرق الدفع', settings: 'الإعدادات', help: 'المساعدة والدعم',
    logout: 'تسجيل الخروج', logoutConfirm: 'هل تريد تسجيل الخروج؟',
    theme: 'المظهر', light: 'فاتح', dark: 'داكن', auto: 'تلقائي', language: 'اللغة', currency: 'العملة',
    general: 'عام', aboutApp: 'عن التطبيق', about: 'حول', arabic: 'العربية', english: 'English',
    iraqiDinar: 'دينار عراقي', sound: 'الصوت', notifSound: 'صوت الإشعارات', orderSound: 'رنين الطلبات',
    defaultSound: 'افتراضي', tapToListen: 'اضغط للاستماع', noSound: 'بدون صوت',
    privacy: 'الخصوصية', privacyPolicy: 'سياسة الخصوصية', rateApp: 'قيّم التطبيق', shareApp: 'شارك التطبيق',

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

    // ═══ Contact & About ═══
    contactUs: 'تواصل معنا', contactIntro: 'نحن هنا لمساعدتك!', whatsapp: 'واتساب', email: 'البريد الإلكتروني',
    telegramChannel: 'القناة الرسمية', workingHours: 'ساعات العمل', workingHoursValue: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
    aboutUs: 'من نحن', aboutUsText: 'وصّلها هو تطبيق عراقي مبتكر يهدف إلى تسهيل الحياة اليومية من خلال توفير خدمة توصيل سريعة، آمنة، وبأسعار تنافسية. نحن نربط بين العملاء، المتاجر، والمندوبين في منصة واحدة ذكية.',
    features: 'لماذا تختار وصّلها؟', feature1: 'توصيل سريع خلال 30 دقيقة في بغداد.', feature2: 'مندوبين موثقين ومدربين على أعلى مستوى.', feature3: 'تتبع مباشر للطلب عبر الخريطة.', feature4: 'الدفع نقداً عند الاستلام (بدون تعقيدات).', feature5: 'أسعار تنافسية وشفافة.', serviceArea: 'منطقة الخدمة',
    serviceAreaText: '📍 نخدم حالياً الرصافة، بغداد. (نعمل على التوسع قريباً!)', developer: 'عن المطوّر',
    devName: 'حسن عدنان', devRole: 'مؤسس ومطوّر تطبيق وصّلها', madeInIraq: 'صُنع بكل حب وفخر في العراق 💜',

    // ═══ Legal (Terms & Privacy) ═══
    lastUpdate: 'آخر تحديث:',
    terms1Title: '1. قبول الشروط', terms1Text: 'باستخدامك لتطبيق وصّلها، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن استخدام التطبيق فوراً.',
    terms2Title: '2. الأهلية', terms2Text: 'يجب أن يكون عمرك 18 سنة على الأقل لاستخدام خدمات التوصيل. إذا كان عمرك أقل من ذلك، يجب استخدام التطبيق تحت إشراف ولي الأمر.',
    terms3Title: '3. الحساب والمسؤوليات', terms3_1: 'أنت مسؤول تماماً عن الحفاظ على سرية معلومات حسابك وكلمة المرور.', terms3_2: 'يجب أن تكون جميع البيانات المقدمة صحيحة وكاملة ومحدثة.', terms3_3: 'يُمنع منعاً باتاً إنشاء حسابات وهمية أو انتحال شخصية الآخرين.', terms3_4: 'يحق لنا إيقاف أو حذف أي حساب يخالف هذه الشروط دون إشعار مسبق.',
    terms4Title: '4. خدمات التوصيل', terms4_1: 'نوفر منصة تربط بين العملاء والمندوبين والمتاجر.', terms4_2: 'نضمن سلامة التوصيل من نقطة الانطلاق إلى نقطة الوصول.', terms4_3: 'يلتزم المندوب بالمواعيد المتفق عليها، وفي حال التأخير يجب إشعار العميل.', terms4_4: 'لسنا مسؤولين عن جودة أو سلامة المنتجات المباعة من المتاجر.',
    terms5Title: '5. الدفع والأسعار', terms5_1: 'الدفع يتم نقداً عند التسليم (Cash on Delivery) في الوقت الحالي.', terms5_2: 'الأسعار المعروضة واضحة قبل تأكيد الطلب وتشمل رسوم التوصيل.', terms5_3: 'لا توجد رسوم خفية أو مفاجئة.',
    terms6Title: '6. الإلغاء والاسترجاع', terms6_1: 'يمكن للعميل إلغاء الطلب مجاناً قبل قبول المندوب للطلب.', terms6_2: 'بعد قبول المندوب، قد تُطبق رسوم إلغاء لتغطية وقت وجهد المندوب.', terms6_3: 'إذا تأخر المندوب عن الوقت المتفق عليه بشكل مبالغ فيه، يحق للعميل الإلغاء دون رسوم.',
    terms7Title: '7. حدود المسؤولية', terms7_1: 'لسنا مسؤولين عن أي تأخير ناتج عن ظروف قاهرة (أمطار، إغلاقات طرق، إلخ).', terms7_2: 'المندوب هو المسؤول المباشر عن سلامة الطرد أثناء توصيله.',
    terms8Title: '8. التواصل والدعم', terms8Text: 'لأي استفسار أو شكوى، يمكنك التواصل معنا عبر:',
    terms9Title: '9. التعديلات', terms9Text: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بالتغييرات الجوهرية عبر التطبيق.',
    
    privacy1Title: '1. المعلومات التي نجمعها', privacy1_1: 'رقم الهاتف: نستخدمه للتحقق من حسابك والتواصل معك.', privacy1_2: 'الاسم: ليعرف المندوب لمن يوصل الطلب.', privacy1_3: 'العناوين: لحفظ مواقع الانطلاق والوصول.', privacy1_4: 'الموقع الجغرافي (GPS): لتحديد موقعك بدقة.', privacy1_5: 'معلومات المركبة (للمندوبين): لضمان سلامة المندوب.',
    privacy2Title: '2. كيف نستخدم معلوماتك', privacy2_1: 'توصيل الطلبات: لمشاركة العنوان مع المندوب.', privacy2_2: 'التواصل: لربط العميل بالمندوب.', privacy2_3: 'تحسين الخدمة: لتحليل الأداء.', privacy2_4: 'الأمان: لمنع الاحتيال.',
    privacy3Title: '3. حماية بياناتك (ما لا نفعله)', privacy3_1: 'لا نبيع بياناتك الشخصية لأي طرف ثالث.', privacy3_2: 'لا نشارك موقعك مع أي جهة غير المندوب.', privacy3_3: 'لا نستخدم بياناتك لأغراض إعلانية.',
    privacy4Title: '4. تخزين وحماية البيانات', privacy4_1: 'نستخدم تشفيراً قوياً (SSL) لحماية بياناتك.', privacy4_2: 'يتم تخزين البيانات على سيرفرات آمنة.', privacy4_3: 'لا نحتفظ بأي معلومات تتعلق ببطاقات الدفع.',
    privacy5Title: '5. صلاحيات التطبيق', privacy5_1: 'الموقع (Location): ضروري لعمل خدمات التوصيل.', privacy5_2: 'الكاميرا (Camera): (اختياري) لرفع صورة.', privacy5_3: 'الإشعارات (Notifications): لتنبيهك بحالة الطلب.',
    privacy6Title: '6. حقوقك', privacy6_1: 'طلب نسخة من بياناتك المحفوظة.', privacy6_2: 'حذف حسابك نهائياً ومسح بياناتك.', privacy6_3: 'تعديل معلوماتك الشخصية في أي وقت.',
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
    now: 'الآن', minsAgo: 'منذ', minsAgoSuffix: 'دقيقة', hoursAgoSuffix: 'ساعة',

    dir: 'rtl'
  },

  en: {
    // ═══ App ═══
    appName: 'Wassilha', tagline: 'Reliable Delivery Service', version: 'Version',
    splashReady: 'Ready to go',
    
    // ═══ Login & Auth ═══
    welcomeBack: 'Welcome back 👋', signIn: 'Sign In', phone: 'Phone Number',
    phonePlaceholder: '07XXXXXXXXX', continue: 'Continue', or: 'OR',
    createNewAccount: 'Create New Account', termsNote: 'By continuing you agree to the',
    terms: 'Terms & Conditions', noAccount: 'Have an account?', loginLink: 'Sign in',
    chooseAccountType: 'Choose Account Type', howUse: 'How do you want to use Wassilha?',
    customer: 'Customer', customerDesc: 'Request delivery anywhere',
    driver: 'Driver', driverDesc: 'Accept orders and earn',
    store: 'Store', storeDesc: 'Register your store and sell',
    registerTitle: 'Create Account', registerSubtitle: 'Complete your details to start',
    fullName: 'Full Name', vehicleType: 'Vehicle Type', selectVehicle: 'Select Vehicle Type',
    motorcycle: 'Motorcycle', bicycle: 'Bicycle', car: 'Car',
    password: 'Password', agreeTerms: 'I agree to the', createAccount: 'Create Account',
    verifyPhone: 'Verify Phone', otpSent: 'Enter the code sent to',
    verify: 'Verify', resendIn: 'Resend in', seconds: 'seconds', resend: 'Resend Code',

    // ═══ Home & Navigation ═══
    hello: 'Hello', location: 'Rusafa, Baghdad', searchService: 'Search for a service...',
    orderNow: 'Order Delivery Now', deliverIn30: 'Delivery within 30 minutes', start: 'Start',
    orderService: 'Order Service', food: 'Food Delivery', grocery: 'Grocery', pharmacy: 'Pharmacy', package: 'Packages',
    myRecentOrders: 'My Recent Orders', viewAll: 'View All', noOrders: 'No orders yet', startFirstOrder: 'Start your first order now',
    home: 'Home', myOrders: 'My Orders', myAccount: 'Account',

    // ═══ New Order ═══
    newDelivery: 'New Delivery', from: 'From', to: 'To',
    selectPickup: 'Tap to select pickup location', selectDropoff: 'Tap to select dropoff location',
    packageType: 'Package Type', normal: 'Normal', medicine: 'Medicine', documents: 'Documents',
    notes: 'Notes (Optional)', notesPlaceholder: 'Any note for the driver...',
    distance: 'Distance', basePrice: 'Base Price', pricePerKm: 'Price per KM', total: 'Total', sendOrder: 'Send Order',

    // ═══ Order Success & Tracking ═══
    orderSent: 'Order Sent', willContact: 'We will contact you soon',
    orderNumber: 'Order Number', price: 'Price', trackOrder: 'Track Order', backHome: 'Back to Home',
    tracking: 'Track Order', arriving15: 'Arriving in 15 minutes', driver: 'Driver',
    orderConfirmed: 'Confirmed', orderConfirmedDesc: 'Your order is in the system',
    driverAccepted: 'Driver Accepted', driverAcceptedDesc: 'Waiting',
    onTheWay: 'On the Way', onTheWayDesc: 'Status will be updated',
    delivered: 'Delivered', deliveredDesc: 'Thank you',
    cancel: 'Cancel', chat: 'Chat', cancelOrderConfirm: 'Cancel this order?',

    // ═══ Driver Identity & Chat ═══
    driverIdentity: 'Driver Identity', callDriver: 'Call', whatsappDriver: 'WhatsApp', chatDriver: 'Chat',
    driverVerified: 'Verified', driverPending: 'Pending', driverPhoneUnavailable: 'Driver phone unavailable',
    markAsDelivered: 'Mark as Delivered', checkingLocation: 'Checking your location...',
    tooFarFromCustomer: 'You are too far from the customer', gpsFailedConfirm: 'Could not detect location. Are you sure?',
    deliverySuccess: 'Delivered successfully', metersAway: 'meters', youAreClose: 'You are in delivery range',
    chatTitle: 'Chat', chatPlaceholder: 'Type a message...', typeMessage: 'Type a message...',
    online: 'Online now', offline: 'Offline', typing: 'typing...', noMessages: 'No messages yet', startChat: 'Start chat',
    today: 'Today', yesterday: 'Yesterday', chatComingSoon: 'Chat coming soon',

    // ═══ Orders List ═══
    all: 'All', active: 'Active', completed: 'Completed', cancelled: 'Cancelled',
    order: 'Order', pending: 'Pending', accepted: 'Accepted', pickedUp: 'On the way', track: 'Track',

    // ═══ Profile & Settings ═══
    myProfile: 'My Account', orders: 'Orders', balance: 'IQD', rating: 'Rating',
    addresses: 'Addresses', paymentMethods: 'Payment Methods', settings: 'Settings', help: 'Help & Support',
    logout: 'Logout', logoutConfirm: 'Do you want to logout?',
    theme: 'Theme', light: 'Light', dark: 'Dark', auto: 'Auto', language: 'Language', currency: 'Currency',
    general: 'General', aboutApp: 'About App', about: 'About', arabic: 'العربية', english: 'English',
    iraqiDinar: 'Iraqi Dinar', sound: 'Sound', notifSound: 'Notification Sound', orderSound: 'Order Ringtone',
    defaultSound: 'Default', tapToListen: 'Tap to listen', noSound: 'No sound',
    privacy: 'Privacy', privacyPolicy: 'Privacy Policy', rateApp: 'Rate App', shareApp: 'Share App',

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

    // ═══ Contact & About ═══
    contactUs: 'Contact Us', contactIntro: 'We are here to help!', whatsapp: 'WhatsApp', email: 'Email',
    telegramChannel: 'Official Channel', workingHours: 'Working Hours', workingHoursValue: 'Sat - Thu: 9 AM - 9 PM',
    aboutUs: 'About Us', aboutUsText: 'Wassilha is an innovative Iraqi app aimed at facilitating daily life by providing fast, safe, and competitively priced delivery services. We connect customers, stores, and drivers on one smart platform.',
    features: 'Why choose Wassilha?', feature1: 'Fast delivery within 30 minutes in Baghdad.', feature2: 'Verified and highly trained drivers.', feature3: 'Live order tracking on the map.', feature4: 'Cash on delivery (no complications).', feature5: 'Competitive and transparent prices.', serviceArea: 'Service Area',
    serviceAreaText: '📍 Currently serving Rusafa, Baghdad. (Expanding soon!)', developer: 'Developer',
    devName: 'Hasan Adnan', devRole: 'Founder & Developer of Wassilha', madeInIraq: 'Made with love and pride in Iraq 💜',

    // ═══ Legal (Terms & Privacy) ═══
    lastUpdate: 'Last updated:',
    terms1Title: '1. Acceptance of Terms', terms1Text: 'By using the Wassilha app, you agree to comply with these terms and conditions. If you do not agree to any part of them, please stop using the app immediately.',
    terms2Title: '2. Eligibility', terms2Text: 'You must be at least 18 years old to use delivery services. If you are younger, the app must be used under parental supervision.',
    terms3Title: '3. Account & Responsibilities', terms3_1: 'You are fully responsible for maintaining the confidentiality of your account information and password.', terms3_2: 'All provided data must be accurate, complete, and up-to-date.', terms3_3: 'Creating fake accounts or impersonating others is strictly prohibited.', terms3_4: 'We reserve the right to suspend or delete any violating account without prior notice.',
    terms4Title: '4. Delivery Services', terms4_1: 'We provide a platform connecting customers, drivers, and stores.', terms4_2: 'We ensure delivery safety from the pickup point to the destination.', terms4_3: 'The driver is committed to agreed times, and in case of delay, the customer must be notified.', terms4_4: 'We are not responsible for the quality or safety of products sold by stores.',
    terms5Title: '5. Payment & Pricing', terms5_1: 'Payment is currently cash on delivery.', terms5_2: 'Displayed prices are clear before order confirmation and include delivery fees.', terms5_3: 'There are no hidden or surprise fees.',
    terms6Title: '6. Cancellation & Returns', terms6_1: 'The customer can cancel the order for free before the driver accepts it.', terms6_2: 'After driver acceptance, cancellation fees may apply to cover the driver\'s time and effort.', terms6_3: 'If the driver is significantly delayed, the customer has the right to cancel without fees.',
    terms7Title: '7. Limitation of Liability', terms7_1: 'We are not responsible for any delays caused by force majeure (rain, road closures, etc.).', terms7_2: 'The driver is directly responsible for the safety of the package during delivery.',
    terms8Title: '8. Contact & Support', terms8Text: 'For any inquiries or complaints, you can contact us via:',
    terms9Title: '9. Modifications', terms9Text: 'We reserve the right to modify these terms at any time. You will be notified of material changes via the app.',
    
    privacy1Title: '1. Information We Collect', privacy1_1: '📱 Phone Number: Used to verify your account and contact you about your orders.', privacy1_2: '👤 Name: So the driver knows who to deliver to.', privacy1_3: '📍 Addresses: To save pickup and dropoff locations for future orders.', privacy1_4: '🗺️ GPS Location: To accurately determine your location when ordering and track the driver.', privacy1_5: '🚗 Vehicle Info (for drivers): To ensure driver safety and eligibility.',
    privacy2Title: '2. How We Use Your Info', privacy2_1: 'Delivering orders: To share the address only with the relevant driver.', privacy2_2: 'Communication: To connect the customer with the driver via call or chat.', privacy2_3: 'Service Improvement: To analyze performance and develop the app.', privacy2_4: 'Security: To prevent fraud and protect users.',
    privacy3Title: '3. Protecting Your Data (What We Don\'t Do)', privacy3_1: '❌ We do not sell your personal data to any third party.', privacy3_2: '❌ We do not share your location with anyone other than the driver responsible for your order.', privacy3_3: '❌ We do not use your data for unauthorized advertising purposes.',
    privacy4Title: '4. Data Storage & Protection', privacy4_1: '🔐 We use strong encryption (SSL) to protect your data during transmission.', privacy4_2: '🛡️ Data is stored on secure servers (Supabase).', privacy4_3: '🚫 We do not retain any payment card information (currently cash payment).',
    privacy5Title: '5. App Permissions', privacy5_1: '📍 Location: Essential for delivery services and locating you on the map.', privacy5_2: '📷 Camera: (Optional) To upload a prescription or package photo.', privacy5_3: '🔔 Notifications: To alert you of order status and chat messages.',
    privacy6Title: '6. Your Rights', privacy6_1: 'Request a copy of your data stored with us.', privacy6_2: 'Permanently delete your account and erase your data (cannot be undone).', privacy6_3: 'Edit your personal information at any time from settings.',
    privacy7Title: '7. Contact',

    // ═══ Toasts & Messages ═══
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
    now: 'Now', minsAgo: '', minsAgoSuffix: 'min ago', hoursAgoSuffix: 'hr ago',

    dir: 'ltr'
  }
};

window.TRANSLATIONS = TRANSLATIONS;
console.log('🌐 Translations loaded: AR + EN —', Object.keys(TRANSLATIONS.ar).length, 'keys');
