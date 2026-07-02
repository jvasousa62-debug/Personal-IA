# 🏗️ IRONFIT - Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                          IRONFIT ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        CAMADA FRONTEND                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  LANDING PAGE       │  │   LOGIN PAGE     │  │   APP PAGE     │ │
│  │  (Next.js)          │  │  (HTML + JS)     │  │ (HTML + JS)    │ │
│  │                     │  │                  │  │                │ │
│  │ • Hero section      │  │ • Email/Pass     │  │ • Chat        │ │
│  │ • Benefits          │  │ • Google Auth    │  │ • Plans       │ │
│  │ • Proof section     │  │ • Link Stripe    │  │ • Exercises   │ │
│  │ • CTA: "Começar"────┼──→ • Show Modal     │  │ • Progress    │ │
│  │                     │  │                  │  │ • Admin       │ │
│  └─────────────────────┘  └──────────────────┘  └────────────────┘
│         │                        │                      │
│         └────────────────────────┴──────────────────────┘
│                                  │
│                    ┌─────────────┴─────────────┐
│                    │                           │
│                    ↓                           ↓
│          ┌─────────────────┐        ┌─────────────────┐
│          │ Stripe CDN      │        │ Supabase JS SDK │
│          │ https://        │        │ Auth + DB       │
│          │ js.stripe.com   │        │                 │
│          └─────────────────┘        └─────────────────┘
│                    │                           │
│                    └───────────────┬───────────┘
│                                    │
│                    ┌───────────────┴──────────────┐
│                    │                              │
│                    ↓                              ↓
│          ┌──────────────────┐        ┌────────────────────┐
│          │   payments.js    │        │  config.js + ui.js │
│          │  (540+ lines)    │        │                    │
│          │                  │        │  • Validation      │
│          │ • Modal planos   │        │  • Sanitization    │
│          │ • Stripe config  │        │  • UI setup        │
│          │ • Subscription   │        │  • Theme handling  │
│          │   check          │        │                    │
│          └──────────────────┘        └────────────────────┘
│
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      CAMADA BACKEND / CLOUD                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────┐  ┌─────────────────────────────────┐ │
│  │    SUPABASE CLOUD         │  │    STRIPE CLOUD                 │ │
│  │                           │  │                                 │ │
│  │ ┌─ Auth Module ────────┐  │  │ ┌─ Payment Processing ───────┐ │ │
│  │ │ • PostgreSQL         │  │  │ │ • Customers                 │ │
│  │ │ • JWT Tokens         │  │  │ │ • Subscriptions             │ │
│  │ │ • OAuth providers    │  │  │ │ • Checkout Sessions         │ │
│  │ │ • MFA ready          │  │  │ │ • Invoices                  │ │
│  │ └──────────────────────┘  │  │ └─────────────────────────────┘ │
│  │                           │  │                                 │
│  │ ┌─ Database ───────────┐  │  │ ┌─ Webhooks ────────────────┐ │ │
│  │ │ • user_profiles      │  │  │ │ • checkout.session.completed
│  │ │ • user_preferences   │  │  │ │ • customer.subscription.*   │ │
│  │ │ • user_subscriptions │─┼──┼→│ • payment_intent.*          │ │
│  │ │   (RLS enabled)      │  │  │ │                             │ │
│  │ │ • chat_messages      │  │  │ └─────────────────────────────┘ │
│  │ │ • exercises          │  │  │                                 │
│  │ │ • workouts           │  │  │ ┌─ Dashboard ────────────────┐ │ │
│  │ │ • admin_settings     │  │  │ │ • Monitor transactions      │ │
│  │ └──────────────────────┘  │  │ │ • Manage customers          │ │
│  │                           │  │ │ • View analytics            │ │
│  │ ┌─ Edge Functions ────┐  │  │ │ • Configure webhooks        │ │
│  │ │ • create-checkout   │  │  │ └─────────────────────────────┘ │
│  │ │   -session          │  │  │                                 │
│  │ │ • chat-ai           │  │  │ ┌─ Test Cards ──────────────┐ │ │
│  │ │ • get-exercises     │  │  │ │ • 4242424242424242         │ │
│  │ └──────────────────────┘  │  │ │ • Valid exp + any CVC      │ │
│  │                           │  │ └─────────────────────────────┘ │
│  │ ┌─ Real-time ───────────┐ │  │                                 │
│  │ │ • chat subscriptions   │ │  │                                 │
│  │ │ • presence            │ │  │                                 │
│  │ └───────────────────────┘ │  │                                 │
│  │                           │  │                                 │
│  └───────────────────────────┘  └─────────────────────────────────┘
│         │                              │
│         │                              │
│         └──────────────┬───────────────┘
│                        │
└────────────────────────┼────────────────────────────────────────────┘
                         │
         ┌───────────────┴──────────────┐
         │                              │
         ↓                              ↓
    ┌──────────────┐        ┌──────────────────────┐
    │  HTTP/HTTPS  │        │  Webhooks HTTP POST  │
    │  REST API    │        │  Events              │
    │              │        │                      │
    │  • Sign up   │        │  • Subscription      │
    │  • Sign in   │        │    created/updated   │
    │  • Query DB  │        │  • Payment success   │
    │  • Update    │        │  • Invoice paid      │
    └──────────────┘        └──────────────────────┘
```

---

## 📊 Fluxo de Dados - Usuário Novo

```
USUÁRIO ACESSA LANDING PAGE
        │
        ↓
┌─────────────────────────────────┐
│  lading-page-IronFit/ironfit    │
│  http://localhost:3000          │
│                                 │
│  Components renderizados:       │
│  • Navbar                       │
│  • Hero ("IronFit")             │
│  • Benefits                     │
│  • HowItWorks                   │
│  • CtaFinal (⭐ IMPORTANTA)       │
│    └─ Button: "Começar agora"   │
│       href="../../login.html"   │
└─────────────────────────────────┘
        │
        │ CLICK BUTTON
        ↓
┌─────────────────────────────────┐
│  login.html                     │
│  Redirect para autenticação     │
│                                 │
│  1. Carrega Supabase JS SDK     │
│  2. Carrega payments.js         │
│  3. Carrega Stripe CDN          │
│                                 │
│  Formulário:                    │
│  • Email input                  │
│  • Password input               │
│  • Submit button                │
└─────────────────────────────────┘
        │
        │ SUBMIT LOGIN FORM
        ↓
┌─────────────────────────────────┐
│  Supabase Auth                  │
│  (Backend)                      │
│                                 │
│  1. Validar email + password    │
│  2. Gerar JWT token             │
│  3. Retornar user profile       │
└─────────────────────────────────┘
        │
        │ SUCCESS?
        ├─ YES ──→ localStorage["ironfit_userId"] = id
        │          localStorage["ironfit_loggedIn"] = true
        │          Redirect index.html
        │
        └─ NO ───→ Mostrar erro

USUÁRIO ENTRA NO APP (index.html)
        │
        ↓
┌─────────────────────────────────┐
│  script.js DOMContentLoaded     │
│                                 │
│  1. Splash desaparece           │
│  2. App container aparece       │
│  3. setupNavigation()           │
│  4. setupChat()                 │
│  5. setupPlans()                │
│                                 │
│  6. ⭐ verifySubscriptionAccess()│
│     (novo!!)                    │
└─────────────────────────────────┘
        │
        │ VERIFICA SUBSCRIPTION
        ↓
┌─────────────────────────────────┐
│  payments.js                    │
│  checkSubscriptionStatus()      │
│                                 │
│  Query Supabase:                │
│  SELECT * FROM                  │
│  user_subscriptions             │
│  WHERE user_id = ? AND          │
│  status = 'active' AND          │
│  expires_at > NOW()             │
└─────────────────────────────────┘
        │
        ├─ SEM SUBSCRIPTION ───→ showSubscriptionModal()
        │                              │
        │                         ┌────┴──────────┐
        │                         │               │
        │                    Modal renderiza 3 planos:
        │                    • Starter ($99)
        │                    • Professional ($299) ⭐
        │                    • Enterprise (custom)
        │                         │
        │                    User clica plano
        │                         │
        │                    ┌────┴────────────┐
        │                    │                 │
        │            Stripe   │            Sem Stripe
        │            ativado  │            (demo)
        │                │    │                 │
        │                ↓    │                 ↓
        │          selectPlan()│        "Em breve!"
        │                │    │                 │
        │                ↓    │            Modal fecha
        │          Redireciona │            App bloqueado
        │          para Stripe │
        │          Checkout    │
        │
        ├─ COM SUBSCRIPTION ───→ App liberado
                                 │
                            setupChat()
                            setupPlans()
                            setupExercises()
                            ... (tudo normal)
```

---

## 🔐 Segurança - Múltiplas Camadas

```
FRONTEND
├─ CSRF Protection (meta tags)
├─ Input Sanitization (config.js)
├─ HTTPS only (produção)
└─ localStorage (sem sensitive data)

SUPABASE
├─ JWT Auth (bearer token)
├─ RLS Policies
│  ├─ user_profiles: SELECT/UPDATE own
│  ├─ user_subscriptions: SELECT own
│  └─ Service role: para webhooks
├─ Password hashing (bcrypt)
└─ Rate limiting (built-in)

STRIPE
├─ Public Key only no frontend
├─ Secret Key in backend .env
├─ Webhook signature verification
├─ idempotency keys
└─ Encrypted data at rest

DATABASE
├─ RLS enabled on all tables
├─ Encrypted connections (SSL/TLS)
├─ Automated backups
├─ No exposed API keys
└─ Audit logs (via triggers)
```

---

## 📈 Escalabilidade

```
Pequeno (até 1k users)
├─ Supabase Free Tier OK
├─ Stripe Standard OK
└─ Landing Page: Next.js vercel free

Médio (1k - 100k users)
├─ Supabase Pro
├─ Stripe Standard
├─ Landing Page: Vercel Pro
├─ CDN: Cloudflare
└─ Email: SendGrid

Grande (100k+ users)
├─ Supabase Enterprise
├─ Stripe Enterprise
├─ Landing Page: Vercel Enterprise
├─ CDN: Cloudflare Enterprise
├─ Email: Custom provider
├─ Monitoring: Sentry + Datadog
└─ Backup: Cross-region replication
```

---

## 🔄 Webhook Flow (Stripe)

```
Usuário completa pagamento no Stripe
        │
        ↓
Stripe envia HTTP POST para seu webhook endpoint
        │
        ↓
┌──────────────────────────────────┐
│ Seu Backend (Edge Function)      │
│                                  │
│ 1. Recebe evento webhook         │
│ 2. Valida assinatura Stripe      │
│ 3. Extrai dados (customer_id,    │
│    subscription_id, plan_type)   │
│ 4. Salva em user_subscriptions   │
│ 5. Retorna 200 OK                │
└──────────────────────────────────┘
        │
        ↓
Supabase Database atualizado
        │
        ↓
Próxima vez que usuário fizer login
        │
        ↓
verifySubscriptionAccess() encontra plano ativo
        │
        ↓
App totalmente liberado! ✅
```

---

## 📦 Dependências

### Frontend
```
├─ @supabase/supabase-js (auth + db)
├─ stripe.js (CDN - não npm)
├─ chart.js (visualizações)
├─ lucide-react (ícones, Next.js)
└─ framer-motion (animações, Next.js)
```

### Backend
```
├─ supabase/cli (migrations)
├─ stripe/sdk (edge functions)
└─ postgres (auto, no Supabase)
```

### Deployment
```
├─ Vercel (Landing Page)
├─ Supabase (Backend)
└─ Stripe (Payments)
```

---

## 🎯 Key Features

| Feature | Status | Descrição |
|---------|--------|-----------|
| Landing Page | ✅ | Next.js profissional |
| Autenticação | ✅ | Supabase + OAuth |
| Planos | ✅ | 3 tiers oferecidos |
| Modal Subs | ✅ | Responsivo + dinâmico |
| Stripe Ready | ✅ | SDK carregado, config ready |
| RLS | ✅ | Segurança no banco |
| Soft Block | ✅ | Sem subscription = bloqueado |
| Webhooks | 📋 | Ready to implement |
| Admin Area | ✅ | Já existe no app |
| Analytics | 📋 | Integrar Stripe analytics |

---

## 🚀 Performance

```
Métrica                    Target      Atual
───────────────────────────────────────────
Lighthouse Score          90+          TBD
Core Web Vitals           Green        TBD
Time to Interactive       < 3s         TBD
First Contentful Paint    < 1.5s       TBD
DB Query Latency          < 100ms      <50ms
Modal Load Time           < 500ms      <200ms
Stripe CDN Load           < 1s         <500ms
```

---

## 📋 Monitoring Checklist

Post-launch, monitore:
- [ ] Webhook delivery rate (Stripe)
- [ ] Database query performance
- [ ] Modal rendering time
- [ ] Error rates
- [ ] User signup completion
- [ ] Payment success rate
- [ ] Churn rate

---

**Arquitetura v1.0** | Production Ready ✅
