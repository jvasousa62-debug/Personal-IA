/* ===========================
   IRONFIT — DATA MODULE v1
   Contains: EXERCISES, PLANS_DATA, API constants, helpers
   =========================== */

// ===========================
// DATA: WORKOUT PLANS
// ===========================
const PLANS_DATA = {
  hipertrofia: { name: 'Hipertrofia Max', accent: 'Max', level: 'Intermediário', frequency: '4x semana', duration: '12 semanas', time: '60-75 min', description: 'Programa de 4 dias com divisão Push/Pull/Legs, alto volume e progressão semanal.', days: [{ day: 'Dia A — Peito e Tríceps', exercises: [{ name: 'Supino Reto', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Supino Inclinado', sets: '4', reps: '10-12', rest: '75s' }, { name: 'Crucifixo', sets: '3', reps: '12-15', rest: '60s' }, { name: 'Tríceps Pulley', sets: '4', reps: '12-15', rest: '60s' }, { name: 'Tríceps Francês', sets: '3', reps: '10-12', rest: '60s' }] }, { day: 'Dia B — Costas e Bíceps', exercises: [{ name: 'Puxada Frontal', sets: '4', reps: '8-10', rest: '90s' }, { name: 'Remada Curvada', sets: '4', reps: '10-12', rest: '75s' }, { name: 'Remada Unilateral', sets: '3', reps: '12', rest: '60s' }, { name: 'Rosca Direta', sets: '4', reps: '10-12', rest: '60s' }, { name: 'Rosca Martelo', sets: '3', reps: '12-15', rest: '60s' }] }, { day: 'Dia C — Pernas', exercises: [{ name: 'Agachamento Livre', sets: '4', reps: '8-10', rest: '120s' }, { name: 'Leg Press 45°', sets: '4', reps: '12-15', rest: '90s' }, { name: 'Cadeira Extensora', sets: '3', reps: '15', rest: '60s' }, { name: 'Mesa Flexora', sets: '3', reps: '12', rest: '60s' }, { name: 'Panturrilha em Pé', sets: '4', reps: '15-20', rest: '45s' }] }, { day: 'Dia D — Ombros e Abdômen', exercises: [{ name: 'Desenvolvimento com Halteres', sets: '4', reps: '10-12', rest: '75s' }, { name: 'Elevação Lateral', sets: '4', reps: '12-15', rest: '60s' }, { name: 'Face Pull', sets: '3', reps: '15-20', rest: '60s' }, { name: 'Abdominal Supra', sets: '4', reps: '20', rest: '45s' }, { name: 'Prancha', sets: '3', reps: '60s', rest: '45s' }] }] },
  forca: { name: 'Força Total', accent: 'Total', level: 'Avançado', frequency: '3x semana', duration: '8 semanas', time: '50-60 min', description: 'Método StrongLifts 5x5. Foco em levantamentos básicos e progressão de carga toda semana.', days: [{ day: 'Treino A', exercises: [{ name: 'Agachamento Livre', sets: '5', reps: '5', rest: '180s' }, { name: 'Supino Reto', sets: '5', reps: '5', rest: '180s' }, { name: 'Remada Curvada', sets: '5', reps: '5', rest: '180s' }] }, { day: 'Treino B', exercises: [{ name: 'Agachamento Livre', sets: '5', reps: '5', rest: '180s' }, { name: 'Desenvolvimento com Barra', sets: '5', reps: '5', rest: '180s' }, { name: 'Levantamento Terra', sets: '1', reps: '5', rest: '240s' }] }] },
  emagrecimento: { name: 'Queima Total', accent: 'Total', level: 'Iniciante', frequency: '5x semana', duration: '8 semanas', time: '45-55 min', description: 'Full body com circuito metabólico de alta intensidade para queima de gordura máxima.', days: [{ day: 'Segunda e Quinta — Full Body', exercises: [{ name: 'Agachamento Livre', sets: '3', reps: '15', rest: '45s' }, { name: 'Supino com Halteres', sets: '3', reps: '12', rest: '45s' }, { name: 'Remada Curvada', sets: '3', reps: '12', rest: '45s' }, { name: 'Desenvolvimento', sets: '3', reps: '12', rest: '45s' }, { name: 'Abdominal Supra', sets: '3', reps: '20', rest: '30s' }] }, { day: 'Terça e Sexta — Circuito Cardio', exercises: [{ name: 'Flexão de Braço', sets: '4', reps: '15', rest: '30s' }, { name: 'Agachamento Búlgaro', sets: '3', reps: '12/lado', rest: '30s' }, { name: 'Hip Thrust', sets: '3', reps: '20', rest: '30s' }, { name: 'Prancha', sets: '3', reps: '40s', rest: '20s' }, { name: 'Abdominal Bicicleta', sets: '3', reps: '20', rest: '30s' }] }] },
  iniciante: { name: 'Start Strong', accent: 'Strong', level: 'Iniciante', frequency: '3x semana', duration: '6 semanas', time: '40-50 min', description: 'Programa de adaptação muscular. Treino full body para construir base sólida.', days: [{ day: 'Treino Full Body (3x/semana)', exercises: [{ name: 'Agachamento Livre', sets: '3', reps: '12-15', rest: '60s' }, { name: 'Supino com Halteres', sets: '3', reps: '12', rest: '60s' }, { name: 'Puxada Frontal', sets: '3', reps: '12', rest: '60s' }, { name: 'Desenvolvimento com Halteres', sets: '3', reps: '12', rest: '60s' }, { name: 'Rosca Direta', sets: '2', reps: '15', rest: '45s' }, { name: 'Tríceps no Pulley', sets: '2', reps: '15', rest: '45s' }, { name: 'Abdominal Supra', sets: '3', reps: '15', rest: '45s' }, { name: 'Prancha', sets: '2', reps: '30s', rest: '30s' }] }] },
};

// ===========================
// LANGUAGE SIMPLIFICATION
// ===========================
const TECH_TO_SIMPLE = {
  'pegada pronada': 'mão virada para baixo',
  'pegada supinada': 'mão virada para cima',
  'pegada mista': 'uma mão pra cima, outra pra baixo',
  'pegada neutra': 'polegar pra cima',
  'fase excêntrica': 'descida controlada',
  'excêntrico': 'descida',
  'contraia': 'aperte',
  'retraídas': 'juntas pra trás',
  'retração escapular': 'juntar as omoplatas',
  'escápulas': 'omoplatas',
  'dorsal': 'costas (músculo largo)',
  'deltóide anterior': 'ombro (frente)',
  'deltóide medial': 'ombro (meio)',
  'deltóide posterior': 'ombro (trás)',
  'trapézio': 'músculo pescoço/ombro',
  'isquiotibiais': 'parte de trás da coxa',
  'quadríceps': 'parte da frente da coxa',
  'gastrocnêmio': 'barriga da perna',
  'glúteo máximo': 'glúteo principal',
  'core': 'barriga firme (abdômen)',
  'coluna neutra': 'coluna reta e natural',
  'valgo de joelho': 'joelho caindo pra dentro',
};

// ===========================
// EXERCISEDB API
// ===========================
// ✅ API KEYS REMOVIDAS - Agora usando Edge Function segura
const EXERCISE_SEARCH_MAP = {
  'supino-reto': 'barbell bench press', 'supino-inclinado': 'incline barbell bench press',
  'supino-declinado': 'decline barbell bench press', 'supino-halter': 'dumbbell bench press',
  'crucifixo': 'dumbbell fly', 'crossover': 'cable crossover', 'flexao': 'push up',
  'mergulho-peito': 'dip', 'peck-deck': 'peck deck fly',
};
const gifCache = {};
