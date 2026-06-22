/**
 * IRONFIT — GIF Database (Supabase Storage)
 * ---------------------------------------------------------------
 * Substitui a integração antiga com ExerciseDB/RapidAPI por GIFs
 * estáticos hospedados no bucket público "gifs" do Supabase Storage.
 *
 * Vantagens dessa abordagem:
 * - Sem custo recorrente de API (RapidAPI cobrava por chamada)
 * - Sem rate limit / sem risco de a API de terceiro cair
 * - Carregamento direto via CDN do Supabase (rápido, cacheável)
 *
 * Exercícios sem GIF disponível caem automaticamente no fallback
 * de animação CSS (ver buildCSSFallback), que já existia no app.
 *
 * Para adicionar novos GIFs no futuro:
 * 1. Suba o arquivo .gif no bucket "gifs" do Supabase Storage
 * 2. Nomeie o arquivo exatamente como o ID do exercício (ex: agachamento.gif)
 * 3. Adicione o ID na lista AVAILABLE_GIFS abaixo
 */

// =========================
// CONFIG — Supabase Storage
// =========================
const SUPABASE_STORAGE_BASE = 'https://oqqoafejnzoolbpskbji.supabase.co/storage/v1/object/public/gifs';

// =========================
// VIDEO LOCAL MAPPING
// Vídeos locais que substituem GIFs/Animações em exercícios específicos
// =========================
const VIDEO_DB = {
  'supino-reto': 'gifs/download.mp4'
};

// =========================
// GIFs DISPONÍVEIS NO BUCKET
// Lista de IDs de exercício que possuem um GIF real hospedado.
// Qualquer ID fora desta lista usa o fallback de animação CSS.
// =========================
const AVAILABLE_GIFS = [
  'supino-inclinado',
  'supino-halter',
  'crucifixo',
  'leg-press',
  'agachamento-bulgaro',
  'panturrilha-pe',
  'elevacao-frontal',
  'encolhimento',
  'rosca-direta',
  'rosca-concentrada',
  'rosca-cabo',
  'triceps-frances',
  'mergulho-triceps',
  'abdominal-supra',
  'abdominal-infra',
  'remada-maquina',
  'puxada-frontal',
];

// Mapeia cada exercício para um tipo de animação CSS (usado no fallback)
const EXERCISE_ANIM_TYPE = {
  'supino-reto':'push','supino-inclinado':'push','supino-declinado':'push','supino-halter':'push',
  'crucifixo':'push','crossover':'push','flexao':'push','mergulho-peito':'push','peck-deck':'push',
  'levantamento-terra':'pull','remada-curvada':'pull','puxada-frontal':'pull','barra-fixa':'pull',
  'remada-unilateral':'pull','remada-maquina':'pull','remada-serrote':'pull','pullover':'pull','terra-romeno':'pull','terra-sumo':'pull',
  'agachamento':'squat','leg-press':'squat','cadeira-extensora':'extend','mesa-flexora':'curl',
  'agachamento-hack':'squat','agachamento-bulgaro':'squat','afundo':'squat','hip-thrust':'push','stiff':'pull',
  'panturrilha-pe':'squat','panturrilha-sentado':'squat','abducao-maquina':'extend','adducao-maquina':'pull',
  'desenvolvimento':'push','desenvolvimento-barra':'push','elevacao-lateral':'extend','elevacao-frontal':'extend',
  'face-pull':'pull','encolhimento':'squat','passaro':'extend',
  'rosca-direta':'curl','rosca-martelo':'curl','rosca-concentrada':'curl','rosca-inclinada':'curl','rosca-cabo':'curl','rosca-scott':'curl',
  'triceps-pulley':'extend','triceps-frances':'extend','triceps-banco':'extend','triceps-unilateral':'extend','triceps-corda':'extend',
  'mergulho-triceps':'push','kickback':'extend',
  'abdominal-supra':'twist','prancha':'hold','abdominal-bicicleta':'twist','abdominal-infra':'extend',
  'abdominal-obliquo':'twist','abdominal-roda':'push','elevacao-pernas-barra':'extend','vacuo-abdominal':'hold'
};

// =========================
// GIF SERVICE
// =========================
const GIFService = {
  init() {
    // Mantido por compatibilidade com chamadas existentes (script.js, ui.js).
    // Não há mais cache em localStorage: as URLs são estáticas e o
    // próprio navegador/CDN do Supabase já cacheiam os arquivos.
  },

  // Retorna a URL do GIF se o exercício tiver um disponível, senão null.
  // Mantém a assinatura async por compatibilidade com quem já chama
  // `await GIFService.getGif(id)` no restante do app.
  async getGif(exerciseId) {
    if (!exerciseId || !AVAILABLE_GIFS.includes(exerciseId)) {
      return null;
    }
    return `${SUPABASE_STORAGE_BASE}/${exerciseId}.gif`;
  },

  // Gera um card com CSS animation puro (fallback visual animado)
  // Os estilos CSS estão em style.css (keyframes e classes .anim-*)
  buildCSSFallback(exerciseId, icon) {
    const animType = EXERCISE_ANIM_TYPE[exerciseId] || 'push';
    const labelMap = {
      push:  'Empurrar',
      pull:  'Puxar',
      squat: 'Agachar',
      curl:  'Flexionar',
      extend:'Estender',
      twist: 'Torcer',
      hold:  'Segurar'
    };
    const label = labelMap[animType] || 'Empurrar';

    return `
    <div class="ex-gif-container anim-${animType}" id="gifBlock">
      <div class="gif-fallback-badge">ANIMAÇÃO</div>
      <div class="gif-fallback-wrap">
        <div class="gif-fallback-icon">${icon}</div>
        <div class="gif-fallback-bar"></div>
        <div class="gif-fallback-label">${label}</div>
      </div>
    </div>`;
  },

  // Build do bloco de GIF com loading state
  buildGifBlock(gifUrl, icon, loading=false, exerciseId=null) {
    // Verificar se existe vídeo local para este exercício
    const videoUrl = exerciseId && VIDEO_DB[exerciseId] ? VIDEO_DB[exerciseId] : null;
    const fallbackHTML = this.buildCSSFallback(exerciseId || '', icon).replace(/'/g, "&#39;");

    if (videoUrl) {
      return `<div class="ex-gif-container" id="gifBlock" style="background:#111;border-radius:0;overflow:visible;">
        <span class="ex-gif-badge">VÍDEO</span>
        <video src="${videoUrl}" autoplay loop muted playsinline controls style="width:100%;max-height:320px;object-fit:contain;display:block;border-radius:0;background:#111;" onerror="document.getElementById('gifBlock').outerHTML='${fallbackHTML}'"></video>
      </div>`;
    }

    if (loading) {
      return `<div class="ex-gif-container" id="gifBlock">
        <div class="ex-gif-fallback">
          <div class="gif-spinner"></div>
          <div class="ex-gif-label">CARREGANDO GIF...</div>
        </div>
      </div>`;
    }

    if (gifUrl) {
      return `<div class="ex-gif-container" id="gifBlock">
        <span class="ex-gif-badge">GIF</span>
        <img src="${gifUrl}" alt="Execução" style="width:100%;max-height:320px;object-fit:contain;display:block;border-radius:12px;" loading="lazy" onerror="document.getElementById('gifBlock').outerHTML='${fallbackHTML}'"/>
      </div>`;
    }

    // Fallback animado CSS (exercício ainda não tem GIF no bucket)
    return this.buildCSSFallback(exerciseId || '', icon);
  }
};

// Inicializar (no-op, mantido por compatibilidade)
GIFService.init();