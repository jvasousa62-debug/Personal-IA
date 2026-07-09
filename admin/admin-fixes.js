// PATCH PARA CORRIGIR OS DOIS BUGS PRINCIPAIS
// Cole este código ANTES de fechar a tag </body> em admin/index.html
// ou substitua as funções em admin/admin.js

// ============================================
// FIX #1: Melhorar validação de updates
// ============================================
// Substitua a função updateUser (linha 379) por esta:

async function updateUser(row, patch) {
  const userId = row.dataset.userId;
  
  // FIX: Validar e sanitizar os dados
  if (patch.plan) {
    patch.plan = normalizePlan(patch.plan);
    patch.ai_monthly_tokens_limit = planTokenLimit(patch.plan);
  }
  
  // FIX: Se estamos mudando para academy_owner, validar academy_id
  if (patch.role === 'academy_owner' && !patch.academy_id) {
    showAlert('Erro: usuario com role academy_owner deve estar vinculado a uma academia.', 'error');
    return;
  }
  
  // FIX: Adicionar timestamp e log
  patch.updated_at = new Date().toISOString();
  console.log('Atualizando usuario:', userId, patch);
  
  const { data, error } = await state.client
    .from('user_profiles')
    .update(patch)
    .eq('user_id', userId)
    .select('user_id'); // Forçar retorno de dados para confirmar sucesso
  
  if (error) {
    console.error('Erro ao salvar usuario:', error);
    showAlert(`Erro ao salvar usuario: ${error.message} (${error.code})`, 'error');
    return;
  }
  
  // FIX: Validar que o update retornou algo
  if (!data || data.length === 0) {
    showAlert('Aviso: usuario pode nao ter sido atualizado corretamente.', 'warning');
    await refreshData();
    return;
  }

  showAlert('Usuario atualizado com sucesso.');
  await refreshData();
}

// ============================================
// FIX #2: Melhorar coleta de dados do formulario
// ============================================
// Substitua a função collectUserPatch (linha 399) por esta:

function collectUserPatch(row) {
  const patch = {};
  const fields = ['academy_id', 'plan', 'account_status', 'role'];
  
  // FIX: Coletar apenas campos conhecidos
  fields.forEach((fieldName) => {
    const input = row.querySelector(`[data-field="${fieldName}"]`);
    if (input) {
      const value = input.value;
      patch[fieldName] = (value === '' || value === 'null') ? null : value;
    }
  });
  
  // FIX: Timestamps adicionais
  if (patch.account_status === 'blocked' && !patch.blocked_at) {
    patch.blocked_at = new Date().toISOString();
  }
  if (patch.account_status === 'deleted' && !patch.deleted_at) {
    patch.deleted_at = new Date().toISOString();
  }
  
  console.log('Patch coletado:', patch);
  return patch;
}

// ============================================
// FIX #3: Melhorar o bindEvents para salvar usuario
// ============================================
// Na seção de listeners (linha 605), mude de:
//   if (action === 'save-user') {
//     await updateUser(row, collectUserPatch(row));
//   }
// Para:

if (action === 'save-user') {
  const patchData = collectUserPatch(row);
  if (Object.keys(patchData).length === 0) {
    showAlert('Nenhuma alteracao foi feita.', 'info');
    return;
  }
  console.log('Salvando usuario com dados:', patchData);
  await updateUser(row, patchData);
}

// ============================================
// FIX #4: Academy Owner Setup
// ============================================
// Quando transformar usuario em academy_owner, use isto:

// ANTES de chamar updateUser:
if (patch.role === 'academy_owner') {
  // 1. Garantir que academy_id está preenchido
  if (!patch.academy_id) {
    showAlert('Selecione uma academia antes de transformar em dono.', 'warning');
    return;
  }
  
  // 2. Atualizar tambem a coluna owner_user_id da academia
  const { error: academyError } = await state.client
    .from('academies')
    .update({ 
      owner_user_id: userId,
      updated_at: new Date().toISOString()
    })
    .eq('id', patch.academy_id);
  
  if (academyError) {
    showAlert(`Erro ao vincular academia: ${academyError.message}`, 'error');
    return;
  }
}

// ============================================
// DIAGNOSTICO: Verificar dados no console
// ============================================
// Para debug, execute isto no console do navegador (F12):

// Ver todos os usuarios
console.table(state.users);

// Ver todas as academias
console.table(state.academies);

// Ver um usuario especifico
console.log(state.users.find(u => u.email === 'seu@email.com'));
