// ===========================
// LOGIN MODULE
// Handles authentication for login.html, register.html, profile.html, preferencias.html
// ===========================

let supabaseClient = null;

// Initialize Supabase from config
function initSupabase() {
    if (!window.IronFitConfig?.SUPABASE_CONFIG) {
        console.warn('IronFit config not loaded. Auth will run in local/offline mode.');
        return null;
    }

    const { url, key } = window.IronFitConfig.SUPABASE_CONFIG;

    if (!url || !key) {
        console.warn('Supabase credentials not configured. Auth will run in local/offline mode.');
        return null;
    }

    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase client library not loaded. Auth will run in local/offline mode.');
        return null;
    }

    try {
        supabaseClient = window.supabase.createClient(url, key);
        window.supabaseClient = supabaseClient;
        console.log('✅ Supabase inicializado');
        return supabaseClient;
    } catch (e) {
        console.warn('Erro ao inicializar Supabase:', e.message);
        return null;
    }
}

// Call on script load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

// ===========================
// LOGIN FORM
// ===========================
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validação
    if (!email || !password) {
        showError('email', 'Preencha email e senha');
        return;
    }

    // Validar formato de email
    if (!window.IronFitConfig?.validateEmail(email)) {
        showError('email', 'Email inválido');
        return;
    }

    // Sanitizar
    const sanitizedEmail = window.IronFitConfig?.sanitizeInput(email);

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: sanitizedEmail,
            password: password // Password não é sanitizado (pode conter caracteres especiais)
        });

        if (error) throw error;

        if (data.user) {
            // Armazenar dados do usuário no localStorage
            localStorage.setItem('ironfit_userEmail', data.user.email || '');
            localStorage.setItem('ironfit_userId', data.user.id || '');
            localStorage.setItem('ironfit_loggedIn', 'true');
            if (data.user.user_metadata?.full_name) {
                localStorage.setItem('ironfit_fullName', data.user.user_metadata.full_name);
            }
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);
            clearErrors();

            const { data: profile, error: profileError } = await supabaseClient
                .from('user_profiles')
                .select('role,account_status')
                .eq('user_id', data.user.id)
                .maybeSingle();

            const isAdmin = !profileError && profile?.role === 'admin' && profile?.account_status === 'active';
            const isAcademyOwner = !profileError && profile?.role === 'academy_owner' && profile?.account_status === 'active';

            if (isAdmin) {
                localStorage.setItem('ironfit_userRole', 'admin');
                window.location.href = 'admin/';
            } else if (isAcademyOwner) {
                localStorage.setItem('ironfit_userRole', 'academy_owner');
                window.location.href = 'academy/';
            } else {
                localStorage.removeItem('ironfit_userRole');
                window.location.href = 'app-main.html';
            }
        }
    } catch (err) {
        showError('email', 'Erro no login: ' + (err.message || 'Tente novamente'));
        console.error(err);
    }
}

// ===========================
// REGISTER FORM
// ===========================
async function register() {
    const fullname = document.getElementById('fullname')?.value.trim() || '';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const academyName = document.getElementById('academyName')?.value.trim() || '';
    const academyCode = document.getElementById('academyCode')?.value.trim().toUpperCase() || '';

    // Validações
    let hasError = false;
    
    if (!fullname || fullname.length < 3) {
        showError('fullnameError', 'Nome deve ter no mínimo 3 caracteres');
        hasError = true;
    }

    if (!email || !window.IronFitConfig?.validateEmail(email)) {
        showError('emailError', 'Email inválido');
        hasError = true;
    }

    if (!academyName || academyName.length < 2) {
        showError('academyNameError', 'Nome da academia é obrigatório (mínimo 2 caracteres)');
        hasError = true;
    }

    if (!academyCode || academyCode.length < 3) {
        showError('academyCodeError', 'Código da academia é obrigatório (mínimo 3 caracteres)');
        hasError = true;
    }

    if (!password || !window.IronFitConfig?.validatePassword(password)) {
        showError('passwordError', 'Senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número');
        hasError = true;
    }

    if (confirmPassword && password !== confirmPassword) {
        showError('confirmPasswordError', 'As senhas não conferem');
        hasError = true;
    }

    if (hasError) return;

    try {
        // Sanitizar
        const sanitizedEmail = window.IronFitConfig?.sanitizeInput(email);
        const sanitizedName = window.IronFitConfig?.sanitizeInput(fullname);
        const sanitizedAcademyName = window.IronFitConfig?.sanitizeInput(academyName);

        // O trigger app_private.handle_new_user valida academy_code e vincula
        // o perfil sem expor a tabela academies para usuarios anonimos.
        const { data, error: signupError } = await supabaseClient.auth.signUp({
            email: sanitizedEmail,
            password: password,
            options: {
                data: {
                    full_name: sanitizedName,
                    academy_name: sanitizedAcademyName,
                    academy_code: academyCode
                }
            }
        });

        if (signupError) throw signupError;

        if (data.user) {
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', sanitizedName);
            
            clearErrors();
            
            // Mostrar modal de confirmação de email e redirecionar
            showEmailConfirmation(sanitizedEmail);
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    } catch (err) {
        const message = err?.message || '';
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('academia') || lowerMessage.includes('academy')) {
            showError('academyCodeError', message);
        } else if (lowerMessage.includes('database error saving new user')) {
            showError('academyCodeError', 'Nao foi possivel validar o codigo da academia. Verifique o codigo ou fale com o responsavel.');
        } else {
            showError('academyCodeError', 'Erro no cadastro: ' + (message || 'Tente novamente'));
        }
        console.error('Register error:', err);
    }
}

function showEmailConfirmation(email) {
    const modal = document.getElementById('emailConfirmationModal');
    if (modal) {
        document.getElementById('confirmationEmail').textContent = email;
        modal.classList.add('show');
    }
}

function goToLogin() {
    window.location.href = 'login.html';
}

async function resendConfirmationEmail() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        alert('Email não encontrado. Faça login novamente.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) throw error;
        alert('Email de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch (err) {
        alert('Erro ao reenviar email: ' + (err.message || 'Tente novamente'));
        console.error('Resend error:', err);
    }
}

// ===========================
// ERROR HANDLING UI
// ===========================
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = field?.parentElement?.querySelector('.error-message');
    
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
    
    if (field) {
        field.classList.add('error');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));
}

async function getPostLoginDestination(user) {
    if (!supabaseClient?.from || !user?.id) return 'index.html';

    const { data: profile, error } = await supabaseClient
        .from('user_profiles')
        .select('role,account_status')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.warn('Nao foi possivel consultar perfil de acesso:', error.message);
        return 'index.html';
    }

    if (profile?.account_status === 'blocked' || profile?.account_status === 'deleted') {
        await supabaseClient.auth.signOut();
        throw new Error(profile.account_status === 'blocked'
            ? 'Sua conta esta bloqueada. Fale com o administrador.'
            : 'Sua conta foi removida do app. Fale com o administrador.');
    }

    localStorage.setItem('ironfit_userRole', profile?.role || 'member');
    if (profile?.account_status === 'active' && profile?.role === 'admin') return 'admin/';
    if (profile?.account_status === 'active' && profile?.role === 'academy_owner') return 'academy/';

    try {
        const { data: academies } = await supabaseClient
            .from('academies')
            .select('id')
            .eq('owner_user_id', user.id)
            .limit(1);
        if (academies?.length) return 'academy/';
    } catch (ownerError) {
        console.warn('Nao foi possivel verificar academia vinculada:', ownerError?.message || ownerError);
    }

    return 'index.html';
}

// ===========================
// LOGOUT
// ===========================
async function logout() {
    try {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Erro ao fazer logout:', err);
    }
}

async function saveUserPreferences(preferences) {
    if (!supabaseClient?.auth || !supabaseClient?.from) {
        throw new Error('Supabase indisponivel');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        throw new Error('Usuario nao autenticado');
    }

    const payload = {
        user_id: user.id,
        preferences,
        ai_personality: preferences?.ai_personality || preferences?.aiStyle || null,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
        .from('user_preferences')
        .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;
}

async function loadUserPreferences() {
    if (!supabaseClient?.auth || !supabaseClient?.from) return null;

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabaseClient
        .from('user_preferences')
        .select('preferences, ai_personality')
        .eq('user_id', user.id)
        .single();

    if (error) return null;
    return data?.preferences || null;
}

window.saveUserPreferences = saveUserPreferences;
window.loadUserPreferences = loadUserPreferences;

// ===========================
// CHECK IF LOGGED IN
// ===========================
async function checkIfLoggedIn() {
    if (!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (data && data.user) {
            const { data: profile, error: profileError } = await supabaseClient
                .from('user_profiles')
                .select('role,account_status')
                .eq('user_id', data.user.id)
                .maybeSingle();

            const isAdmin = !profileError && profile?.role === 'admin' && profile?.account_status === 'active';
            const isAcademyOwner = !profileError && profile?.role === 'academy_owner' && profile?.account_status === 'active';
            if (isAdmin) {
                localStorage.setItem('ironfit_userRole', 'admin');
                window.location.href = 'admin/';
            } else if (isAcademyOwner) {
                localStorage.setItem('ironfit_userRole', 'academy_owner');
                window.location.href = 'academy/';
            } else {
                localStorage.removeItem('ironfit_userRole');
                window.location.href = 'app-main.html';
            }
        }
    } catch (err) {
        console.log('Usuário não logado');
    }
}

async function redirectAdminIfNeeded() {
    if (!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error || !data?.user) return;

        const { data: profile, error: profileError } = await supabaseClient
            .from('user_profiles')
            .select('role,account_status')
            .eq('user_id', data.user.id)
            .maybeSingle();

        const isAdmin = !profileError && profile?.role === 'admin' && profile?.account_status === 'active';
        const isAcademyOwner = !profileError && profile?.role === 'academy_owner' && profile?.account_status === 'active';
        if (isAdmin && !window.location.pathname.includes('/admin/')) {
            localStorage.setItem('ironfit_userRole', 'admin');
            window.location.href = 'admin/';
        } else if (isAcademyOwner && !window.location.pathname.includes('/academy/')) {
            localStorage.setItem('ironfit_userRole', 'academy_owner');
            window.location.href = 'academy/';
        } else if (!isAdmin && !isAcademyOwner) {
            localStorage.removeItem('ironfit_userRole');
        }
    } catch (err) {
        console.warn('Erro ao verificar permissão de admin:', err);
    }
}

// ===========================
// FORGOT PASSWORD
// ===========================
function goToForgot() {
    alert('Página de recuperação de senha em desenvolvimento');
}

// ===========================
// PAGE-SPECIFIC INITIALIZATION
// ===========================
async function initLoginPage() {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const isAuthPage = pageName === 'login.html' || pageName === 'register.html' || pageName === '';

    if (isAuthPage) {
        checkIfLoggedIn();
    } else {
        redirectAdminIfNeeded();
    }
    
    const loginBtn = document.querySelector('button[onclick*="login"]');
    const registerBtn = document.querySelector('button[onclick*="register"]');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            login();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            register();
        });
    }

    // Permitir enter para submit
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}
