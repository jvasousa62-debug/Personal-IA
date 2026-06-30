(function (root) {
  const PLAN_DEFINITIONS = Object.freeze([
    { value: 'pro', label: 'Pro', monthlyAmount: 79, description: 'Plano inicial para academias em crescimento.' },
    { value: 'premium', label: 'Premium', monthlyAmount: 149, description: 'Mais recursos e suporte para operação completa.' },
    { value: 'enterprise', label: 'Enterprise', monthlyAmount: 299, description: 'Gestão avançada para redes e franquias.' }
  ]);

  function normalizePlan(plan) {
    if (typeof plan !== 'string') return 'pro';

    const value = plan.toLowerCase().trim();
    if (value === 'free' || value === 'basic') return 'pro';
    if (value === 'premium' || value === 'enterprise' || value === 'pro') return value;
    return 'pro';
  }

  function getPlanLabel(plan) {
    return PLAN_DEFINITIONS.find((item) => item.value === normalizePlan(plan))?.label || 'Pro';
  }

  function getPlanOptions() {
    return PLAN_DEFINITIONS.map((item) => ({ ...item }));
  }

  function isPaidPlan(plan) {
    const normalized = normalizePlan(plan);
    return normalized === 'pro' || normalized === 'premium' || normalized === 'enterprise';
  }

  const api = {
    PLAN_DEFINITIONS,
    normalizePlan,
    getPlanLabel,
    getPlanOptions,
    isPaidPlan
  };

  root.IronFitPlanConfig = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
