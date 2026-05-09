/* ===========================
   IRONFIT — UI MODULE v1
   Contains: Navigation, page rendering, modals, user menu
   =========================== */

// ===========================
// PROGRESS HELPER STUBS
// ===========================
function updateMeasures(data) {
  if (!data) return;
  const measures = ['chest', 'waist', 'hip', 'armR', 'armL', 'thighR', 'thighL', 'calf'];
  measures.forEach(m => {
    const el = document.getElementById('stat' + m.charAt(0).toUpperCase() + m.slice(1));
    if (el) el.textContent = data[m] ? data[m] + ' cm' : '—';
  });
}

function renderHistory(checkins) {
  const histEl = document.getElementById('checkInHistory');
  if (!histEl) return;
  if (!checkins || !checkins.length) {
    histEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Nenhum registro ainda</div>';
    return;
  }
  histEl.innerHTML = checkins.map(c => `<div style="padding:12px;border-bottom:1px solid #333;"><strong>${c.date}</strong><br>Peso: ${c.weight || '—'} kg | Gordura: ${c.fat || '—'}%</div>`).join('');
}

function renderChart(checkins, metric) {
  // Stub: Chart.js would be used here in production
  const chartEl = document.getElementById('progressChart');
  if (!chartEl) return;
  if (!checkins || !checkins.length) {
    chartEl.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Nenhum registro ainda. Adicione seu primeiro check-in!</div>';
    return;
  }
  chartEl.innerHTML = '<div style="text-align:center;color:#0f0;">Gráfico renderizado com sucesso</div>';
}

function renderBodyInsights(data) {
  const insEl = document.getElementById('bodyInsights');
  if (!insEl) return;
  if (!data) insEl.innerHTML = '';
}

// ===========================
// NAVIGATION
// ===========================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const mnavItems = document.querySelectorAll('.mnav-item');
  const pages = document.querySelectorAll('.page');

  function goToPage(pageId) {
    if (pageId === 'profile') { window.location.href = 'profile.html'; return; }
    if (pageId === 'settings') { window.location.href = 'preferencias.html'; return; }
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    navItems.forEach(n => n.classList.remove('active'));
    mnavItems.forEach(n => n.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(n => n.classList.add('active'));
    if (pageId === 'exercises') renderExercises('all');
    if (pageId === 'builder') renderPicker('');
    if (pageId === 'progress') renderProgress();
  }

  navItems.forEach(i => i.addEventListener('click', () => goToPage(i.dataset.page)));
  mnavItems.forEach(i => i.addEventListener('click', () => { goToPage(i.dataset.page); document.getElementById('mobileOverlay')?.classList.add('hidden'); }));
  document.getElementById('hamburger')?.addEventListener('click', () => document.getElementById('mobileOverlay')?.classList.remove('hidden'));
  document.getElementById('closeMenu')?.addEventListener('click', () => document.getElementById('mobileOverlay')?.classList.add('hidden'));
}

// ===========================
// PLANS
// ===========================
function setupPlans() {
  document.querySelectorAll('.plan-card').forEach(card => card.addEventListener('click', () => openPlanModal(card.dataset.plan)));
  document.getElementById('planModalClose')?.addEventListener('click', closePlanModal);
  document.getElementById('planModalBackdrop')?.addEventListener('click', closePlanModal);
}

function openPlanModal(planId) {
  const plan = PLANS_DATA[planId]; if (!plan) return;
  document.getElementById('planModalContent').innerHTML = `
    <div class="plan-modal-header">
      <div class="plan-modal-title">IRON<span>${plan.accent}</span></div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;color:var(--gray3);margin-top:-4px;">${plan.name}</div>
      <div class="plan-modal-meta"><span>${plan.level}</span><span>${plan.frequency}</span><span>${plan.duration}</span><span>${plan.time}</span></div>
      <p style="font-size:13px;color:var(--gray3);margin-top:12px;">${plan.description}</p>
    </div>
    ${plan.days.map(day => `<div class="day-block"><div class="day-title">${day.day}</div>${day.exercises.map(ex => `<div class="exercise-row"><div class="ex-name">${ex.name}</div><div class="ex-sets"><strong>${ex.sets}</strong>séries</div><div class="ex-reps"><strong>${ex.reps}</strong>reps</div><div class="ex-rest"><strong>${ex.rest}</strong>desc.</div></div>`).join('')}</div>`).join('')}`;
  document.getElementById('planModal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePlanModal() {
  document.getElementById('planModal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===========================
// EXERCISES
// ===========================
function renderExercises(filter) {
  const grid = document.getElementById('exercisesGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? EXERCISES : EXERCISES.filter(e => e.group === filter);
  grid.innerHTML = filtered.map(ex => `
    <div class="ex-card" data-id="${ex.id}">
      <div class="ex-card-img">${ex.icon}</div>
      <div class="ex-card-body">
        <div class="ex-card-group">${ex.group.toUpperCase()}</div>
        <div class="ex-card-name">${ex.name}</div>
        <div class="ex-card-tags">${ex.tags.map(t => `<span class="ex-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
  grid.querySelectorAll('.ex-card').forEach(card => card.addEventListener('click', () => openExerciseModal(card.dataset.id)));
}

function setupExercises() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExercises(btn.dataset.filter);
    });
  });
  document.getElementById('exerciseModalClose')?.addEventListener('click', closeExerciseModal);
  document.getElementById('exerciseModalBackdrop')?.addEventListener('click', closeExerciseModal);
}

async function openExerciseModal(id) {
  const ex = EXERCISES.find(e => e.id === id); if (!ex) return;
  const content = document.getElementById('exerciseModalContent');

  const bodyData = await getUserBodyData();
  const week = bodyData.currentWeek || 1;
  const personalLoad = calcPersonalizedLoad(ex.id, bodyData, week);
  const vol = calcVolumeForWeek(week, bodyData.goal);

  const hasLocalVideo = typeof VIDEO_DB !== 'undefined' && VIDEO_DB[id];
  const initialGifBlock = hasLocalVideo
    ? buildGifBlock(null, ex.icon, false, id)
    : buildGifBlock(null, ex.icon, true, id);

  content.innerHTML = `
    ${initialGifBlock}
    <div class="ex-modal-header">
      <div class="ex-modal-icon">${ex.icon}</div>
      <div>
        <div class="ex-modal-group">${ex.group} · ${ex.difficulty}</div>
        <div class="ex-modal-title">${ex.name}</div>
        <div style="font-size:13px;color:var(--gray3);margin-top:4px;">${simplifyText(ex.muscles)}</div>
      </div>
    </div>
    <div class="ex-recs" style="margin-bottom:12px;">
      <div class="ex-rec-box"><div class="ex-rec-label">Séries</div><div class="ex-rec-value">${vol.sets}</div></div>
      <div class="ex-rec-box"><div class="ex-rec-label">Reps</div><div class="ex-rec-value">${vol.reps}</div></div>
      <div class="ex-rec-box"><div class="ex-rec-label">Descanso</div><div class="ex-rec-value">${vol.rest}</div></div>
      <div class="ex-rec-box"><div class="ex-rec-label">Carga Est.</div><div class="ex-rec-value" style="color:var(--accent,#e8ff00)">${personalLoad}</div></div>
    </div>
    <div style="font-size:11px;color:var(--gray3);margin-bottom:20px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;">
      📅 Semana ${week}/12 — ${vol.note}
    </div>
    <div class="ex-section"><div class="ex-section-title">Execução passo a passo</div><ol class="steps-list">${ex.steps.map((s, i) => `<li><span class="step-num">${i + 1}</span><span>${simplifyText(s)}</span></li>`).join('')}</ol></div>
    <div class="ex-section"><div class="ex-section-title">Dicas de postura</div><ul class="tips-list">${ex.tips.map(t => `<li>${simplifyText(t)}</li>`).join('')}</ul></div>
    <div class="ex-section"><div class="ex-section-title">Erros comuns</div><ul class="mistakes-list">${ex.mistakes.map(m => `<li>${simplifyText(m)}</li>`).join('')}</ul></div>`;

  document.getElementById('exerciseModal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (hasLocalVideo) return;

  let gifUrl = null;
  if (typeof GIFService !== 'undefined' && GIFService.getGif) {
    gifUrl = await GIFService.getGif(id);
  } else {
    gifUrl = await fetchGifFromExerciseDB(id);
  }
  const gifBlock = document.getElementById('gifBlock');
  if (gifBlock) gifBlock.outerHTML = buildGifBlock(gifUrl, ex.icon, false, id);
}

function closeExerciseModal() {
  document.getElementById('exerciseModal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===========================
// BUILDER
// ===========================
let currentWorkout = [];

function renderPicker(filterGroup) {
  const picker = document.getElementById('exercisePicker');
  if (!picker) return;
  const filtered = filterGroup ? EXERCISES.filter(e => e.group === filterGroup) : EXERCISES;
  picker.innerHTML = filtered.map(ex => `
    <div class="picker-item">
      <div><div class="picker-item-name">${ex.name}</div><div class="picker-item-group">${ex.group.charAt(0).toUpperCase() + ex.group.slice(1)}</div></div>
      <button class="picker-add-btn" data-id="${ex.id}">+</button>
    </div>`).join('');
  picker.querySelectorAll('.picker-add-btn').forEach(btn => btn.addEventListener('click', () => addExercise(btn.dataset.id)));
}

window.filterBuilderExercises = function () { renderPicker(document.getElementById('addGroup')?.value || ''); };

function addExercise(id) {
  const ex = EXERCISES.find(e => e.id === id); if (!ex) return;
  const bodyData = userBodyDataCache;
  const week = bodyData?.currentWeek || 1;
  const load = bodyData ? calcPersonalizedLoad(id, bodyData, week) : '?';
  const vol = calcVolumeForWeek(week, bodyData?.goal || 'hipertrofia');
  currentWorkout.push({
    ...ex,
    sets: String(vol.sets),
    reps: String(vol.reps),
    rest: vol.rest.replace('s', ''),
    estimatedLoad: load,
    uid: Date.now() + Math.random(),
  });
  renderWorkoutList();
}

function removeExercise(uid) { currentWorkout = currentWorkout.filter(e => e.uid !== uid); renderWorkoutList(); }

function renderWorkoutList() {
  const list = document.getElementById('workoutList');
  if (!list) return;
  if (!currentWorkout.length) {
    list.innerHTML = `<div class="empty-workout"><div class="empty-icon">⬛</div><p>Adicione exercícios ao seu treino</p></div>`;
    return;
  }
  list.innerHTML = currentWorkout.map(ex => `
    <div class="workout-ex-item">
      <div>
        <div class="wei-name">${ex.name}</div>
        <div class="wei-group">${ex.group.charAt(0).toUpperCase() + ex.group.slice(1)} ${ex.estimatedLoad ? `· 🏋️ ${ex.estimatedLoad}` : ''}</div>
      </div>
      <div><span class="wei-label">Séries</span><input class="wei-input" type="number" min="1" max="10" value="${ex.sets}" onchange="updateField(${ex.uid},'sets',this.value)"/></div>
      <div><span class="wei-label">Reps</span><input class="wei-input" type="text" value="${ex.reps}" onchange="updateField(${ex.uid},'reps',this.value)" style="width:68px;"/></div>
      <div><span class="wei-label">Desc(s)</span><input class="wei-input" type="number" min="15" max="300" value="${ex.rest}" onchange="updateField(${ex.uid},'rest',this.value)"/></div>
      <button class="wei-remove" onclick="removeExercise(${ex.uid})">✕</button>
    </div>`).join('');
}

window.updateField = function (uid, field, value) { const ex = currentWorkout.find(e => e.uid === uid); if (ex) ex[field] = value; };

function setupBuilder() {
  document.getElementById('clearPlanBtn')?.addEventListener('click', () => { currentWorkout = []; renderWorkoutList(); });
  document.getElementById('savePlanBtn')?.addEventListener('click', () => {
    const name = document.getElementById('builderName')?.value.trim() || 'Meu Treino';
    const goal = document.getElementById('builderGoal')?.value || 'Personalizado';
    if (!currentWorkout.length) { alert('Adicione pelo menos um exercício!'); return; }
    const saved = JSON.parse(localStorage.getItem('ironfit_plans') || '[]');
    saved.push({ id: Date.now(), name, goal, exercises: currentWorkout, date: new Date().toLocaleDateString('pt-BR') });
    localStorage.setItem('ironfit_plans', JSON.stringify(saved));
    renderSavedPlans();
    currentWorkout = []; renderWorkoutList();
    if (document.getElementById('builderName')) document.getElementById('builderName').value = '';
    if (document.getElementById('builderGoal')) document.getElementById('builderGoal').value = '';
    alert(`Treino "${name}" salvo! 💪`);
  });
  renderPicker('');
  renderSavedPlans();
}

function renderSavedPlans() {
  const saved = JSON.parse(localStorage.getItem('ironfit_plans') || '[]');
  const section = document.getElementById('savedPlansSection');
  if (!section) return;
  if (!saved.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  document.getElementById('savedPlansGrid').innerHTML = saved.map(p =>
    `<div class="saved-plan-card">
      <div class="saved-plan-name">${p.name}</div>
      <div class="saved-plan-meta">${p.goal} · ${p.exercises.length} exercícios · ${p.date}</div>
      <div class="saved-plan-actions">
        <button class="sp-btn" onclick="loadSavedPlan(${p.id})">Carregar</button>
        <button class="sp-btn danger" onclick="deleteSavedPlan(${p.id})">Excluir</button>
      </div>
    </div>`).join('');
}

window.loadSavedPlan = function (id) {
  const saved = JSON.parse(localStorage.getItem('ironfit_plans') || '[]');
  const plan = saved.find(p => p.id === id); if (!plan) return;
  currentWorkout = plan.exercises.map(e => ({ ...e, uid: Date.now() + Math.random() }));
  if (document.getElementById('builderName')) document.getElementById('builderName').value = plan.name;
  renderWorkoutList();
};

window.deleteSavedPlan = function (id) {
  if (!confirm('Excluir?')) return;
  let saved = JSON.parse(localStorage.getItem('ironfit_plans') || '[]');
  saved = saved.filter(p => p.id !== id);
  localStorage.setItem('ironfit_plans', JSON.stringify(saved));
  renderSavedPlans();
};

// ===========================
// PROGRESS SYSTEM
// ===========================
let progressChart = null, currentMetric = 'weight';

function renderProgress() {
  const checkins = getCheckins();
  document.getElementById('statCount').textContent = checkins.length;

  if (!checkins.length) {
    ['statWeight', 'statImc', 'statFat'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });
    ['statWeightDelta', 'statFatDelta', 'statImcLabel'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
    updateMeasures(null); renderHistory([]); renderChart([], currentMetric);
    renderBodyInsights(null);
    return;
  }

  const latest = checkins[checkins.length - 1];
  const prev = checkins.length > 1 ? checkins[checkins.length - 2] : null;

  const weightEl = document.getElementById('statWeight');
  if (weightEl) weightEl.textContent = latest.weight ? latest.weight + ' kg' : '—';
}

function setupProgress() {
  document.getElementById('openCheckInBtn')?.addEventListener('click', () => {
    const ciDate = document.getElementById('ciDate');
    if (ciDate) ciDate.value = new Date().toISOString().split('T')[0];
    document.getElementById('checkInModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });
  document.getElementById('checkInClose')?.addEventListener('click', closeCheckIn);
  document.getElementById('checkInBackdrop')?.addEventListener('click', closeCheckIn);
  document.getElementById('saveCheckInBtn')?.addEventListener('click', () => {
    const date = document.getElementById('ciDate')?.value;
    if (!date) { alert('Informe a data!'); return; }
    const entry = {
      id: Date.now(),
      date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR'),
      weight: document.getElementById('ciWeight')?.value || null,
      height: document.getElementById('ciHeight')?.value || null,
      fat: document.getElementById('ciFat')?.value || null,
      muscle: document.getElementById('ciMuscle')?.value || null,
      chest: document.getElementById('ciChest')?.value || null,
      waist: document.getElementById('ciWaist')?.value || null,
      hip: document.getElementById('ciHip')?.value || null,
      armR: document.getElementById('ciArmR')?.value || null,
      armL: document.getElementById('ciArmL')?.value || null,
      thighR: document.getElementById('ciThighR')?.value || null,
      thighL: document.getElementById('ciThighL')?.value || null,
      calf: document.getElementById('ciCalf')?.value || null,
      notes: document.getElementById('ciNotes')?.value || null,
    };
    const checkins = getCheckins();
    checkins.push(entry);
    saveCheckins(checkins);
    userBodyDataCache = null;
    closeCheckIn();
    renderProgress();
    ['ciWeight', 'ciHeight', 'ciFat', 'ciMuscle', 'ciChest', 'ciWaist', 'ciHip', 'ciArmR', 'ciArmL', 'ciThighR', 'ciThighL', 'ciCalf', 'ciNotes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  });

  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMetric = tab.dataset.metric;
      const labels = { weight: 'Evolução do Peso', fat: 'Evolução da Gordura', muscle: 'Evolução do Músculo' };
      const title = document.querySelector('.chart-title');
      if (title) title.textContent = labels[currentMetric] || 'Evolução';
      renderChart(getCheckins(), currentMetric);
    });
  });
}

function closeCheckIn() {
  document.getElementById('checkInModal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

window.deleteCheckin = function (id) {
  if (!confirm('Excluir?')) return;
  saveCheckins(getCheckins().filter(c => c.id !== id));
  userBodyDataCache = null;
  renderProgress();
};

// ===========================
// USER MENU
// ===========================
function toggleUserMenu() {
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return;
  userMenu.classList.toggle('hidden');
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sidebarUser') && !e.target.closest('#userMenu')) userMenu.classList.add('hidden');
  }, { once: true });
}

async function handleLogout() {
  const keysToRemove = ['ironfit_profile', 'ironfit_prefs', 'ironfit_avatar', 'ironfit_plans', 'ironfit_checkins', 'user_preferences', 'user_data', 'ironfit_userEmail', 'ironfit_fullName', 'ironfit_userId', 'ironfit_loggedIn'];
  keysToRemove.forEach(k => localStorage.removeItem(k));
  if (supabaseClient) { try { await supabaseClient.auth.signOut(); } catch (e) { } }
  window.location.href = 'login.html';
}
