# ⚡ QUICK START — 30 Minutos para Animações Funcionarem

## 🎯 Objetivo
Configurar RAPIDAPI_KEY e testar animações funcionando seguramente.

---

## ✅ O QUE FOI FEITO (você não precisa fazer)

- ✅ RAPIDAPI_KEY removida do frontend (era crítico!)
- ✅ Supabase Edge Function criada como proxy seguro
- ✅ Código atualizado em 3 arquivos
- ✅ 5 documentos criados

**Você só precisa de 3 coisas:**

---

## 🚀 PASSO 1: Obter RAPIDAPI_KEY (5 min)

```
1. Ir para: https://rapidapi.com/api-sports/api/exercisedb
2. Clicar em "Subscribe to Test" (grátis)
3. No code snippets à direita, copiar o valor de "X-RapidAPI-Key"
   Exemplo: f2a8a15739msh6d74fd54a84778ep148338jsn6eab3c64a9fa
```

💾 **Guardar essa chave segura — vai usar próximo!**

---

## 🚀 PASSO 2: Configurar no Supabase (10 min)

### Opção A: Via CLI (rápido)
```bash
# Terminal
cd "c:\Users\mteso\OneDrive\Área de Trabalho\Projeto-Academia"

# Configurar chave
supabase secrets set RAPIDAPI_KEY "sua-chave-aqui"

# Pronto!
```

### Opção B: Via Dashboard
```
1. https://app.supabase.com
2. Seu projeto → Functions → get-exercise-gif
3. Settings → Secrets
4. Novo secret: RAPIDAPI_KEY = "sua-chave"
5. Salvar
```

---

## 🚀 PASSO 3: Testar Localmente (10 min)

### Terminal 1 — Supabase
```bash
cd "c:\Users\mteso\OneDrive\Área de Trabalho\Projeto-Academia"
supabase start
```

### Terminal 2 — Seu App
```bash
cd "c:\Users\mteso\OneDrive\Área de Trabalho\Projeto-Academia"
python -m http.server 8000
```

### Browser
```
1. Abrir http://localhost:8000
2. Fazer login (usar conta de teste)
3. Clicar em "Exercícios" ou começar um treino
4. Clicar em qualquer exercício
5. ✅ DEVE VER GIF ANIMADO!
```

---

## ✅ VALIDAÇÕES RÁPIDAS

### No Console (F12)
```javascript
// Teste 1: Verificar que NÃO há chave exposta
console.log(window.RAPIDAPI_KEY);  // undefined ✅

// Teste 2: Ver requisição sendo feita
// Abrir Network tab (F12)
// Clicar em exercício
// Ver "get-exercise-gif" na lista
// Headers: método POST, sem API keys ✅

// Teste 3: Ver GIF carregando
// Ir para "Elements" (F12)
// Procurar <img src="https://v2.exercisedb...">
// Se existir = funcionando! ✅
```

---

## 🚀 PASSO 4: Deploy (5 min)

Depois de testar:

```bash
# Fazer deploy da função para produção
supabase functions deploy get-exercise-gif --project-ref seu-projeto-id
```

**Onde pega seu-projeto-id?**
- https://app.supabase.com → Seu projeto → Settings → General → Project ID

---

## 📊 Testes Esperados

| O Quê | Esperado | Se não... |
|-------|----------|-----------|
| Página carrega | < 3s | Verificar console (F12) |
| Login funciona | ✅ | Usuário/senha corretos? |
| Clicar exercício | Modal abre | JavaScript error? (console) |
| GIF aparece | Animação | Ver [TESTE-ANIMACOES.md](TESTE-ANIMACOES.md) |
| Sem erros | Console limpo | Rolar para troubleshooting |

---

## 🐛 Troubleshooting Rápido

### "Erro: Cannot read property of undefined"
```
1. Verificar se RAPIDAPI_KEY foi configurado
2. Ver nome das chaves (case-sensitive)
```

### "GIF não carrega"
```
1. Abrir DevTools (F12)
2. Console → ver mensagens de erro
3. Network → ver status de /functions/v1/get-exercise-gif
   - 200 = OK
   - 500 = RAPIDAPI_KEY não configurada
   - 404 = Função não foi deployed
```

### "Erro 404 em Network"
```
supabase functions deploy get-exercise-gif
```

---

## 📁 Referência de Arquivos

| Arquivo | Para quê |
|---------|----------|
| `RESUMO-SEGURANCA.md` | Entender o que foi feito |
| `TESTE-ANIMACOES.md` | Testes mais detalhados |
| `CORRECAO-SEGURANCA.md` | Entender a segurança |
| `.env.example` | Ver variáveis necessárias |
| `supabase/functions/get-exercise-gif/index.ts` | Ver código da função |

---

## ⏱️ Timeline

```
Agora (5 min)      → Obter chave
+ 5 min            → Configurar no Supabase
+ 10 min           → Testar localmente
+ 5 min            → Deploy para produção
────────────────────
Total: 25 minutos ⚡
```

---

## ✅ Conclusão

Depois de fazer isso:

✅ Animações funcionam  
✅ Seguro (sem API keys no frontend)  
✅ Pronto para academias  

**Próximo:** Criar demo para academias!

---

**Pronto? Comece pelo PASSO 1!** 🚀
