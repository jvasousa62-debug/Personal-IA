/* ===========================
   IRONFIT — CHAT MODULE v1
   Contains: Chat logic, messaging, AI interaction
   =========================== */

// ===========================
// CACHE & STATE
// ===========================
let userBodyDataCache = null;
let periodizationCache = {};
let prefsCache = null;
let chatUsesPeriodization = 0;
let chatHistory = [];

// ===========================
// BODY DATA — METRICS INTEGRATION
// ===========================
async function getUserBodyData(forceRefresh = false) {
  if (userBodyDataCache && !forceRefresh) return userBodyDataCache;

  const profileStr = localStorage.getItem('ironfit_profile');
  const checkins = getCheckins();
  const latest = checkins[checkins.length - 1] || {};

  let profile = {};
  try { profile = profileStr ? JSON.parse(profileStr) : {}; } catch (e) { }

  const weight = parseFloat(latest.weight || profile.weight) || 75;
  const fat = parseFloat(latest.fat || profile.fat) || 18;
  const muscle = parseFloat(latest.muscle || profile.muscle) || 40;
  const height = parseFloat(latest.height || profile.height) || 175;
  const experience = profile.experience_level || 'intermediario';
  const goal = profile.goal || 'hipertrofia';
  const weeklyFreq = parseInt(profile.weekly_frequency) || 4;

  const measures = {
    chest: parseFloat(latest.chest || profile.chest) || null,
    waist: parseFloat(latest.waist || profile.waist) || null,
    hip: parseFloat(latest.hip || profile.hip) || null,
    armR: parseFloat(latest.armR || profile.arm_r) || null,
    thighR: parseFloat(latest.thighR || profile.thigh_r) || null,
  };

  let weightTrend = 0;
  const first = checkins[0] || {};
  if (first.weight && latest.weight && checkins.length > 1) {
    const days = (Date.now() - new Date(first.date).getTime()) / (24 * 60 * 60 * 1000);
    if (days > 0) weightTrend = parseFloat(((weight - parseFloat(first.weight)) / (days / 7)).toFixed(2));
  }

  const currentWeek = Math.min(Math.max(1, checkins.length > 0
    ? Math.ceil((Date.now() - new Date(checkins[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 1), 12);

  if (!prefsCache) {
    try { prefsCache = JSON.parse(localStorage.getItem('ironfit_prefs') || '{}'); } catch (e) { prefsCache = {}; }
  }

  userBodyDataCache = {
    weight, fat, muscle, height,
    imc: calcIMC(weight, height),
    experience, goal, weeklyFreq,
    measures,
    weightTrend,
    checkinsCount: checkins.length,
    currentWeek,
    leanMass: Math.round(weight * (1 - fat / 100)),
    isBeginner: experience === 'iniciante',
    isAdvanced: experience === 'avancado',
    bfCategory: fat < 15 ? 'lean' : fat < 25 ? 'medium' : 'high',
    prefs: { ...prefsCache },
  };

  return userBodyDataCache;
}

// ===========================
// CHAT — FASTER AI
// ===========================
async function sendMessage(userText) {
  if (!userText.trim()) return;

  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  input.value = '';
  sendBtn.disabled = true;

  appendMessage('user', userText);
  chatHistory.push({ role: 'user', content: userText });

  // 🔥 SALVAR MENSAGEM DO USUÁRIO
  if (supabaseClient) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
      await supabaseClient.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: userText
      });
    }
  }

  const typingId = showTyping();
  if (!supabaseClient) {
    console.error('Supabase client não carregado');
    return;
  }
  try {
    // 1. Pegar sessão do usuário (AUTH)
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session?.access_token) {
      throw new Error('❌ Sessão expirada. Faça login novamente.');
    }

    // 2. Chamar Edge Function do Supabase
    console.log('📤 Enviando mensagem para IA...');
    console.log('🔐 Token presente:', !!session.access_token);
    console.log('📚 Histórico local:', chatHistory.length, 'mensagens');
    
    const response = await fetch(
      'https://oqqoafejnzoolbpskbji.supabase.co/functions/v1/chat-ai',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userText,
          history: chatHistory.slice(-10) // Enviar últimas 10 mensagens do histórico local
        })
      }
    );

    removeTyping(typingId);

    console.log('📡 Response status:', response.status);

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Erro ao decodificar resposta' };
      }
      console.error('❌ Erro da API (Status ' + response.status + '):', errorData);
      
      // Se for erro 401/403, pode ser token expirado
      if (response.status === 401 || response.status === 403) {
        throw new Error('🔐 Erro de autenticação. Faça login novamente.');
      }
      
      throw new Error(errorData.error || `❌ Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida:', data);
    
    const aiReply = data?.reply || '';

    if (!aiReply || !aiReply.trim()) {
      console.warn('⚠️ Resposta vazia:', data);
      throw new Error('Resposta vazia recebida da IA');
    }

    // ✅ SALVAR E EXIBIR RESPOSTA DA IA
    chatHistory.push({ role: 'assistant', content: aiReply });
    appendMessage('ai', aiReply);
    console.log('✅ Mensagem da IA exibida');
    
    if (supabaseClient) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: aiReply
        });
      }
    }

  } catch (e) {
    console.error('❌ ERRO NO CHAT:', e.message);
    console.error('🔍 Stack:', e.stack);
    removeTyping(typingId);
    
    // ⚠️ FALLBACK: Usar resposta inteligente local
    console.log('📚 Usando fallback inteligente...');
    const fallback = buildSmartResponse(userText);
    chatHistory.push({ role: 'assistant', content: fallback });
    appendMessage('ai', fallback);
    
    // ✅ SALVAR RESPOSTA DE FALLBACK
    if (supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('chat_messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: fallback
          });
        }
      } catch (saveError) {
        console.error('Erro ao salvar fallback:', saveError);
      }
    }
  }

  sendBtn.disabled = false;
}

// ===========================
// RESETAR CHAT
// ===========================
async function resetChat() {
  // Confirmação dupla para evitar exclusões acidentais
  if (!confirm('⚠️ AVISO: Tem certeza que quer limpar PERMANENTEMENTE todo o histórico do chat?\n\nEssa ação NÃO pode ser desfeita!')) {
    return;
  }

  if (!confirm('🔥 CONFIRMAR: Deletar TODAS as mensagens do banco de dados?')) {
    return;
  }

  const resetBtn = document.getElementById('resetChatBtn');
  if (resetBtn) resetBtn.disabled = true;

  try {
    console.log('🔄 Iniciando exclusão permanente do chat...');

    // 1. Limpar histórico local
    chatHistory = [];

    // 2. DELETAR DO BANCO DE DADOS (PERMANENTE)
    if (supabaseClient) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Não foi possível obter dados do usuário. Faça login novamente.');
      }

      // Deletar todas as mensagens do usuário (PERMANENTEMENTE)
      const { error: deleteError } = await supabaseClient
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar do banco:', deleteError);
        throw new Error(`Erro ao deletar: ${deleteError.message}`);
      }

      console.log('✅ Mensagens deletadas do banco de dados');
    }

    // 3. LIMPAR UI
    const container = document.getElementById('chatMessages');
    if (container) {
      container.innerHTML = `
        <div class="msg-wrapper ai">
          <div class="msg-avatar">IA</div>
          <div class="msg-bubble ai">
            <p>✅ Chat resetado com SUCESSO!</p>
            <p style="margin-top:8px;">Todas as mensagens foram deletadas permanentemente.</p>
            <p style="margin-top:8px;"><strong>Como posso ajudar você agora?</strong></p>
          </div>
        </div>
      `;
    }

    console.log('✅ Chat resetado com sucesso - histórico limpo permanentemente');
    alert('✅ Histórico do chat deletado permanentemente!');

  } catch (e) {
    console.error('❌ Erro ao resetar chat:', e.message);
    alert(`❌ Erro ao resetar o chat:\n\n${e.message}\n\nTente novamente ou contate o suporte.`);
  } finally {
    if (resetBtn) resetBtn.disabled = false;
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'ai' ? 'IA' : 'U';
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${role}`;
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('chatMessages');
  if (!container) return id;
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-wrapper ai';
  wrapper.id = id;
  wrapper.innerHTML = `<div class="msg-avatar">IA</div><div class="msg-bubble ai"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setupChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  if (!input || !sendBtn) return;

  sendBtn.addEventListener('click', () => { const txt = input.value.trim(); if (txt) sendMessage(txt); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const txt = input.value.trim(); if (txt) sendMessage(txt); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const message = (btn.dataset.msg || btn.textContent || '').toString().trim();
      if (!message) return;
      btn.disabled = true;
      sendMessage(message).finally(() => { btn.disabled = false; });
    });
  });

  // 🔥 EVENT LISTENER: RESETAR CHAT
  const resetBtn = document.getElementById('resetChatBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetChat);
  }

  // 🔥 CARREGAR HISTÓRICO DO USUÁRIO
  (async () => {
    if (!supabaseClient) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      data.forEach(msg => {
        appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
        chatHistory.push({ role: msg.role, content: msg.content });
      });
    }
  })();

  // Pré-carregar dados corporais em background
  getUserBodyData().catch(() => { });
}

// ===========================
// USER DATA LOADING
// ===========================
async function loadUserData() {
  const isLoggedInLocal = localStorage.getItem('ironfit_loggedIn') === 'true';
  const userEmail = localStorage.getItem('ironfit_userEmail');

  function applyUserToUI(displayName, email, avatarUrl) {
    const firstName = displayName.split(' ')[0];
    if (document.getElementById('userName')) document.getElementById('userName').textContent = `Bem-vindo ${firstName}`;
    if (document.getElementById('userGoal')) document.getElementById('userGoal').textContent = email;
    if (document.getElementById('userMenuEmail')) document.getElementById('userMenuEmail').textContent = email;
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = avatarUrl
        ? `<img src="${avatarUrl}" alt="${firstName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : firstName.charAt(0).toUpperCase();
    }
  }

  function resolveProfileName(fallback) {
    try {
      const p = JSON.parse(localStorage.getItem('ironfit_profile') || '{}');
      return p.full_name || fallback;
    } catch (e) { return fallback; }
  }

  if (isLoggedInLocal && userEmail) {
    const name = resolveProfileName(userEmail.split('@')[0]);
    applyUserToUI(name, userEmail, localStorage.getItem('ironfit_avatar'));
    return;
  }

  if (!supabaseClient) { console.warn('⚠️ Supabase não disponível, modo offline'); return; }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) { console.warn('⚠️ Usuário não autenticado, modo offline'); return; }
    const name = resolveProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário');
    applyUserToUI(name, user.email, localStorage.getItem('ironfit_avatar'));
  } catch (err) {
    console.error('❌ Erro ao carregar usuário:', err.message);
    console.warn('⚠️ Continuando em modo offline');
  }
}
