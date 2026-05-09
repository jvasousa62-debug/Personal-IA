
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  let message = '';
  let history: any[] = [];
  let requestProfile: any = null;
  let requestPreferences: any = null;

  try {
    const body = await req.json();

    message = body?.message?.toString().trim() || '';
    history = Array.isArray(body?.history) ? body.history : [];
    requestProfile = body?.profile && typeof body.profile === 'object' ? body.profile : null;
    requestPreferences = body?.preferences && typeof body.preferences === 'object' ? body.preferences : null;

  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON in request body',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (!message) {
    return new Response(
      JSON.stringify({
        error: 'Message is required',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized - no token',
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(
      JSON.stringify({
        error: 'Invalid token',
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  let bodyData: any = null;

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


const systemPrompt = `
Você é IRON IA, um personal trainer de inteligência artificial especializado em musculação, hipertrofia, força e performance física.

INSTRUÇÕES IMPORTANTES:
1. Responda SEMPRE em PORTUGUÊS BRASIL
2. Seja prático, direto e motivador
3. Dê recomendações específicas baseadas na pergunta do usuário
4. Use markdown para formatação
5. Máximo de 300 tokens por resposta
6. Se não souber algo específico, seja honesto e sugira consultar um profissional

${bodyData ? `
DADOS DO USUÁRIO:
- Peso: ${bodyData.weight || 'N/A'} kg
- Gordura Corporal: ${bodyData.body_fat || 'N/A'}%
- Altura: ${bodyData.height || 'N/A'} cm
- Objetivo: ${bodyData.goal || 'N/A'}
- Experiência: ${bodyData.experience_level || 'N/A'}
` : ''}

ÁREAS DE EXPERTISE:
- Planejamento de treinos
- Hipertrofia
- Força
- Nutrição esportiva
- Recuperação
- Suplementação

NÃO:
- Dar diagnósticos médicos
- Prescrever medicamentos
`;


const qualityPrompt = `

QUALIDADE DA RESPOSTA:
- Nao responda como chatbot generico. Responda como treinador experiente.
- Sempre que fizer sentido, explique o fundamento: tensao mecanica, volume, descanso, progressao, recuperacao ou aderencia.
- Se o usuario pedir treino, entregue exercicios com series x reps, descanso, ordem, carga estimada quando possivel e progressao.
- Ajuste pelo peso, objetivo, experiencia, semana atual e preferencias do usuario.
- Se faltar contexto, faca uma recomendacao segura e diga qual dado refinaria a resposta.
- Use markdown claro, tom motivador e poucas firulas.
- Para pedidos de treino, nutricao ou tecnica, priorize utilidade sobre brevidade; pode responder com mais detalhes.

${requestProfile ? `
CONTEXTO ENVIADO PELO APP:
- Peso: ${requestProfile.weight || 'N/A'} kg
- Altura: ${requestProfile.height || 'N/A'} cm
- Objetivo: ${requestProfile.goal || 'N/A'}
- Experiencia: ${requestProfile.experience || requestProfile.experience_level || 'N/A'}
- Semana atual: ${requestProfile.currentWeek || 'N/A'}
` : ''}

${requestPreferences ? `
PREFERENCIAS:
- Estilo: ${requestPreferences.aiStyle || requestPreferences.ai_personality || 'padrao'}
- Nivel de detalhe: ${requestPreferences.detailLevel || 'medio'}
- Linguagem simples: ${requestPreferences.simpleLanguage ? 'sim' : 'nao'}
` : ''}
`;

const messages = [
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'API key not configured',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {

    const aiResponse = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          system: `${systemPrompt}\n${qualityPrompt}`,
          messages,
        }),
      }
    );

    if (!aiResponse.ok) {

      const errorData = await aiResponse
        .json()
        .catch(() => null);

      return new Response(
        JSON.stringify({
          error: 'Failed to generate response',
          details: errorData,
        }),
        {
          status: aiResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await aiResponse.json();

    const aiText =
      typeof data.completion === 'string'
        ? data.completion.trim()
        : Array.isArray(data.content)
        ? data.content
            .map((item: any) => item.text || '')
            .join('')
            .trim()
        : (data.output_text || '').toString().trim();

    if (!aiText) {
      return new Response(
        JSON.stringify({
          error: 'Empty response from AI',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        reply: aiText,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: 'Unexpected server error',
        details: error instanceof Error
          ? error.message
          : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
