/**
 * 🔧 SCRIPT DE DEBUG DO CHAT
 * 
 * Use isso no Console do navegador (F12) para debugar o chat
 * Cole tudo de uma vez no console
 */

// ============================================
// 1. VERIFICAR AUTENTICAÇÃO
// ============================================
console.log('=== 🔐 VERIFICAÇÃO DE AUTENTICAÇÃO ===');

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  console.log('✅ Session:', session ? 'ATIVA' : '❌ INATIVA');
  console.log('📧 Email:', user?.email || 'Não autenticado');
  console.log('🔑 User ID:', user?.id || 'Sem ID');
  console.log('🎫 Token presente:', !!session?.access_token);
  console.log('Token (primeiros 20 chars):', session?.access_token?.substring(0, 20) + '...');
})();

// ============================================
// 2. VERIFICAR DADOS NO BANCO
// ============================================
console.log('\n=== 📊 DADOS NO BANCO DE DADOS ===');

(async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  // Mensagens do chat
  const { data: messages, error: msgError } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('💬 Últimas 5 mensagens:');
  if (messages) {
    messages.forEach((msg, i) => {
      console.log(`  ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
  } else {
    console.log('  ❌ Erro:', msgError?.message);
  }
  
  // Dados corporais
  const { data: bodyData, error: bodyError } = await supabaseClient
    .from('body_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  console.log('\n🏋️ Dados corporais:');
  if (bodyData) {
    console.log('  Peso:', bodyData.weight, 'kg');
    console.log('  Gordura:', bodyData.body_fat, '%');
    console.log('  Altura:', bodyData.height, 'cm');
    console.log('  Objetivo:', bodyData.goal);
    console.log('  Experiência:', bodyData.experience_level);
  } else {
    console.log('  ⚠️ Sem dados corporais configurados');
  }
})();

// ============================================
// 3. TESTAR CHAMADA DA EDGE FUNCTION
// ============================================
console.log('\n=== 🚀 TESTE DA EDGE FUNCTION ===');

(async () => {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  console.log('📤 Testando chamada à Edge Function...');
  
  const response = await fetch(
    'https://oqqoafejnzoolbpskbji.supabase.co/functions/v1/chat-ai',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        message: 'Teste: Como fazer agachamento?'
      })
    }
  );
  
  console.log('✅ Status da resposta:', response.status);
  
  if (!response.ok) {
    console.error('❌ ERRO:', response.statusText);
    const errorData = await response.json();
    console.error('Detalhes:', errorData);
    return;
  }
  
  const data = await response.json();
  console.log('📩 Resposta da IA:');
  console.log(data.reply || 'Vazio!');
  
  // Verifica se é resposta real ou fallback
  if (data.reply.includes('IRON IA aqui')) {
    console.warn('⚠️ Parece estar retornando fallback genérico');
  } else {
    console.log('✅ Resposta específica detectada!');
  }
})();

// ============================================
// 4. LIMPAR CONSOLE
// ============================================
console.clear();
console.log('%c🧪 DEBUG DO CHAT CARREGADO', 'color: green; font-size: 16px;');
console.log('Execute as funções acima para debugar');
