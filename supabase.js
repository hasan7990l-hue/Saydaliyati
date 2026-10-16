// ============================================
// 🔥 SUPABASE.JS — Wassilha Database v2
// نظام قاعدة البيانات الكامل
// ============================================

console.log('🔥 Supabase.js loading...');

// ═══════════════════════════════════════
// 📦 تحميل مكتبة Supabase
// ═══════════════════════════════════════
let _sbClient = null;
let _sbReady = false;
const _sbReadyCallbacks = [];

const _sbScript = document.createElement('script');
_sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
_sbScript.onload = () => {
  try {
    _sbClient = window.supabase.createClient(
      CONFIG.SUPABASE.url,
      CONFIG.SUPABASE.key
    );
    window.sb = _sbClient;
    _sbReady = true;
    console.log('✅ Supabase Connected');

    // تنفيذ كل الـ callbacks المنتظرة
    _sbReadyCallbacks.forEach(cb => cb());
    _sbReadyCallbacks.length = 0;

    window.dispatchEvent(new Event('supabase-ready'));
  } catch (e) {
    console.error('❌ Supabase init failed:', e);
  }
};
document.head.appendChild(_sbScript);

// ═══════════════════════════════════════
// ⏳ انتظار جاهزية الاتصال
// ═══════════════════════════════════════
function waitForSb() {
  return new Promise((resolve) => {
    if (_sbReady && _sbClient) {
      resolve(_sbClient);
    } else {
      _sbReadyCallbacks.push(() => resolve(_sbClient));
    }
  });
}

// ═══════════════════════════════════════
// 🔌 اختبار الاتصال
// ═══════════════════════════════════════
async function testSupabaseConnection() {
  try {
    const sb = await waitForSb();
    const { error } = await sb.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// ═══════════════════════════════════════
// 👥 USERS — المستخدمون
// ═══════════════════════════════════════

async function createUser(userData) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('users')
      .insert([{
        phone: userData.phone,
        name: userData.name,
        role: userData.role || 'customer',
        email: userData.email || null,
        avatar: userData.avatar || null
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('createUser error:', error);
    return { success: false, error: error.message };
  }
}

async function getUserByPhone(phone) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('getUserByPhone error:', error);
    return { success: false, error: error.message };
  }
}

async function getUserById(userId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('getUserById error:', error);
    return { success: false, error: error.message };
  }
}

async function updateUser(userId, updates) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('updateUser error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════
// 🔢 OTP — التحقق من الهاتف
// ═══════════════════════════════════════

async function sendOTP(phone) {
  try {
    const sb = await waitForSb();
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // احذف الأكواد القديمة
    await sb.from('otp_codes').delete().eq('phone', phone);

    // أضف الكود الجديد
    const { error } = await sb
      .from('otp_codes')
      .insert([{
        phone: phone,
        code: code,
        expires_at: new Date(Date.now() + CONFIG.TIMERS.otpExpiry).toISOString()
      }]);

    if (error) throw error;

    console.log('📱 OTP:', code, '→', phone);
    return { success: true, code: code };
  } catch (error) {
    console.error('sendOTP error:', error);
    return { success: false, error: error.message };
  }
}

async function verifyOTP(phone, code) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Invalid or expired code' };
    }

    await sb.from('otp_codes').update({ used: true }).eq('id', data.id);
    return { success: true };
  } catch (error) {
    console.error('verifyOTP error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════
// 💰 WALLETS — المحافظ
// ═══════════════════════════════════════

async function getWallet(userId) {
  try {
    const sb = await waitForSb();

    // حاول جلب المحفظة
    const { data, error } = await sb
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // إذا وُجدت — أرجعها
    if (data) return { success: true, wallet: data };

    // إذا لم تُوجد — أنشئ واحدة جديدة
    const { data: newWallet, error: createError } = await sb
      .from('wallets')
      .insert([{ user_id: userId, balance: 0, total_earned: 0 }])
      .select()
      .single();

    if (createError) throw createError;
    return { success: true, wallet: newWallet };
  } catch (error) {
    console.error('getWallet error:', error);
    return { success: false, error: error.message };
  }
}

async function updateWallet(userId, amount, type = 'add') {
  try {
    const sb = await waitForSb();

    const walletResult = await getWallet(userId);
    if (!walletResult.success) throw new Error('Wallet not found');

    const current = walletResult.wallet.balance || 0;
    const newBalance = type === 'add' ? current + amount : current - amount;

    const { data, error } = await sb
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, wallet: data };
  } catch (error) {
    console.error('updateWallet error:', error);
    return { success: false, error: error.message };
  }
}
// ═══════════════════════════════════════
// 📦 ORDERS — الطلبات
// ═══════════════════════════════════════

async function createOrder(orderData) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .insert([{
        customer_id: orderData.customerId,
        pickup_address: orderData.pickupAddress,
        pickup_lat: orderData.pickupLat || null,
        pickup_lng: orderData.pickupLng || null,
        dropoff_address: orderData.dropoffAddress,
        dropoff_lat: orderData.dropoffLat || null,
        dropoff_lng: orderData.dropoffLng || null,
        package_type: orderData.packageType || 'normal',
        package_description: orderData.description || null,
        notes: orderData.notes || null,
        distance_km: orderData.distance || null,
        base_price: orderData.basePrice || 0,
        total_price: orderData.totalPrice || 0,
        driver_share: orderData.driverShare || 0,
        platform_share: orderData.platformShare || 0,
        status: 'pending'
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    console.error('createOrder error:', error);
    return { success: false, error: error.message };
  }
}

async function getUserOrders(userId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('getUserOrders error:', error);
    return { success: false, error: error.message, orders: [] };
  }
}

async function getOrderById(orderId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    console.error('getOrderById error:', error);
    return { success: false, error: error.message };
  }
}

async function getAvailableOrders() {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('getAvailableOrders error:', error);
    return { success: false, error: error.message, orders: [] };
  }
}

async function getDriverOrders(driverId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('driver_id', driverId)
      .in('status', ['accepted', 'picked_up'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('getDriverOrders error:', error);
    return { success: false, error: error.message, orders: [] };
  }
}

async function acceptOrder(orderId, driverId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('orders')
      .update({
        driver_id: driverId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    console.error('acceptOrder error:', error);
    return { success: false, error: error.message };
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const sb = await waitForSb();
    const updates = { status };

    if (status === 'picked_up') updates.picked_up_at = new Date().toISOString();
    else if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    else if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

    const { data, error } = await sb
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════
// 🛵 DRIVERS — المندوبون
// ═══════════════════════════════════════

async function createDriverProfile(userId, vehicleType) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('drivers')
      .insert([{
        user_id: userId,
        vehicle_type: vehicleType || 'motorcycle',
        is_online: false,
        is_verified: false
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, driver: data };
  } catch (error) {
    console.error('createDriverProfile error:', error);
    return { success: false, error: error.message };
  }
}

async function getDriverProfile(userId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, driver: data };
  } catch (error) {
    console.error('getDriverProfile error:', error);
    return { success: false, error: error.message };
  }
}

async function updateDriverStatus(userId, isOnline, lat, lng) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('drivers')
      .update({
        is_online: isOnline,
        current_lat: lat || null,
        current_lng: lng || null,
        last_seen: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, driver: data };
  } catch (error) {
    console.error('updateDriverStatus error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════
// 🏪 STORES — المتاجر
// ═══════════════════════════════════════

async function createStoreProfile(userId, storeData) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('stores')
      .insert([{
        user_id: userId,
        store_name: storeData.name || storeData.store_name,
        phone: storeData.phone || null,
        address: storeData.address || null,
        category: storeData.category || 'general'
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, store: data };
  } catch (error) {
    console.error('createStoreProfile error:', error);
    return { success: false, error: error.message };
  }
}

async function getStoreProfile(userId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, store: data };
  } catch (error) {
    console.error('getStoreProfile error:', error);
    return { success: false, error: error.message };
  }
}

async function getAllStores() {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return { success: true, stores: data || [] };
  } catch (error) {
    console.error('getAllStores error:', error);
    return { success: false, error: error.message, stores: [] };
  }
}

// ═══════════════════════════════════════
// 🔔 NOTIFICATIONS — الإشعارات
// ═══════════════════════════════════════

async function createNotification(userId, title, message, type) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('notifications')
      .insert([{
        user_id: userId,
        title: title,
        message: message,
        type: type || 'general'
      }])
      .select()
      .single();
    if (error) throw error;

    // تشغيل نغمة الإشعار
    if (typeof playNotificationSound === 'function') {
      playNotificationSound();
    }

    return { success: true, notification: data };
  } catch (error) {
    console.error('createNotification error:', error);
    return { success: false, error: error.message };
  }
}

async function getUserNotifications(userId) {
  try {
    const sb = await waitForSb();
    const { data, error } = await sb
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return { success: true, notifications: data || [] };
  } catch (error) {
    console.error('getUserNotifications error:', error);
    return { success: false, error: error.message, notifications: [] };
  }
}

async function markNotificationRead(notificationId) {
  try {
    const sb = await waitForSb();
    const { error } = await sb
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════
// 🌐 EXPORTS — كل الدوال
// ═══════════════════════════════════════
window.DB = {
  // Connection
  testSupabaseConnection,
  waitForSb,

  // Users
  createUser,
  getUserByPhone,
  getUserById,
  updateUser,

  // OTP
  sendOTP,
  verifyOTP,

  // Wallet
  getWallet,
  updateWallet,

  // Orders
  createOrder,
  getUserOrders,
  getOrderById,
  getAvailableOrders,
  getDriverOrders,
  acceptOrder,
  updateOrderStatus,

  // Drivers
  createDriverProfile,
  getDriverProfile,
  updateDriverStatus,

  // Stores
  createStoreProfile,
  getStoreProfile,
  getAllStores,

  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationRead
};

console.log('🔥 Supabase.js loaded —', Object.keys(window.DB).length, 'functions');
