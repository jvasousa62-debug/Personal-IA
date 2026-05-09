/* ===========================
   IRONFIT — MAIN INIT v1
   Entry point: Initializes all modules on DOMContentLoaded
   =========================== */

// ===========================
// SUPABASE SETUP
// ===========================
let supabaseClient = null;

function initSupabase() {
  if (!window.IronFitConfig?.SUPABASE_CONFIG) {
    console.error('❌ IronFit config not loaded. Ensure config.js is included before main.js');
    return false;
  }

  const { url, key } = window.IronFitConfig.SUPABASE_CONFIG;

  if (!url || !key) {
    console.error('❌ Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return false;
  }

  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase client library not loaded. Include @supabase/supabase-js before main.js');
    return false;
  }

  try {
    supabaseClient = window.supabase.createClient(url, key);
    window.supabaseClient = supabaseClient;
    console.log('✅ Supabase configurado com sucesso');
    return true;
  } catch (e) {
    console.error('❌ Erro ao inicializar Supabase:', e.message);
    return false;
  }
}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}

// ===========================
// APP INITIALIZATION
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  // Remove splash instantaneamente
  const splash = document.getElementById('splash');
  if (splash) splash.style.display = 'none';

  const app = document.getElementById('app');
  if (app) app.classList.remove('hidden');

  try {
    // ✅ INICIALIZAR GIF SERVICE (Cache de animações)
    if (typeof GIFService !== 'undefined' && GIFService.init) {
      GIFService.init();
      console.log('✅ GIFService inicializado');
    }

    setupNavigation();
    setupChat();
    setupPlans();
    setupExercises();
    setupBuilder();
    setupProgress();
    loadUserData();
  } catch (e) {
    console.error('Erro ao iniciar app:', e);
  }
});
