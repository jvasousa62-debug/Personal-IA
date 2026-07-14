(function () {
  const state = {
    client: null,
    user: null,
    profile: null,
    academy: null,
    students: [],
    subscription: null,
    events: []
  };

  const $ = (selector) => document.querySelector(selector);
  const dateFmt = new Intl.DateTimeFormat('pt-BR');

  function initSupabaseClient() {
    const config = window.IronFitConfig?.SUPABASE_CONFIG;
    const url = config?.url || document.querySelector('meta[name="supabase-url"]')?.content;
    const key = config?.key || document.querySelector('meta[name="supabase-key"]')?.content;
    
    console.log('🔍 [DEBUG] Inicializando Supabase com URL:', url ? 'OK' : 'FALTA');
    
    if (!url || !key || !window.supabase) {
      console.error('❌ [DEBUG] Supabase não configurado corretamente');
      return null;
    }
    return window.supabase.createClient(url, key);
  }

  function showAlert(message, type = 'info') {
    const alert = $('#academyAlert');
    if (!alert) return;
    alert.textContent = message;
    alert.className = `academy-alert ${type}`;
    window.clearTimeout(showAlert.timer);
    showAlert.timer = window.setTimeout(() => alert.classList.add('hidden'), 4600);
  }

  function setLoading(isLoading) {
    $('#academyLoading')?.classList.toggle('hidden', !isLoading);
    $('#academyContent')?.classList.toggle('hidden', isLoading);
  }

  function denyAccess(message) {
    console.error('❌ ACESSO NEGADO:', message);
    setLoading(false);
    $('#academyContent')?.classList.add('hidden');
    const denied = $('#academyDenied');
    if (denied) {
      denied.classList.remove('hidden');
      denied.querySelector('p').textContent = message;
    }
  }

  function formatDate(value) {
    if (!value) return 'Sem acesso';
    try {
      return dateFmt.format(new Date(value));
    } catch (error) {
      return 'Sem acesso';
    }
  }

  function daysSince(value) {
    if (!value) return Infinity;
    return Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  }

  function planLabel(plan) {
    return window.IronFitPlanConfig?.getPlanLabel?.(plan) || ({
      basic: 'Plano Simples',
      pro: 'Plano Pro',
      premium: 'Plano Premium',
      enterprise: 'Plano Enterprise'
    }[(plan || 'basic').toString().toLowerCase()] || 'Plano Simples');
  }

  function studentStatus(student) {
    if (student.account_status !== 'active') return student.account_status || 'inactive';
    return daysSince(student.last_seen_at) > 7 ? 'inactive' : 'active';
  }

  function statusLabel(status) {
    return {
      active: 'Ativo',
      inactive: 'Inativo',
      blocked: 'Bloqueado',
      deleted: 'Removido',
      canceled: 'Cancelado'
    }[status] || status || '-';
  }

  // ✅ FIX: Aguardar e validar sessão do Supabase antes de usar
  async function ensureSessionValid() {
    console.log('🔍 [DEBUG] Verificando sessão do Supabase...');
    
    if (!state.client) {
      console.error('❌ [DEBUG] Client não inicializado');
      return false;
    }

    try {
      // Tentar obter sessão atual
      const { data, error } = await state.client.auth.getSession();
      
      console.log('🔍 [DEBUG] getSession result:', {
        hasSession: !!data?.session,
        user: data?.session?.user?.email,
        error: error?.message
      });

      if (error) {
        console.error('❌ [DEBUG] Erro ao obter sessão:', error.message);
        return false;
      }

      if (!data?.session) {
        console.warn('⚠️ [DEBUG] Nenhuma sessão ativa encontrada');
        return false;
      }

      console.log('✅ [DEBUG] Sessão válida');
      return true;
    } catch (err) {
      console.error('❌ [DEBUG] Erro ao verificar sessão:', err.message);
      return false;
    }
  }

  async function loadAcademy() {
    console.log('🔍 [DEBUG] Iniciando loadAcademy...');
    setLoading(true);
    $('#academyDenied')?.classList.add('hidden');

    state.client = initSupabaseClient();
    
    if (!state.client) {
      denyAccess('Supabase nao esta configurado nesta pagina.');
      return;
    }

    // ✅ FIX: Verificar se a sessão está válida ANTES de chamar getUser
    const sessionValid = await ensureSessionValid();
    if (!sessionValid) {
      console.error('❌ [DEBUG] Sessão inválida. Tentando forçar atualização...');
      denyAccess('Sessao expirada. Faça login novamente.');
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '../login.html';
      }, 2000);
      return;
    }

    // ✅ Agora sim, tentar obter o usuário
    const { data: userData, error: userError } = await state.client.auth.getUser();
    console.log('🔍 [DEBUG] getUser result:', { 
      user: userData?.user?.email, 
      error: userError?.message 
    });
    
    if (userError || !userData?.user) {
      console.error('❌ [DEBUG] Erro ao obter usuário:', userError?.message);
      denyAccess('Faca login antes de abrir a area da academia.');
      return;
    }

    state.user = userData.user;
    console.log('✅ [DEBUG] User autenticado:', state.user.email);

    const { data: profile, error: profileError } = await state.client
      .from('user_profiles')
      .select('user_id,email,full_name,role,account_status,academy_id')
      .eq('user_id', state.user.id)
      .maybeSingle();

    console.log('🔍 [DEBUG] Profile carregado:', {
      email: profile?.email,
      role: profile?.role,
      account_status: profile?.account_status,
      academy_id: profile?.academy_id,
      error: profileError?.message
    });

    const storedRole = (localStorage.getItem('ironfit_userRole') || '').toLowerCase();
    const role = (profile?.role || storedRole || '').toLowerCase();
    const accountStatus = profile?.account_status || 'active';
    const isAdmin = role === 'admin';
    const isAcademyOwner = role === 'academy_owner';
    
    console.log('🔍 [DEBUG] Verificação de acesso:', {
      storedRole,
      role,
      accountStatus,
      isAdmin,
      isAcademyOwner,
      canAccess: (isAdmin || isAcademyOwner) && accountStatus === 'active'
    });
    
    const canAccessAcademy = (isAdmin || isAcademyOwner) && accountStatus === 'active';

    if (!canAccessAcademy) {
      if (!isAdmin && !isAcademyOwner) {
        denyAccess(`Esta area e exclusiva para donos de academia. Seu role: "${role}"`);
      } else if (accountStatus !== 'active') {
        denyAccess(`Sua conta esta com status: "${accountStatus}". Deve ser "active".`);
      } else {
        denyAccess('Sua conta nao tem permissao para gerir uma academia.');
      }
      return;
    }

    console.log('✅ [DEBUG] Acesso concedido! Carregando dados...');

    state.profile = profile || {
      user_id: state.user.id,
      email: state.user.email,
      full_name: state.user.user_metadata?.full_name || state.user.email,
      role,
      account_status: accountStatus,
      academy_id: null
    };
    await refreshData();
  }

  async function refreshData() {
    console.log('🔍 [DEBUG] Iniciando refreshData...');
    
    // ✅ FIX: Validar que state.user existe antes de continuar
    if (!state.user || !state.user.id) {
      console.error('❌ [DEBUG] state.user não está definido');
      denyAccess('Erro: usuario nao autenticado');
      return;
    }
    
    setLoading(true);

    let academies = [];
    let academyError = null;

    const { data: ownedAcademies, error: ownedError } = await state.client
      .from('academies')
      .select('id,name,status,access_code,student_limit,validity_months,expires_at,owner_user_id,plan')
      .eq('owner_user_id', state.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('🔍 [DEBUG] Academias do owner:', { count: ownedAcademies?.length, error: ownedError?.message });

    if (!ownedError && ownedAcademies?.length) {
      academies = ownedAcademies;
      console.log('✅ [DEBUG] Academia encontrada por owner_user_id');
    } else if (state.profile?.academy_id) {
      console.log('🔍 [DEBUG] Procurando por academy_id:', state.profile.academy_id);
      const { data: linkedAcademies, error: linkedError } = await state.client
        .from('academies')
        .select('id,name,status,access_code,student_limit,validity_months,expires_at,owner_user_id,plan')
        .eq('id', state.profile.academy_id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('🔍 [DEBUG] Resultado da busca:', { count: linkedAcademies?.length, error: linkedError?.message });

      academies = linkedAcademies || [];
      academyError = linkedError;

      if (academies?.[0] && !academies[0].owner_user_id) {
        console.log('🔍 [DEBUG] Atualizando owner_user_id da academia...');
        const { error: linkError } = await state.client
          .from('academies')
          .update({ owner_user_id: state.user.id, updated_at: new Date().toISOString() })
          .eq('id', academies[0].id);

        if (!linkError) {
          academies[0].owner_user_id = state.user.id;
          console.log('✅ [DEBUG] owner_user_id atualizado com sucesso');
        } else {
          console.error('❌ [DEBUG] Erro ao atualizar owner_user_id:', linkError.message);
        }
      }
    } else {
      console.log('⚠️ [DEBUG] Nenhuma academia encontrada');
      academyError = ownedError;
    }

    if (academyError || !academies?.length) {
      console.error('❌ [DEBUG] Erro ao carregar academia:', { error: academyError?.message, count: academies?.length });
      renderEmptyState();
      return;
    }

    state.academy = academies[0];
    console.log('✅ [DEBUG] Academia selecionada:', state.academy.name);

    const [studentsResult, subscriptionResult, eventsResult] = await Promise.all([
      state.client
        .from('user_profiles')
        .select('user_id,email,full_name,account_status,plan,last_seen_at,created_at')
        .eq('academy_id', state.academy.id)
        .order('full_name', { ascending: true }),
      state.client
        .from('subscriptions')
        .select('id,academy_id,status,plan,monthly_amount,next_billing_at,started_at,canceled_at')
        .eq('academy_id', state.academy.id)
        .order('created_at', { ascending: false })
        .limit(1),
      state.client
        .from('academy_workout_events')
        .select('id,user_id,event_type,occurred_at,title')
        .eq('academy_id', state.academy.id)
        .order('occurred_at', { ascending: false })
        .limit(1000)
    ]);

    console.log('🔍 [DEBUG] Dados carregados:', {
      students: studentsResult.data?.length,
      subscription: subscriptionResult.data?.length,
      events: eventsResult.data?.length,
      errors: [studentsResult.error?.message, subscriptionResult.error?.message, eventsResult.error?.message]
    });

    const firstError = studentsResult.error || subscriptionResult.error;
    if (firstError) {
      denyAccess(`Nao foi possivel carregar os dados: ${firstError.message}`);
      return;
    }

    state.students = studentsResult.data || [];
    state.subscription = subscriptionResult.data?.[0] || null;
    state.events = eventsResult.error ? [] : (eventsResult.data || []);

    console.log('✅ [DEBUG] Dados processados com sucesso. Renderizando...');
    renderAll();
    setLoading(false);
    console.log('✅ [DEBUG] loadAcademy concluído com sucesso!');
  }

  function renderEmptyState() {
    setLoading(false);
    $('#academyContent')?.classList.add('hidden');
    const denied = $('#academyDenied');
    if (denied) {
      denied.classList.remove('hidden');
      denied.querySelector('p').textContent = 'Ainda nao existe uma academia vinculada a esta conta. O admin pode vincular a academia para liberar o painel.';
    }
  }

  function renderAll() {
    $('#academyTitle').textContent = state.academy.name;
    $('#growthAcademyName').textContent = state.academy.name;
    $('#academyCode').textContent = state.academy.access_code;
    renderStudents();
    renderReports();
    renderPlan();
  }

  function renderStudents() {
    const query = ($('#studentSearch')?.value || '').toLowerCase();
    const students = state.students.filter((student) => {
      const text = `${student.full_name || ''} ${student.email || ''}`.toLowerCase();
      return text.includes(query);
    });

    const active = state.students.filter((student) => studentStatus(student) === 'active').length;
    const inactive = state.students.filter((student) => studentStatus(student) === 'inactive').length;

    $('#studentMetrics').innerHTML = [
      ['Alunos ativos', active, `${state.students.length} vinculados`],
      ['Alunos inativos', inactive, '7+ dias sem acesso'],
      ['Limite', state.academy.student_limit, `${state.students.length} usando`],
      ['Status da academia', statusLabel(state.academy.status), state.academy.access_code]
    ].map(([label, value, note]) => metric(label, value, note)).join('');

    $('#studentsTableBody').innerHTML = students.map((student) => {
      const status = studentStatus(student);
      return `
        <tr data-user-id="${student.user_id}">
          <td>
            <div class="academy-student-name">${student.full_name || student.email || 'Aluno sem nome'}</div>
            <div class="academy-muted">${student.email || student.user_id}</div>
          </td>
          <td><span class="academy-status ${status}">${statusLabel(status)}</span></td>
          <td>${formatDate(student.last_seen_at)}</td>
          <td>${planLabel(student.plan || state.academy.plan || 'basic')}</td>
          <td><button class="academy-danger-btn" type="button" data-action="remove-student">Remover</button></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5">Nenhum aluno encontrado.</td></tr>';
  }

  function renderReports() {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const recentEvents = state.events.filter((event) => new Date(event.occurred_at).getTime() >= thirtyDaysAgo);
    const activeStudents = state.students.filter((student) => student.account_status === 'active');
    const avgFrequency = activeStudents.length ? (recentEvents.length / activeStudents.length).toFixed(1) : '0.0';

    $('#reportMetrics').innerHTML = [
      ['Alunos ativos', activeStudents.length, `${state.students.length} cadastrados`],
      ['Treinos concluidos', state.events.length, `${recentEvents.length} nos ultimos 30 dias`],
      ['Frequencia media', avgFrequency, 'treinos/aluno em 30 dias'],
      ['Sem acesso 7+ dias', state.students.filter((student) => daysSince(student.last_seen_at) > 7).length, 'precisam de reativacao']
    ].map(([label, value, note]) => metric(label, value, note)).join('');

    const eventCount = new Map();
    state.events.forEach((event) => eventCount.set(event.user_id, (eventCount.get(event.user_id) || 0) + 1));
    const engaged = [...state.students]
      .map((student) => ({ student, count: eventCount.get(student.user_id) || 0 }))
      .sort((a, b) => b.count - a.count || (b.student.last_seen_at || '').localeCompare(a.student.last_seen_at || ''))
      .slice(0, 6);

    $('#engagedStudents').innerHTML = engaged.map(({ student, count }) => `
      <div class="academy-list-row">
        <div>
          <div class="academy-list-title">${student.full_name || student.email}</div>
          <div class="academy-list-meta">${count} treinos · ultimo acesso ${formatDate(student.last_seen_at)}</div>
        </div>
      </div>
    `).join('') || '<p class="academy-muted">Sem dados de engajamento ainda.</p>';

    const inactive = state.students
      .filter((student) => daysSince(student.last_seen_at) > 7)
      .sort((a, b) => daysSince(b.last_seen_at) - daysSince(a.last_seen_at))
      .slice(0, 8);

    $('#inactiveStudents').innerHTML = inactive.map((student) => `
      <div class="academy-list-row">
        <div>
          <div class="academy-list-title">${student.full_name || student.email}</div>
          <div class="academy-list-meta">${daysSince(student.last_seen_at) === Infinity ? 'Nunca acessou' : `${daysSince(student.last_seen_at)} dias sem acessar`}</div>
        </div>
      </div>
    `).join('') || '<p class="academy-muted">Nenhum aluno parado ha mais de 7 dias.</p>';
  }

  function renderPlan() {
    const subscription = state.subscription;
    const plan = planLabel(state.academy.plan || subscription?.plan || 'basic');
    const nextBilling = subscription?.next_billing_at || state.academy.expires_at;
    const used = state.students.length;
    const limit = Number(state.academy.student_limit || 0);
    const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    $('#planCard').innerHTML = [
      ['Plano atual', plan],
      ['Limite', `${limit} alunos`],
      ['Usando', `${used} alunos`],
      ['Pagamento', 'Direto com IRONFIT'],
      ['Validade', formatDate(nextBilling)]
    ].map(([label, value]) => `
      <div class="academy-plan-row"><span>${label}</span><strong>${value}</strong></div>
    `).join('');

    $('#limitUsage').innerHTML = `
      <div class="academy-metric-value">${used} / ${limit}</div>
      <div class="academy-limit-bar"><span style="width:${pct}%"></span></div>
      <p class="academy-muted">${pct}% do limite utilizado.</p>
    `;
  }

  function metric(label, value, note) {
    return `
      <article class="academy-metric">
        <div class="academy-metric-label">${label}</div>
        <div class="academy-metric-value">${value}</div>
        <div class="academy-metric-note">${note}</div>
      </article>
    `;
  }

  async function removeStudent(row) {
    const userId = row.dataset.userId;
    const ok = window.confirm('Remover este aluno da academia? A conta dele continua existindo.');
    if (!ok) return;

    const { error } = await state.client
      .from('user_profiles')
      .update({ academy_id: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('academy_id', state.academy.id);

    if (error) {
      showAlert(`Erro ao remover aluno: ${error.message}`, 'error');
      return;
    }

    showAlert('Aluno removido da academia.');
    await refreshData();
  }

  async function updatePlan(action) {
    const labels = {
      renew: 'renovar',
      upgrade: 'fazer upgrade do',
      cancel: 'cancelar o'
    };
    showAlert(`Para ${labels[action] || 'alterar o'} plano, fale com o administrador IRONFIT. O pagamento e a liberacao sao feitos manualmente.`);
  }

  async function copyCode() {
    const code = state.academy?.access_code || '';
    try {
      await navigator.clipboard.writeText(code);
      showAlert('Codigo copiado.');
    } catch (error) {
      showAlert(`Codigo: ${code}`);
    }
  }

  function bindEvents() {
    document.querySelectorAll('[data-academy-tab]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const tab = link.dataset.academyTab;
        document.querySelectorAll('[data-academy-tab]').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.academy-tab').forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
        $(`#academy-tab-${tab}`)?.classList.add('active');
      });
    });

    $('#refreshAcademyBtn')?.addEventListener('click', refreshData);
    $('#studentSearch')?.addEventListener('input', renderStudents);
    $('#copyCodeBtn')?.addEventListener('click', copyCode);

    $('#studentsTableBody')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action="remove-student"]');
      if (button) removeStudent(button.closest('tr'));
    });

    document.querySelectorAll('[data-plan-action]').forEach((button) => {
      button.addEventListener('click', () => updatePlan(button.dataset.planAction));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 [DEBUG] DOMContentLoaded - iniciando academy.js');
    bindEvents();
    loadAcademy();
  });
})();
