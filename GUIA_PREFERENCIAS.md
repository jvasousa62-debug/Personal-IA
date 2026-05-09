# 📚 Guia: Salvar Preferências do Usuário no IRONFIT

## 🎯 O que foi implementado

Seu projeto agora tem:
1. ✅ **Página de Registro** (`register.html`) - usuários podem criar conta
2. ✅ **Funções de Preferências** (`script.js`) - guardar preferências localmente ou no Supabase
3. ❌ **Tabela no Supabase** - você precisa criar isso

---

## 🔧 Como Configurar as Preferências no Supabase

### **OPÇÃO 1: Salvar apenas no LocalStorage (RÁPIDO & SEM CONFIGURAÇÃO)**

As funções já estão prontas para salvar localmente! Use assim no seu código:

```javascript
// Salvar preferências do usuário
await saveUserPreferences({
    goal: 'hipertrofia',           // meta de treino
    experience_level: 'iniciante',  // nível de experiência
    weekly_frequency: 4,             // frequência de treinos por semana
    theme: 'dark',                   // tema da interface
    notifications: true              // notificações habilitadas
});

// Carregar preferências
const userPrefs = await loadUserPreferences();
console.log(userPrefs);

// Atualizar uma preferência específica
await updatePreference('theme', 'light');
```

**Vantagem:** Rápido, sem configuração  
**Desvantagem:** Dados perdidos se usuário limpar cache do navegador

---

### **OPÇÃO 2: Salvar no Supabase (RECOMENDADO - SINCRONIZA ENTRE DISPOSITIVOS)**

#### **Passo 1: Acessar Supabase Dashboard**

1. Vá para [supabase.com](https://supabase.com) e faça login
2. Clique no seu projeto `oqqoafejnzoolbpskbji`
3. No menu esquerdo, clique em **"SQL Editor"**

#### **Passo 2: Criar a Tabela user_preferences**

Cole este SQL no editor e execute:

```sql
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal VARCHAR(50),
  experience_level VARCHAR(50),
  weekly_frequency INTEGER,
  theme VARCHAR(20) DEFAULT 'dark',
  notifications BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'pt-BR',
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Habilitar Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode acessar suas próprias preferências
CREATE POLICY "Usuários acessam suas próprias preferências"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### **Passo 3: Configurar Acesso da Chave Anon**

1. Vá em **Settings** → **API**
2. Copie sua **anon/public key** (já está em script.js)
3. A tabela automaticamente dará acesso para usuários autenticados

---

## 💾 Como Usar as Funções de Preferências

### **Após o usuário fazer login, salvar suas preferências:**

```javascript
// Exemplo: Usuário escolhe sua meta de treino
async function setupUserAfterLogin() {
  const userGoal = 'hipertrofia'; // valores: 'hipertrofia', 'força', 'emagrecimento', 'resistencia'
  
  const preferences = {
    goal: userGoal,
    experience_level: 'intermediario',
    weekly_frequency: 4,
    theme: 'dark',
    notifications: true,
    language: 'pt-BR'
  };

  const saved = await saveUserPreferences(preferences);
  if (saved) {
    console.log('✅ Preferências salvas!');
  }
}
```

### **Carregar preferências ao entrar no app:**

```javascript
// No início de index.html ou no DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  const prefs = await loadUserPreferences();
  
  if (prefs) {
    console.log('Objetivo do usuário:', prefs.goal);
    console.log('Nível:', prefs.experience_level);
    
    // Personalizar interface com base nas preferências
    if (prefs.theme === 'light') {
      document.body.classList.add('light-theme');
    }
  }
});
```

### **Atualizar uma preferência específica:**

```javascript
// Usuário muda o tema
await updatePreference('theme', 'light');

// Usuário habilita notificações
await updatePreference('notifications', true);
```

### **Logout (limpar preferências):**

```javascript
async function handleLogout() {
  await supabaseClient.auth.signOut();
  clearUserPreferences();
  window.location.href = 'login.html';
}
```

---

## 📊 Estrutura da Tabela user_preferences

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único da preferência |
| `user_id` | UUID | ID do usuário (referencia auth.users) |
| `goal` | VARCHAR | Meta: 'hipertrofia', 'força', 'emagrecimento', 'resistencia' |
| `experience_level` | VARCHAR | Nível: 'iniciante', 'intermediario', 'avancado' |
| `weekly_frequency` | INTEGER | Quantos dias por semana treina (3-7) |
| `theme` | VARCHAR | 'dark' ou 'light' |
| `notifications` | BOOLEAN | Notificações habilitadas? true/false |
| `language` | VARCHAR | Idioma: 'pt-BR', 'en-US', etc |
| `created_at` | TIMESTAMP | Quando foi criada |
| `last_updated` | TIMESTAMP | Última atualização |

---

## 🚀 Exemplo Prático Completo

```javascript
// 1. APÓS REGISTRO BEM-SUCEDIDO (em register.html)
handleRegister() {
  // ... validações ...
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullname } }
  });

  if (!error && data.user) {
    // Salvar preferências padrão
    await saveUserPreferences({
      goal: 'hipertrofia',
      experience_level: 'iniciante',
      weekly_frequency: 3,
      theme: 'dark',
      notifications: true
    });
    
    // Redirecionar
    window.location.href = 'login.html';
  }
}

// 2. APÓS LOGIN (em index.html)
window.addEventListener('load', async () => {
  const prefs = await loadUserPreferences();
  
  if (prefs && prefs.goal) {
    // Mostrar plano recomendado baseado na meta
    const planKey = prefs.goal; // 'hipertrofia', 'forca', etc
    if (PLANS_DATA[planKey]) {
      // Iniciar com o plano apropriado
      showPlan(planKey);
    }
  }
});

// 3. QUANDO USUÁRIO MUDA PREFERÊNCIAS
async function updateUserGoal(newGoal) {
  const success = await updatePreference('goal', newGoal);
  if (success) {
    showMessage('✅ Meta atualizada!');
  }
}
```

---

## ⚠️ Verificação: Está Funcionando?

Abra o **DevTools** (F12) no navegador e veja os logs:

```javascript
// Deve mostrar:
✅ Supabase configurado com sucesso
✅ Preferências salvas com sucesso
✅ Preferências carregadas do Supabase
```

Se ver `⚠️` ou `❌`, verifique:
1. ✅ Tabela `user_preferences` foi criada no Supabase
2. ✅ Row Level Security está ativo
3. ✅ Usuário está logado (`getUser()` retorna um usuário)

---

## 🔒 Segurança

✅ **RLS (Row Level Security) ativo** - cada usuário vê apenas suas preferências  
✅ **Chave anon configurada** - não usa chave service_role  
✅ **Backup em localStorage** - se Supabase falhar, usa cache local

---

## 📝 Resumo do que fazer agora

1. ✅ **Ir para [console.prisma.io](https://console.prisma.io)** (ou seu dashboard Supabase)
2. ✅ **Copiar o SQL da tabela `user_preferences` acima**
3. ✅ **Executar no SQL Editor do Supabase**
4. ✅ **Pronto!** As funções já estão prontas em script.js

---

## ❓ Dúvidas Frequentes

**P: E se o usuário não tiver conta no Supabase?**  
R: As funções salvam em localStorage como fallback, então funciona offline também.

**P: Posso adicionar mais campos às preferências?**  
R: Sim! Altere a tabela e as funções `saveUserPreferences()` em script.js.

**P: Como sincronizar preferências entre o App e Web?**  
R: Ambos usam o mesmo `user_id` do Supabase, então sincronizam automaticamente.

---

**Criado para IRONFIT - Personal IA 💪**
