// ---------- Supabase Configuration ----------
// Reemplaza estos valores con los de tu proyecto en https://supabase.com/dashboard
const SUPABASE_URL = 'https://lqohuqedsylthwpnufvt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UhSEeUKq6ANkGqlDZ0e46g_HN8hymto';

// Cargar el SDK de Supabase desde CDN
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.warn('Supabase SDK not loaded. Add the script tag to your HTML.');
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// ---------- Auth Helpers ----------
async function signUp(email, password, fullName) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signInWithGoogle(redirectTo) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const dest = redirectTo || localStorage.getItem('mp_auth_redirect') || (window.location.origin + '/profile.html');
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: dest }
  });
  if (error) throw error;
  return data;
}

function getAuthRedirect() {
  return localStorage.getItem('mp_auth_redirect') || (window.location.origin + '/profile.html');
}

function setAuthRedirect(url) {
  if (url && !url.includes('login.html')) {
    localStorage.setItem('mp_auth_redirect', url);
  }
}

function clearAuthRedirect() {
  localStorage.removeItem('mp_auth_redirect');
}

async function signOut() {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

async function getCurrentUser() {
  const sb = initSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getSession() {
  const sb = initSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

// ---------- Subscription Helpers ----------
async function getUserProfile(userId) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

async function getUserSubscription(userId) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function getPlans() {
  const sb = initSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('plans')
    .select('*')
    .eq('active', true)
    .order('price_monthly', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ---------- Auth State Listener ----------
function onAuthStateChange(callback) {
  const sb = initSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ---------- UI Helpers ----------
function updateAuthUI(user) {
  const authButtons = document.querySelectorAll('.auth-btn');
  const userMenus = document.querySelectorAll('.user-menu');
  const premiumBadges = document.querySelectorAll('.premium-badge');

  if (user) {
    authButtons.forEach(btn => btn.style.display = 'none');
    userMenus.forEach(menu => {
      menu.style.display = 'flex';
      const nameEl = menu.querySelector('.user-name');
      if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email;
    });
  } else {
    authButtons.forEach(btn => btn.style.display = 'flex');
    userMenus.forEach(menu => menu.style.display = 'none');
  }
}

// Export for use in other scripts
window.MarketPulseAuth = {
  initSupabase,
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getSession,
  getUserProfile,
  getUserSubscription,
  getPlans,
  onAuthStateChange,
  updateAuthUI,
  getAuthRedirect,
  setAuthRedirect,
  clearAuthRedirect,
};