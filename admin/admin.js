(function () {
  const state = {
    client: null,
    user: null,
    profile: null,
    users: [],
    academies: [],
    subscriptions: [],
    messages: []
  };

  const $ = (selector) => document.querySelector(selector);
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const dateFmt = new Intl.DateTimeFormat('pt-BR');

  function initSupabaseClient() {
    const config = window.IronFitConfig?.SUPABASE_CONFIG;
    const url = config?.url || document.querySelector('meta[name="supabase-url"]')?.content;
    const key = config?.key || document.querySelector('meta[name="supabase-key"]')?.content;

    if (!url || !key || !window.supabase) return null;
    return window.supabase.createClient(url, key);
  }

  function showAlert(message, type = 'info') {
    const alert = $('#adminAlert');
    if (!alert) return;
    alert.textContent = message;
    alert.className = `admin-alert ${type}`;
    window.clearTimeout(showAlert.timer);
    showAlert.timer = window.setTimeout(() => alert.classList.add('hidden'), 4800);
  }

  function setLoading(isLoading) {
    $('#adminLoading')?.classList.toggle('hidden', !isLoading);
    $('#adminContent')?.classList.toggle('hidden', isLoading);
  }

  function denyAccess(message) {
    setLoading(false);
    $('#adminContent')?.classList.add('hidden');
    const denied = $('#adminDenied');
    if (denied) {
      denied.classList.remove('hidden');
      denied.querySelector('p').textContent = message;
    }
  }

  function statusLabel(status) {
    const labels = {
      active: 'Ativo',
      blocked: 'Bloqueado',
      deleted: 'Excluido',
      suspended: 'Suspensa',
      expired: 'Expirada',
      canceled: 'Cancelada',
      past_due: 'Pendente'
    };
    return labels[status] || status || '-';
  }

  function roleLabel(role) {
    const normalized = (role || '').toString().toLowerCase();
    const labels = {
      member: 'Aluno',
      academy_owner: 'Dono da academia',
      admin: 'Admin'
    };
    return labels[normalized] || 'Aluno';
  }

  function normalizePlan(plan) {
    return window.IronFitPlanConfig?.normalizePlan?.(plan) || ((plan || 'basic').toString().toLowerCase());
  }

  function planLabel(plan) {
    return window.IronFitPlanConfig?.getPlanLabel?.(plan) || ({
      basic: 'Plano Simples',
      pro: 'Plano Pro',
      premium: 'Plano Premium',
      enterprise: 'Plano Enterprise'
    }[normalizePlan(plan)] || 'Plano Simples');
  }

  function planOptions(selectedPlan) {
    const options = window.IronFitPlanConfig?.getPlanOptions?.() || [
      { value: 'basic', label: 'Plano Simples' },
      { value: 'pro', label: 'Plano Pro' },
      { value: 'premium', label: 'Plano Premium' },
      { value: 'enterprise', label: 'Plano Enterprise' }
    ];
    const selected = normalizePlan(selectedPlan);
    return options
      .map((plan) => `<option value="${plan.value}" ${plan.value === selected ? 'selected' : ''}>${plan.label}</option>`)
      .join('');
  }

  function planMonthlyAmount(plan) {
    const normalized = normalizePlan(plan);
    const item = window.IronFitPlanConfig?.getPlanOptions?.()?.find((option) => option.value === normalized);
    return item?.monthlyAmount || ({ basic: 49, pro: 99, premium: 199, enterprise: 499 }[normalized] || 49);
  }

  function planTokenLimit(plan) {
    return window.IronFitPlanConfig?.getAITokenLimit?.(plan) || ({ basic: 5000, pro: 20000, premium: 75000, enterprise: 300000 }[normalizePlan(plan)] || 5000);
  }

  function academyById(id) {
    return state.academies.find((academy) => academy.id === id);
  }

  function getStudentCount(academyId) {
    return state.users.filter((user) => user.academy_id === academyId && user.account_status !== 'deleted').length;
  }

  function formatDate(value) {
    if (!value) return '-';
    try {
      return dateFmt.format(new Date(value));
    } catch (error) {
      return '-';
    }
  }

  async function loadAdmin() {
    setLoading(true);
    $('#adminDenied')?.classList.add('hidden');

    state.client = initSupabaseClient();
    if (!state.client) {
      denyAccess('Supabase nao esta configurado nesta pagina.');
      return;
    }

    const { data: userData, error: userError } = await state.client.auth.getUser();
    if (userError || !userData?.user) {
      denyAccess('Faca login antes de abrir a area administrativa.');
      return;
    }

    state.user = userData.user;

    const { data: profile, error: profileError } = await state.client
      .from('user_profiles')
      .select('user_id,email,full_name,role,account_status')
      .eq('user_id', state.user.id)
      .maybeSingle();

    if (profileError || profile?.role !== 'admin' || profile?.account_status !== 'active') {
      denyAccess('Sua conta ainda nao tem permissao de admin.');
      return;
    }

    state.profile = profile;
    await refreshData();
  }

  async function refreshData() {
    setLoading(true);

    const [usersResult, academiesResult, subscriptionsResult, messagesResult] = await Promise.all([
      state.client
        .from('user_profiles')
        .select('id,user_id,email,full_name,role,account_status,plan,academy_id,created_at,last_seen_at')
        .order('created_at', { ascending: false }),
      state.client
        .from('academies')
        .select('id,name,legal_name,email,phone,status,access_code,student_limit,validity_months,expires_at,created_at,owner_user_id,plan')
        .order('created_at', { ascending: false }),
      state.client
        .from('subscriptions')
        .select('id,academy_id,user_id,status,plan,monthly_amount,started_at,canceled_at')
        .order('created_at', { ascending: false }),
      state.client
        .from('chat_messages')
        .select('id,user_id,created_at')
        .order('created_at', { ascending: false })
        .limit(1000)
    ]);

    const firstError = usersResult.error || academiesResult.error || subscriptionsResult.error;
    if (firstError) {
      denyAccess(`Nao foi possivel carregar o admin: ${firstError.message}`);
      return;
    }

    state.users = usersResult.data || [];
    state.academies = academiesResult.data || [];
    state.subscriptions = subscriptionsResult.data || [];
    state.messages = messagesResult.data || [];

    renderAll();
    setLoading(false);
  }

  function renderAll() {
    renderMetrics();
    renderUsers();
    renderAcademies();
    renderBilling();
    renderTopAcademies();
  }

  function renderMetrics() {
    const activeUsers = state.users.filter((u) => u.account_status === 'active').length;
    const blockedUsers = state.users.filter((u) => u.account_status === 'blocked').length;
    const activeAcademies = state.academies.filter((a) => a.status === 'active').length;
    const activeManualPlans = state.academies.filter((academy) => academy.status === 'active');
    const monthly = activeManualPlans.reduce((sum, academy) => sum + planMonthlyAmount(academy.plan), 0);

    const metrics = [
      ['Usuarios ativos', activeUsers, `${blockedUsers} bloqueados`],
      ['Academias ativas', activeAcademies, `${state.academies.length} cadastradas`],
      ['Planos ativos', activeManualPlans.length, 'cobranca manual'],
      ['Receita mensal', money.format(monthly), `${money.format(monthly * 12)} ao ano`]
    ];

    $('#adminMetrics').innerHTML = metrics.map(([label, value, note]) => `
      <article class="admin-metric">
        <div class="admin-metric-label">${label}</div>
        <div class="admin-metric-value">${value}</div>
        <div class="admin-metric-note">${note}</div>
      </article>
    `).join('');
  }

  function renderUsers() {
    const query = ($('#userSearch')?.value || '').toLowerCase();
    const users = state.users.filter((user) => {
      const text = `${user.full_name || ''} ${user.email || ''}`.toLowerCase();
      return text.includes(query);
    });

    $('#usersTableBody').innerHTML = users.map((user) => {
      const academyOptions = ['<option value="">Sem academia</option>'].concat(
        state.academies.map((academy) => `<option value="${academy.id}" ${academy.id === user.academy_id ? 'selected' : ''}>${academy.name}</option>`)
      ).join('');
      const academy = academyById(user.academy_id);

      return `
        <tr data-user-id="${user.user_id}">
          <td>
            <div class="admin-user-name">${user.full_name || user.email || 'Usuario sem nome'}</div>
            <div class="admin-muted">${user.email || user.user_id}</div>
          </td>
          <td>
            <select class="admin-select" data-field="academy_id">${academyOptions}</select>
            <div class="admin-muted">${academy?.access_code || ''}</div>
          </td>
          <td>
            <select class="admin-select" data-field="plan">
              ${planOptions(user.plan)}
            </select>
          </td>
          <td>
            <select class="admin-select" data-field="account_status">
              ${['active', 'blocked', 'deleted'].map((status) => `<option value="${status}" ${status === user.account_status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}
            </select>
          </td>
          <td>
            <select class="admin-select" data-field="role">
              ${['member', 'academy_owner', 'admin'].map((role) => `<option value="${role}" ${role === (user.role || 'member') ? 'selected' : ''}>${roleLabel(role)}</option>`).join('')}
            </select>
          </td>
          <td>
            <div class="admin-actions">
              <button class="admin-secondary-btn" type="button" data-action="save-user">Salvar</button>
              <button class="admin-secondary-btn" type="button" data-action="toggle-block">${user.account_status === 'blocked' ? 'Desbloquear' : 'Bloquear'}</button>
              <button class="admin-danger-btn" type="button" data-action="delete-user">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="6">Nenhum usuario encontrado.</td></tr>`;
  }

  function renderAcademies() {
    const query = ($('#academySearch')?.value || '').toLowerCase();
    const academies = state.academies.filter((academy) => {
      const text = `${academy.name || ''} ${academy.access_code || ''}`.toLowerCase();
      return text.includes(query);
    });

    $('#academiesTableBody').innerHTML = academies.map((academy) => {
      const students = getStudentCount(academy.id);
      return `
        <tr data-academy-id="${academy.id}">
          <td>
            <div class="admin-academy-name">${academy.name}</div>
            <div class="admin-muted">Criada em ${formatDate(academy.created_at)}</div>
          </td>
          <td>
            <strong>${planLabel(academy.plan)}</strong>
            <div class="admin-muted">${money.format(planMonthlyAmount(academy.plan))}/mes</div>
          </td>
          <td><strong>${academy.access_code}</strong></td>
          <td>${students} / ${academy.student_limit}</td>
          <td>${academy.validity_months} meses<br><span class="admin-muted">${formatDate(academy.expires_at)}</span></td>
          <td><span class="admin-status ${academy.status}">${statusLabel(academy.status)}</span></td>
          <td>
            <div class="admin-actions">
              <button class="admin-secondary-btn" type="button" data-action="edit-academy">Editar</button>
              <button class="admin-secondary-btn" type="button" data-action="toggle-academy">${academy.status === 'suspended' ? 'Reativar' : 'Suspender'}</button>
              <button class="admin-secondary-btn" type="button" data-action="increase-limit">+50 alunos</button>
            </div>
          </td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="7">Nenhuma academia cadastrada.</td></tr>`;
  }

  function renderBilling() {
    $('#subscriptionsTableBody').innerHTML = state.academies.map((academy) => {
      return `
        <tr>
          <td>${academy?.name || 'Sem academia'}</td>
          <td>${planLabel(academy.plan)}</td>
          <td><span class="admin-status ${academy.status}">${statusLabel(academy.status)}</span></td>
          <td>${money.format(planMonthlyAmount(academy.plan))}</td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="4">Nenhuma academia cadastrada.</td></tr>`;

    const active = state.academies.filter((academy) => academy.status === 'active');
    const inactive = state.academies.filter((academy) => academy.status !== 'active');
    const monthly = active.reduce((sum, academy) => sum + planMonthlyAmount(academy.plan), 0);
    const values = [
      ['Planos ativos', active.length],
      ['Academias inativas', inactive.length],
      ['Receita mensal', money.format(monthly)],
      ['Receita anual', money.format(monthly * 12)]
    ];

    $('#revenueCards').innerHTML = values.map(([label, value]) => `
      <div class="admin-revenue-card">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');

    $('#financeSummary').innerHTML = values.map(([label, value]) => `
      <div class="admin-finance-row">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  function renderTopAcademies() {
    const usageByAcademy = new Map();
    state.messages.forEach((message) => {
      const user = state.users.find((item) => item.user_id === message.user_id);
      if (!user?.academy_id) return;
      usageByAcademy.set(user.academy_id, (usageByAcademy.get(user.academy_id) || 0) + 1);
    });

    const rows = state.academies
      .map((academy) => {
        const students = getStudentCount(academy.id);
        const messages = usageByAcademy.get(academy.id) || 0;
        return { academy, students, messages, score: students * 2 + messages };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const max = Math.max(...rows.map((row) => row.score), 1);
    $('#topAcademies').innerHTML = rows.map((row) => `
      <div class="admin-usage-row">
        <div>
          <strong>${row.academy.name}</strong>
          <div class="admin-usage-meta">${row.students} alunos · ${row.messages} mensagens IA</div>
          <div class="admin-usage-bar"><span style="width:${Math.max(8, (row.score / max) * 100)}%"></span></div>
        </div>
        <span class="admin-status ${row.academy.status}">${statusLabel(row.academy.status)}</span>
      </div>
    `).join('') || '<p class="admin-muted">Sem uso registrado ainda.</p>';
  }

  async function updateUser(row, patch) {
    const userId = row.dataset.userId;
    
    if (!patch || Object.keys(patch).length === 0) {
      showAlert('Nenhuma alteracao para salvar.', 'info');
      return;
    }

    if (patch.plan) {
      patch.plan = normalizePlan(patch.plan);
      patch.ai_monthly_tokens_limit = planTokenLimit(patch.plan);
    }

    patch.updated_at = new Date().toISOString();

    console.log('Salvando usuario:', userId, patch);

    const { data, error } = await state.client
      .from('user_profiles')
      .update(patch)
      .eq('user_id', userId)
      .select('user_id');

    if (error) {
      console.error('Erro Supabase:', error);
      showAlert(`Erro ao salvar: ${error.message}`, 'error');
      return;
    }

    if (!data || data.length === 0) {
      showAlert('Nao foi possivel salvar o usuario.', 'warning');
      return;
    }

    showAlert('Usuario atualizado com sucesso.');
    await refreshData();
  }

  function collectUserPatch(row) {
    const patch = {};
    const fields = ['academy_id', 'plan', 'account_status', 'role'];
    
    fields.forEach((fieldName) => {
      const input = row.querySelector(`[data-field="${fieldName}"]`);
      if (input) {
        const value = input.value;
        patch[fieldName] = (value === '' || value === 'null') ? null : value;
      }
    });
    
    if (patch.account_status === 'blocked') patch.blocked_at = new Date().toISOString();
    if (patch.account_status === 'deleted') patch.deleted_at = new Date().toISOString();
    
    return patch;
  }

  async function saveAcademy(event) {
    event.preventDefault();
    const id = $('#academyId').value;
    const expires = $('#academyExpires').value;
    const ownerUserId = $('#academyOwnerUserId').value || null;
    const plan = normalizePlan($('#academyPlan').value);
    const payload = {
      name: $('#academyName').value.trim(),
      access_code: $('#academyCode').value.trim().toUpperCase(),
      plan,
      student_limit: Number($('#academyLimit').value || 0),
      validity_months: Number($('#academyMonths').value || 12),
      expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      status: $('#academyStatus').value,
      owner_user_id: ownerUserId,
      updated_at: new Date().toISOString()
    };

    const request = id
      ? state.client.from('academies').update(payload).eq('id', id).select('id').single()
      : state.client.from('academies').insert(payload).select('id').single();

    const { data, error } = await request;
    if (error) {
      showAlert(`Erro ao salvar academia: ${error.message}`, 'error');
      return;
    }

    const academyId = data?.id || id;

    if (ownerUserId && academyId) {
      const ownerProfile = state.users.find((user) => user.user_id === ownerUserId);
      const ownerRole = ownerProfile?.role === 'admin' ? 'admin' : 'academy_owner';
      const { error: ownerError } = await state.client
        .from('user_profiles')
        .update({
          role: ownerRole,
          academy_id: academyId,
          plan,
          ai_monthly_tokens_limit: planTokenLimit(plan),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', ownerUserId);

      if (ownerError) {
        showAlert(`Academia salva, mas houve erro ao vincular o dono: ${ownerError.message}`, 'warning');
      }
    }

    if (academyId) {
      const { error: studentsPlanError } = await state.client
        .from('user_profiles')
        .update({
          plan,
          ai_monthly_tokens_limit: planTokenLimit(plan),
          updated_at: new Date().toISOString()
        })
        .eq('academy_id', academyId)
        .neq('account_status', 'deleted');

      if (studentsPlanError) {
        showAlert(`Academia salva, mas houve erro ao atualizar o plano dos alunos: ${studentsPlanError.message}`, 'warning');
      }

      const subscriptionPayload = {
        academy_id: academyId,
        user_id: ownerUserId,
        status: payload.status === 'active' ? 'active' : 'canceled',
        plan,
        monthly_amount: planMonthlyAmount(plan),
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: existingSubscriptions } = await state.client
        .from('subscriptions')
        .select('id')
        .eq('academy_id', academyId)
        .limit(1);

      const existingSubscriptionId = existingSubscriptions?.[0]?.id;
      const subscriptionRequest = existingSubscriptionId
        ? state.client.from('subscriptions').update(subscriptionPayload).eq('id', existingSubscriptionId)
        : state.client.from('subscriptions').insert(subscriptionPayload);

      const { error: subscriptionError } = await subscriptionRequest;
      if (subscriptionError) {
        showAlert(`Academia salva, mas houve erro ao registrar faturamento manual: ${subscriptionError.message}`, 'warning');
      }
    }

    closeAcademyModal();
    showAlert('Academia salva.');
    await refreshData();
  }

  function populateAcademyOwnerOptions(academy) {
    const ownerSelect = $('#academyOwnerUserId');
    if (!ownerSelect) return;

    const activeOwners = state.users
      .filter((user) => user.account_status === 'active')
      .sort((a, b) => (a.full_name || a.email || '').localeCompare(b.full_name || b.email || ''));

    ownerSelect.innerHTML = ['<option value="">Sem dono definido</option>']
      .concat(activeOwners.map((user) => `<option value="${user.user_id}" ${academy?.owner_user_id === user.user_id ? 'selected' : ''}>${user.full_name || user.email || user.user_id}</option>`))
      .join('');
  }

  function openAcademyModal(academy) {
    $('#academyModalTitle').textContent = academy ? 'Editar academia' : 'Nova academia';
    $('#academyId').value = academy?.id || '';
    $('#academyName').value = academy?.name || '';
    $('#academyCode').value = academy?.access_code || '';
    $('#academyPlan').value = normalizePlan(academy?.plan || 'basic');
    $('#academyLimit').value = academy?.student_limit || 300;
    $('#academyMonths').value = academy?.validity_months || 12;
    $('#academyExpires').value = academy?.expires_at ? academy.expires_at.slice(0, 10) : '';
    $('#academyStatus').value = academy?.status || 'active';
    populateAcademyOwnerOptions(academy);
    $('#academyModal').classList.remove('hidden');
  }

  function closeAcademyModal() {
    $('#academyModal').classList.add('hidden');
    $('#academyForm').reset();
    $('#academyId').value = '';
  }

  function generateCode() {
    const name = $('#academyName').value || 'Academia';
    const prefix = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase() || 'GYM';
    $('#academyCode').value = `${prefix}${new Date().getFullYear()}`;
  }

  async function handleAdminLogout() {
    const logoutKeys = [
      'ironfit_profile',
      'ironfit_prefs',
      'ironfit_avatar',
      'ironfit_plans',
      'ironfit_checkins',
      'user_preferences',
      'user_data',
      'ironfit_userEmail',
      'ironfit_fullName',
      'ironfit_userId',
      'ironfit_loggedIn',
      'userEmail',
      'userId',
      'userName',
      'ironfit_userRole',
      'auth_token'
    ];
    logoutKeys.forEach((key) => localStorage.removeItem(key));

    const authClient = state.client?.auth || window.supabaseClient?.auth || (window.supabase && window.IronFitConfig?.SUPABASE_CONFIG ? window.supabase.createClient(window.IronFitConfig.SUPABASE_CONFIG.url, window.IronFitConfig.SUPABASE_CONFIG.key) : null);
    if (authClient?.signOut) {
      try {
        await authClient.signOut();
      } catch (error) {
        console.warn('Erro no logout admin:', error);
      }
    }

    window.location.replace('../login.html');
  }

  function bindEvents() {
    document.querySelectorAll('[data-admin-tab]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const tab = link.dataset.adminTab;
        document.querySelectorAll('[data-admin-tab]').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.admin-tab').forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
        $(`#admin-tab-${tab}`)?.classList.add('active');
      });
    });

    $('#refreshAdminBtn')?.addEventListener('click', refreshData);
    $('#logoutAdminBtn')?.addEventListener('click', handleAdminLogout);
    $('#newAcademyBtn')?.addEventListener('click', () => openAcademyModal());
    $('#academyForm')?.addEventListener('submit', saveAcademy);
    $('#closeAcademyModal')?.addEventListener('click', closeAcademyModal);
    $('#cancelAcademyForm')?.addEventListener('click', closeAcademyModal);
    $('#academyModalBackdrop')?.addEventListener('click', closeAcademyModal);
    $('#generateCodeBtn')?.addEventListener('click', generateCode);
    $('#userSearch')?.addEventListener('input', renderUsers);
    $('#academySearch')?.addEventListener('input', renderAcademies);

    $('#usersTableBody')?.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const row = button.closest('tr');
      const action = button.dataset.action;

      if (action === 'save-user') {
        const patch = collectUserPatch(row);
        await updateUser(row, patch);
      }

      if (action === 'toggle-block') {
        const current = row.querySelector('[data-field="account_status"]').value;
        await updateUser(row, {
          account_status: current === 'blocked' ? 'active' : 'blocked',
          blocked_at: current === 'blocked' ? null : new Date().toISOString()
        });
      }

      if (action === 'delete-user') {
        const ok = window.confirm('Excluir este usuario do app? A conta de autenticacao permanece no Supabase Auth.');
        if (ok) {
          await updateUser(row, { account_status: 'deleted', deleted_at: new Date().toISOString() });
        }
      }
    });

    $('#academiesTableBody')?.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const row = button.closest('tr');
      const academy = state.academies.find((item) => item.id === row.dataset.academyId);
      if (!academy) return;

      if (button.dataset.action === 'edit-academy') {
        openAcademyModal(academy);
      }

      if (button.dataset.action === 'toggle-academy') {
        const nextStatus = academy.status === 'suspended' ? 'active' : 'suspended';
        const { error } = await state.client.from('academies').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', academy.id);
        if (error) showAlert(`Erro ao alterar academia: ${error.message}`, 'error');
        else {
          showAlert('Status da academia atualizado.');
          await refreshData();
        }
      }

      if (button.dataset.action === 'increase-limit') {
        const { error } = await state.client.from('academies').update({ student_limit: Number(academy.student_limit || 0) + 50, updated_at: new Date().toISOString() }).eq('id', academy.id);
        if (error) showAlert(`Erro ao aumentar limite: ${error.message}`, 'error');
        else {
          showAlert('Limite aumentado em 50 alunos.');
          await refreshData();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    loadAdmin();
  });
})();
