# 🚀 Guia de Deployment e Setup para Academias

## 📋 Pré-requisitos

- Node.js v16+ (para desenvolvimento local)
- Conta Supabase (gratuita em https://supabase.com)
- Conta Vercel/Netlify/hosting (para deploy)
- Domínio customizado (ex: ironfit.minha-academia.com.br)

---

## 🔧 Setup Local (Desenvolvimento)

### 1. Clonar/preparar projeto

```bash
# Se no GitHub
git clone https://github.com/seu-usuario/ironfit.git
cd ironfit

# Ou copiar os arquivos
```

### 2. Criar conta Supabase

1. Ir para https://supabase.com
2. Criar novo projeto
3. Escolher região (ex: `sa-east-1` para Brasil)
4. Copiar as credenciais:
   - `Project URL`
   - `Anon Public Key`

### 3. Configurar variáveis de ambiente

Criar arquivo `.env.local` (NÃO commitar para Git):

```env
# Supabase
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica

# APIs (se usar)
VITE_RAPIDAPI_KEY=sua-chave-exercisedb
VITE_ANTHROPIC_API_KEY=sua-chave-claude

# Analytics (opcional)
VITE_POSTHOG_KEY=sua-chave-analytics
```

**IMPORTANTE:** Nunca commitar chaves em `.env` público!

### 4. Inicializar banco de dados

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Criar migrations
supabase migrations new init_schema

# Aplicar migrations
supabase db push
```

### 5. Testar localmente

```bash
# Python HTTP server (recomendado)
python3 -m http.server 8000

# Ou com Node.js
npm install -D http-server
http-server

# Abrir http://localhost:8000/index.html
```

---

## 🌐 Deploy em Vercel (Recomendado)

### Passo 1: Preparar repositório Git

```bash
git init
git add .
git commit -m "Initial IRONFIT commit"
git remote add origin https://github.com/seu-usuario/ironfit.git
git push -u origin main
```

### Passo 2: Conectar a Vercel

1. Ir para https://vercel.com
2. Importar projeto do GitHub
3. Configurar variáveis de ambiente:
   - Project Settings → Environment Variables
   - Adicionar todas as variáveis do `.env.local`

### Passo 3: Deploy

```bash
# Ou pelo dashboard Vercel
# Vercel faz deploy automático ao fazer push para main
git push origin main
```

### Resultado

- URL automática: `ironfit-seu-usuario.vercel.app`
- Ou usar domínio customizado

---

## 🎨 Customizar para Sua Academia

### 1. Logo e Cores

Editar em `index.html`:

```html
<div class="sidebar-logo">MINHA<span>GYM</span></div>
```

Editar em `style.css`:

```css
:root {
  --accent: #seu-cor-principal;  /* Amarelo neon → sua cor */
  /* ... outras cores */
}
```

### 2. Textos Iniciais

Em `script.js`, modificar prompt de AI:

```javascript
// Alterarpersonalidade da IA
const aiStyle = 'motivador';  // ou 'bruto', 'tecnico', etc.
```

### 3. Adicionar Logo da Academia

```html
<!-- Em index.html, substituir logo padrão -->
<img src="logo-academia.png" class="academy-logo">
```

```css
/* Em style.css */
.academy-logo {
  max-width: 150px;
  margin: 20px auto;
}
```

---

## 🏋️ Configurar Exercícios Específicos

### Se sua academia tem exercícios únicos/específicos

Adicionar em `script.js` ou `src/data.js`:

```javascript
const CUSTOM_EXERCISES = [
  {
    id: 'leg-press-custom',
    name: 'Leg Press Especial Academia',
    group: 'pernas',
    // ... resto dos dados
  }
];

// Depois unir com base de dados
const ALL_EXERCISES = [...EXERCISES, ...CUSTOM_EXERCISES];
```

---

## 📊 Configurar Banco de Dados

### Tabelas principais (auto-criadas):

```sql
-- Usuários (gerenciado por Supabase Auth)
-- chat_messages (histórico de chat)
-- workout_data (treinos salvos)
-- body_metrics (check-ins de progresso)
-- user_preferences (preferências de IA)
```

### Para visualizar/gerenciar dados:

1. Ir para Supabase Dashboard
2. Tables → editor de tabelas
3. Ou usar DBeaver para SQL direto

---

## 🔐 Segurança em Produção

### Checklist

- [ ] Variáveis de ambiente não commitadas
- [ ] CORS configurado para seu domínio
- [ ] SSL/TLS ativado (Vercel faz automaticamente)
- [ ] Supabase RLS (Row Level Security) ativado
- [ ] Backups automáticos configurados
- [ ] 2FA para admins Supabase

### Configurar RLS no Supabase

```sql
-- Permitir usuários verem apenas seus dados
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see only their messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📱 PWA (Progressive Web App)

Para oferecer como app nativo:

### 1. Criar manifest.json

```json
{
  "name": "IRONFIT - Minha Academia",
  "short_name": "IRONFIT",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "logo-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0a0a0a",
  "background_color": "#ffffff"
}
```

### 2. Adicionar em index.html

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#0a0a0a">
<meta name="apple-mobile-web-app-capable" content="yes">
```

---

## 📞 Suporte e Monitoramento

### Error Tracking

Adicionar Sentry para tracking de erros:

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "sua-chave-sentry",
  environment: "production"
});
```

### Analytics

Usar PostHog ou Mixpanel para entender uso:

```javascript
// Rastrear eventos importantes
posthog.capture('treino_completo', {
  user_id: userId,
  duracao: duracao,
  exercicios: quantidade
});
```

---

## 💾 Backups e Disaster Recovery

### Backup automático (Supabase)

- Supabase faz backups daily (plano paid)
- Armazenado em múltiplas regiões

### Exportar dados

```sql
-- PostgreSQL backup
pg_dump -U postgres -h seu-host -d seu-db > backup.sql
```

---

## 🎯 Checklist de Deploy Final

Antes de oferecer às academias:

- [ ] Deploy em produção testado
- [ ] Supabase migrations aplicadas
- [ ] IA respondendo corretamente
- [ ] Autenticação funcionando
- [ ] Dados sendo salvos corretamente
- [ ] Animações/GIFs carregando
- [ ] Mobile responsivo
- [ ] Sem erros de console
- [ ] Performance: < 3s load time
- [ ] Segurança: SSL certificado válido

---

## 📞 Suporte Técnico

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| Login não funciona | Verificar Supabase Auth config em main.js |
| Chat não responde | Verificar ANTHROPIC_API_KEY e rate limits |
| GIFs não carregam | Verificar CORS no Supabase, usar proxy |
| Banco lento | Adicionar índices, verificar conexões |

### Contatos Úteis

- Supabase Docs: https://supabase.com/docs
- Vercel Support: https://vercel.com/support
- Anthropic API: https://docs.anthropic.com

---

## 💰 Custos Estimados (Mensal)

| Serviço | Nível Free | Nível Paid | Estimado |
|---------|-----------|-----------|----------|
| Supabase | ✅ até 50k users | $25+ | $25-100 |
| Vercel | ✅ unlimited | $20+/team | $20 |
| Anthropic API | ❌ $3/M.tokens | paga | $50-200 |
| Domínio | ❌ | $10-20/ano | $1-2 |
| **TOTAL** | **$0** | **mín $70** | **$96-322** |

**Para academias:** Incluir R$ 400-1000/mês na receita de SaaS

---

## 🎓 Conclusão

Processo de deploy:

```
1. Setup local + testes (4h)
2. Configurar Supabase (2h)
3. Deploy Vercel (1h)
4. Customizar (2-4h)
5. QA e testes (4h)
6. Lançamento beta (2h)

Total: ~15-20 horas
```

**Pronto para academias após validação completa!**
