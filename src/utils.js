/* ===========================
   IRONFIT — UTILS MODULE v1
   Contains: Helper functions, calculations, text formatting
   =========================== */

// ===========================
// HELPERS
// ===========================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function simplifyText(text, useSimple = true) {
  if (!useSimple) return text;
  let simple = text;
  for (const [tech, simpleTerm] of Object.entries(TECH_TO_SIMPLE)) {
    const regex = new RegExp(tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    simple = simple.replace(regex, simpleTerm);
  }
  return simple;
}

// ===========================
// BODY METRICS HELPERS
// ===========================
function getCheckins() {
  try { return JSON.parse(localStorage.getItem('ironfit_checkins') || '[]'); } catch (e) { return []; }
}

function calcIMC(w, h) {
  if (!w || !h) return null;
  const hm = h / 100;
  return (w / (hm * hm)).toFixed(1);
}

function saveCheckins(data) { localStorage.setItem('ironfit_checkins', JSON.stringify(data)); }

function imcLabel(imc) {
  if (!imc) return '—';
  const v = parseFloat(imc);
  if (v < 18.5) return 'Abaixo do peso';
  if (v < 25) return 'Normal';
  if (v < 30) return 'Sobrepeso';
  return 'Obesidade';
}

// ===========================
// PERIODIZATION ENGINE — DEEP
// ===========================
function calcPersonalizedLoad(exerciseId, bodyData, week = 1) {
  const w = bodyData.weight || 75;

  const baseMultipliers = {
    'agachamento': { iniciante: 0.5, intermediario: 0.8, avancado: 1.2 },
    'supino-reto': { iniciante: 0.4, intermediario: 0.65, avancado: 0.95 },
    'levantamento-terra': { iniciante: 0.6, intermediario: 1.0, avancado: 1.5 },
    'terra-romeno': { iniciante: 0.45, intermediario: 0.75, avancado: 1.1 },
    'remada-curvada': { iniciante: 0.4, intermediario: 0.65, avancado: 0.9 },
    'puxada-frontal': { iniciante: 0.35, intermediario: 0.55, avancado: 0.8 },
    'desenvolvimento': { iniciante: 0.2, intermediario: 0.35, avancado: 0.55 },
    'rosca-direta': { iniciante: 0.15, intermediario: 0.25, avancado: 0.38 },
    'triceps-frances': { iniciante: 0.15, intermediario: 0.25, avancado: 0.38 },
    'leg-press': { iniciante: 0.8, intermediario: 1.4, avancado: 2.0 },
    'hip-thrust': { iniciante: 0.6, intermediario: 1.0, avancado: 1.5 },
    'panturrilha-pe': { iniciante: 0.5, intermediario: 0.9, avancado: 1.3 },
    'elevacao-lateral': { iniciante: 0.05, intermediario: 0.09, avancado: 0.13 },
  };

  const weekProgressions = [1.0, 1.05, 1.10, 1.08, 1.15, 1.20, 1.18, 1.25, 0.85, 1.10, 1.18, 1.28];
  const progression = weekProgressions[Math.min(week - 1, 11)] || 1.0;

  const expLevel = bodyData.experience || 'intermediario';
  const mult = (baseMultipliers[exerciseId] || { iniciante: 0.3, intermediario: 0.5, avancado: 0.75 })[expLevel] || 0.5;

  const load = Math.round(w * mult * progression / 2.5) * 2.5;
  return load >= 5 ? `${load}kg` : '~5kg';
}

function calcVolumeForWeek(week, goal) {
  const phases = {
    hipertrofia: [
      [3, '15', '60s', 'Semana de adaptação — técnica em foco'],
      [3, '13', '65s', 'Adaptação — aumente se sentir fácil'],
      [4, '12', '70s', 'Volume aumentando — foco na contração'],
      [4, '10', '75s', 'Sobrecarga progressiva — +2.5kg vs semana 1'],
      [4, '10-8', '80s', 'Intensidade elevada — RIR 2-3'],
      [4, '8', '90s', 'Fase de força-hipertrofia — RIR 1-2'],
      [5, '8', '90s', 'Alto volume — pico de volume'],
      [5, '6-8', '90s', 'Intensidade máxima — RIR 0-1'],
      [3, '12', '60s', '🔄 DELOAD — reduza a carga 40%'],
      [4, '10', '75s', 'Nova fase — recomece com +5% vs fase 1'],
      [4, '8', '80s', 'Sobrecarga acumulada — force a progressão'],
      [5, '6', '90s', 'Semana de pico — dê tudo que tem!'],
    ],
    forca: [
      [3, '8', '120s', 'Base de força'],
      [3, '6', '150s', 'Aumentando intensidade'],
      [4, '5', '180s', 'Protocolo 5x5 iniciando'],
      [5, '5', '180s', '5x5 completo'],
      [5, '4', '180s', 'Intensidade crescente'],
      [5, '3', '210s', 'Força máxima'],
      [3, '5', '120s', '🔄 DELOAD — recuperação'],
      [5, '2', '240s', 'Pico de força'],
    ],
    emagrecimento: [
      [3, '15', '45s', 'Circuito metabólico — 45s descanso'],
      [3, '15', '40s', 'Reduzindo descanso — mais metabolismo'],
      [4, '15', '35s', 'Alta densidade — caloria queimando'],
      [4, '12', '40s', 'Introduzindo mais carga'],
      [4, '12', '35s', 'Máximo esforço metabólico'],
      [4, '10', '45s', 'Força + metabólico'],
      [3, '12', '45s', '🔄 DELOAD — recuperação'],
      [4, '10', '40s', 'Retomada intensa'],
    ],
  };

  if (!week || isNaN(week)) week = 1;
  if (week < 1) week = 1;

  if (!goal || !phases[goal]) {
    console.warn('Goal inválido:', goal);
    goal = 'hipertrofia';
  }

  const plan = phases[goal];
  const index = Math.min(Math.max(week - 1, 0), plan.length - 1);

  const entry = plan[index];

  if (!entry) {
    console.error('Entry undefined:', { week, goal, index });
    return { sets: 3, reps: '12', rest: '60s', note: 'Fallback padrão' };
  }

  return {
    sets: entry[0],
    reps: entry[1],
    rest: entry[2],
    note: entry[3]
  };
}

// ===========================
// BODY METRICS ANALYSIS
// ===========================
function analyzeBodyMetrics(bodyData) {
  const insights = [];
  const { weight, fat, height, imc, measures, weightTrend, goal, leanMass } = bodyData;

  const imcVal = parseFloat(imc);
  if (imcVal < 18.5) insights.push('⚠️ IMC abaixo do peso — priorize ganho de massa magra');
  else if (imcVal >= 25 && imcVal < 30) insights.push('📊 IMC em sobrepeso — déficit calórico moderado recomendado');
  else if (imcVal >= 30) insights.push('🔴 IMC indicando obesidade — consulte um médico');

  if (fat < 10) insights.push('💡 Gordura muito baixa — pode comprometer hormônios');
  else if (fat > 25 && goal === 'hipertrofia') insights.push('💡 Com gordura > 25%, considere uma fase de cutting antes de bulking');

  if (Math.abs(weightTrend) > 0.5) {
    if (goal === 'emagrecimento' && weightTrend < 0) insights.push(`✅ Perdendo ~${Math.abs(weightTrend)}kg/semana — ritmo ${Math.abs(weightTrend) > 1 ? 'acelerado (atenção à perda de músculo)' : 'ideal'}`);
    else if (goal === 'hipertrofia' && weightTrend > 0) insights.push(`✅ Ganhando ~${weightTrend}kg/semana — ${weightTrend > 0.5 ? 'ritmo alto (pode acumular gordura)' : 'ritmo ideal para lean bulk'}`);
    else if (goal === 'hipertrofia' && weightTrend < 0) insights.push(`⚠️ Perdendo peso em fase de hipertrofia — aumente as calorias`);
  }

  if (measures.waist) {
    const ratio = measures.waist / height;
    if (ratio > 0.55) insights.push('⚠️ Relação cintura/altura elevada — risco cardiovascular, priorize cardio');
  }

  if (leanMass < 50 && bodyData.experience === 'avancado') insights.push('💡 Massa magra baixa para nível avançado — reveja nutrição e descanso');

  return insights;
}

// ===========================
// AI PERSONALITY PROMPT
// ===========================
function getUserExperienceLevel() {
  try {
    const profile = JSON.parse(localStorage.getItem('ironfit_profile') || '{}');
    return profile.experience_level || 'iniciante';
  } catch (e) { return 'iniciante'; }
}

function getAIPersonalityPrompt(bodyData = null) {
  let cached;
  try { cached = JSON.parse(localStorage.getItem('ironfit_prefs') || '{}'); } catch (e) { cached = {}; }

  const styleMap = { 'motivador': 'intense', 'bruto': 'strict', 'tecnico': 'nerd', 'amigavel': 'calm', 'sarcastico': 'funny', 'zen': 'calm' };
  const style = styleMap[cached.aiStyle] || 'intense';
  const detailMap = { 1: 'concise', 2: 'balanced', 3: 'detailed' };
  const detail = detailMap[cached.detailLevel] || 'balanced';
  const experienceLevel = getUserExperienceLevel();

  const levelInstructions = {
    iniciante: `NÍVEL: INICIANTE — linguagem simples, explique passo a passo, 3x/semana full body, 2-3 séries 12-15 reps, foco em técnica`,
    intermediario: `NÍVEL: INTERMEDIÁRIO — pode usar termos técnicos, 4-5x/semana, 3-4 séries 8-12 reps, sobrecarga progressiva`,
    avancado: `NÍVEL: AVANÇADO — linguagem técnica, periodização, RIR/RPE, 5-6x/semana, técnicas intensivas`,
  };

  const stylePrompts = {
    intense: `Estilo: INTENSO — motivador, energético, "BORA!", "SEM DESCULPA!", chama de "guerreiro/campeão"`,
    calm: `Estilo: CALMO — tranquilo, paciente, "passo a passo", chama de "amigo/parceiro"`,
    nerd: `Estilo: CIENTÍFICO — cita evidências, explica mecanismos fisiológicos, RIR, RPE, periodização`,
    funny: `Estilo: DESCONTRAÍDO — piadas, memes, "Bro...", leve mas informativo`,
    strict: `Estilo: RÍGIDO — direto, militar, frases curtas, zero tolerância com desculpas`,
  };

  const detailPrompts = {
    concise: `Detalhe: CONCISO — respostas curtas e diretas`,
    balanced: `Detalhe: EQUILIBRADO — explicações claras sem exagero`,
    detailed: `Detalhe: DETALHADO — explicações profundas com contexto fisiológico`,
  };

  let bodyContext = '';
  if (bodyData) {
    bodyContext = `
DADOS CORPORAIS DO USUÁRIO (USE PARA PERSONALIZAR):
- Peso: ${bodyData.weight}kg | Gordura: ${bodyData.fat}% | Massa magra: ${bodyData.leanMass}kg
- IMC: ${bodyData.imc} | Altura: ${bodyData.height}cm
- Objetivo: ${bodyData.goal} | Frequência: ${bodyData.weeklyFreq}x/semana
- Semana atual do programa: ${bodyData.currentWeek}/12
- Tendência de peso: ${bodyData.weightTrend > 0 ? '+' : ''}${bodyData.weightTrend}kg/semana
- Nível: ${bodyData.experience}
${bodyData.measures.waist ? `- Cintura: ${bodyData.measures.waist}cm` : ''}
${bodyData.measures.chest ? `- Peito: ${bodyData.measures.chest}cm` : ''}
${bodyData.measures.armR ? `- Braço: ${bodyData.measures.armR}cm` : ''}

REGRAS DE PERSONALIZAÇÃO:
- Calcule carga como ${Math.round(bodyData.weight * 0.6)}kg-${Math.round(bodyData.weight * 0.8)}kg para exercícios compostos (baseado no peso corporal)
- Para emagrecimento: use descansos de 30-45s
- Para hipertrofia: use descansos de 60-90s
- Para força: use descansos de 120-180s
- Semana ${bodyData.currentWeek}: ${calcVolumeForWeek(bodyData.currentWeek, bodyData.goal).note}`;
  }

  return `Você é o IRON IA — personal trainer virtual do IRONFIT. Responda SEMPRE em português brasileiro.

${levelInstructions[experienceLevel] || levelInstructions.iniciante}
${stylePrompts[style] || stylePrompts.intense}
${detailPrompts[detail] || detailPrompts.balanced}

${bodyContext}

EXPERTISE EM PERIODIZAÇÃO:
- Use periodização linear ondulatória: acumulação (semanas 1-3) → intensificação (4-6) → pico (7-8) → deload (9) → nova fase (10-12)
- Sempre mencione a semana e a fase do programa
- Calcule cargas baseadas no peso corporal do usuário
- Mencione RIR (reps reserva) e RPE quando relevante para avançados
- Progressão de carga: +2.5kg/semana em compostos, +1.25kg em isolados

FORMATO DE TREINO (sempre use este formato):
Exercício: séries x reps | descanso | carga estimada
Ex: Supino Reto: 4x8-10 | 90s | ~${bodyData ? Math.round(bodyData.weight * 0.65) : 65}kg

REGRAS:
- Máximo 400 palavras
- Nunca dê diagnósticos médicos
- Recomende médico/nutricionista quando necessário
- Use emojis com moderação 💪🔥`;
}

// ===========================
// SMART FALLBACK RESPONSES
// ===========================
// ===========================
// SMART FALLBACK RESPONSES
// Este bloco SO entra em acao quando a IA online (Edge Function chat-ai)
// falhar de verdade (sem internet, servico fora do ar, etc). Ele nunca
// deve travar a conversa com uma lista fixa de opcoes — sempre tenta
// responder com base no que foi perguntado, e avisa que esta em modo
// reduzido para o usuario nao achar que aquilo e a resposta completa da IA.
// ===========================
function buildSmartResponse(t) {
  const original = t;
  t = t.toLowerCase().trim();
  const bodyData = userBodyDataCache || {};
  const week = bodyData?.currentWeek || 1;
  const weight = bodyData?.weight || 75;
  const goal = bodyData?.goal || 'hipertrofia';
  const est = (pct) => Math.round(weight * pct / 2.5) * 2.5;
  const has = (...terms) => terms.every(term => t.includes(term));
  const any = (...terms) => terms.some(term => t.includes(term));

  const offlineNotice = '\n\n_(Estou respondendo em modo offline porque não consegui falar com o servidor da IA agora. Em alguns minutos volto ao normal — tente reenviar a mensagem se quiser uma resposta mais completa.)_';

  // SUGESTÕES EXATAS E CASOS ESPECÍFICOS
  if (t.includes('quero montar um treino de hipertrofia') || (t.includes('treino') && t.includes('hipertrofia')))
    return `💪 **TREINO DE HIPERTROFIA — SEMANA ${week}**\n\n**A — BASE E FORÇA**\n• Supino Reto: 4x8-10 | 90s | ~${est(0.65)}kg\n• Agachamento Livre: 4x6-8 | 120s | ~${est(0.8)}kg\n• Remada Curvada: 4x8-10 | 90s | ~${est(0.65)}kg\n\n**B — VOLUME E ISOLAMENTO**\n• Desenvolvimento Halteres: 3x10-12 | 75s | ~${est(0.35)}kg\n• Leg Press: 3x12-15 | 90s | ~${est(1.4)}kg\n• Cadeira Extensora: 3x15 | 60s\n\n📈 **Dica:** mantenha a progressão de +2,5kg em compostos e foque na técnica.${offlineNotice}`;

  if (t.includes('como faço para perder gordura mantendo músculo') || (has('gordura', 'mantendo') || (has('gordura', 'músculo') && !t.includes('dieta'))))
    return `⚡ **PERDA DE GORDURA MANTENDO MÚSCULO**\n\n**Treino:**\n• Priorize compostos: 3-4x por semana\n• Mantenha cargas desafiadoras: 4x8-12 em supino, agachamento e remada\n• Adicione 1-2 circuitos leves no final do treino\n\n**Nutrição:**\n• Déficit moderado: -300 a -500 kcal\n• Proteína: 2,0-2,2g/kg\n• Carboidrato pós-treino para recuperação\n\n**Recuperação:**\n• Durma 7-9h\n• Evite treinos consecutivos para o mesmo grupo muscular${offlineNotice}`;

  if (t.includes('qual a melhor dieta para ganho de massa') || (has('dieta', 'massa') || has('ganho', 'massa')))
    return `🥩 **DIETA PARA GANHO DE MASSA**\n\n**Calorias:**\n• +300-500 kcal acima da manutenção\n\n**Macronutrientes:**\n• Proteína: 1,8-2,2g/kg\n• Carboidratos: 45-55% das calorias\n• Gorduras: 20-25% das calorias\n\n**Sugestão prática:**\n• 4-5 refeições por dia\n• Priorize frango, ovos, arroz integral, batata-doce e leguminosas\n\n💡 **Dica:** ajuste as calorias conforme a balança evolui.${offlineNotice}`;

  if (t.includes('quanto tempo devo descansar entre as séries') || has('descans', 'séries') || has('quanto tempo', 'descans'))
    return `⏱️ **DESCANSO ENTRE SÉRIES**\n\n• Força (1-6 reps): 2-3 minutos\n• Hipertrofia (8-12 reps): 60-90 segundos\n• Resistência (15+ reps): 30-60 segundos\n\n**Dica:** quanto maior a carga, mais descanso; quanto mais foco em volume, menor o descanso.${offlineNotice}`;

  // TREINO ESPECÍFICO POR GRUPO MUSCULAR
  if (t.includes('peito') || t.includes('supino') || t.includes('crucifixo') || t.includes('peitoral'))
    return `🔥 **TREINO PEITO — SEMANA ${week}**\n\n**A — FORÇA BASE**\n• Supino Reto: 4x8-10 | 90s | ~${est(0.65)}kg\n• Supino Inclinado: 4x10-12 | 75s | ~${est(0.5)}kg\n\n**B — VOLUME**\n• Crucifixo: 3x12-15 | 60s | ~${est(0.2)}kg\n• Crossover Cabo: 3x15 | 60s\n• Peck Deck: 3x15 | 45s\n\n📈 **Progressão:** adicione +2,5kg por semana no supino.${offlineNotice}`;

  if (t.includes('costas') || t.includes('dorsal') || t.includes('remada') || t.includes('puxada'))
    return `💪 **TREINO COSTAS — SEMANA ${week}**\n\n**A — VERTICAL**\n• Puxada Frontal: 4x8-10 | 90s | ~${est(0.55)}kg\n• Remada Curvada: 4x10-12 | 75s | ~${est(0.65)}kg\n\n**B — HORIZONTAL**\n• Remada Unilateral: 3x12/lado | 60s | ~${est(0.3)}kg\n• Pullover: 3x12-15 | 60s\n\n📈 **Progressão:** +2,5kg/semana nas remadas compostas.${offlineNotice}`;

  if (t.includes('perna') || t.includes('glut') || t.includes('agachamento') || t.includes('terra') || t.includes('leg press'))
    return `🦵 **TREINO PERNAS — SEMANA ${week}**\n\n**A — FORÇA**\n• Agachamento Livre: 5x5-8 | 120s | ~${est(0.8)}kg\n• Terra Romeno: 4x8-10 | 90s | ~${est(0.75)}kg\n\n**B — VOLUME**\n• Leg Press: 4x12-15 | 90s | ~${est(1.4)}kg\n• Cadeira Extensora: 3x15 | 60s\n• Mesa Flexora: 3x12 | 60s\n• Hip Thrust: 4x15 | 75s | ~${est(1.0)}kg\n\n📈 **Progressão:** +5kg/semana no agachamento.${offlineNotice}`;

  if (t.includes('ombro') || t.includes('deltoid') || t.includes('desenvolvimento'))
    return `⚡ **TREINO OMBROS — SEMANA ${week}**\n\n**A — PRESSÃO**\n• Desenvolvimento Halteres: 4x10-12 | 90s | ~${est(0.35)}kg\n\n**B — ISOLAMENTO 3D**\n• Elevação Lateral: 4x15-20 | 60s | ~${est(0.09)}kg\n• Face Pull: 4x15-20 | 45s\n• Elevação Frontal: 3x12-15 | 60s\n\n📈 **Progressão:** +1,25kg/semana nas elevações.${offlineNotice}`;

  if (t.includes('braço') || t.includes('bíceps') || t.includes('tríceps'))
    return `💪 **TREINO BRAÇO — SEMANA ${week}**\n\n**A — BÍCEPS**\n• Rosca Direta Halteres: 4x10-12 | 75s | ~${est(0.15)}kg\n• Rosca Direta Barra: 3x12-15 | 60s\n\n**B — TRÍCEPS**\n• Rosca Francesa: 4x10-12 | 75s\n• Tríceps Corda: 3x12-15 | 60s\n• Mergulho: 3x8-12 | 90s\n\n📈 **Progressão:** +1,25kg/semana.${offlineNotice}`;

  // NUTRIÇÃO E DIETA
  if (t.includes('proteína') || t.includes('nutrição') || t.includes('comer') || t.includes('dieta') || t.includes('caloria'))
    return `🥩 **NUTRIÇÃO PERSONALIZADA**\n\n🎯 **Seu peso (~${weight}kg):**\n• Proteína: ${Math.round(weight * 2.2)}g/dia (${Math.round(weight * 2.2 / 4)} refeições de ${Math.round(weight * 0.55)}g)\n• Calorias: ~${Math.round(weight * (goal === 'emagrecimento' ? 26 : 35))}kcal/dia\n\n🍗 **Fontes de proteína:**\n• Frango, ovo, carne magra, whey, atum\n\n💊 **Suplementos recomendados:**\n• Creatina: 5g/dia\n• Whey: 30g pós-treino\n• Cafeína: 200mg pré-treino\n\n⚠️ Consulte um nutricionista para uma dieta precisa.${offlineNotice}`;

  // PROGRESSÃO E CARGA
  if (t.includes('progressão') || t.includes('carga') || t.includes('peso') || t.includes('aumentar'))
    return `📈 **PROGRESSÃO DE CARGA**\n\n**Método linear simples:**\n• Compostos (agachamento, supino): +2,5kg/semana\n• Isolados (rosca, desenvolvimento): +1,25kg/semana\n\n**Quando não conseguir progredir:**\n1. Tire 1-2 repetições e mantenha o peso\n2. Faça +1 série do peso anterior\n3. Tire 1-2 dias de descanso extra\n4. Aumente as calorias em 100-200kcal\n\n💡 **O que evitar:**\n• Pular aumentos\n• Mudar de exercício toda semana\n• Fazer cardio em excesso\n• Dormir pouco${offlineNotice}`;

  // RECUPERAÇÃO E DESCANSO
  if (t.includes('recuperação') || t.includes('descanso') || t.includes('dormir') || t.includes('sono'))
    return `😴 **PROTOCOLO DE RECUPERAÇÃO**\n\n**Descanso entre séries:**\n• Força (1-6 reps): 2-3 minutos\n• Hipertrofia (8-12 reps): 1-2 minutos\n• Resistência (15+ reps): 30-60 segundos\n\n**Sono necessário:**\n• 7-9 horas por noite\n• Sem celular 30 min antes de dormir\n• Quarto escuro e fresco\n\n🧘 **Outras técnicas:**\n• Alongamento de 5-10min pós-treino\n• Sauna 2x/semana (opcional)\n• Massagem ou foam roll nos dias de descanso${offlineNotice}`;

  // PERIODIZAÇÃO
  if (t.includes('peri') || t.includes('semana') || t.includes('plano') || t.includes('programa'))
    return `📅 **PERIODIZAÇÃO DE 12 SEMANAS**\n\n🔴 **Semanas 1-3 (Acumulação):**\nVolume alto, técnica, base\n• 3-4 séries x 12-15 repetições\n• Descanso de 60-90s\n\n🟠 **Semanas 4-6 (Intensificação):**\nAumentando a carga, reduzindo as repetições\n• 4-5 séries x 8-10 repetições\n• Descanso de 2-3min\n\n🔵 **Semanas 7-8 (Pico):**\nMáxima intensidade\n• 5-6 séries x 5-8 repetições\n• Descanso de 3-5min\n\n⚪ **Semana 9 (Deload):**\n40% menos carga — recuperação ativa${offlineNotice}`;

  // EXERCÍCIOS EM GERAL
  if (t.includes('exercício') || t.includes('como fazer') || t.includes('técnica'))
    return `🏋️ **PRINCIPAIS EXERCÍCIOS**\n\n**Compostos (início do treino):**\n• Agachamento, supino, levantamento terra, desenvolvimento\n\n**Isolados (final do treino):**\n• Leg press, crucifixo, rosca scott, puxador\n\n💡 **Dica de execução:**\n1. Controle o peso (não arremesse)\n2. Use amplitude completa\n3. Pause 1-2s na contração máxima\n4. Faça a negativa de forma controlada (2-3s)\n\nMe diga qual exercício você quer detalhar e eu explico passo a passo.${offlineNotice}`;

  // OBJETIVO ESPECÍFICO
  if (t.includes('ganho') || t.includes('massa') || t.includes('hipertrofia') || (t.includes('músculo') && !t.includes('gordura')))
    return `💪 **PROTOCOLO DE HIPERTROFIA**\n\n**Volume:**\n• 12-20 séries por grupo muscular/semana\n• 8-12 repetições por série\n• Descanso de 60-90s\n\n**Nutrição:**\n• +300-500kcal acima da manutenção\n• 1,6-2,2g de proteína por kg\n• Carboidratos concentrados no pós-treino\n\n**Frequência:**\n• 3-4x de treino por semana\n• 2 dias de descanso por semana\n• Dormir 8h por noite${offlineNotice}`;

  if (t.includes('emagrecimento') || t.includes('gordura') || t.includes('cut') || t.includes('definição') || (t.includes('massa') && t.includes('definição')))
    return `⚡ **PROTOCOLO DE EMAGRECIMENTO**\n\n**Déficit calórico:**\n• -300 a -500kcal da manutenção\n• Meta de perder ~0,5kg/semana\n\n**Treino:**\n• Mantenha a força (não reduza a carga)\n• Aumente repetições ou séries\n• Adicione 30min de cardio 2x/semana\n\n**Nutrição:**\n• 2,2g de proteína por kg (mais importante)\n• Reduza carboidratos ou gorduras\n• Hidratação: 3-4L de água/dia${offlineNotice}`;

  // ===========================
  // FORA DA LISTA CONHECIDA: nunca bloquear.
  // Damos uma resposta honesta, util e que convida a pessoa a continuar,
  // em vez de empurrar uma lista fixa de opcoes.
  // ===========================
  return `Entendi sua pergunta: "${original.trim()}".\n\nNo momento não consigo falar com o servidor da IA completa, então minhas respostas estão mais limitadas. Posso te ajudar agora com bastante detalhe em: treino por grupo muscular (peito, costas, pernas, ombros, braços), nutrição e calorias, progressão de carga, descanso/recuperação e periodização.\n\nSe sua dúvida for sobre outro assunto, me dê um pouco mais de contexto (por exemplo, qual exercício, qual sintoma, ou qual objetivo) que eu tento te dar o melhor direcionamento possível mesmo nesse modo reduzido. Em breve a IA completa volta a responder normalmente.${offlineNotice}`;
}

// ===========================
// GIF HANDLING (via Supabase Edge Function — Seguro)
// ===========================
async function fetchGifFromExerciseDB(exerciseId) {
  // Usar cache do script.js se disponível
  if (typeof gifCache !== 'undefined' && gifCache[exerciseId]) {
    return gifCache[exerciseId];
  }
  
  if (typeof EXERCISE_SEARCH_MAP === 'undefined' || !EXERCISE_SEARCH_MAP[exerciseId]) {
    return null;
  }
  
  const searchTerm = EXERCISE_SEARCH_MAP[exerciseId];
  
  try {
    // Chamar Edge Function do Supabase (chave segura no backend)
    const supabaseUrl = 'https://oqqoafejnzoolbpskbji.supabase.co';
    const url = `${supabaseUrl}/functions/v1/get-exercise-gif`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId, searchTerm })
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.gifUrl && typeof gifCache !== 'undefined') {
      gifCache[exerciseId] = data.gifUrl;
      return data.gifUrl;
    }
    
    return data.gifUrl || null;
  } catch (e) {
    console.warn(`Error fetching GIF for ${exerciseId}:`, e);
    return null;
  }
}

function buildGifBlock(gifUrl, icon, loading = false, exerciseId = null) {
  if (typeof GIFService !== 'undefined' && GIFService.buildGifBlock) {
    return GIFService.buildGifBlock(gifUrl, icon, loading, exerciseId);
  }
  if (loading) return `<div class="ex-gif-container" id="gifBlock"><div class="ex-gif-fallback"><div class="gif-spinner"></div><div class="ex-gif-label">CARREGANDO GIF...</div></div></div>`;
  if (gifUrl) return `<div class="ex-gif-container" id="gifBlock"><span class="ex-gif-badge">GIF</span><img src="${gifUrl}" alt="Execução" style="width:100%;max-height:320px;object-fit:contain;display:block;border-radius:12px;" loading="lazy"/></div>`;
  return `<div class="ex-gif-container" id="gifBlock"><div class="ex-gif-fallback"><div class="ex-gif-icon">${icon}</div><div class="ex-gif-label">GIF INDISPONÍVEL</div></div></div>`;
}
