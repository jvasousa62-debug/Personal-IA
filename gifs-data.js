/**
 * IRONFIT — GIF Database + Fallback System
 * Fontes gratuitas: ExerciseDB (RapidAPI), Wikimedia Commons, Giphy, CSS animations
 */

// =========================
// VIDEO LOCAL MAPPING
// Vídeos locais que substituem GIFs/Animações em exercícios específicos
// =========================
const VIDEO_DB = {
  'supino-reto': 'gifs/download.mp4'
};

// =========================
// GIF PUBLIC MAPPING
// URLs de GIFs gratuitos/domínio público mapeados por ID do exercício
// =========================
const GIF_DB = {
  // PEITO
  'supino-reto':         { provider:'exercisedb', term:'barbell bench press' },
  'supino-inclinado':    { provider:'exercisedb', term:'incline barbell bench press' },
  'supino-declinado':    { provider:'exercisedb', term:'decline barbell bench press' },
  'supino-halter':       { provider:'exercisedb', term:'dumbbell bench press' },
  'crucifixo':           { provider:'exercisedb', term:'chest fly' },
  'crossover':           { provider:'exercisedb', term:'cable crossover' },
  'flexao':              { provider:'exercisedb', term:'push up' },
  'mergulho-peito':      { provider:'exercisedb', term:'dip' },
  'peck-deck':           { provider:'exercisedb', term:'pec deck fly' },

  // COSTAS
  'levantamento-terra':  { provider:'exercisedb', term:'barbell deadlift' },
  'remada-curvada':      { provider:'exercisedb', term:'barbell bent over row' },
  'puxada-frontal':      { provider:'exercisedb', term:'lat pulldown' },
  'barra-fixa':          { provider:'exercisedb', term:'pull up' },
  'remada-unilateral':   { provider:'exercisedb', term:'dumbbell row' },
  'remada-maquina':      { provider:'exercisedb', term:'seated row' },
  'remada-serrote':      { provider:'exercisedb', term:'cable row' },
  'pullover':            { provider:'exercisedb', term:'dumbbell pullover' },
  'terra-romeno':        { provider:'exercisedb', term:'romanian deadlift' },
  'terra-sumo':          { provider:'exercisedb', term:'sumo deadlift' },

  // PERNAS
  'agachamento':         { provider:'exercisedb', term:'barbell squat' },
  'leg-press':           { provider:'exercisedb', term:'leg press' },
  'cadeira-extensora':   { provider:'exercisedb', term:'leg extension' },
  'mesa-flexora':        { provider:'exercisedb', term:'leg curl' },
  'agachamento-hack':    { provider:'exercisedb', term:'hack squat' },
  'agachamento-bulgaro': { provider:'exercisedb', term:'bulgarian split squat' },
  'afundo':              { provider:'exercisedb', term:'lunge' },
  'hip-thrust':          { provider:'exercisedb', term:'hip thrust' },
  'stiff':               { provider:'exercisedb', term:'stiff leg deadlift' },
  'panturrilha-pe':      { provider:'exercisedb', term:'standing calf raise' },
  'panturrilha-sentado': { provider:'exercisedb', term:'seated calf raise' },
  'abducao-maquina':     { provider:'exercisedb', term:'hip abduction' },
  'adducao-maquina':     { provider:'exercisedb', term:'hip adduction' },

  // OMBROS
  'desenvolvimento':     { provider:'exercisedb', term:'dumbbell shoulder press' },
  'desenvolvimento-barra': { provider:'exercisedb', term:'barbell overhead press' },
  'elevacao-lateral':    { provider:'exercisedb', term:'lateral raise' },
  'elevacao-frontal':    { provider:'exercisedb', term:'front raise' },
  'face-pull':           { provider:'exercisedb', term:'face pull' },
  'encolhimento':        { provider:'exercisedb', term:'shrug' },
  'passaro':             { provider:'exercisedb', term:'reverse fly' },

  // BÍCEPS
  'rosca-direta':        { provider:'exercisedb', term:'barbell curl' },
  'rosca-martelo':       { provider:'exercisedb', term:'hammer curl' },
  'rosca-concentrada':   { provider:'exercisedb', term:'concentration curl' },
  'rosca-inclinada':     { provider:'exercisedb', term:'incline curl' },
  'rosca-cabo':          { provider:'exercisedb', term:'cable curl' },
  'rosca-scott':         { provider:'exercisedb', term:'preacher curl' },

  // TRÍCEPS
  'triceps-pulley':      { provider:'exercisedb', term:'triceps pushdown' },
  'triceps-frances':     { provider:'exercisedb', term:'skull crusher' },
  'triceps-banco':       { provider:'exercisedb', term:'bench dip' },
  'triceps-unilateral':  { provider:'exercisedb', term:'tricep pushdown' },
  'triceps-corda':       { provider:'exercisedb', term:'rope pushdown' },
  'mergulho-triceps':    { provider:'exercisedb', term:'dips' },
  'kickback':            { provider:'exercisedb', term:'tricep kickback' },

  // ABDÔMEN
  'abdominal-supra':     { provider:'exercisedb', term:'crunch' },
  'prancha':             { provider:'exercisedb', term:'plank' },
  'abdominal-bicicleta': { provider:'exercisedb', term:'bicycle crunch' },
  'abdominal-infra':     { provider:'exercisedb', term:'leg raise' },
  'abdominal-obliquo':   { provider:'exercisedb', term:'oblique crunch' },
  'abdominal-roda':      { provider:'exercisedb', term:'ab wheel' },
  'elevacao-pernas-barra': { provider:'exercisedb', term:'hanging leg raise' },
  'vacuo-abdominal':     { provider:'exercisedb', term:'stomach vacuum' },
};

// Mapeia cada exercício para um tipo de animação CSS
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
  // Cache em memória + localStorage
  _cache: new Map(),
  _localStorageKey: 'ironfit_gif_cache',

  _loadPersistentCache() {
    try {
      const raw = localStorage.getItem(this._localStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([k, v]) => this._cache.set(k, v));
      }
    } catch (e) { /* ignore */ }
  },

  _savePersistentCache() {
    try {
      const obj = {};
      this._cache.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(this._localStorageKey, JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  },

  init() {
    this._loadPersistentCache();
  },

  async getGif(exerciseId) {
    // 1. Verificar cache
    if (this._cache.has(exerciseId)) {
      const cached = this._cache.get(exerciseId);
      if (cached && cached !== 'null') return cached;
      return null;
    }

    // 2. Tentar GIF local SOMENTE se fizer sentido (a pasta atual não garante todos os GIFs)
    // Evita tentar carregar arquivos inexistentes (.gif1, etc.) e poluir console com 404.
    const localUrl = `gifs/${exerciseId}.gif`;
    const allowLocal = false; // <-- modo “silencioso”: não tenta local (foca em edge/CSS)

    if (allowLocal) {
      try {
        const exists = await this._checkImageExists(localUrl);
        if (exists) {
          this._cache.set(exerciseId, localUrl);
          this._savePersistentCache();
          return localUrl;
        }
      } catch (e) { /* ignore */ }
    }

    // 3. Tentar ExerciseDB via Edge Function (mais importante)
    if (typeof fetchGifFromExerciseDB === 'function') {
      try {
        const url = await fetchGifFromExerciseDB(exerciseId);
        if (url) {
          this._cache.set(exerciseId, url);
          this._savePersistentCache();
          return url;
        }
      } catch (e) { /* ignore */ }
    }

    // 4. Marcar como não encontrado para não tentar de novo
    this._cache.set(exerciseId, null);
    this._savePersistentCache();
    return null;
  },

  _checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
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
    const animType = EXERCISE_ANIM_TYPE[exerciseId] || 'push';
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

    // Fallback animado CSS
    return this.buildCSSFallback(exerciseId || '', icon);
  }
};

// Inicializar cache persistente ao carregar
GIFService.init();

