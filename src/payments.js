/* ===========================
   IRONFIT — PAYMENT MODULE
   DEPRECATED: Stripe integration temporarily disabled
   
   This module is no longer active. The app now uses academy code
   validation instead of payment processing.
   
   The code below is preserved for future use when integrating Stripe
   for multi-academy deployments.
   
   Subscription verification is now handled by:
   - Academy code validation at registration
   - User profile.plan field (set to academy's plan)
   - Token limits based on plan type
   =========================== */

// ===========================
// STRIPE CONFIGURATION (DISABLED)
// ===========================
/* COMMENTED OUT - Stripe disabled for now
const STRIPE_CONFIG = {
  enabled: false, // Set to true when Stripe is ready
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  priceIds: {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    professional: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || ''
  }
};
*/

// ===========================
// SUBSCRIPTION PLANS
// =========================== 
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 'R$ 99',
    period: '/mês',
    features: [
      'Chat com IA até 50 requisições/mês',
      'Até 10 alunos',
      'Suporte básico'
    ],
    color: '#4F46E5'
  },
  professional: {
    name: 'Professional',
    price: 'R$ 299',
    period: '/mês',
    features: [
      'Chat com IA ilimitado',
      'Até 100 alunos',
      'Análises avançadas',
      'Suporte prioritário'
    ],
    color: '#FFD600',
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Customizado',
    period: 'contato',
    features: [
      'Tudo do Professional',
      'Integrações customizadas',
      'API acesso completo',
      'Suporte dedicado 24/7'
    ],
    color: '#e8ff00'
  }
};

// ===========================
// CHECK SUBSCRIPTION STATUS
// Returns: { hasActiveSubscription: bool, plan: string, expiresAt: timestamp }
// =========================== 
async function checkSubscriptionStatus(userId) {
  try {
    if (!window.supabaseClient) {
      console.warn('⚠️ Supabase client not initialized');
      return {
        hasActiveSubscription: false,
        plan: null,
        expiresAt: null,
        error: 'Supabase not configured'
      };
    }

    // Query user's subscription from database
    const { data, error } = await window.supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Subscription check error:', error);
      return {
        hasActiveSubscription: false,
        plan: null,
        expiresAt: null,
        error: 'Failed to check subscription'
      };
    }

    if (!data) {
      return {
        hasActiveSubscription: false,
        plan: null,
        expiresAt: null,
        status: 'no_subscription'
      };
    }

    const isActive = data.status === 'active' && new Date(data.expires_at) > new Date();

    return {
      hasActiveSubscription: isActive,
      plan: data.plan_type,
      expiresAt: data.expires_at,
      status: data.status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasActiveSubscription: false,
      plan: null,
      expiresAt: null,
      error: error.message
    };
  }
}

// ===========================
// HANDLE NO SUBSCRIPTION
// Shows modal with plan options
// =========================== 
function showSubscriptionModal() {
  const existingModal = document.getElementById('subscription-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'subscription-modal';
  modal.innerHTML = `
    <div class="subscription-overlay">
      <div class="subscription-modal">
        <div class="modal-header">
          <h2>Escolha seu plano</h2>
          <p class="modal-subtitle">Selecione o plano que melhor se adequa ao seu negócio</p>
        </div>

        <div class="plans-container">
          ${renderPlanCards()}
        </div>

        <div class="modal-footer">
          <p class="stripe-notice">
            💳 Integração com Stripe será habilitada em breve
          </p>
          <button class="btn-secondary" onclick="document.getElementById('subscription-modal').remove()">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #subscription-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Barlow', sans-serif;
    }

    .subscription-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
    }

    .subscription-modal {
      position: relative;
      z-index: 10001;
      background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 1px solid #333;
      border-radius: 16px;
      padding: 40px;
      max-width: 1200px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      text-align: center;
      margin-bottom: 40px;
      color: #fff;
    }

    .modal-header h2 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: 'Bebas Neue', sans-serif;
    }

    .modal-subtitle {
      font-size: 16px;
      color: #aaa;
    }

    .plans-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .plan-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid #333;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      transition: all 0.3s ease;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .plan-card:hover {
      border-color: #e8ff00;
      box-shadow: 0 0 30px rgba(232, 255, 0, 0.1);
      transform: translateY(-4px);
    }

    .plan-card.popular {
      border-color: #e8ff00;
      background: rgba(232, 255, 0, 0.05);
      box-shadow: 0 0 60px rgba(232, 255, 0, 0.1);
    }

    .plan-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #e8ff00;
      color: #000;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .plan-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      margin-top: 8px;
    }

    .plan-price {
      font-size: 48px;
      font-weight: bold;
      color: #e8ff00;
      margin-bottom: 4px;
      font-family: 'Bebas Neue', sans-serif;
    }

    .plan-period {
      font-size: 14px;
      color: #999;
      margin-bottom: 24px;
    }

    .plan-features {
      list-style: none;
      margin-bottom: 32px;
      text-align: left;
    }

    .plan-features li {
      padding: 8px 0;
      color: #ccc;
      font-size: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .plan-features li:last-child {
      border-bottom: none;
    }

    .plan-features li:before {
      content: "✓ ";
      color: #e8ff00;
      font-weight: bold;
      margin-right: 8px;
    }

    .plan-button {
      width: 100%;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .plan-card:not(.popular) .plan-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ccc;
      border: 1px solid #333;
    }

    .plan-card:not(.popular) .plan-button:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .plan-card.popular .plan-button {
      background: #e8ff00;
      color: #000;
    }

    .plan-card.popular .plan-button:hover {
      background: #fff;
      box-shadow: 0 0 30px rgba(232, 255, 0, 0.3);
    }

    .modal-footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #333;
    }

    .stripe-notice {
      color: #FFD600;
      font-size: 14px;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(255, 214, 0, 0.1);
      border-radius: 6px;
      border-left: 3px solid #FFD600;
    }

    .btn-secondary {
      padding: 10px 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid #333;
      color: #ccc;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 13px;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border-color: #e8ff00;
    }

    @media (max-width: 768px) {
      .subscription-modal {
        padding: 24px;
        width: 95%;
      }

      .plan-price {
        font-size: 32px;
      }

      .plans-container {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(modal);

  // Close on overlay click
  modal.querySelector('.subscription-overlay').addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.subscription-overlay')) {
      modal.remove();
    }
  });
}

// ===========================
// RENDER PLAN CARDS
// =========================== 
function renderPlanCards() {
  return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => `
    <div class="plan-card ${plan.popular ? 'popular' : ''}">
      ${plan.popular ? '<div class="plan-badge">Popular</div>' : ''}
      <div class="plan-name">${plan.name}</div>
      <div class="plan-price">${plan.price}</div>
      <div class="plan-period">${plan.period}</div>
      <ul class="plan-features">
        ${plan.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="plan-button" onclick="selectPlan('${key}')">
        ${STRIPE_CONFIG.enabled ? 'Escolher plano' : 'Em breve'}
      </button>
    </div>
  `).join('');
}

// ===========================
// SELECT PLAN & REDIRECT TO STRIPE (DISABLED)
// ===========================
/* COMMENTED OUT - Stripe disabled for now
async function selectPlan(planType) {
  if (!STRIPE_CONFIG.enabled) {
    alert('✨ A integração com Stripe será habilitada em breve!\n\nEste é o plano: ' + SUBSCRIPTION_PLANS[planType].name);
    return;
  }

  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Erro: Usuário não identificado. Faça login novamente.');
    return;
  }

  try {
    // Chamar função de edge para gerar Stripe checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        priceId: STRIPE_CONFIG.priceIds[planType],
        planType
      })
    });

    const { sessionId } = await response.json();

    // Redirecionar para Stripe Checkout
    if (window.Stripe) {
      const stripe = Stripe(STRIPE_CONFIG.publishableKey);
      stripe.redirectToCheckout({ sessionId });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    alert('Erro ao processar. Tente novamente.');
  }
}
*/

// REPLACEMENT: Simple placeholder for future Stripe integration
function selectPlan(planType) {
  console.log('selectPlan() called for:', planType);
  console.log('Note: Stripe integration is currently disabled.');
  console.log('Users must register with a valid academy code.');
}

// ===========================
// VERIFY SUBSCRIPTION ON PAGE LOAD (SIMPLIFIED)
// Since Stripe is disabled, this now just verifies the user has an academy_id
// =========================== 
async function verifySubscriptionAccess() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    // Sem user ID, deixa carregar. Login vai redirecionar conforme necessário
    return true;
  }

  try {
    // Check if user has an academy_id (assigned during registration)
    if (window.supabaseClient) {
      const { data: profile, error } = await window.supabaseClient
        .from('user_profiles')
        .select('academy_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error checking academy access:', error);
        return true; // Allow access, let the page handle errors
      }

      if (!profile || !profile.academy_id) {
        console.warn('⚠️ Usuário sem academia vinculada.');
        // User should have been created with academy_id, this shouldn't happen
        return false;
      }

      return true;
    }
  } catch (err) {
    console.error('Error in verifySubscriptionAccess:', err);
    return true; // Allow access on error
  }

  return true;
}

// ===========================
// Export for use in other modules
// Note: Stripe-related functions are now placeholders
// =========================== 
window.PaymentModule = {
  checkSubscriptionStatus: async () => ({ hasActiveSubscription: true, plan: null }),
  showSubscriptionModal: () => console.log('showSubscriptionModal disabled'),
  selectPlan: () => console.log('selectPlan disabled - using academy codes instead'),
  verifySubscriptionAccess,
  SUBSCRIPTION_PLANS,
  STRIPE_CONFIG: { enabled: false }
};
