# 🔐 IRONFIT - Guia de Integração com Stripe

## Visão Geral

O projeto está **pronto para integração com Stripe**, mas atualmente está em **modo demonstrativo**. O fluxo funciona assim:

```
Landing Page → Login → Verificação de Plano
                      ↓
                    Sem Plano? → Modal de Planos
                      ↓
                   Com Plano? → App IRONFIT
```

## 📋 Estrutura Implementada

### 1. **Landing Page (Next.js)**
- Localização: `lading-page-IronFit/ironfit/`
- Botão CTA: "⚡ Começar agora" → Redireciona para `login.html`
- Link alternativo: "Falar com especialista" → WhatsApp

### 2. **Sistema de Autenticação**
- Arquivo: `src/login.js`
- Usa: Supabase Auth
- Após login → Verifica subscription status

### 3. **Módulo de Pagamentos**
- Arquivo: `src/payments.js`
- Status: **DESATIVADO por padrão** (`STRIPE_CONFIG.enabled = false`)
- Planos definidos:
  - **Starter**: R$ 99/mês (50 requisições IA)
  - **Professional**: R$ 299/mês (Ilimitado) ⭐ Popular
  - **Enterprise**: Customizado

### 4. **Banco de Dados**
- Tabela: `user_subscriptions` (criada via migration)
- Campos: plan_type, status, stripe_customer_id, stripe_subscription_id, etc.
- RLS habilitado para segurança

---

## 🚀 Como Ativar o Stripe

### Passo 1: Obter Credenciais do Stripe

1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Vá para **Developers** → **API Keys**
3. Copie:
   - **Publishable Key** (pública)
   - **Secret Key** (privada - nunca compartilhe!)

### Passo 2: Criar Produtos e Preços

1. Vá para **Products** no dashboard
2. Crie 3 produtos:
   - **Starter Plan** → Preço: $99 USD/mês
   - **Professional Plan** → Preço: $299 USD/mês
   - **Enterprise Plan** → Preço: Customizado
3. Copie os **Price IDs** (ex: `price_1234...`)

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Stripe (Modo Publicável)
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXX

# Stripe (Modo Secreto - APENAS no backend)
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXX

# Price IDs (do passo anterior)
STRIPE_PRICE_STARTER=price_1234567890
STRIPE_PRICE_PROFESSIONAL=price_0987654321
STRIPE_PRICE_ENTERPRISE=price_1111111111
```

### Passo 4: Ativar no Código

Edite `src/payments.js`:

```javascript
const STRIPE_CONFIG = {
  enabled: true,  // ← Mude para TRUE
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  priceIds: {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    professional: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || ''
  }
};
```

### Passo 5: Criar Edge Function para Checkout

Crie `supabase/functions/create-checkout-session/index.ts`:

```typescript
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Deno.createHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, priceId, planType } = await req.json();

    // Buscar ou criar customer no Stripe
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user?.email,
      });
      customerId = customer.id;
    }

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/login`,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Passo 6: Configurar Webhooks

1. Vá para **Webhooks** no Stripe Dashboard
2. Adicione endpoint: `https://seu-dominio.com/api/webhooks/stripe`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## 🔄 Fluxo Completo (Com Stripe Ativado)

```
1. Usuário clica "Começar Agora" na landing page
   ↓
2. Redirecionado para login
   ↓
3. Faz login com Supabase Auth
   ↓
4. Sistema verifica subscription (user_subscriptions)
   ↓
5. Sem subscription → Modal de planos aparece
   ↓
6. Usuário clica em plano → Redireciona para Stripe Checkout
   ↓
7. Completa pagamento → Webhook registra subscription
   ↓
8. Acesso ao app IRONFIT liberado ✅
```

---

## 📊 Monitoramento

### Verificar Subscriptions no Supabase

```sql
SELECT 
  u.email,
  us.plan_type,
  us.status,
  us.expires_at,
  us.stripe_customer_id
FROM user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

### Verificar Webhooks do Stripe

Dashboard → **Developers** → **Webhooks** → Ver logs

---

## 🧪 Teste Modo Demonstrativo (Stripe Desativado)

1. Landing page funciona normalmente
2. Click "Começar Agora" → vai para login
3. Login com conta Supabase
4. Modal de planos aparece com "Em breve" (Stripe desativado)
5. Sistema bloqueia acesso ao app (é esperado)

---

## 🛠️ Troubleshooting

### Modal não aparece?
- Verificar se `src/payments.js` está carregado
- Verificar console.log do navegador para erros
- Confirmar que `user_subscriptions` existe no Supabase

### Checkout não redireciona?
- Verificar se `STRIPE_CONFIG.enabled = true`
- Confirmar se price IDs estão corretos
- Verificar se Stripe.js (CDN) foi carregado

### Webhook não dispara?
- Verificar logs no dashboard do Stripe
- Confirmar URL do webhook está acessível
- Testar com Stripe CLI: `stripe trigger payment_intent.succeeded`

---

## 📚 Referências

- [Stripe Docs](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)

---

**Status**: ✅ Sistema pronto para produção com Stripe habilitado
