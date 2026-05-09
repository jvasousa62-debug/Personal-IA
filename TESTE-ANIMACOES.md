# 🧪 TESTE DE ANIMAÇÕES — Quick Start

## ⚡ Pré-requisitos

- [x] Supabase CLI instalado: `npm install -g supabase`
- [x] RAPIDAPI_KEY configurada no Supabase
- [x] código-fonte atualizado ✅

---

## 📋 Passo 1: Configurar Variáveis de Ambiente

### 1.1 - Pegar sua RAPIDAPI_KEY

1. Ir para https://rapidapi.com/api-sports/api/exercisedb
2. Se não tiver conta, criar (grátis)
3. Clicar em "Subscribe to Test"
4. Copiar a chave em "X-RapidAPI-Key" (no code snippet à direita)

### 1.2 - Adicionar no Supabase

Via CLI:
```bash
supabase secrets set RAPIDAPI_KEY "sua-chave-aqui"
```

Ou via Dashboard:
1. https://app.supabase.com
2. Seu projeto → Functions → get-exercise-gif
3. Settings → Secrets
4. Adicionar `RAPIDAPI_KEY` = sua chave
5. Salvar

---

## 🏃 Passo 2: Testar Localmente

```bash
# Terminal 1: Iniciar Supabase local
supabase start

# Terminal 2: Seu projeto
cd "c:\Users\mteso\OneDrive\Área de Trabalho\Projeto-Academia"

# Iniciar servidor local (Python)
python -m http.server 8000

# Ou com Node
npx http-server .
```

---

## 🧪 Passo 3: Testar Animações

### Via Browser

1. Abrir http://localhost:8000
2. Login (usar credenciais de teste)
3. Ir para "Exercícios" ou iniciar um treino
4. **Clicar em qualquer exercício**
5. Deve abrir modal com:
   - ✅ Nome do exercício
   - ✅ Descrição
   - ✅ **GIF ANIMADO** ← verificar isso!

### Verificar no Console

```javascript
// Abrir DevTools (F12) → Console
// Executar:

// Teste 1: Verificar se Edge Function está acessível
fetch('https://seu-projeto.supabase.co/functions/v1/get-exercise-gif', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    exerciseId: 'supino-reto',
    searchTerm: 'barbell bench press'
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d));

// Teste 2: Ver cache
// (em gifs-data.js)
console.log('Cache:', GIFService.gifCache);

// Teste 3: Testar busca específica
GIFService.getGif('agachamento-livre')
  .then(url => console.log('GIF URL:', url));
```

---

## ✅ Checklist de Testes

### Teste Funcional

- [ ] Página carrega sem erros
- [ ] Login funciona
- [ ] Clicar em exercício abre modal
- [ ] GIF animado aparece no modal
- [ ] GIF diferente para exercícios diferentes
- [ ] GIF não trava animação
- [ ] Modal fecha corretamente

### Teste de Performance

- [ ] Primeira requisição: ~1-2 segundos (API call)
- [ ] Requisições seguintes: <100ms (cache)
- [ ] Sem mensagens de erro no console

### Teste de Segurança

```javascript
// NO CONSOLE — Verificar que NÃO aparece chave
console.log(window.RAPIDAPI_KEY); // undefined ✅
console.log(window.RAPIDAPI_HOST); // undefined ✅

// Verificar que chave NÃO sai do servidor
// Abrir Network tab (F12)
// Clicar em exercício
// Ver requisição POST para /functions/v1/get-exercise-gif
// ✅ Headers NÃO devem conter x-rapidapi-key
// ✅ Body deve conter apenas { exerciseId, searchTerm }
```

---

## 🎯 Exercícios para Testar

Esses têm GIF mapeado (100% devem funcionar):

```javascript
// Lista de 10 exercícios com animação garantida:
const testExercises = [
  'supino-reto',        // barbell bench press
  'rosca-barra',        // barbell curls
  'agachamento-livre',  // barbell squat
  'rosca-haltere',      // dumbbell curl
  'puxada-alta',        // lat pulldown
  'leg-press',          // leg press
  'crucifixo-polia',    // cable fly
  'terrinha-barra',     // barbell military press
  'leg-curl',           // leg curl
  'pull-up'             // pull ups
];

// Testar cada um:
for (const ex of testExercises) {
  GIFService.getGif(ex).then(url => {
    console.log(`${ex}: ${url ? '✅ OK' : '❌ FAIL'}`);
  });
}
```

---

## 🐛 Troubleshooting

### GIF não carrega

```javascript
// 1. Verificar se função está respondendo
const test = await fetch('...get-exercise-gif', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ exerciseId: 'supino', searchTerm: 'bench' })
});
console.log('Status:', test.status); // Deve ser 200
const data = await test.json();
console.log('Data:', data); // { gifUrl: 'https://...', cached: false }

// 2. Se erro 500 → RAPIDAPI_KEY não configurada
// 3. Se erro 404 → Função não foi deployed
```

### Erro: "exerciseId is not in EXERCISE_SEARCH_MAP"

```javascript
// Alguns exercícios podem não estar mapeados
// Verificar em gifs-data.js qual chave usar

// Exemplo:
// Se não funciona com 'supino', tente:
GIFService.getGif('supino-reto'); // Chave correta
```

### Lento

```javascript
// Cache está vazio na primeira vez
// Vai melhorar drasticamente depois

// Verificar cache:
GIFService.gifCache; // { 'supino': 'https://...', ... }
localStorage.getItem('ironfit_gif_cache'); // JSON com GIFs cached
```

---

## 📊 Métricas Esperadas

| Métrica | Esperado | Ruim |
|---------|----------|------|
| Tempo 1ª requisição | 1-3s | >5s |
| Tempo 2ª requisição | <100ms | >1s |
| Taxa de sucesso | 95%+ | <80% |
| Erros 404 | <5% | >20% |
| Erros 403 | 0% | >0% |

---

## 🚀 Deploy em Produção

Depois de testar e tudo OK:

```bash
# 1. Fazer push do código
git add .
git commit -m "feat: Add secure ExerciseDB animations via Edge Function"
git push origin main

# 2. Deploy da Edge Function (se não for auto)
supabase functions deploy get-exercise-gif --project-ref seu-projeto-id

# 3. Verificar em produção
# - Ir para seu-dominio.com
# - Testar animações
# - Verificar Network tab (POST para /functions/v1/get-exercise-gif)
```

---

## ✅ Conclusão

Se todos os testes passarem:

✅ **Animações funcionando**  
✅ **Segurança OK (sem API keys expostas)**  
✅ **Performance OK (com cache)**  
✅ **Pronto para academias!**

---

**Próximo passo:** Depois de validar, adicionar este teste em um arquivo de CI/CD (GitHub Actions)
