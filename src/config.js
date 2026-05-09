/* ===========================
   IRONFIT — CONFIGURATION MODULE
   Centralizes all sensitive configuration
   =========================== */

// ===========================
// ENVIRONMENT DETECTION
// ===========================
const ENV = {
  isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  isProd: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : window.location.origin
};

// ===========================
// SUPABASE CONFIGURATION
// Load from window.__IRONFIT_CONFIG__ (injected by build process)
// Or from meta tags as fallback
// ===========================
function getSupabaseConfig() {
  // Priority 1: Window config (best practice for security)
  if (window.__IRONFIT_CONFIG__?.supabase) {
    return window.__IRONFIT_CONFIG__.supabase;
  }

  // Priority 2: Meta tags
  const urlMeta = document.querySelector('meta[name="supabase-url"]');
  const keyMeta = document.querySelector('meta[name="supabase-key"]');
  
  if (urlMeta?.content && keyMeta?.content) {
    return {
      url: urlMeta.content,
      key: keyMeta.content
    };
  }

  // Priority 3: Default (will fail with clear error)
  console.warn('⚠️ Supabase config not found. Ensure environment variables are set.');
  return {
    url: '',
    key: ''
  };
}

const SUPABASE_CONFIG = getSupabaseConfig();

// ===========================
// VALIDATION & SANITIZATION
// ===========================
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}

function validateName(name) {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s'-]+$/.test(name);
}

// ===========================
// CSRF PROTECTION
// ===========================
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

// ===========================
// API HEADERS BUILDER
// ===========================
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCSRFToken()
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// ===========================
// EXPORTS
// ===========================
window.IronFitConfig = {
  ENV,
  SUPABASE_CONFIG,
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateName,
  getCSRFToken,
  getAuthHeaders
};
