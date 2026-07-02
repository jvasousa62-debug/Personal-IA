#!/usr/bin/env node

/**
 * IRONFIT - Quick Validation Script
 * Verifica se o fluxo Landing Page → Login → Stripe está funcionando
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 IRONFIT - Validação do Fluxo\n');
console.log('═'.repeat(60));

let checks = 0;
let passed = 0;

// Função auxiliar para verificar
function checkFile(filePath, description) {
  checks++;
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    passed++;
    return true;
  } else {
    console.log(`❌ ${description} - NÃO ENCONTRADO`);
    return false;
  }
}

function checkContent(filePath, searchString, description) {
  checks++;
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      passed++;
      return true;
    } else {
      console.log(`❌ ${description} - NÃO ENCONTRADO`);
      return false;
    }
  } else {
    console.log(`❌ ${description} - ARQUIVO NÃO EXISTE`);
    return false;
  }
}

// Validações
console.log('\n📁 ARQUIVOS CRIADOS:');
console.log('─'.repeat(60));
checkFile('src/payments.js', 'Módulo de Pagamentos');
checkFile('supabase/migrations/20260630_user_subscriptions.sql', 'Migration - Tabela Subscriptions');
checkFile('STRIPE-SETUP.md', 'Guia de Setup Stripe');
checkFile('FLUXO-COMPLETO.md', 'Documentação Fluxo');

console.log('\n🔗 LANDING PAGE → LOGIN:');
console.log('─'.repeat(60));
checkContent(
  'lading-page-IronFit/ironfit/components/CtaFinal.tsx',
  '../../login.html',
  'CtaFinal.tsx redireciona para login'
);

console.log('\n📜 SCRIPTS CARREGADOS:');
console.log('─'.repeat(60));
checkContent('index.html', 'src/payments.js', 'payments.js em index.html');
checkContent('index.html', 'https://js.stripe.com/v3/', 'Stripe SDK em index.html');
checkContent('login.html', 'src/payments.js', 'payments.js em login.html');
checkContent('login.html', 'https://js.stripe.com/v3/', 'Stripe SDK em login.html');

console.log('\n⚙️ INTEGRAÇÃO COM APP:');
console.log('─'.repeat(60));
checkContent(
  'script.js',
  'verifySubscriptionAccess',
  'Verificação de subscription em script.js'
);

console.log('\n🗄️ MÓDULO DE PAGAMENTOS:');
console.log('─'.repeat(60));
checkContent('src/payments.js', 'checkSubscriptionStatus', 'Função: checkSubscriptionStatus');
checkContent('src/payments.js', 'showSubscriptionModal', 'Função: showSubscriptionModal');
checkContent('src/payments.js', 'selectPlan', 'Função: selectPlan');
checkContent('src/payments.js', 'verifySubscriptionAccess', 'Função: verifySubscriptionAccess');
checkContent('src/payments.js', 'SUBSCRIPTION_PLANS', 'Constante: SUBSCRIPTION_PLANS');
checkContent('src/payments.js', 'STRIPE_CONFIG', 'Constante: STRIPE_CONFIG');

console.log('\n🗑️ LIMPEZA:');
console.log('─'.repeat(60));
const personalIAExists = fs.existsSync(path.join(__dirname, 'Personal-IA'));
if (!personalIAExists) {
  console.log('✅ Personal-IA/ removido');
  passed++;
} else {
  console.log('❌ Personal-IA/ ainda existe');
}
checks++;

const debugExists = fs.existsSync(path.join(__dirname, 'DEBUG-CHAT-CONSOLE.js'));
if (!debugExists) {
  console.log('✅ DEBUG-CHAT-CONSOLE.js removido');
  passed++;
} else {
  console.log('❌ DEBUG-CHAT-CONSOLE.js ainda existe');
}
checks++;

// Resultado final
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 RESULTADO: ${passed}/${checks} validações passaram\n`);

if (passed === checks) {
  console.log('🎉 TUDO PRONTO! Sistema de pagamentos está configurado!\n');
  console.log('Próximos passos:');
  console.log('1. Ler: STRIPE-SETUP.md');
  console.log('2. Criar conta no Stripe: https://stripe.com');
  console.log('3. Ativar: STRIPE_CONFIG.enabled = true em src/payments.js');
  console.log('4. Configurar webhooks no Stripe Dashboard\n');
  process.exit(0);
} else {
  console.log('⚠️ Algumas validações falharam. Verifique os arquivos acima.\n');
  process.exit(1);
}
