import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ProviderName = 'openai' | 'anthropic';

type RouteDecision = {
  difficulty: 'simple' | 'standard' | 'complex';
  provider: ProviderName;
  model: string;
  score: number;
};

class ProviderError extends Error {
  status: number;
  details: unknown;

  constructor(provider: ProviderName, status: number, details: unknown) {
    super(`${provider} request failed`);
    this.status = status;
    this.details = details;
  }
}

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function cleanMessage(msg: unknown): string {
  return typeof msg === 'string' ? msg.trim().slice(0, 4000) : '';
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-12)
    .map((msg) => ({
      role: msg?.role === 'user' ? 'user' : 'assistant',
      content: cleanMessage(msg?.content),
    }))
    .filter((msg) => msg.content.length > 0);
}

function getEnv(name: string, fallback = '') {
  return Deno.env.get(name)?.trim() || fallback;
}

// ===========================
// DETECÇÃO DE GRUPOS MUSCULARES MÚLTIPLOS
// Resolve o bug central: "treino de peito e tríceps" só respondendo peito.
// ===========================
const MUSCLE_GROUP_PATTERNS: Record<string, string[]> = {
  peito: ['peito', 'peitoral', 'supino'],
  costas: ['costas', 'dorsal', 'remada', 'puxada', 'dorsais'],
  pernas: ['perna', 'pernas', 'quadriceps', 'quadríceps', 'agachamento', 'gluteo', 'glúteo', 'posterior de coxa', 'panturrilha'],
  ombro: ['ombro', 'ombros', 'deltoide', 'deltóide', 'desenvolvimento'],
  biceps: ['biceps', 'bíceps', 'rosca'],
  triceps: ['triceps', 'tríceps'],
  abdomen: ['abdomen', 'abdômen', 'abdominal', 'core', 'prancha'],
};

function detectMuscleGroups(message: string): string[] {
  const text = normalizeText(message);
  const found: string[] = [];
  for (const [group, patterns] of Object.entries(MUSCLE_GROUP_PATTERNS)) {
    if (patterns.some((p) => text.includes(normalizeText(p)))) {
      found.push(group);
    }
  }
  return found;
}

function scoreQuestion(message: string, history: ChatMessage[]) {
  const text = normalizeText(message);
  let score = 0;

  if (message.length > 160) score += 2;
  if (message.length > 420) score += 2;
  if (history.length >= 6) score += 1;

  const complexPatterns = [
    'monte', 'montar', 'crie', 'criar', 'plano', 'rotina', 'periodizacao',
    'macros', 'calorias', 'dieta', 'emagrecer', 'hipertrofia', 'forca',
    'lesao', 'dor', 'tendinite', 'joelho', 'coluna', 'ombro',
    'adaptar', 'personalizar', 'progressao', 'divisao', 'semana',
    'iniciante', 'intermediario', 'avancado', 'treino completo',
  ];

  const simplePatterns = [
    'descanso', 'quantas series', 'quantas repeticoes', 'proteina',
    'creatina', 'aquecimento', 'alongamento', 'cardio', 'pos treino',
    'pre treino', 'agua', 'sono',
  ];

  for (const pattern of complexPatterns) {
    if (text.includes(pattern)) score += 2;
  }

  for (const pattern of simplePatterns) {
    if (text.includes(pattern)) score += 1;
  }

  if (text.includes('?') && text.split(' ').length <= 12) score -= 1;

  // CORREÇÃO CRÍTICA: pedido de treino com 2+ grupos musculares é sempre complexo.
  // Antes, "treino de peito e triceps" podia cair como 'simple' e ir pro modelo
  // mais fraco, que então ignorava metade do pedido.
  const muscleGroups = detectMuscleGroups(message);
  if (muscleGroups.length >= 2) score += 4;

  if (score >= 5) return { difficulty: 'complex' as const, score };
  if (score <= 1) return { difficulty: 'simple' as const, score };
  return { difficulty: 'standard' as const, score };
}

function pickConfiguredProvider(preferred: ProviderName, openaiKey: string, anthropicKey: string): ProviderName | null {
  if (preferred === 'openai' && openaiKey) return 'openai';
  if (preferred === 'anthropic' && anthropicKey) return 'anthropic';
  if (openaiKey) return 'openai';
  if (anthropicKey) return 'anthropic';
  return null;
}

function routeQuestion(message: string, history: ChatMessage[], openaiKey: string, anthropicKey: string): RouteDecision | null {
  const { difficulty, score } = scoreQuestion(message, history);
  const simpleProvider = (getEnv('AI_ROUTER_SIMPLE_PROVIDER', 'anthropic') as ProviderName);
  const standardProvider = (getEnv('AI_ROUTER_STANDARD_PROVIDER', 'anthropic') as ProviderName);
  const complexProvider = (getEnv('AI_ROUTER_COMPLEX_PROVIDER', 'anthropic') as ProviderName);

  const preferred =
    difficulty === 'complex'
      ? complexProvider
      : difficulty === 'standard'
      ? standardProvider
      : simpleProvider;

  const provider = pickConfiguredProvider(preferred, openaiKey, anthropicKey);
  if (!provider) return null;

  // MODELOS ATUALIZADOS (jun/2026).
  // claude-3-haiku-20240307 estava DEPRECADO — uma das causas raiz das respostas ruins.
  // Agora simple/standard/complex todos usam Sonnet 4.6 por padrão (bom equilíbrio
  // custo/qualidade), com Haiku 4.5 como opção mais barata só se você setar
  // ANTHROPIC_SIMPLE_MODEL explicitamente.
  const model =
    provider === 'openai'
      ? difficulty === 'complex'
        ? getEnv('OPENAI_REASONING_MODEL', 'gpt-5')
        : getEnv('OPENAI_FAST_MODEL', 'gpt-5-mini')
      : difficulty === 'simple'
        ? getEnv('ANTHROPIC_SIMPLE_MODEL', getEnv('ANTHROPIC_MODEL', 'claude-sonnet-4-6'))
        : getEnv('ANTHROPIC_MODEL', 'claude-sonnet-4-6');

  return { difficulty, provider, model, score };
}

// ===========================
// PROMPT DE ELITE — IRON IA
// Reescrito para forçar: (1) atender pedidos compostos por completo,
// (2) raciocinar como um time de personal trainers de alto nível,
// (3) nunca entregar treino incompleto, genérico ou raso.
// ===========================
function buildTrainerPrompt(bodyData: any, requestProfile: any, requestPreferences: any, detectedGroups: string[]) {
  const userData = bodyData || requestProfile;

  const groupsInstruction = detectedGroups.length >= 2
    ? `\nATENÇÃO CRÍTICA — PEDIDO COMPOSTO DETECTADO:
O usuário pediu treino envolvendo MAIS DE UM grupo muscular nesta mensagem (detectado: ${detectedGroups.join(', ')}).
Você é OBRIGADO a montar exercícios para TODOS os grupos pedidos, nunca só o primeiro.
Distribua o volume de forma realista (ex: peito+tríceps = grupo principal maior, secundário menor mas completo).
Se faltar isso, a resposta é considerada um ERRO GRAVE de atendimento.\n`
    : '';

  return `Você é o IRON IA: um conselho composto pelos melhores personal trainers e coaches de força do mundo, combinando a mentalidade de treinadores de powerlifting, hipertrofia natural, fisioterapia esportiva e preparação de atletas de elite. Você pensa como quem já treinou milhares de pessoas reais e sabe exatamente o que funciona na prática, não em teoria de blog.

MENTALIDADE INEGOCIÁVEL:
- Você NUNCA entrega uma resposta incompleta. Se o usuário pediu duas coisas, você responde as duas, sempre.
- Você é específico, nunca genérico. Nada de "faça exercícios para peito e tríceps" — você nomeia o exercício, a série, a repetição, o descanso e a ordem.
- Você pensa em como o usuário vai EXECUTAR aquilo na academia hoje, não em teoria.
- Você corrige o usuário com respeito quando o pedido dele é fisiologicamente ruim (ex: treinar a mesma articulação dois dias seguidos), mas sempre entrega uma solução, nunca só a crítica.
- Você prioriza: técnica > progressão de carga > volume > intensidade. Nessa ordem.
- Frase que te define: "Treino mal feito não é treino, é perda de tempo e risco de lesão." Você nunca entrega isso.

REGRA DE ATENDIMENTO COMPLETO (a mais importante):
- Leia a mensagem do usuário palavra por palavra antes de responder. Se ele citar 2 ou mais grupos musculares, regiões do corpo, ou objetivos na mesma frase, TODOS precisam aparecer na resposta com exercícios reais.
- Exemplo do que NÃO fazer: usuário pede "treino de peito e tríceps" e você só manda peito. Isso é uma falha de atendimento.
- Exemplo do que fazer: usuário pede "treino de peito e tríceps" → você monta um treino combinado, com peito como foco principal (3-4 exercícios) e tríceps como finalização (2-3 exercícios), na ordem certa (peito primeiro, porque tríceps já é auxiliar no peito; depois tríceps isolado).
${groupsInstruction}
PERSONALIDADE:
- Responda sempre em português do Brasil.
- Fale como um treinador de academia experiente: direto, prático, confiante e humano.
- Evite resposta genérica de chatbot. Diga exatamente o que fazer no treino real, com números.

SEGURANÇA:
- Não dê diagnóstico médico e não prescreva medicamentos.
- Se houver dor forte, lesão, tontura, falta de ar incomum ou sintomas persistentes, oriente procurar médico/fisioterapeuta.
- Para dieta clínica, doenças, alergias ou transtornos alimentares, recomende nutricionista/médico.

FORMATO OBRIGATÓRIO PARA TREINOS:
- Separe por grupo muscular com um cabeçalho claro para cada grupo pedido.
- Para cada exercício: nome, séries x repetições, tempo de descanso, e uma dica técnica de execução em poucas palavras.
- Sempre inclua uma ordem lógica: primeiro exercícios compostos/multiarticulares do grupo principal, depois isolados, depois o grupo secundário.
- Se fizer sentido, inclua 1 linha de aquecimento específico antes do primeiro exercício pesado.
- Em nutrição, mantenha simples, realista e voltado a performance.
- Responda com no máximo 700 palavras, salvo se o usuário pedir um plano completo multi-dia.

${userData ? `DADOS DO USUÁRIO:
- Peso: ${userData.weight || 'N/A'} kg
- Altura: ${userData.height || 'N/A'} cm
- Gordura corporal: ${userData.body_fat || userData.fat || 'N/A'}%
- Objetivo: ${userData.goal || 'N/A'}
- Experiência: ${userData.experience || userData.experience_level || 'N/A'}
- Frequência semanal: ${userData.weeklyFreq || userData.weekly_freq || 'N/A'}
- Semana atual: ${userData.currentWeek || 'N/A'}
` : ''}

${requestPreferences ? `PREFERÊNCIAS DO APP:
- Estilo: ${requestPreferences.aiStyle || requestPreferences.ai_personality || 'padrao'}
- Nível de detalhe: ${requestPreferences.detailLevel || 'medio'}
- Linguagem simples: ${requestPreferences.simpleLanguage ? 'sim' : 'nao'}
` : ''}

ANTES DE RESPONDER, VERIFIQUE MENTALMENTE:
1. Atendi TODOS os grupos musculares ou objetivos que o usuário citou?
2. Cada exercício tem séries, reps, descanso e dica técnica?
3. A ordem dos exercícios faz sentido fisiologicamente?
4. Isso é algo que um personal trainer de elite realmente entregaria, ou é raso e genérico?
Se qualquer resposta for "não", refaça antes de responder.`;
}

async function callAnthropic(model: string, systemPrompt: string, messages: ChatMessage[]) {
  const apiKey = getEnv('ANTHROPIC_API_KEY');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new ProviderError('anthropic', response.status, details);
  }

  const data = await response.json();
  return Array.isArray(data.content)
    ? data.content.map((item: any) => item.text || '').join('').trim()
    : '';
}

function parseOpenAIText(data: any) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data.output)) {
    return data.output
      .flatMap((item: any) => item.content || [])
      .map((content: any) => content.text || '')
      .join('')
      .trim();
  }

  if (Array.isArray(data.choices)) {
    return (data.choices[0]?.message?.content || '').toString().trim();
  }

  return '';
}

async function callOpenAI(model: string, systemPrompt: string, messages: ChatMessage[]) {
  const apiKey = getEnv('OPENAI_API_KEY');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: 1400,
    }),
  });

  if (response.ok) return parseOpenAIText(await response.json());

  const responseDetails = await response.json().catch(() => null);

  if (response.status !== 400 && response.status !== 404) {
    throw new ProviderError('openai', response.status, responseDetails);
  }

  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_completion_tokens: 1400,
    }),
  });

  if (!chatResponse.ok) {
    const chatDetails = await chatResponse.json().catch(() => null);
    throw new ProviderError('openai', chatResponse.status, {
      responses: responseDetails,
      chatCompletions: chatDetails,
    });
  }

  return parseOpenAIText(await chatResponse.json());
}

async function callProvider(route: RouteDecision, systemPrompt: string, messages: ChatMessage[]) {
  if (route.provider === 'openai') {
    return await callOpenAI(route.model, systemPrompt, messages);
  }

  return await callAnthropic(route.model, systemPrompt, messages);
}

function fallbackRoute(failedRoute: RouteDecision, openaiKey: string, anthropicKey: string): RouteDecision | null {
  if (failedRoute.provider === 'openai' && anthropicKey) {
    return {
      ...failedRoute,
      provider: 'anthropic',
      model: getEnv('ANTHROPIC_MODEL', 'claude-sonnet-4-6'),
    };
  }

  if (failedRoute.provider === 'anthropic' && openaiKey) {
    return {
      ...failedRoute,
      provider: 'openai',
      model:
        failedRoute.difficulty === 'complex'
          ? getEnv('OPENAI_REASONING_MODEL', 'gpt-5')
          : getEnv('OPENAI_FAST_MODEL', 'gpt-5-mini'),
    };
  }

  return null;
}

// ===========================
// VALIDAÇÃO DE COMPLETUDE
// Confere se a resposta da IA realmente citou todos os grupos pedidos.
// Se faltar algum, tenta de novo com uma instrução mais forte antes de
// devolver pro usuário uma resposta incompleta.
// ===========================
function responseCoversGroups(reply: string, groups: string[]): boolean {
  const normalizedReply = normalizeText(reply);
  return groups.every((group) => {
    const patterns = MUSCLE_GROUP_PATTERNS[group] || [group];
    return patterns.some((p) => normalizedReply.includes(normalizeText(p)));
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let message = '';
  let history: ChatMessage[] = [];
  let requestProfile: any = null;
  let requestPreferences: any = null;

  try {
    const body = await req.json();
    message = cleanMessage(body?.message);
    history = sanitizeHistory(body?.history);
    requestProfile = body?.profile && typeof body.profile === 'object' ? body.profile : null;
    requestPreferences = body?.preferences && typeof body.preferences === 'object' ? body.preferences : null;
  } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  if (!message) return jsonResponse({ error: 'Message is required' }, 400);

  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return jsonResponse({ error: 'Unauthorized - no token' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) return jsonResponse({ error: 'Invalid token' }, 401);

  let bodyData: any = requestProfile;

  try {
    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    bodyData = data || requestProfile;
  } catch {
    bodyData = requestProfile;
  }

  const openaiKey = getEnv('OPENAI_API_KEY');
  const anthropicKey = getEnv('ANTHROPIC_API_KEY');
  const route = routeQuestion(message, history, openaiKey, anthropicKey);

  if (!route) {
    return jsonResponse({ error: 'No AI provider configured' }, 500);
  }

  const detectedGroups = detectMuscleGroups(message);
  const systemPrompt = buildTrainerPrompt(bodyData, requestProfile, requestPreferences, detectedGroups);
  const messages = [
    ...history,
    { role: 'user' as const, content: message },
  ];

  try {
    let finalRoute = route;
    let aiText = await callProvider(finalRoute, systemPrompt, messages);

    if (!aiText) {
      const backup = fallbackRoute(finalRoute, openaiKey, anthropicKey);
      if (!backup) return jsonResponse({ error: 'Empty response from AI' }, 500);
      finalRoute = backup;
      aiText = await callProvider(finalRoute, systemPrompt, messages);
    }

    // Se o pedido tinha 2+ grupos musculares e a resposta não cobriu todos,
    // tenta UMA vez mais com uma instrução de correção explícita antes de
    // devolver algo incompleto pro usuário.
    if (detectedGroups.length >= 2 && aiText && !responseCoversGroups(aiText, detectedGroups)) {
      const correctionMessages = [
        ...messages,
        { role: 'assistant' as const, content: aiText },
        {
          role: 'user' as const,
          content: `Sua resposta anterior não cobriu todos os grupos musculares que eu pedi (${detectedGroups.join(', ')}). Refaça a resposta completa, incluindo exercícios reais para TODOS os grupos pedidos, sem cortar nenhum.`,
        },
      ];
      try {
        const correctedText = await callProvider(finalRoute, systemPrompt, correctionMessages);
        if (correctedText) aiText = correctedText;
      } catch {
        // Se a correção falhar, segue com a resposta original em vez de quebrar o chat.
      }
    }

    return jsonResponse({
      reply: aiText,
      provider: finalRoute.provider,
      model: finalRoute.model,
      difficulty: finalRoute.difficulty,
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      const backup = fallbackRoute(route, openaiKey, anthropicKey);

      if (backup) {
        try {
          const aiText = await callProvider(backup, systemPrompt, messages);
          if (aiText) {
            return jsonResponse({
              reply: aiText,
              provider: backup.provider,
              model: backup.model,
              difficulty: backup.difficulty,
              fallbackFrom: route.provider,
            });
          }
        } catch {
          // Retorna o erro do provedor original abaixo. Geralmente é mais útil.
        }
      }

      return jsonResponse({
        error: 'Failed to generate response',
        provider: route.provider,
        model: route.model,
        details: error.details,
      }, error.status || 502);
    }

    return jsonResponse({
      error: 'Unexpected server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});