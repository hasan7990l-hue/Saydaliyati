// ============================================
// 🔥 SUPABASE.JS — Database Connection
// ============================================

const _sbScript = document.createElement('script');
_sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
_sbScript.onload = () => {
  window.supabase = window.supabase.createClient(
    CONFIG.SUPABASE.url,
    CONFIG.SUPABASE.key
  );
  console.log('✅ Supabase Connected');
  window.dispatchEvent(new Event('supabase-ready'));
};
document.head.appendChild(_sbScript);

// ═══ Test ═══
async function testSupabaseConnection() {
  try {
    const { data, error } = await window.supabase
      .from('users')
      .select('count')
      .limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Supabase:', error);
    return false;
  }
}

// ═══ Users ═══
async function createUser(userData) {
  try {
    const { data, error } = await window.supabase
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
    return { success: false, error: error.message };
  }
}

async function getUserByPhone(phone) {
  try {
    const { data, error } = await window.supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserById(userId) {
  try {
    const { data, error } = await window.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateUser(userId, updates) {
  try {
    const { data, error } = await window.supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ OTP ═══
async function sendOTP(phone) {
  try {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await window.supabase.from('otp_codes').delete().eq('phone', phone);
    const { error } = await window.supabase
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
    return { success: false, error: error.message };
  }
}

async function verifyOTP(phone, code) {
  try {
    const { data, error } = await window.supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (error || !data) {
      return { success: false, error: 'Invalid or expired code' };
    }
    await window.supabase.from('otp_codes').update({ used: true }).eq('id', data.id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ Orders ═══
async function createOrder(orderData) {
  try {
    const { data, error } = await window.supabase
      .from('orders')
      .insert([{
        customer_id: orderData.customerId,
        pickup_address: orderData.pickupAddress,
        pickup_lat: orderData.pickupLat,
        pickup_lng: orderData.pickupLng,
        dropoff_address: orderData.dropoffAddress,
        dropoff_lat: orderData.dropoffLat,
        dropoff_lng: orderData.dropoffLng,
        package_type: orderData.packageType || 'normal',
        package_description: orderData.description,
        notes: orderData.notes,
        distance_km: orderData.distance,
        base_price: orderData.basePrice,
        total_price: orderData.totalPrice,
        driver_share: orderData.driverShare,
        platform_share: orderData.platformShare,
        status: 'pending'
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserOrders(userId) {
  try {
    const { data, error } = await window.supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, orders: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAvailableOrders() {
  try {
    const { data, error } = await window.supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return { success: true, orders: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function acceptOrder(orderId, driverId) {
  try {
    const { data, error } = await window.supabase
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
    return { success: false, error: error.message };
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const updates = { status: status };
    if (status === 'picked_up') updates.picked_up_at = new Date().toISOString();
    else if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    const { data, error } = await window.supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ Drivers ═══
async function createDriverProfile(userId, vehicleType) {
  try {
    const { data, error } = await window.supabase
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
    return { success: false, error: error.message };
  }
}

async function updateDriverStatus(userId, isOnline, lat, lng) {
  try {
    const { data, error } = await window.supabase
      .from('drivers')
      .update({
        is_online: isOnline,
        current_lat: lat,
        current_lng: lng,
        last_seen: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, driver: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ Notifications ═══
async function createNotification(userId, title, message, type) {
  try {
    const { data, error } = await window.supabase
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
    return { success: true, notification: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserNotifications(userId) {
  try {
    const { data, error } = await window.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return { success: true, notifications: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ Wallet ═══
async function getWallet(userId) {
  try {
    const { data, error } = await window.supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await window.supabase
        .from('wallets')
        .insert([{ user_id: userId, balance: 0, total_earned: 0 }])
        .select()
        .single();
      if (createError) throw createError;
      return { success: true, wallet: newWallet };
    }
    if (error) throw error;
    return { success: true, wallet: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══ Export ═══
window.DB = {
  testSupabaseConnection,
  createUser,
  getUserByPhone,
  getUserById,
  updateUser,
  sendOTP,
  verifyOTP,
  createOrder,
  getUserOrders,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  createDriverProfile,
  updateDriverStatus,
  createNotification,
  getUserNotifications,
  getWallet
};

console.log('🔥 Supabase.js loaded');
