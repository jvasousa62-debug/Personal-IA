(function (root) {
  // Plan definitions with AI token limits and features
  const PLAN_DEFINITIONS = Object.freeze([
    {
      value: 'basic',
      label: 'Plano Simples',
      monthlyAmount: 49,
      description: 'Ideal para academias começando com IA',
      aiMonthlyTokens: 5000,
      studentLimit: 30,
      features: ['Acesso básico à IA', '5.000 tokens/mês', 'Suporte por email']
    },
    {
      value: 'pro',
      label: 'Plano Pro',
      monthlyAmount: 99,
      description: 'Para academias em crescimento',
      aiMonthlyTokens: 20000,
      studentLimit: 100,
      features: ['IA com mais poder', '20.000 tokens/mês', 'Suporte prioritário', 'Relatórios avançados']
    },
    {
      value: 'premium',
      label: 'Plano Premium',
      monthlyAmount: 199,
      description: 'Mais recursos e suporte completo',
      aiMonthlyTokens: 75000,
      studentLimit: 500,
      features: ['IA ilimitada', '75.000 tokens/mês', 'Suporte 24/7', 'Integração com sistemas']
    },
    {
      value: 'enterprise',
      label: 'Plano Enterprise',
      monthlyAmount: 499,
      description: 'Gestão avançada para redes e franquias',
      aiMonthlyTokens: 300000,
      studentLimit: 5000,
      features: ['IA máxima', '300.000 tokens/mês', 'Suporte dedicado', 'API customizada', 'Multi-academia']
    }
  ]);

  function normalizePlan(plan) {
    if (typeof plan !== 'string') return 'basic';

    const value = plan.toLowerCase().trim();
    if (value === 'free') return 'basic';
    if (value === 'simple') return 'basic';
    if (['basic', 'pro', 'premium', 'enterprise'].includes(value)) return value;
    return 'basic';
  }

  function getPlanLabel(plan) {
    return PLAN_DEFINITIONS.find((item) => item.value === normalizePlan(plan))?.label || 'Plano Simples';
  }

  function getPlanOptions() {
    return PLAN_DEFINITIONS.map((item) => ({ ...item }));
  }

  function isPaidPlan(plan) {
    const normalized = normalizePlan(plan);
    return ['basic', 'pro', 'premium', 'enterprise'].includes(normalized);
  }

  function getAITokenLimit(plan) {
    const normalized = normalizePlan(plan);
    return PLAN_DEFINITIONS.find((item) => item.value === normalized)?.aiMonthlyTokens || 5000;
  }

  function getStudentLimit(plan) {
    const normalized = normalizePlan(plan);
    return PLAN_DEFINITIONS.find((item) => item.value === normalized)?.studentLimit || 30;
  }

  function getPlanByTokenLimit(tokens) {
    // Find the cheapest plan that can accommodate the requested tokens
    return PLAN_DEFINITIONS.find((item) => item.aiMonthlyTokens >= tokens) || PLAN_DEFINITIONS[PLAN_DEFINITIONS.length - 1];
  }

  const api = {
    PLAN_DEFINITIONS,
    normalizePlan,
    getPlanLabel,
    getPlanOptions,
    isPaidPlan,
    getAITokenLimit,
    getStudentLimit,
    getPlanByTokenLimit
  };

  root.IronFitPlanConfig = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
