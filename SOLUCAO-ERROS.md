# 🔴 ERROS ENCONTRADOS — Análise e Solução

**Screenshot mostra:**
```
TypeError: Failed to fetch at sendMessage (chat.js:118:28)
Failed to load resource: 404 (Not Found) para:
  - :5500/gifs/supino-inclinado.gif1
  - :5500/gifs/supino-declinado.gif1
  - :5500/gifs/supino-halter.gif1
```

---

## 🔴 ERRO #1: TypeError: Failed to fetch (chat.js:118)

### Causa
```
POST para https://oqqoafejnzoolbpskbji.supabase.co/functions/v1/chat-ai
FALHOU — Supabase não respondeu
```

### Possíveis razões:
1. ❌ **ANTHROPIC_API_KEY não configurado no Supabase**
2. ❌ **Edge Function chat-ai não foi deployada**
3. ❌ **Erro CORS**
4. ❌ **Supabase local não está rodando** (se testar localmente)

### ✅ Solução

**Se testando localmente:**
```bash
# Terminal 1 - Supabase
supabase start
```

**Se testando em produção:**
```bash
# Configurar ANTHROPIC_API_KEY
supabase secrets set ANTHROPIC_API_KEY "sua-chave-aqui"

# Verificar se foi configurado
supabase secrets list

# Deploy da função
supabase functions deploy chat-ai --project-ref seu-id
```

---

## 🔴 ERRO #2: 404 para GIFs locais (.gif1)

### Causa
```
GIFService tenta carregar gifs/{exerciseId}.gif
Arquivos não existem em pasta gifs/
Servidor retorna 404
```

### Por que tenta local?

```
GIFService.getGif() fluxo:
  1. Verifica cache localStorage
  2. Tenta carregar local: gifs/supino-inclinado.gif ← AQUI FALHA (não existe)
  3. Fallback: tenta fetchGifFromExerciseDB() via Edge Function
  4. Se falhar: cai em CSS fallback animation
```

### ✅ Solução

**Opção 1: Desabilitar busca de GIFs locais (recomendado)**

Se não há GIFs locais, descomentar e criar GIFs para esses exercícios:
```bash
# Você precisa dessas imagens em:
gifs/supino-reto.gif
gifs/agachamento.gif
gifs/puxada-frontal.gif
... etc
```

**Opção 2: Usar apenas Edge Function + Fallback CSS (mais simples)**

Remover a busca por GIFs locais:
```javascript
// gifs-data.js - Pular o passo 2 (não tentar local)
async getGif(exerciseId) {
  // 1. Verificar cache
  if (this._cache.has(exerciseId)) return this._cache.get(exerciseId);

  // 2. PULAR: Tentar GIF local (não há arquivos)
  
  // 3. Tentar ExerciseDB (mais importante)
  if (typeof fetchGifFromExerciseDB === 'function') {
    try {
      const url = await fetchGifFromExerciseDB(exerciseId);
      if (url) return url;
    } catch (e) { }
  }

  // 4. Fallback CSS animation
  return null;
}
```

---

## 🔧 O que fazer AGORA

### ✅ PASSO 1: Certificar que Supabase está rodando
```bash
# Terminal 1
supabase start
# Deve sair com: Supabase local ready on port 54321
```

### ✅ PASSO 2: Testar Edge Function chat-ai
```bash
# Terminal, no diretório do projeto
supabase functions deploy chat-ai

# Verificar deployment
supabase functions list
# Deve aparecer: chat-ai
```

### ✅ PASSO 3: Testar Edge Function get-exercise-gif
```bash
supabase functions deploy get-exercise-gif

# Verificar
supabase functions list
# Deve aparecer: get-exercise-gif
```

### ✅ PASSO 4: Configurar variáveis de ambiente
```bash
# Chat AI
supabase secrets set ANTHROPIC_API_KEY "sk-ant-seu-token"

# ExerciseDB
supabase secrets set RAPIDAPI_KEY "sua-chave-rapidapi"

# Verificar
supabase secrets list
```

### ✅ PASSO 5: Recarregar browser
```
1. Limpar cache (Ctrl+Shift+Del)
2. Recarregar página (Ctrl+Shift+R)
3. Abrir DevTools (F12)
4. Testar novamente
```

---

## 🧪 Testes de Diagnóstico

### Teste 1: Verificar se Edge Functions estão rodando
```javascript
// Console (F12)
fetch('http://localhost:54321/functions/v1/chat-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'oi' })
})
.then(r => r.json())
.then(d => console.log(d));

// Se retorna { reply: "..." } → OK ✅
// Se retorna erro → Problema ❌
```

### Teste 2: Verificar se get-exercise-gif funciona
```javascript
// Console (F12)
fetch('http://localhost:54321/functions/v1/get-exercise-gif', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    exerciseId: 'supino-reto',
    searchTerm: 'barbell bench press'
  })
})
.then(r => r.json())
.then(d => console.log(d));

// Se retorna { gifUrl: "https://..." } → OK ✅
// Se retorna { error: "API key not configured" } → Configure RAPIDAPI_KEY ❌
```

---

## 📊 Diagrama de Fluxo (Como Deveria Funcionar)

```
Usuário digita no chat
    ↓
sendMessage() chama Edge Function chat-ai
    ↓
Chat-ai usa ANTHROPIC_API_KEY
    ↓
Retorna resposta IA
    ↓
Mensagem aparece no chat ✅
```

```
Usuário clica em exercício
    ↓
openExerciseModal() chama fetchGifFromExerciseDB()
    ↓
Chama Edge Function get-exercise-gif
    ↓
get-exercise-gif usa RAPIDAPI_KEY
    ↓
Busca em ExerciseDB API
    ↓
Retorna GIF URL
    ↓
GIF aparece no modal ✅
```

---

## ⚠️ Se Mesmo Assim Não Funcionar

### Chat dando erro:
```
1. Abrir DevTools (F12)
2. Console
3. Colar:
   fetch('http://localhost:54321/functions/v1/chat-ai', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ message: 'teste' })
   }).then(r => r.json()).then(d => console.log(d));
4. Ver resposta
5. Se erro, enviar print para diagnóstico
```

### GIFs dando erro:
```
1. Abrir DevTools (F12)
2. Network tab
3. Clicar em exercício
4. Ver requisição para get-exercise-gif
5. Clicar na requisição
6. Ver Response (se tem gifUrl ou error)
7. Se erro, enviar print para diagnóstico
```

---

## ✅ Checklist Pré-Teste

- [ ] `supabase start` está rodando (Terminal 1)
- [ ] `supabase functions deploy chat-ai` foi executado
- [ ] `supabase functions deploy get-exercise-gif` foi executado
- [ ] `supabase secrets set ANTHROPIC_API_KEY` foi configurado
- [ ] `supabase secrets set RAPIDAPI_KEY` foi configurado
- [ ] Browser recarregado com Ctrl+Shift+R (limpar cache)
- [ ] DevTools (F12) aberto
- [ ] Console limpo (Ctrl+L)

---

**Depois de fazer isso, os erros devem sumir!** ✅
