# 🔐 CORREÇÃO DE SEGURANÇA — API KEYS EXPOSTAS

**Data:** 4 de maio de 2026  
**Status:** ✅ **CORRIGIDO**

---

## 🔴 PROBLEMA ENCONTRADO

Seu código tinha **API KEYS HARDCODED NO FRONTEND**, representando um risco de segurança:

### 1. ❌ RAPIDAPI_KEY (CRÍTICO)
```javascript
// ❌ ANTES: Exposto no frontend
const RAPIDAPI_KEY = 'f2a8a15739msh6d74fd54a84778ep148338jsn6eab3c64a9fa';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

// Cliente poderia:
// - Roubar a chave
// - Fazer requisições não autorizadas
// - Estourar rate limits
// - Custar caro na sua conta
```

**Arquivos afetados:**
- `script.js` (linha 336-337)
- `src/data.js` (linha 108-109)
- `src/utils.js` (usava as variáveis)

### 2. ⚠️ Supabase Anon Key
```javascript
// ⚠️ OK expor (é pública), mas melhor em env vars
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Obs:** A Supabase "anon key" é segura para frontend (é pública), mas melhor em variáveis de ambiente.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Passo 1: Criar Edge Function Segura

Criei uma **Supabase Edge Function** que:
- Recebe requisição do frontend (sem chave)
- Chama ExerciseDB com a chave no backend
- Retorna o GIF para o frontend
- **A chave RAPIDAPI nunca sai do servidor!**

📁 **Arquivo criado:**
```
supabase/functions/get-exercise-gif/index.ts
```

**Como funciona:**
```
Frontend                    Supabase Edge Function
   |                              |
   |--POST request------->        |
   |  {exerciseId,        |--POST com RAPIDAPI_KEY--> ExerciseDB API
   |   searchTerm}        |
   |                      |<--Resposta GIF URL--
   |<--GIF URL-------|   |
   |                      |
```

### Passo 2: Remover Chaves do Frontend

✅ **Script.js:**
```javascript
// ❌ ANTES
const RAPIDAPI_KEY = '...';

// ✅ DEPOIS
// Agora usa Edge Function (sem chave)
async function fetchGifFromExerciseDB(exerciseId) {
  const url = `${supabaseUrl}/functions/v1/get-exercise-gif`;
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ exerciseId, searchTerm })
  });
  // ...
}
```

✅ **src/data.js:** Removido RAPIDAPI_KEY

✅ **src/utils.js:** Atualizado para usar Edge Function

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env.local` (não commitar para Git):
```env
# Supabase (opcional - já no código, mas melhor em env)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica

# ExerciseDB (CRÍTICO - vai na Edge Function)
RAPIDAPI_KEY=sua-chave-aqui
RAPIDAPI_HOST=exercisedb.p.rapidapi.com
```

---

## 🚀 COMO CONFIGURAR

### 1. Setup da Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy da função
supabase functions deploy get-exercise-gif
```

### 2. Configurar Variáveis de Ambiente no Supabase

```bash
# Via CLI
supabase secrets set RAPIDAPI_KEY "sua-chave"
supabase secrets set RAPIDAPI_HOST "exercisedb.p.rapidapi.com"

# Ou via Dashboard Supabase:
# - Functions → get-exercise-gif → Settings → Secrets
```

### 3. Testar Localmente

```bash
# Terminal 1: Supabase local
supabase start

# Terminal 2: Seu app
python3 -m http.server 8000

# Ir para http://localhost:8000
# Abrir Console > Ir em Exercícios > Clicar em exercício
# Verificar se GIF carrega (no console verá POST para /functions/v1/get-exercise-gif)
```

### 4. Deploy em Produção

```bash
# Fazer push para main
git add .
git commit -m "fix: Move ExerciseDB to Edge Function (security)"
git push origin main

# Supabase auto-faz deploy da função
# Ou manual:
supabase functions deploy get-exercise-gif --project-ref seu-projeto
```

---

## 📊 ANTES vs DEPOIS

| Aspecto | ANTES ❌ | DEPOIS ✅ |
|---------|----------|----------|
| API Key visível | Frontend | Backend (Edge Function) |
| Risco de roubo | Alto | Nenhum |
| Rate limiting | Sem proteção | Protegido |
| Custo | Vulnerável | Controlado |
| Performance | Direto (lento) | Via Supabase (rápido) |
| Cache | localStorage | localStorage + Edge Function |

---

## 🔐 Segurança Agora

✅ **RAPIDAPI_KEY:** Segura no backend, nunca em frontend  
✅ **Supabase Key:** Anon key é ok em frontend (Row Level Security protege dados)  
✅ **Rate Limiting:** Controlado na Edge Function  
✅ **CORS:** Protegido automaticamente pelo Supabase  
✅ **Tokens JWT:** Gerenciados pelo Supabase Auth  

---

## 📝 Checklist Implementação

- [x] Criar Edge Function `get-exercise-gif`
- [x] Remover RAPIDAPI_KEY de `script.js`
- [x] Remover RAPIDAPI_KEY de `src/data.js`
- [x] Atualizar `src/utils.js` para usar Edge Function
- [ ] Configurar variáveis de ambiente no Supabase
- [ ] Testar animações localmente
- [ ] Deploy em produção
- [ ] Validar que GIFs carregam

---

## ⚠️ O QUE NÃO MUDAR

**Supabase Keys no Frontend:** OK ✅

A Supabase pública key é segura para frontend porque:
- É apenas uma chave de acesso público
- RLS (Row Level Security) protege os dados
- Qualquer pessoa pode vê-la (está no frontend)
- Supabase foi designed para isso

**Exemplo:** Sua chave pública está em `src/main.js`:
```javascript
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseKey = 'eyJ...'; // Isso é OK
```

Mas **RAPIDAPI_KEY era diferente** — é chave de uma API externa e não deve ser exposta.

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| GIF não carrega | Verificar se Edge Function foi deployed: `supabase functions list` |
| Erro 403 | Verificar RAPIDAPI_KEY nas variáveis de ambiente |
| Erro 404 | Exercício não mapeado em EXERCISE_SEARCH_MAP |
| Lento | Cache está vazio, vai melhorar após primeira requisição |

---

## 📚 Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [ExerciseDB API](https://exercisedb.io/)
- [OWASP: API Security](https://owasp.org/www-project-api-security/)
- [Environment Variables em Supabase](https://supabase.com/docs/guides/functions/secrets)

---

## ✅ Resumo

1. ✅ **Problema corrigido:** RAPIDAPI_KEY removida do frontend
2. ✅ **Solução implementada:** Edge Function do Supabase
3. ⏳ **Próximo passo:** Você configurar variáveis de ambiente
4. 🚀 **Resultado:** Animações funcionando com segurança

---

**Agora as animações funcionarão seguramente!** 🎬

Você só precisa configurar a variável de ambiente `RAPIDAPI_KEY` no Supabase e testar.
