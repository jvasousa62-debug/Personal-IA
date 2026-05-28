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
  const standardProvider = (getEnv('AI_ROUTER_STANDARD_PROVIDER', 'openai') as ProviderName);
  const complexProvider = (getEnv('AI_ROUTER_COMPLEX_PROVIDER', 'openai') as ProviderName);

  const preferred =
    difficulty === 'complex'
      ? complexProvider
      : difficulty === 'standard'
      ? standardProvider
      : simpleProvider;

  const provider = pickConfiguredProvider(preferred, openaiKey, anthropicKey);
  if (!provider) return null;

  const model =
    provider === 'openai'
      ? difficulty === 'complex'
        ? getEnv('OPENAI_REASONING_MODEL', 'gpt-5')
        : getEnv('OPENAI_FAST_MODEL', 'gpt-5-mini')
      : getEnv('ANTHROPIC_MODEL', 'claude-3-haiku-20240307');

  return { difficulty, provider, model, score };
}

function buildTrainerPrompt(bodyData: any, requestProfile: any, requestPreferences: any) {
  const userData = bodyData || requestProfile;

  return `Voce e o IRON IA, um personal trainer realista e experiente do app IRONFIT.

PERSONALIDADE:
- Responda sempre em portugues do Brasil.
- Fale como um treinador de academia: direto, pratico, confiante e humano.
- Seja especifico. Prefira exercicios, series, repeticoes, descanso, ordem, tecnica e progressao.
- Evite resposta generica de chatbot. Diga o que fazer no treino real.
- Quando faltar dado importante, peca a informacao e entregue uma recomendacao segura com o contexto atual.

SEGURANCA:
- Nao de diagnostico medico e nao prescreva medicamentos.
- Se houver dor forte, lesao, tontura, falta de ar incomum ou sintomas persistentes, oriente procurar medico/fisioterapeuta.
- Para dieta clinica, doencas, alergias ou transtornos alimentares, recomende nutricionista/medico.

FORMATO:
- Use markdown limpo.
- Em planos de treino, inclua aquecimento curto, exercicios em ordem, series x reps, descanso, tecnica e progressao.
- Em tecnica, inclua ajuste inicial, execucao, erros comuns e alternativa se houver desconforto.
- Em nutricao, mantenha simples, realista e voltado a performance.
- Responda com no maximo 650 palavras, salvo se o usuario pedir um plano completo.

${userData ? `DADOS DO USUARIO:
- Peso: ${userData.weight || 'N/A'} kg
- Altura: ${userData.height || 'N/A'} cm
- Gordura corporal: ${userData.body_fat || userData.fat || 'N/A'}%
- Objetivo: ${userData.goal || 'N/A'}
- Experiencia: ${userData.experience || userData.experience_level || 'N/A'}
- Frequencia semanal: ${userData.weeklyFreq || userData.weekly_freq || 'N/A'}
- Semana atual: ${userData.currentWeek || 'N/A'}
` : ''}

${requestPreferences ? `PREFERENCIAS DO APP:
- Estilo: ${requestPreferences.aiStyle || requestPreferences.ai_personality || 'padrao'}
- Nivel de detalhe: ${requestPreferences.detailLevel || 'medio'}
- Linguagem simples: ${requestPreferences.simpleLanguage ? 'sim' : 'nao'}
` : ''}`;
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
      max_tokens: 850,
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
      max_output_tokens: 900,
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
      max_completion_tokens: 900,
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
      model: getEnv('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
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

  const systemPrompt = buildTrainerPrompt(bodyData, requestProfile, requestPreferences);
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
          // Return the original provider error below. It is usually more useful.
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
