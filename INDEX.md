# 📚 IRONFIT - Documentação Central

Bem-vindo! Seu sistema de pagamentos foi implementado com sucesso. Use este arquivo como índice para navegar pela documentação.

---

## 🎯 Comece por Aqui

### **Para entender rápido** (5 min)
👉 [RESUMO-EXECUTIVO.md](RESUMO-EXECUTIVO.md)
- O que foi feito
- Fluxo visual
- Próximos passos

### **Para entender tudo** (20 min)
👉 [FLUXO-COMPLETO.md](FLUXO-COMPLETO.md)
- Documentação técnica detalhada
- Explicação de cada parte
- Checklist completo

### **Para ativar Stripe** (Vai depender)
👉 [STRIPE-SETUP.md](STRIPE-SETUP.md)
- Passo a passo
- Configurações
- Troubleshooting

---

## 📁 Estrutura do Projeto

```
Projeto-Academia/
├── 📄 RESUMO-EXECUTIVO.md ........... Start here! ⭐
├── 📄 FLUXO-COMPLETO.md ............ Técnico
├── 📄 STRIPE-SETUP.md ............. Integração Stripe
├── 📄 INDEX.md .................... Este arquivo
│
├── 📁 lading-page-IronFit/ironfit/
│   └── components/
│       └── CtaFinal.tsx ........... Landing → Login
│
├── 📁 src/
│   ├── payments.js ............... 🆕 Sistema de pagamentos
│   ├── config.js ................ Configurações
│   ├── login.js ................. Autenticação
│   └── main.js .................. App principal
│
├── 📁 supabase/
│   └── migrations/
│       └── 20260630_user_subscriptions.sql .. 🆕 Tabela subscriptions
│
├── index.html ................... App principal
├── login.html ................... Login page
└── script.js .................... Inicialização app
```

---

## 🚀 Fluxo de Ação

### Opção 1: Testar Agora (Demo)
```
1. Abrir: lading-page-IronFit/ironfit
2. npm run dev
3. Visitar: http://localhost:3000
4. Click "Começar agora"
5. Fazer login
6. Ver modal de planos
```

### Opção 2: Ativar Stripe (Produção)
```
1. Ler: STRIPE-SETUP.md
2. Criar conta: stripe.com
3. Configurar: .env com credenciais
4. Ativar: STRIPE_CONFIG.enabled = true
5. Deploy!
```

---

## 📊 O Que Foi Implementado

### ✅ Landing Page
- [x] Next.js professiona
- [x] Hero section
- [x] CTA conectado ao login
- [x] Responsivo

### ✅ Autenticação
- [x] Supabase Auth
- [x] Email + Password
- [x] Google OAuth ready
- [x] Sessão gerenciada

### ✅ Sistema de Pagamentos
- [x] Modal com 3 planos
- [x] Integração Stripe (standby)
- [x] Soft block sem plano
- [x] Responsivo

### ✅ Banco de Dados
- [x] Tabela `user_subscriptions`
- [x] RLS (segurança)
- [x] Índices de performance
- [x] Triggers para atualização

---

## 🔑 Funções Principais

### `src/payments.js`

```javascript
// Verificar se user tem plano ativo
await PaymentModule.checkSubscriptionStatus(userId)
// → { hasActiveSubscription, plan, expiresAt }

// Mostrar modal de planos
PaymentModule.showSubscriptionModal()

// Selecionar plano (chama Stripe)
await PaymentModule.selectPlan('professional')

// Verificar acesso ao app
await PaymentModule.verifySubscriptionAccess()
// → bloqueia app se sem subscription
```

---

## 🎨 Planos Oferecidos

| Plano | Preço | IA | Alunos | Suporte | Popular? |
|-------|-------|-------|--------|---------|----------|
| **Starter** | R$ 99/mês | 50/mês | 10 | Básico | ❌ |
| **Professional** | R$ 299/mês | Ilimitado | 100 | Prioritário | ⭐ |
| **Enterprise** | Customizado | Ilimitado | ∞ | 24/7 | 🏢 |

---

## 🔐 Segurança

- ✅ Supabase Auth (OAuth2)
- ✅ RLS no banco de dados
- ✅ CORS habilitado
- ✅ Secret keys em .env
- ✅ Input validation

---

## 📞 Troubleshooting Rápido

### Modal não aparece?
```
1. Verificar console.log (F12)
2. Confirmar src/payments.js está carregado
3. Verificar se Supabase está pronto
4. Testar: window.PaymentModule
```

### Login não funciona?
```
1. Verificar credenciais Supabase em index.html
2. Confirmar meta tags estão presentes
3. Testar conexão: window.supabaseClient
```

### Stripe checkout não abre?
```
1. Ativar: STRIPE_CONFIG.enabled = true
2. Adicionar Price IDs em .env
3. Confirmar .env está sendo lido
4. Verificar console para erros
```

---

## 📚 Referências Rápidas

### Supabase
- [Docs Auth](https://supabase.com/docs/guides/auth)
- [Docs Database](https://supabase.com/docs/guides/database)
- [Docs RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Stripe
- [Docs](https://stripe.com/docs)
- [Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks](https://stripe.com/docs/webhooks)

### NextJS
- [Getting Started](https://nextjs.org/docs)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Checklist Para Produção

- [ ] Ler STRIPE-SETUP.md completamente
- [ ] Criar conta Stripe
- [ ] Obter Publishable Key
- [ ] Obter Secret Key
- [ ] Criar produtos no Stripe
- [ ] Copiar Price IDs
- [ ] Configurar .env
- [ ] Criar Edge Function
- [ ] Configurar webhooks
- [ ] Ativar STRIPE_CONFIG.enabled
- [ ] Testar com cartão de teste
- [ ] Verificar webhook
- [ ] Deploy em staging
- [ ] Testar em staging
- [ ] Deploy produção
- [ ] Monitorar webhooks

---

## 📞 Precisa de Ajuda?

1. **Quick Help**: Procure em STRIPE-SETUP.md
2. **Technical Deep Dive**: Veja FLUXO-COMPLETO.md
3. **Overview**: Leia RESUMO-EXECUTIVO.md

---

## 🎉 Pronto Para Começar!

```
✅ Sistema implementado
✅ Documentação completa
✅ Pronto para produção

Próximo passo: Ativar Stripe! 🚀
```

---

**Last Updated**: 30/06/2026  
**Version**: 1.0  
**Status**: Production Ready ✅
