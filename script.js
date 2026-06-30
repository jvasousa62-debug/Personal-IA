/* ===========================
   IRONFIT — APP JAVASCRIPT v4
   FIXES: prefsCache duplicate declaration
   NEW: Faster AI, deep periodization, progressive overload, body metrics integration
   =========================== */

// ===========================
// GLOBAL FUNCTIONS (for onclick handlers)
// ===========================
function openSettings() {
  document.getElementById('userMenu')?.classList.add('hidden');
  document.getElementById('mobileOverlay')?.classList.remove('show');
  if (localStorage.getItem('ironfit_userRole') === 'admin') {
    window.location.assign('admin/');
  } else {
    window.location.assign('preferencias.html');
  }
}

function openProfile() {
  document.getElementById('userMenu')?.classList.add('hidden');
  document.getElementById('mobileOverlay')?.classList.remove('show');
  if (localStorage.getItem('ironfit_userRole') === 'admin') {
    window.location.assign('admin/');
  } else {
    window.location.assign('profile.html');
  }
}

function openAdmin() {
  document.getElementById('userMenu')?.classList.add('hidden');
  document.getElementById('mobileOverlay')?.classList.remove('show');
  window.location.assign('admin/');
}

window.openSettings = openSettings;
window.openProfile = openProfile;
window.openAdmin = openAdmin;

// ===========================
// DATA: EXERCISES DATABASE
// ===========================
const EXERCISES = [
  // ======= PEITO =======
  {
    id: 'supino-reto', name: 'Supino Reto', group: 'peito', icon: '🏋️', tags: ['Básico', 'Barra', 'Composto'], muscles: 'Peitoral maior, deltóide anterior, tríceps', equipment: 'Barra + banco', difficulty: 'Intermediário', recommended: { sets: '4', reps: '8-12', rest: '90s' },
    steps: ['Deite no banco com os pés apoiados no chão. A barra alinhada com os olhos.', 'Pegue a barra com pegada pronada, um pouco mais larga que a largura dos ombros.', 'Desengate a barra e posicione-a sobre o peito superior.', 'Inspire e desça a barra controladamente até tocar levemente o esterno.', 'Expire e empurre a barra de volta à posição inicial, contraindo o peito.'],
    tips: ['Mantenha as escápulas retraídas durante todo o exercício', 'Pés firmes no chão — não levante os calcanhares', 'Controle o excêntrico (descida) por 2-3 segundos'],
    mistakes: ['Barra muito alta, próximo ao pescoço', 'Cotovelos abertos a 90° (flare)', 'Quicar a barra no peito']
  },

  {
    id: 'supino-inclinado', name: 'Supino Inclinado', group: 'peito', icon: '↗️', tags: ['Básico', 'Barra', 'Composto'], muscles: 'Peitoral superior, deltóide anterior, tríceps', equipment: 'Barra + banco inclinado', difficulty: 'Intermediário', recommended: { sets: '4', reps: '8-12', rest: '90s' },
    steps: ['Ajuste o banco a 30-45°. Pegue a barra na largura dos ombros.', 'Desça a barra até a parte superior do peito.', 'Empurre a barra para cima e levemente para frente.', 'Mantenha os cotovelos em 45° durante o movimento.'],
    tips: ['Ângulo de 30° ativa mais peitoral que 45°', 'Não deixe a lombar perder o contato com o banco'],
    mistakes: ['Banco muito inclinado (vira exercício de ombro)', 'Descida muito rápida sem controle']
  },

  {
    id: 'supino-declinado', name: 'Supino Declinado', group: 'peito', icon: '↘️', tags: ['Básico', 'Barra'], muscles: 'Peitoral inferior, tríceps', equipment: 'Banco declinado + barra', difficulty: 'Intermediário', recommended: { sets: '3', reps: '10-12', rest: '75s' },
    steps: ['Prenda os pés no banco declinado. Pegue a barra levemente mais larga que o ombro.', 'Desça a barra até a parte inferior do peito.', 'Empurre contraindo o peito inferior.'],
    tips: ['Cuidado ao desengatar e travar a barra — use um parceiro', 'Ótimo para definição do peito inferior'],
    mistakes: ['Não usar trava de segurança', 'Amplitude excessiva forçando o ombro']
  },

  {
    id: 'supino-halter', name: 'Supino com Halteres', group: 'peito', icon: '🥊', tags: ['Básico', 'Halter'], muscles: 'Peitoral, deltóide anterior, tríceps', equipment: 'Halteres + banco', difficulty: 'Iniciante', recommended: { sets: '4', reps: '10-12', rest: '75s' },
    steps: ['Segure um halter em cada mão, sente-se no banco e deite.', 'Posicione os halteres ao lado do peito, cotovelos dobrados.', 'Empurre os halteres para cima até quase estender os braços.', 'Desça controladamente com amplitude maior que a barra.'],
    tips: ['Amplitude maior que barra = mais ativação do peitoral', 'Gire levemente os punhos ao subir para maior contração'],
    mistakes: ['Halteres batendo no topo — perde tensão', 'Descida descontrolada']
  },

  {
    id: 'crucifixo', name: 'Crucifixo com Halteres', group: 'peito', icon: '✝️', tags: ['Isolamento', 'Halter'], muscles: 'Peitoral maior (esterno), deltóide anterior', equipment: 'Halteres + banco', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Deite no banco com halteres acima do peito, braços quase estendidos.', 'Abra os braços em arco amplo, mantendo leve flexão nos cotovelos.', 'Desça até sentir alongamento máximo no peito.', 'Retorne ao centro, espremendo o peitoral.'],
    tips: ['Movimento de "abraçar uma árvore" — não force os ombros', 'Use carga leve e foque na amplitude e contração'],
    mistakes: ['Carga excessiva forçando o ombro', 'Dobrar os cotovelos excessivamente — vira supino']
  },

  {
    id: 'crossover', name: 'Crossover no Cabo', group: 'peito', icon: '🔀', tags: ['Isolamento', 'Cabo'], muscles: 'Peitoral esternal e inferior', equipment: 'Polia dupla', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Fique no centro da polia dupla alta, um pé à frente.', 'Segure as alças, braços abertos em T com leve flexão.', 'Traga as mãos juntas à frente do corpo em arco.', 'Aperte o peito por 1-2 segundos e retorne.'],
    tips: ['Varie a altura das polias para atingir diferentes porções do peito', 'Incline levemente o tronco à frente para mais ativação'],
    mistakes: ['Usar biceps para puxar em vez do peito', 'Velocidade excessiva — perde a contração']
  },

  {
    id: 'flexao', name: 'Flexão de Braço', group: 'peito', icon: '🤸', tags: ['Peso Corporal', 'Funcional'], muscles: 'Peitoral, tríceps, deltóide anterior, core', equipment: 'Nenhum', difficulty: 'Iniciante', recommended: { sets: '3', reps: '15-20', rest: '45s' },
    steps: ['Apoie as mãos levemente mais largas que os ombros, braços estendidos.', 'Mantenha o corpo em linha reta da cabeça aos pés.', 'Flexione os cotovelos e desça o peito até quase tocar o chão.', 'Empurre de volta à posição inicial.'],
    tips: ['Core sempre contraído — não deixe o quadril cair', 'Cotovelos em ~45° não abertos a 90°'],
    mistakes: ['Quadril levantando ou afundando', 'Pescoço projetado para frente']
  },

  {
    id: 'mergulho-peito', name: 'Mergulho (Paralelas)', group: 'peito', icon: '⬇️', tags: ['Peso Corporal', 'Composto'], muscles: 'Peitoral inferior, tríceps, deltóide anterior', equipment: 'Paralelas', difficulty: 'Intermediário', recommended: { sets: '3', reps: '10-15', rest: '75s' },
    steps: ['Segure as paralelas, braços estendidos, corpo inclinado levemente à frente.', 'Desça flexionando os cotovelos, inclinando o tronco.', 'Desça até os ombros ficarem abaixo dos cotovelos.', 'Empurre de volta à posição inicial.'],
    tips: ['Inclinação do tronco à frente = mais peito; vertical = mais tríceps', 'Adicione peso com cinturão para progredir'],
    mistakes: ['Descida excessiva forçando o ombro', 'Cotovelos muito abertos']
  },

  {
    id: 'peck-deck', name: 'Peck Deck (Voador)', group: 'peito', icon: '🦅', tags: ['Isolamento', 'Máquina'], muscles: 'Peitoral esternal', equipment: 'Máquina voador', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Ajuste o assento: cotovelos na altura dos ombros.', 'Segure as alças ou apoie os antebraços nas almofadas.', 'Traga os braços à frente, espremendo o peito.', 'Retorne controladamente sentindo o alongamento.'],
    tips: ['Não force o retorno — use o peso para alongar o peito', 'Ideal para finalizar o treino de peito com sangue no músculo'],
    mistakes: ['Cotovelos abaixo da linha dos ombros', 'Retorno brusco que força o ombro']
  },

  // ======= COSTAS =======
  {
    id: 'levantamento-terra', name: 'Levantamento Terra', group: 'costas', icon: '🏆', tags: ['Básico', 'Barra', 'Composto'], muscles: 'Eretores da espinha, glúteos, isquiotibiais, trapézio', equipment: 'Barra + anilhas', difficulty: 'Avançado', recommended: { sets: '3', reps: '3-6', rest: '180s' },
    steps: ['Pés na largura do quadril, barra sobre o meio do pé.', 'Incline e segure a barra com pegada pronada ou mista.', 'Baixe o quadril, coluna neutra, peito aberto.', 'Empurre o chão com os pés e suba a barra rente às pernas.', 'Estenda quadril e joelhos ao mesmo tempo no topo.'],
    tips: ['A barra nunca afasta do corpo', 'Imagine "empurrar o chão" em vez de puxar a barra'],
    mistakes: ['Coluna lombar arredondada — risco de hérnia', 'Olhar para cima excessivamente']
  },

  {
    id: 'remada-curvada', name: 'Remada Curvada', group: 'costas', icon: '🔙', tags: ['Básico', 'Barra', 'Composto'], muscles: 'Dorsal, romboides, trapézio médio, bíceps', equipment: 'Barra', difficulty: 'Intermediário', recommended: { sets: '4', reps: '8-12', rest: '90s' },
    steps: ['Segure a barra com pegada pronada, incline o tronco a 45°.', 'Joelhos levemente dobrados, coluna neutra.', 'Puxe a barra em direção ao umbigo, cotovelos para trás.', 'Contraia as escápulas no topo por 1 segundo.'],
    tips: ['"Esmagar uma laranja entre as escápulas" na contração', 'Pegada supinada ativa mais o bíceps'],
    mistakes: ['Balanço do corpo para dar impulso', 'Coluna arredondada']
  },

  {
    id: 'puxada-frontal', name: 'Puxada Frontal', group: 'costas', icon: '📥', tags: ['Básico', 'Cabo', 'Composto'], muscles: 'Dorsal, bíceps, romboides', equipment: 'Puxador', difficulty: 'Iniciante', recommended: { sets: '4', reps: '10-12', rest: '75s' },
    steps: ['Sente-se no aparelho, coxas fixas. Pegue a barra com pegada larga.', 'Incline o tronco ~15°.', 'Puxe a barra ao peito superior, cotovelos para baixo e para trás.', 'Volte controladamente, sentindo o dorsal alongar.'],
    tips: ['"Empurrar as axilas para baixo" em vez de puxar com os braços', 'NUNCA puxe atrás da cabeça — risco cervical'],
    mistakes: ['Puxar atrás da cabeça', 'Balanço excessivo do tronco']
  },

  {
    id: 'barra-fixa', name: 'Barra Fixa', group: 'costas', icon: '🏅', tags: ['Peso Corporal', 'Composto'], muscles: 'Dorsal, bíceps, romboides, trapézio', equipment: 'Barra fixa', difficulty: 'Avançado', recommended: { sets: '4', reps: '6-10', rest: '90s' },
    steps: ['Segure a barra com pegada pronada, mãos na largura dos ombros ou mais largas.', 'Pendure com os braços estendidos, escápulas levemente retraídas.', 'Puxe o corpo para cima até o queixo ultrapassar a barra.', 'Desça controladamente até a extensão completa.'],
    tips: ['Retração escapular antes de puxar é crucial', 'Use borracha de assistência para progressão'],
    mistakes: ['Kipping (balanço) — remove o trabalho muscular', 'Não atingir a extensão completa na descida']
  },

  {
    id: 'remada-unilateral', name: 'Remada Unilateral', group: 'costas', icon: '1️⃣', tags: ['Básico', 'Halter'], muscles: 'Dorsal, romboides, tríceps longo', equipment: 'Halter + banco', difficulty: 'Iniciante', recommended: { sets: '4', reps: '10-12', rest: '60s' },
    steps: ['Apoie um joelho e mão no banco. Segure o halter com a mão livre.', 'Mantenha a coluna neutra e paralela ao chão.', 'Puxe o halter ao lado do quadril, cotovelo para trás.', 'Contraia o dorsal no topo e retorne controladamente.'],
    tips: ['Visualize puxar o cotovelo, não o halter', 'Sem rotação excessiva do tronco'],
    mistakes: ['Rotação excessiva do tronco', 'Puxar com bíceps em vez do dorsal']
  },

  {
    id: 'remada-maquina', name: 'Remada na Máquina', group: 'costas', icon: '🎰', tags: ['Básico', 'Máquina'], muscles: 'Dorsal, romboides, bíceps', equipment: 'Máquina de remada', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Ajuste o assento: peito no apoio, handles na altura do umbigo.', 'Pegue as alças com pegada neutra ou pronada.', 'Puxe as alças ao abdômen, cotovelos para trás.', 'Retorne controladamente sem soltar as escápulas.'],
    tips: ['Máquina ideal para iniciantes aprenderem o padrão de remada', 'Aperto de escápulas antes de puxar'],
    mistakes: ['Usar o balanço para ajudar', 'Não retrair as escápulas']
  },

  {
    id: 'pullover', name: 'Pullover com Halter', group: 'costas', icon: '🔄', tags: ['Isolamento', 'Halter'], muscles: 'Dorsal, serrátil, peitoral', equipment: 'Halter + banco', difficulty: 'Intermediário', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Deite transversalmente no banco, somente os ombros apoiados.', 'Segure o halter com as duas mãos acima do peito.', 'Desça o halter em arco atrás da cabeça, sentindo o dorsal.', 'Retorne ao ponto inicial contraindo dorsal e peito.'],
    tips: ['Excelente para expandir a caixa torácica', 'Cotovelos levemente flexionados durante todo o movimento'],
    mistakes: ['Carga excessiva sem controle', 'Cotovelos dobrados demais — vira triceps']
  },

  {
    id: 'terra-romeno', name: 'Levantamento Terra Romeno', group: 'costas', icon: '🇷🇴', tags: ['Básico', 'Barra'], muscles: 'Isquiotibiais, glúteos, eretores da espinha', equipment: 'Barra', difficulty: 'Intermediário', recommended: { sets: '4', reps: '8-12', rest: '90s' },
    steps: ['Em pé, segure a barra na largura dos ombros.', 'Incline o tronco mantendo a barra rente às pernas, joelhos semi-flexionados.', 'Desça até sentir o alongamento nos isquiotibiais.', 'Suba contraindo os glúteos e eretores.'],
    tips: ['Diferente do terra convencional: não dobra os joelhos tanto', 'Foco no alongamento dos posteriores de coxa'],
    mistakes: ['Arredondar a lombar', 'Descer excessivamente (além da amplitude dos isquios)']
  },

  // ======= PERNAS =======
  {
    id: 'agachamento', name: 'Agachamento Livre', group: 'pernas', icon: '🦵', tags: ['Básico', 'Barra', 'Composto'], muscles: 'Quadríceps, glúteos, isquiotibiais, panturrilhas', equipment: 'Barra + rack', difficulty: 'Avançado', recommended: { sets: '4', reps: '5-8', rest: '120s' },
    steps: ['Barra sobre os trapézios, pés na largura dos ombros.', 'Inspire fundo, ative o core.', 'Desça empurrando os joelhos para fora.', 'Até coxas paralelas ou abaixo.', 'Suba expirando, mantendo o torso ereto.'],
    tips: ['Joelho segue o dedo mínimo do pé', 'Valsalva protege a coluna'],
    mistakes: ['Valgo de joelho (joelhos para dentro)', 'Calcanhar levantando do chão']
  },

  {
    id: 'leg-press', name: 'Leg Press 45°', group: 'pernas', icon: '🦿', tags: ['Básico', 'Máquina', 'Composto'], muscles: 'Quadríceps, glúteos, isquiotibiais', equipment: 'Leg Press', difficulty: 'Iniciante', recommended: { sets: '4', reps: '12-15', rest: '90s' },
    steps: ['Costas e glúteos apoiados. Pés na largura dos ombros.', 'Retire as travas, desça a 90°.', 'Empurre até quase estender — sem travar o joelho.'],
    tips: ['Pés mais altos = mais glúteo; mais baixos = mais quadríceps'],
    mistakes: ['Tirar os glúteos do apoio', 'Joelhos colapsando para dentro']
  },

  {
    id: 'cadeira-extensora', name: 'Cadeira Extensora', group: 'pernas', icon: '🪑', tags: ['Isolamento', 'Máquina'], muscles: 'Quadríceps (4 cabeças)', equipment: 'Cadeira extensora', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Ajuste o aparelho: joelho alinhado com o pivô.', 'Estenda os joelhos contraindo os quadríceps.', 'Segure no topo por 1-2 segundos.', 'Desça controladamente — fase excêntrica importante.'],
    tips: ['Ótimo exercício de isolamento para quadríceps', 'Excelente para finalização e pump'],
    mistakes: ['Usar momentum para subir a carga', 'Não completar a extensão no topo']
  },

  {
    id: 'mesa-flexora', name: 'Mesa Flexora', group: 'pernas', icon: '🛏️', tags: ['Isolamento', 'Máquina'], muscles: 'Isquiotibiais, gastrocnêmio', equipment: 'Mesa flexora', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Deite de bruços, joelhos na borda, calcanhar sob o apoio.', 'Flexione os joelhos puxando os calcanhares ao glúteo.', 'Contraia no topo e desça controladamente.'],
    tips: ['Quadril sem sair do apoio durante o movimento', 'Velocidade lenta na descida para mais ativação'],
    mistakes: ['Quadril levantando do apoio', 'Amplitude incompleta']
  },

  {
    id: 'agachamento-bulgaro', name: 'Agachamento Búlgaro', group: 'pernas', icon: '🇧🇬', tags: ['Básico', 'Halter', 'Unilateral'], muscles: 'Quadríceps, glúteos, isquiotibiais', equipment: 'Banco + halteres', difficulty: 'Intermediário', recommended: { sets: '4', reps: '10-12', rest: '75s' },
    steps: ['Apoie o pé traseiro em um banco, segure halteres.', 'Flexione o joelho da frente descendo o quadril.', 'Desça até a coxa ficar paralela ao chão.', 'Empurre pelo calcanhar da frente para subir.'],
    tips: ['Excelente para corrigir desequilíbrios entre as pernas', 'Distância do banco afeta o músculo: mais longe = mais glúteo'],
    mistakes: ['Joelho da frente ultrapassando demais o pé', 'Tronco inclinado demais para frente']
  },

  {
    id: 'hip-thrust', name: 'Hip Thrust', group: 'pernas', icon: '🍑', tags: ['Básico', 'Barra', 'Glúteo'], muscles: 'Glúteo máximo, isquiotibiais', equipment: 'Banco + barra', difficulty: 'Intermediário', recommended: { sets: '4', reps: '12-15', rest: '75s' },
    steps: ['Apoie as escápulas no banco, barra sobre os quadris.', 'Pés apoiados no chão, joelhos a 90°.', 'Eleve o quadril contraindo o glúteo até o corpo ficar reto.', 'Segure no topo por 1-2 segundos.'],
    tips: ['Melhor exercício para ativação do glúteo máximo', 'Use proteção (almofada) na barra para conforto'],
    mistakes: ['Extensão lombar no topo — use o glúteo, não a lombar', 'Pés muito perto ou longe do corpo']
  },

  {
    id: 'stiff', name: 'Stiff com Halteres', group: 'pernas', icon: '🏊', tags: ['Básico', 'Halter'], muscles: 'Isquiotibiais, glúteos, eretores', equipment: 'Halteres', difficulty: 'Iniciante', recommended: { sets: '4', reps: '10-12', rest: '75s' },
    steps: ['Em pé com halteres à frente das coxas.', 'Incline o tronco mantendo as costas retas.', 'Desça os halteres pela frente das pernas.', 'Contraia os glúteos para subir.'],
    tips: ['Sinta o alongamento nos isquiotibiais na descida', 'Joelhos levemente dobrados — não travar'],
    mistakes: ['Arredondar a lombar', 'Descer demais sem controle']
  },

  {
    id: 'panturrilha-pe', name: 'Panturrilha em Pé', group: 'pernas', icon: '🦶', tags: ['Isolamento', 'Máquina'], muscles: 'Gastrocnêmio, sóleo', equipment: 'Máquina ou degrau', difficulty: 'Iniciante', recommended: { sets: '4', reps: '15-20', rest: '45s' },
    steps: ['Apoie as bolas dos pés na borda de um degrau.', 'Desça os calcanhares para baixo, sentindo o alongamento.', 'Suba nas pontas dos pés contraindo as panturrilhas.', 'Segure no topo por 1 segundo.'],
    tips: ['Amplitude completa: de baixo ao máximo que conseguir subir', 'Joelhos estendidos para focar no gastrocnêmio'],
    mistakes: ['Bouncing (quique) sem controle', 'Amplitude curta — não aproveita o músculo completo']
  },

  // ======= OMBROS =======
  {
    id: 'desenvolvimento', name: 'Desenvolvimento com Halteres', group: 'ombros', icon: '⬆️', tags: ['Básico', 'Halter', 'Composto'], muscles: 'Deltóide anterior e medial, trapézio, tríceps', equipment: 'Halteres + banco', difficulty: 'Iniciante', recommended: { sets: '4', reps: '10-15', rest: '60s' },
    steps: ['Sente-se no banco, halteres na altura dos ombros.', 'Palmas para frente, cotovelos abaixo das mãos.', 'Empurre para cima até quase estender os braços.', 'Desça controladamente.'],
    tips: ['Cotovelos levemente à frente para proteger o manguito', 'Core contraído durante todo o exercício'],
    mistakes: ['Jogar lombar para compensar', 'Halteres muito para trás da cabeça']
  },

  {
    id: 'elevacao-lateral', name: 'Elevação Lateral', group: 'ombros', icon: '↔️', tags: ['Isolamento', 'Halter'], muscles: 'Deltóide medial', equipment: 'Halteres', difficulty: 'Iniciante', recommended: { sets: '4', reps: '12-20', rest: '60s' },
    steps: ['Em pé, halteres ao lado do corpo.', 'Eleve os braços lateralmente até a altura dos ombros.', 'Cotovelo levemente acima do pulso no topo.', 'Desça controladamente.'],
    tips: ['Incline o tronco levemente à frente para mais ativação', 'Mindinho levemente para cima no topo'],
    mistakes: ['Balançar o corpo', 'Elevar os ombros junto com os braços']
  },

  {
    id: 'face-pull', name: 'Face Pull', group: 'ombros', icon: '🎯', tags: ['Isolamento', 'Cabo'], muscles: 'Deltóide posterior, manguito rotador, trapézio médio', equipment: 'Polia alta + corda', difficulty: 'Iniciante', recommended: { sets: '3', reps: '15-20', rest: '60s' },
    steps: ['Polia na altura dos olhos, segure a corda com os dois polegares para cima.', 'Puxe a corda em direção ao rosto, abrindo os cotovelos.', 'Contraia o deltóide posterior e retorno controlado.'],
    tips: ['Exercício essencial para saúde do ombro e postura', 'Fundamental para equilibrar o trabalho de peito e deltóide anterior'],
    mistakes: ['Carga excessiva que compromete a técnica', 'Não abrir os cotovelos durante a puxada']
  },

  // ======= BÍCEPS =======
  {
    id: 'rosca-direta', name: 'Rosca Direta', group: 'biceps', icon: '💪', tags: ['Isolamento', 'Barra'], muscles: 'Bíceps braquial, braquial, braquiorradial', equipment: 'Barra', difficulty: 'Iniciante', recommended: { sets: '3', reps: '10-15', rest: '60s' },
    steps: ['Em pé, barra com pegada supinada.', 'Cotovelos fixos ao lado do tronco.', 'Contraia o bíceps subindo a barra em arco.', 'Comprima no topo por 1 segundo.', 'Desça controladamente.'],
    tips: ['Cotovelos são pivôs fixos — só o antebraço se move', 'Descida lenta potencializa o crescimento'],
    mistakes: ['Balançar o corpo', 'Cotovelos saindo do corpo']
  },

  {
    id: 'rosca-martelo', name: 'Rosca Martelo', group: 'biceps', icon: '🔨', tags: ['Isolamento', 'Halter'], muscles: 'Braquiorradial, braquial, bíceps', equipment: 'Halteres', difficulty: 'Iniciante', recommended: { sets: '3', reps: '10-15', rest: '60s' },
    steps: ['Halteres ao lado do corpo, palmas neutras.', 'Cotovelos fixos.', 'Suba o halter mantendo o polegar para cima.', 'Contraia no topo, desça devagar.'],
    tips: ['Fundamental para aumentar a largura do braço', 'Pode alternar os braços ou fazer simultâneo'],
    mistakes: ['Virar o punho durante o movimento', 'Cotovelos saindo do corpo']
  },

  {
    id: 'rosca-concentrada', name: 'Rosca Concentrada', group: 'biceps', icon: '🎯', tags: ['Isolamento', 'Halter'], muscles: 'Bíceps braquial (pico)', equipment: 'Halter + banco', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Sente-se no banco, cotovelo apoiado na parte interna da coxa.', 'Segure o halter com a palma para cima.', 'Suba o halter contraindo o bíceps ao máximo.', 'Desça controladamente.'],
    tips: ['Melhor exercício para o pico do bíceps', 'Foco total em um braço por vez — elimina compensação'],
    mistakes: ['Mover o cotovelo do apoio', 'Usar momentum da perna para ajudar']
  },

  // ======= TRÍCEPS =======
  {
    id: 'triceps-pulley', name: 'Tríceps no Pulley', group: 'triceps', icon: '⬇️', tags: ['Isolamento', 'Cabo'], muscles: 'Tríceps (3 cabeças)', equipment: 'Polia alta', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Em pé em frente à polia alta, barra com pegada pronada.', 'Cotovelos fixos ao lado do corpo.', 'Empurre para baixo até os braços estenderem.', 'Aperte o tríceps no topo.', 'Retorne controlado.'],
    tips: ['Corda permite rotação externa para maior contração', 'Incline levemente o tronco para frente'],
    mistakes: ['Cotovelos saindo do corpo', 'Usar o peso do corpo']
  },

  {
    id: 'triceps-frances', name: 'Tríceps Francês', group: 'triceps', icon: '🥐', tags: ['Isolamento', 'Barra'], muscles: 'Tríceps (cabeça longa)', equipment: 'Barra W + banco', difficulty: 'Intermediário', recommended: { sets: '3', reps: '10-12', rest: '60s' },
    steps: ['Deite no banco, barra acima do peito com braços estendidos.', 'Flexione os cotovelos, descendo a barra à testa.', 'Cotovelos apontando para cima — não abrir.', 'Empurre de volta à posição inicial.'],
    tips: ['Excelente para a cabeça longa do tríceps', 'Use barra W para menos stress no pulso'],
    mistakes: ['Cotovelos se abrindo para os lados', 'Barra descendo demais (risco cervical)']
  },

  {
    id: 'triceps-corda', name: 'Tríceps na Corda', group: 'triceps', icon: '🪢', tags: ['Isolamento', 'Cabo'], muscles: 'Tríceps (todas as cabeças)', equipment: 'Polia alta + corda', difficulty: 'Iniciante', recommended: { sets: '3', reps: '12-15', rest: '60s' },
    steps: ['Segure as pontas da corda com os polegares para cima.', 'Cotovelos fixos ao lado do tronco.', 'Empurre para baixo abrindo as pontas da corda ao final.', 'Retorne devagar.'],
    tips: ['A separação das pontas no final aumenta a contração das três cabeças', 'Uma das variações mais completas para tríceps'],
    mistakes: ['Não abrir as pontas no final do movimento', 'Cotovelos se afastando do corpo']
  },

  // ======= ABDÔMEN =======
  {
    id: 'abdominal-supra', name: 'Abdominal Supra', group: 'abdomen', icon: '🔥', tags: ['Básico', 'Peso Corporal'], muscles: 'Reto abdominal superior', equipment: 'Colchonete', difficulty: 'Iniciante', recommended: { sets: '3', reps: '15-20', rest: '45s' },
    steps: ['Deite com joelhos flexionados, mãos atrás da cabeça.', 'Contraia o abdômen e eleve a cabeça e ombros.', 'Lombar no chão.', 'Desça controladamente.'],
    tips: ['"Enrolar" a coluna, não levantar a cabeça', 'Expire no esforço'],
    mistakes: ['Puxar o pescoço com as mãos', 'Lombar saindo do chão']
  },

  {
    id: 'prancha', name: 'Prancha (Plank)', group: 'abdomen', icon: '📏', tags: ['Isometria', 'Peso Corporal'], muscles: 'Core completo, transverso abdominal, glúteos', equipment: 'Colchonete', difficulty: 'Iniciante', recommended: { sets: '3', reps: '30-60s', rest: '45s' },
    steps: ['Apoie-se nos antebraços e pontas dos pés.', 'Corpo em linha reta da cabeça ao calcanhar.', 'Contraia abdômen, glúteos e quadríceps.', 'Mantenha a posição pelo tempo determinado.'],
    tips: ['Respire normalmente durante a prancha', 'Progrida aumentando o tempo'],
    mistakes: ['Quadril levantado (forma de pirâmide)', 'Quadril afundando (lombar sobrecarregada)']
  },

  {
    id: 'abdominal-bicicleta', name: 'Abdominal Bicicleta', group: 'abdomen', icon: '🚲', tags: ['Peso Corporal'], muscles: 'Oblíquos, reto abdominal', equipment: 'Colchonete', difficulty: 'Iniciante', recommended: { sets: '3', reps: '20', rest: '45s' },
    steps: ['Deite, mãos atrás da cabeça, pernas elevadas.', 'Alterne cotovelo direito ao joelho esquerdo e vice-versa.', 'Movimento de pedalar enquanto torce o tronco.'],
    tips: ['Um dos exercícios mais completos para o abdômen', 'Foque na rotação do tronco, não só no cotovelo'],
    mistakes: ['Puxar o pescoço com as mãos', 'Velocidade excessiva sem controle']
  },

  {
    id: 'prancha-lateral', name: 'Prancha Lateral', group: 'abdomen', icon: '↕️', tags: ['Isometria', 'Peso Corporal'], muscles: 'Oblíquos, quadrado lombar', equipment: 'Colchonete', difficulty: 'Iniciante', recommended: { sets: '3', reps: '30-45s', rest: '30s' },
    steps: ['Apoie-se em um antebraço, corpo em linha reta lateral.', 'Quadril elevado, formando linha diagonal.', 'Mantenha pelo tempo determinado e troque o lado.'],
    tips: ['Não deixe o quadril cair', 'Olhe para frente, não para o chão'],
    mistakes: ['Quadril afundando', 'Apoio no punho em vez do antebraço']
  },
];

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
// EXERCISEDB API — PROXY VIA EDGE FUNCTION
// ===========================
// ✅ CHAVE SEGURA: Agora via Supabase Edge Function (não exposta no frontend)
const EXERCISE_SEARCH_MAP = {
  'supino-reto': 'barbell bench press', 'supino-inclinado': 'incline barbell bench press',
  'supino-declinado': 'decline barbell bench press', 'supino-halter': 'dumbbell bench press',
  'crucifixo': 'dumbbell fly', 'crossover': 'cable crossover', 'flexao': 'push up',
  'mergulho-peito': 'dip', 'peck-deck': 'peck deck fly',
  'levantamento-terra': 'barbell deadlift', 'remada-curvada': 'barbell bent over row',
  'puxada-frontal': 'cable lat pulldown', 'barra-fixa': 'pull-up', 'remada-unilateral': 'dumbbell row',
  'remada-maquina': 'seated row', 'pullover': 'dumbbell pullover', 'terra-romeno': 'romanian deadlift',
  'agachamento': 'barbell squat', 'leg-press': 'leg press', 'cadeira-extensora': 'leg extension',
  'mesa-flexora': 'lying leg curl', 'agachamento-bulgaro': 'dumbbell bulgarian split squat',
  'hip-thrust': 'barbell hip thrust', 'stiff': 'dumbbell stiff leg deadlift',
  'panturrilha-pe': 'standing calf raise', 'desenvolvimento': 'dumbbell shoulder press',
  'elevacao-lateral': 'dumbbell lateral raise', 'face-pull': 'cable face pull',
  'rosca-direta': 'barbell curl', 'rosca-martelo': 'dumbbell hammer curl',
  'rosca-concentrada': 'dumbbell concentration curl',
  'triceps-pulley': 'cable pushdown', 'triceps-frances': 'barbell french press',
  'triceps-corda': 'rope pushdown',
  'abdominal-supra': 'crunch', 'prancha': 'plank', 'abdominal-bicicleta': 'bicycle crunch',
};
const gifCache = {};

async function fetchGifFromExerciseDB(exerciseId) {
  if (typeof GIFService !== 'undefined' && GIFService.getGif) {
    return await GIFService.getGif(exerciseId);
  }
  return null;
}

function buildGifBlock(gifUrl, icon, loading = false, exerciseId = null) {
  if (typeof GIFService !== 'undefined' && GIFService.buildGifBlock) {
    return GIFService.buildGifBlock(gifUrl, icon, loading, exerciseId);
  }
  if (loading) return `<div class="ex-gif-container" id="gifBlock"><div class="ex-gif-fallback"><div class="gif-spinner"></div><div class="ex-gif-label">CARREGANDO GIF...</div></div></div>`;
  if (gifUrl) return `<div class="ex-gif-container" id="gifBlock"><span class="ex-gif-badge">GIF</span><img src="${gifUrl}" alt="Execução" style="width:100%;max-height:320px;object-fit:contain;display:block;border-radius:12px;" loading="lazy"/></div>`;
  return `<div class="ex-gif-container" id="gifBlock"><div class="ex-gif-fallback"><div class="ex-gif-icon">${icon}</div><div class="ex-gif-label">GIF INDISPONÍVEL</div></div></div>`;
}

// ===========================
// NAVIGATION
// ===========================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const mnavItems = document.querySelectorAll('.mnav-item');
  const pages = document.querySelectorAll('.page');

  function goToPage(pageId) {
    if (!pageId) return;
    if (pageId === 'profile') { openProfile(); return; }
    if (pageId === 'settings') { openSettings(); return; }
    if (pageId === 'admin') { openAdmin(); return; }
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    navItems.forEach(n => n.classList.remove('active'));
    mnavItems.forEach(n => n.classList.remove('active'));
    navItems.forEach(n => n.removeAttribute('aria-current'));
    mnavItems.forEach(n => n.removeAttribute('aria-current'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(n => n.classList.add('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(n => n.setAttribute('aria-current', 'page'));
    if (pageId === 'exercises') renderExercises('all');
    if (pageId === 'builder') renderPicker('');
    if (pageId === 'progress') renderProgress();
  }

  navItems.forEach(i => {
    i.addEventListener('click', (e) => {
      e.preventDefault();
      goToPage(i.dataset.page);
    });
  });
  mnavItems.forEach(i => {
    i.addEventListener('click', (e) => {
      e.preventDefault();
      goToPage(i.dataset.page);
      document.getElementById('mobileOverlay')?.classList.remove('show');
    });
  });
  document.getElementById('hamburger')?.addEventListener('click', () => document.getElementById('mobileOverlay')?.classList.add('show'));
  document.getElementById('closeMenu')?.addEventListener('click', () => document.getElementById('mobileOverlay')?.classList.remove('show'));
}

// ===========================
// CACHE & STATE — SINGLE DECLARATION (FIX)
// ===========================
let userBodyDataCache = null;
let periodizationCache = {};
let prefsCache = null;        // ← única declaração (bug corrigido)
let chatUsesPeriodization = 0;
let chatHistory = [];

// ===========================
// HELPERS
// ===========================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===========================
// BODY DATA — METRICS INTEGRATION
// ===========================
async function getUserBodyData(forceRefresh = false) {
  if (userBodyDataCache && !forceRefresh) return userBodyDataCache;

  const profileStr = localStorage.getItem('ironfit_profile');
  const checkins = getCheckins();
  const latest = checkins[checkins.length - 1] || {};

  let profile = {};
  try { profile = profileStr ? JSON.parse(profileStr) : {}; } catch (e) { }

  const weight = parseFloat(latest.weight || profile.weight) || 75;
  const fat = parseFloat(latest.fat || profile.fat) || 18;
  const muscle = parseFloat(latest.muscle || profile.muscle) || 40;
  const height = parseFloat(latest.height || profile.height) || 175;
  const experience = profile.experience_level || 'intermediario';
  const goal = profile.goal || 'hipertrofia';
  const weeklyFreq = parseInt(profile.weekly_frequency) || 4;

  const measures = {
    chest: parseFloat(latest.chest || profile.chest) || null,
    waist: parseFloat(latest.waist || profile.waist) || null,
    hip: parseFloat(latest.hip || profile.hip) || null,
    armR: parseFloat(latest.armR || profile.arm_r) || null,
    thighR: parseFloat(latest.thighR || profile.thigh_r) || null,
  };

  // Tendência de peso (kg/semana)
  let weightTrend = 0;
  const first = checkins[0] || {};
  if (first.weight && latest.weight && checkins.length > 1) {
    const days = (Date.now() - new Date(first.date).getTime()) / (24 * 60 * 60 * 1000);
    if (days > 0) weightTrend = parseFloat(((weight - parseFloat(first.weight)) / (days / 7)).toFixed(2));
  }

  // Semana atual do programa
  const currentWeek = Math.min(Math.max(1, checkins.length > 0
    ? Math.ceil((Date.now() - new Date(checkins[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 1), 12);

  if (!prefsCache) {
    try { prefsCache = JSON.parse(localStorage.getItem('ironfit_prefs') || '{}'); } catch (e) { prefsCache = {}; }
  }

  userBodyDataCache = {
    weight, fat, muscle, height,
    imc: calcIMC(weight, height),
    experience, goal, weeklyFreq,
    measures,
    weightTrend,
    checkinsCount: checkins.length,
    currentWeek,
    leanMass: Math.round(weight * (1 - fat / 100)),
    isBeginner: experience === 'iniciante',
    isAdvanced: experience === 'avancado',
    bfCategory: fat < 15 ? 'lean' : fat < 25 ? 'medium' : 'high',
    prefs: { ...prefsCache },
  };

  return userBodyDataCache;
}

// ===========================
// PERIODIZATION ENGINE — DEEP
// ===========================

/**
 * Calcula carga personalizada baseada em peso corporal, experiência e semana
 * Progressão ondulatória: volume alto → intensidade alta → deload
 */
function calcPersonalizedLoad(exerciseId, bodyData, week = 1) {
  const w = bodyData.weight || 75;

  // Multiplicadores por exercício (% do peso corporal como carga base)
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

  // Progressão semanal ondulatória (periodização linear com ondulação)
  // Semanas 1-3: acumulação (+ volume), 4-6: intensificação (+peso -vol), 7-8: pico, 9: deload, 10-12: nova fase
  const weekProgressions = [1.0, 1.05, 1.10, 1.08, 1.15, 1.20, 1.18, 1.25, 0.85, 1.10, 1.18, 1.28];
  const progression = weekProgressions[Math.min(week - 1, 11)] || 1.0;

  const expLevel = bodyData.experience || 'intermediario';
  const mult = (baseMultipliers[exerciseId] || { iniciante: 0.3, intermediario: 0.5, avancado: 0.75 })[expLevel] || 0.5;

  const load = Math.round(w * mult * progression / 2.5) * 2.5; // arredondar para múltiplos de 2.5kg
  return load >= 5 ? `${load}kg` : '~5kg';
}

/**
 * Calcula séries e reps com base na semana (periodização ondulatória por semana)
 */
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

  // 🛡️ GARANTIAS
  if (!week || isNaN(week)) week = 1;
  if (week < 1) week = 1;

  if (!goal || !phases[goal]) {
    console.warn('Goal inválido:', goal);
    goal = 'hipertrofia';
  }

  const plan = phases[goal];

  // 🛡️ Clamp seguro
  const index = Math.min(Math.max(week - 1, 0), plan.length - 1);

  const entry = plan[index];

  if (!entry) {
    console.warn('Volume de treino indisponivel, usando fallback:', { week, goal, index });
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

  // IMC
  const imcVal = parseFloat(imc);
  if (imcVal < 18.5) insights.push('⚠️ IMC abaixo do peso — priorize ganho de massa magra');
  else if (imcVal >= 25 && imcVal < 30) insights.push('📊 IMC em sobrepeso — déficit calórico moderado recomendado');
  else if (imcVal >= 30) insights.push('🔴 IMC indicando obesidade — consulte um médico');

  // Gordura corporal
  if (fat < 10) insights.push('💡 Gordura muito baixa — pode comprometer hormônios');
  else if (fat > 25 && goal === 'hipertrofia') insights.push('💡 Com gordura > 25%, considere uma fase de cutting antes de bulking');

  // Tendência de peso
  if (Math.abs(weightTrend) > 0.5) {
    if (goal === 'emagrecimento' && weightTrend < 0) insights.push(`✅ Perdendo ~${Math.abs(weightTrend)}kg/semana — ritmo ${Math.abs(weightTrend) > 1 ? 'acelerado (atenção à perda de músculo)' : 'ideal'}`);
    else if (goal === 'hipertrofia' && weightTrend > 0) insights.push(`✅ Ganhando ~${weightTrend}kg/semana — ${weightTrend > 0.5 ? 'ritmo alto (pode acumular gordura)' : 'ritmo ideal para lean bulk'}`);
    else if (goal === 'hipertrofia' && weightTrend < 0) insights.push(`⚠️ Perdendo peso em fase de hipertrofia — aumente as calorias`);
  }

  // Cintura (se disponível)
  if (measures.waist) {
    const ratio = measures.waist / height;
    if (ratio > 0.55) insights.push('⚠️ Relação cintura/altura elevada — risco cardiovascular, priorize cardio');
  }

  // Massa magra
  if (leanMass < 50 && bodyData.experience === 'avancado') insights.push('💡 Massa magra baixa para nível avançado — reveja nutrição e descanso');

  return insights;
}

// ===========================
// AI PERSONALITY PROMPT (with periodization context)
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

  // Contexto corporal personalizado
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
function buildLegacySmartResponse(t) {
  t = t.toLowerCase();
  const bodyData = userBodyDataCache;
  const week = bodyData?.currentWeek || 1;
  const weight = bodyData?.weight || 80;
  const est = (pct) => Math.round(weight * pct / 2.5) * 2.5;

  if (t.includes('peito') || t.includes('supino') || t.includes('crucifixo'))
    return `🔥 **TREINO PEITO — SEMANA ${week}**\n\n**A — FORÇA BASE**\n• Supino Reto: 4x8-10 | 90s | ~${est(0.65)}kg\n• Supino Inclinado: 4x10-12 | 75s | ~${est(0.5)}kg\n\n**B — VOLUME**\n• Crucifixo: 3x12-15 | 60s | ~${est(0.2)}kg\n• Crossover Cabo: 3x15 | 60s\n• Peck Deck: 3x15 | 45s\n\n📈 **Progressão:** adicione +2.5kg por semana no supino\n🎯 **Semana ${week} foco:** ${calcVolumeForWeek(week, 'hipertrofia').note}`;

  if (t.includes('costas') || t.includes('dorsal') || t.includes('remada'))
    return `💪 **TREINO COSTAS — SEMANA ${week}**\n\n**A — VERTICAL**\n• Puxada Frontal: 4x8-10 | 90s | ~${est(0.55)}kg\n• Remada Curvada: 4x10-12 | 75s | ~${est(0.65)}kg\n\n**B — HORIZONTAL**\n• Remada Unilateral: 3x12/lado | 60s | ~${est(0.3)}kg\n• Pullover: 3x12-15 | 60s | ~${est(0.2)}kg\n\n📈 **Progressão:** +2.5kg/semana nas remadas compostas`;

  if (t.includes('perna') || t.includes('glut') || t.includes('agachamento'))
    return `🦵 **TREINO PERNAS — SEMANA ${week}**\n\n**A — FORÇA**\n• Agachamento Livre: 5x5-8 | 120s | ~${est(0.8)}kg\n• Terra Romeno: 4x8-10 | 90s | ~${est(0.75)}kg\n\n**B — VOLUME**\n• Leg Press: 4x12-15 | 90s | ~${est(1.4)}kg\n• Cadeira Extensora: 3x15 | 60s\n• Mesa Flexora: 3x12 | 60s\n• Hip Thrust: 4x15 | 75s | ~${est(1.0)}kg\n\n**C — PANTURRILHA**\n• Panturrilha em Pé: 5x20 | 45s\n\n📈 **Progressão:** +5kg/semana no agachamento`;

  if (t.includes('ombro') || t.includes('deltoid'))
    return `⚡ **TREINO OMBROS — SEMANA ${week}**\n\n**A — PRESSÃO**\n• Desenvolvimento Halteres: 4x10-12 | 90s | ~${est(0.35)}kg\n\n**B — ISOLAMENTO 3D**\n• Elevação Lateral: 4x15-20 | 60s | ~${est(0.09)}kg\n• Face Pull: 4x15-20 | 45s\n\n📈 **Progressão:** +1.25kg/semana nas elevações`;

  if (t.includes('peri') || t.includes('progress') || t.includes('semana') || t.includes('carga'))
    return `📈 **PERIODIZAÇÃO — SEU PLANO ${week > 1 ? 'SEMANA ' + week : 'COMPLETO'}**\n\n🗓 **Fases do programa (12 semanas):**\n• Semanas 1-3: Acumulação (volume alto, técnica)\n• Semanas 4-6: Intensificação (+peso, -reps)\n• Semanas 7-8: Pico (máxima intensidade)\n• Semana 9: Deload (40% menos carga)\n• Semanas 10-12: Nova fase (5% acima da fase 1)\n\n⚙️ **Progressão de carga:**\n• Compostos: +2.5kg/semana\n• Isolados: +1.25kg/semana\n\n**Semana atual (${week}):** ${calcVolumeForWeek(week, 'hipertrofia').note}`;

  if (t.includes('proteína') || t.includes('nutrição') || t.includes('comer'))
    return `🥩 **NUTRIÇÃO PERSONALIZADA**\n\n🎯 **Baseado no seu peso (~${weight}kg):**\n• Proteína: ${Math.round(weight * 2.2)}g/dia (${Math.round(weight * 2.2 / 4)} refeições de ${Math.round(weight * 0.55)}g)\n• Calorias: ~${Math.round(weight * (bodyData?.goal === 'emagrecimento' ? 26 : 35))}kcal/dia\n\n🔥 **Fontes de proteína:**\n• Frango, ovo, carne magra, whey, atum\n\n💊 **Suplementos essenciais:**\n• Creatina: 5g/dia\n• Whey: 30g pós-treino\n• Cafeína: 200mg pré-treino\n\n⚠️ Consulte um nutricionista para dieta precisa!`;

  const respostas = [
    `💥 **IRON IA aqui!** Me diga o que precisa:\n\n🏋️ "Treino de [peito/costas/pernas/ombros]"\n📊 "Meu plano da semana ${week}"\n⚖️ "Nutrição para meu peso de ${weight}kg"\n📈 "Como progredir a carga"\n💤 "Protocolo de recuperação"\n\n**MANDA VER!** 🔥`,
  ];
  return respostas[0];
}

// ===========================
// CHAT — FASTER AI
// ===========================
function normalizeMessage(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildWorkoutResponse(title, exercises, focus, progression, bodyData) {
  const week = bodyData?.currentWeek || 1;
  const goal = bodyData?.goal || 'hipertrofia';
  const volume = calcVolumeForWeek(week, goal);
  const level = bodyData?.experience || 'intermediario';
  const levelNote = {
    iniciante: 'Como voce esta em fase de base, deixa 2-3 repeticoes na reserva e prioriza execucao limpa.',
    intermediario: 'Trabalha perto de RIR 1-2 nas ultimas series, sem sacrificar amplitude.',
    avancado: 'Pode buscar RPE 8-9 no exercicio principal e controlar fadiga nos acessorios.'
  }[level] || 'Ajuste a carga pela tecnica: pesado o bastante para desafiar, leve o bastante para controlar.';

  return `**${title} - Semana ${week}**\n\n` +
    `**Foco de hoje:** ${focus}\n` +
    `**Bloco recomendado:** ${volume.sets} series, ${volume.reps} reps, descanso ${volume.rest}. ${volume.note}\n\n` +
    exercises.map(ex => `- **${ex.name}:** ${ex.sets}x${ex.reps} | ${ex.rest} | carga estimada ${ex.load}`).join('\n') +
    `\n\n**Por que isso funciona:** comeca pelo movimento mais tecnico enquanto voce esta fresco, depois aumenta volume nos acessorios para gerar tensao mecanica e estresse metabolico sem baguncar a tecnica.\n\n` +
    `**Progressao:** ${progression}\n` +
    `**Ajuste fino:** ${levelNote}`;
}

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

function waitForNaturalResponse(startedAt) {
  const targetDelay = 2000 + Math.floor(Math.random() * 1001);
  const elapsed = Date.now() - startedAt;
  return sleep(Math.max(0, targetDelay - elapsed));
}

function setChatReadyState(isReady) {
  const sendBtn = document.getElementById('sendBtn');
  const chatContainer = document.querySelector('.chat-container');
  if (!sendBtn) return;

  sendBtn.disabled = !isReady;
  sendBtn.classList.toggle('is-thinking', !isReady);
  chatContainer?.classList.toggle('is-thinking', !isReady);
}

function buildChatErrorFallback(error) {
  const message = (error?.message || '').toLowerCase();

  if (message.includes('auth') || message.includes('token') || message.includes('login')) {
    return '**Estou no modo local agora.**\n\nSua sessão da IA online não foi validada, então vou responder por aqui sem travar o chat.\n\nMe diga seu objetivo, nível e quantos dias por semana você treina que eu monto um ajuste prático.';
  }

  return null;
}

async function sendMessage(userText) {
  if (!userText.trim()) return;

  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatContainer = document.querySelector('.chat-container');
  const inputArea = document.querySelector('.chat-input-area');
  if (!input || !sendBtn) return;

  // Gamificacao leve: nao pode travar o chat se o modulo de XP nao carregar.
  if (typeof awardXP === 'function') {
    awardXP('chat_message', 8);
  }

  setChatReadyState(false);
  inputArea?.classList.add('sent');
  setTimeout(() => inputArea?.classList.remove('sent'), 420);
  input.value = '';

  appendMessage('user', userText);
  chatHistory.push({ role: 'user', content: userText });


  if (supabaseClient) {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { error } = await supabaseClient.from('chat_messages').insert({
          user_id: user.id,
          role: 'user',
          content: userText
        });
        if (error) console.warn('Nao foi possivel salvar mensagem do usuario:', error.message);
      }
    } catch (saveError) {
      console.warn('Falha ao salvar mensagem do usuario:', saveError.message);
    }
  }

  const typingId = showTyping();
  const responseStartedAt = Date.now();
  await getUserBodyData().catch(() => null);

  if (!supabaseClient) {
    console.warn('Supabase client não carregado, usando fallback local');
    const fallback = buildSmartResponse(userText);
    await waitForNaturalResponse(responseStartedAt);
    chatHistory.push({ role: 'assistant', content: fallback });
    removeTyping(typingId);
    appendMessage('ai', fallback);
    setChatReadyState(true);
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session?.access_token) {
      console.warn('Sessão não encontrada, usando fallback local');
      const fallback = buildSmartResponse(userText);
      await waitForNaturalResponse(responseStartedAt);
      chatHistory.push({ role: 'assistant', content: fallback });
      removeTyping(typingId);
      appendMessage('ai', fallback);
      setChatReadyState(true);
      return;
    }

    console.log('📤 Enviando mensagem para IA...');
    console.log('🔐 Token presente:', !!session.access_token);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch(
        'https://oqqoafejnzoolbpskbji.supabase.co/functions/v1/chat-ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          signal: controller.signal,
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          profile: userBodyDataCache || null,
          preferences: userBodyDataCache?.prefs || null
        })
      }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    console.debug('IA response status:', response.status);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Erro ao decodificar resposta' };
      }
      console.warn('IA indisponivel, usando resposta local. Status ' + response.status + ':', errorData);
      if (response.status === 401 || response.status === 403) {
        throw new Error('🔐 Erro de autenticação. Faça login novamente.');
      }
      throw new Error(errorData.error || `❌ Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    console.debug('Resposta da IA recebida');

    const aiReply = data?.reply || '';
    if (!aiReply.trim()) {
      console.warn('⚠️ Resposta vazia:', data);
      throw new Error('Resposta vazia recebida da IA');
    }

    await waitForNaturalResponse(responseStartedAt);
    chatHistory.push({ role: 'assistant', content: aiReply });
    removeTyping(typingId);
    appendMessage('ai', aiReply);
    console.debug('Mensagem da IA exibida');

    if (supabaseClient) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: aiReply
        });
      }
    }
  } catch (e) {
    console.warn('IA online falhou, usando resposta local:', e.message);
    const fallback = buildChatErrorFallback(e) || buildSmartResponse(userText);
    await waitForNaturalResponse(responseStartedAt);
    chatHistory.push({ role: 'assistant', content: fallback });
    removeTyping(typingId);
    appendMessage('ai', fallback);

    if (supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('chat_messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: fallback
          });
        }
      } catch (saveError) {
      console.warn('Nao foi possivel salvar fallback:', saveError.message || saveError);
      }
    }
  } finally {
    setChatReadyState(true);
  }
}


// ===========================
// RESETAR CHAT
// ===========================
async function resetChat() {
  // Confirmação dupla para evitar exclusões acidentais
  if (!confirm('⚠️ AVISO: Tem certeza que quer limpar PERMANENTEMENTE todo o histórico do chat?\n\nEssa ação NÃO pode ser desfeita!')) {
    return;
  }

  if (!confirm('🔥 CONFIRMAR: Deletar TODAS as mensagens do banco de dados?')) {
    return;
  }

  const resetBtn = document.getElementById('resetChatBtn');
  if (resetBtn) resetBtn.disabled = true;

  try {
    console.log('🔄 Iniciando exclusão permanente do chat...');

    // 1. Limpar histórico local
    chatHistory = [];

    // 2. DELETAR DO BANCO DE DADOS (PERMANENTE)
    if (supabaseClient) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Não foi possível obter dados do usuário. Faça login novamente.');
      }

      // Deletar todas as mensagens do usuário (PERMANENTEMENTE)
      const { error: deleteError } = await supabaseClient
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar do banco:', deleteError);
        throw new Error(`Erro ao deletar: ${deleteError.message}`);
      }

      console.log('✅ Mensagens deletadas do banco de dados');
    }

    // 3. LIMPAR UI
    const container = document.getElementById('chatMessages');
    if (container) {
      container.innerHTML = `
        <div class="msg-wrapper ai hero-message">
          <div class="msg-avatar">IA</div>
          <div class="msg-bubble ai">
            <p>✅ Chat resetado com SUCESSO!</p>
            <p style="margin-top:8px;">Todas as mensagens foram deletadas permanentemente.</p>
            <p style="margin-top:8px;"><strong>Como posso ajudar você agora?</strong></p>
          </div>
        </div>
      `;
    }

    console.log('✅ Chat resetado com sucesso - histórico limpo permanentemente');
    alert('✅ Histórico do chat deletado permanentemente!');

  } catch (e) {
    console.error('❌ Erro ao resetar chat:', e.message);
    alert(`❌ Erro ao resetar o chat:\n\n${e.message}\n\nTente novamente ou contate o suporte.`);
  } finally {
    if (resetBtn) resetBtn.disabled = false;
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${role} animate-fade-in`;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'ai' ? 'IA' : 'U';
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${role}`;
  bubble.innerHTML = text
    .replace(/### (.*?)\n/g, '<h3 class="msg-title">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('chatMessages');
  if (!container) return id;
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-wrapper ai';
  wrapper.id = id;
  wrapper.innerHTML = `<div class="msg-avatar">IA</div><div class="msg-bubble ai typing-bubble"><div class="typing-indicator" aria-label="IRON IA pensando"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div><span class="typing-text">IRON IA ajustando seu plano</span></div></div>`;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setupChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  if (!input || !sendBtn) return;

  sendBtn.addEventListener('click', () => { const txt = input.value.trim(); if (txt) sendMessage(txt); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const txt = input.value.trim(); if (txt) sendMessage(txt); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  document.querySelectorAll('.suggestion-btn, .onboarding-chip').forEach(btn =>
    btn.addEventListener('click', () => {
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 260);
      sendMessage(btn.dataset.msg);
    })
  );

  // 🔥 EVENT LISTENER: RESETAR CHAT
  const resetBtn = document.getElementById('resetChatBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetChat);
  }

  // 🔥 CARREGAR HISTÓRICO DO USUÁRIO
(async () => {
  try {
  if (!supabaseClient) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (data) {
    data.forEach(msg => {
      appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
      chatHistory.push({ role: msg.role, content: msg.content });
    });
  }
  } catch (e) {
    console.warn('Nao foi possivel carregar historico do chat:', e.message);
  }
})();

  // Pré-carregar dados corporais em background para primeira resposta ser mais rápida
  getUserBodyData().catch(() => { });
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
  console.log('🧩 openExerciseModal id=', id);

  const ex = EXERCISES.find(e => e.id === id); if (!ex) return;
  const content = document.getElementById('exerciseModalContent');

  // Cargas personalizadas baseadas no perfil
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
    <div class="ex-recs-grid">
      <div class="ex-rec-box"><div class="ex-rec-label">Séries</div><div class="ex-rec-value">${vol.sets}</div></div>
      <div class="ex-rec-box"><div class="ex-rec-label">Reps</div><div class="ex-rec-value">${vol.reps}</div></div>
      <div class="ex-rec-box"><div class="ex-rec-label">Descanso</div><div class="ex-rec-value">${vol.rest}</div></div>
      <div class="ex-rec-box accent"><div class="ex-rec-label">Carga Est.</div><div class="ex-rec-value">${personalLoad}</div></div>
    </div>
    <div class="ex-week-badge">
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

function getCheckins() {
  try {
    const data = JSON.parse(localStorage.getItem('ironfit_checkins') || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Check-ins corrompidos no localStorage. Usando lista vazia.');
    return [];
  }
}

function calcIMC(w, h) {
  const weight = parseFloat(w);
  const height = parseFloat(h);
  if (!weight || !height) return null;
  const meters = height / 100;
  return (weight / (meters * meters)).toFixed(1);
}

function saveCheckins(data) {
  localStorage.setItem('ironfit_checkins', JSON.stringify(Array.isArray(data) ? data : []));
}

function imcLabel(imc) {
  if (!imc) return '-';
  const value = parseFloat(imc);
  if (value < 18.5) return 'Abaixo do peso';
  if (value < 25) return 'Normal';
  if (value < 30) return 'Sobrepeso';
  return 'Obesidade';
}

// ⚠️ FUNÇÕES UTILITÁRIAS MOVIDAS PARA src/utils.js
// Use: getCheckins(), calcIMC(), saveCheckins()

// ⚠️ FUNÇÃO MOVIDA PARA src/utils.js
// Use: imcLabel()

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

  if (prev && prev.weight && latest.weight) {
    const d = (parseFloat(latest.weight) - parseFloat(prev.weight)).toFixed(1);
    const el = document.getElementById('statWeightDelta');
    if (el) { el.textContent = (d > 0 ? '+' : '') + d + ' kg'; el.className = 'stat-delta ' + (d > 0 ? 'positive' : d < 0 ? 'negative' : ''); }
  }

  const imc = calcIMC(latest.weight, latest.height);
  const imcEl = document.getElementById('statImc');
  if (imcEl) imcEl.textContent = imc || '—';
  const imcLabelEl = document.getElementById('statImcLabel');
  if (imcLabelEl) imcLabelEl.textContent = imcLabel(imc);

  const fatEl = document.getElementById('statFat');
  if (fatEl) fatEl.textContent = latest.fat ? latest.fat + '%' : '—';

  if (prev && prev.fat && latest.fat) {
    const d = (parseFloat(latest.fat) - parseFloat(prev.fat)).toFixed(1);
    const el = document.getElementById('statFatDelta');
    if (el) { el.textContent = (d > 0 ? '+' : '') + d + '%'; el.className = 'stat-delta ' + (d < 0 ? 'positive' : d > 0 ? 'negative' : ''); }
  }

  updateMeasures(latest);
  renderHistory(checkins);
  renderChart(checkins, currentMetric);
  renderBodyInsights(latest);
}

// Novo: renderizar insights de medidas corporais na página de progresso
function renderBodyInsights(latest) {
  const container = document.getElementById('bodyInsights');
  if (!container || !latest) return;

  getUserBodyData(true).then(bodyData => {
    const insights = analyzeBodyMetrics(bodyData);
    if (!insights.length) { container.innerHTML = ''; return; }
    container.innerHTML = `
      <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:var(--gray3);margin-bottom:12px;">ANÁLISE CORPORAL IA</div>
        ${insights.map(i => `<div style="font-size:13px;color:#ccc;margin-bottom:8px;padding-left:4px;">${i}</div>`).join('')}
        <div style="font-size:11px;color:var(--gray3);margin-top:12px;">Semana ${bodyData.currentWeek}/12 do programa</div>
      </div>`;
  }).catch(() => { });
}

function updateMeasures(data) {
  const fields = { mChest: 'chest', mWaist: 'waist', mHip: 'hip', mArmR: 'armR', mArmL: 'armL', mThighR: 'thighR', mThighL: 'thighL', mCalf: 'calf' };
  for (const [elId, key] of Object.entries(fields)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = (data && data[key]) ? data[key] + ' cm' : '—';
  }
}

function renderHistory(checkins) {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (!checkins.length) { list.innerHTML = '<div class="history-empty">Nenhum registro ainda</div>'; return; }
  list.innerHTML = [...checkins].reverse().map(c =>
    `<div class="history-item">
      <div class="history-date">${c.date}</div>
      <div class="history-metrics">
        ${c.weight ? `<div class="history-metric"><div class="history-metric-val">${c.weight}kg</div><div class="history-metric-label">Peso</div></div>` : ''}
        ${c.fat ? `<div class="history-metric"><div class="history-metric-val">${c.fat}%</div><div class="history-metric-label">Gordura</div></div>` : ''}
        ${c.muscle ? `<div class="history-metric"><div class="history-metric-val">${c.muscle}%</div><div class="history-metric-label">Músculo</div></div>` : ''}
        ${c.waist ? `<div class="history-metric"><div class="history-metric-val">${c.waist}cm</div><div class="history-metric-label">Cintura</div></div>` : ''}
      </div>
      <button class="history-delete" onclick="deleteCheckin(${c.id})">✕</button>
    </div>`).join('');
}

function renderChart(checkins, metric) {
  const canvas = document.getElementById('progressChart');
  const empty = document.getElementById('chartEmpty');
  const filtered = checkins.filter(c => c[metric]);
  if (!filtered.length) {
    empty?.classList.remove('hidden');
    if (progressChart) { progressChart.destroy(); progressChart = null; }
    if (canvas) canvas.style.display = 'none';
    return;
  }
  empty?.classList.add('hidden');
  if (canvas) canvas.style.display = 'block';
  if (typeof Chart === 'undefined') { console.warn('Chart.js não carregado'); return; }
  const labels = filtered.map(c => c.date);
  const values = filtered.map(c => parseFloat(c[metric]));
  const metricLabels = { weight: 'Peso (kg)', fat: '% Gordura', muscle: '% Músculo' };
  if (progressChart) progressChart.destroy();
  progressChart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: [{ label: metricLabels[metric] || metric, data: values, borderColor: '#e8ff00', backgroundColor: 'rgba(232,255,0,0.08)', borderWidth: 2, pointBackgroundColor: '#e8ff00', pointBorderColor: '#111', pointBorderWidth: 2, pointRadius: 5, tension: 0.3, fill: true }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', borderColor: '#333', borderWidth: 1, titleColor: '#e8ff00', bodyColor: '#aaa', padding: 10 } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#666', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#666', font: { size: 11 } } } } },
  });
}

window.deleteCheckin = function (id) {
  if (!confirm('Excluir?')) return;
  saveCheckins(getCheckins().filter(c => c.id !== id));
  userBodyDataCache = null; // Invalidar cache ao deletar checkin
  renderProgress();
};

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
    userBodyDataCache = null; // Invalidar cache ao salvar novo checkin
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

// ===========================
// SUPABASE SETUP
// ===========================
let supabaseClient = null;
const supabaseUrl = 'https://oqqoafejnzoolbpskbji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcW9hZmVqbnpvb2xicHNrYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODQ0NzYsImV4cCI6MjA5MjM2MDQ3Nn0.28ilXh_YHdf7PBCrEz4r_gA20MmeOmo7ZViNIixMJgM';

if (supabaseUrl && supabaseKey && typeof window.supabase !== 'undefined') {
  try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseClient = supabaseClient;
    console.log('✅ Supabase configurado');
  } catch (e) {
    console.warn('⚠️ Supabase não pôde ser inicializado:', e.message);
  }
}

function syncAuthenticatedUser(user) {
  if (!user) return;
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
  localStorage.setItem('ironfit_userEmail', user.email || '');
  localStorage.setItem('ironfit_userId', user.id || '');
  localStorage.setItem('ironfit_loggedIn', 'true');
  if (fullName) localStorage.setItem('ironfit_fullName', fullName);
}

if (supabaseClient?.auth) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      syncAuthenticatedUser(session.user);
    }

    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('ironfit_userEmail');
      localStorage.removeItem('ironfit_userId');
      localStorage.removeItem('ironfit_loggedIn');
      localStorage.removeItem('ironfit_fullName');
    }
  });
}

function setAdminNavigationVisible(isVisible) {
  ['adminNavItem', 'adminMenuItem', 'adminMobileNavItem'].forEach((id) => {
    document.getElementById(id)?.classList.toggle('hidden', !isVisible);
  });
}

async function getAccessProfile(userId) {
  const client = supabaseClient || window.supabaseClient;
  if (!client?.from || !userId) return null;

  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('full_name,role,account_status')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Nao foi possivel verificar permissao do usuario:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Erro ao verificar perfil de acesso:', error?.message || error);
    return null;
  }
}

async function applyAccessProfile(user) {
  const profile = await getAccessProfile(user?.id);
  const status = profile?.account_status;

  setAdminNavigationVisible(profile?.role === 'admin' && status === 'active');

  if (status === 'blocked' || status === 'deleted') {
    alert(status === 'blocked'
      ? 'Sua conta esta bloqueada. Fale com o administrador.'
      : 'Sua conta foi removida do app. Fale com o administrador.');
    await handleLogout();
    return false;
  }

  return profile || true;
}

// ===========================
// AUTH FUNCTIONS
// ===========================
async function login() {
  if (!supabaseClient) { alert('Sistema de autenticação não configurado.'); return; }
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  if (!email || !password) { alert('Informe email e senha!'); return; }
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Erro ao fazer login: ' + error.message);
    } else {
      const profile = await getAccessProfile(data.user.id);
      if (profile?.role === 'admin' && profile?.account_status === 'active') {
        window.location.href = 'admin/';
      } else {
        window.location.href = 'index.html';
      }
    }
  } catch (err) { alert('Erro na autenticação: ' + err.message); }
}

async function loadUserData() {
  const isLoggedInLocal = localStorage.getItem('ironfit_loggedIn') === 'true';
  const userEmail = localStorage.getItem('ironfit_userEmail');

  function applyUserToUI(displayName, email, avatarUrl, isAdmin = false) {
    const firstName = displayName.split(' ')[0];
    const label = isAdmin ? `${firstName} (Admin)` : `Bem-vindo ${firstName}`;
    if (document.getElementById('userName')) document.getElementById('userName').textContent = label;
    if (document.getElementById('userGoal')) document.getElementById('userGoal').textContent = email;
    if (document.getElementById('userMenuEmail')) document.getElementById('userMenuEmail').textContent = email;
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = avatarUrl
        ? `<img src="${avatarUrl}" alt="${firstName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : firstName.charAt(0).toUpperCase();
    }
  }

  function resolveProfileName(fallback) {
    try {
      const p = JSON.parse(localStorage.getItem('ironfit_profile') || '{}');
      return p.full_name || fallback;
    } catch (e) { return fallback; }
  }

  if (isLoggedInLocal && userEmail && !supabaseClient) {
    setAdminNavigationVisible(false);
    const name = resolveProfileName(userEmail.split('@')[0]);
    applyUserToUI(name, userEmail, localStorage.getItem('ironfit_avatar'));
    document.getElementById('userRoleBadge')?.classList.add('hidden');
    document.getElementById('adminMenuItem')?.classList.add('hidden');
    document.getElementById('adminNavItem')?.classList.add('hidden');
    document.getElementById('adminMobileNavItem')?.classList.add('hidden');
    return;
  }

  // Permitir uso offline sem redirecionar para login
  if (!supabaseClient) {
    const fallbackEmail = userEmail || 'offline@ironfit.local';
    const name = resolveProfileName('Usuário');
    applyUserToUI(name, fallbackEmail, localStorage.getItem('ironfit_avatar'));
    document.getElementById('userRoleBadge')?.classList.add('hidden');
    document.getElementById('adminMenuItem')?.classList.add('hidden');
    document.getElementById('adminNavItem')?.classList.add('hidden');
    document.getElementById('adminMobileNavItem')?.classList.add('hidden');
    return;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      setAdminNavigationVisible(false);
      const fallbackEmail = userEmail || 'offline@ironfit.local';
      const name = resolveProfileName('Usuário');
      applyUserToUI(name, fallbackEmail, localStorage.getItem('ironfit_avatar'));
      document.getElementById('userRoleBadge')?.classList.add('hidden');
      document.getElementById('adminMenuItem')?.classList.add('hidden');
      document.getElementById('adminNavItem')?.classList.add('hidden');
      document.getElementById('adminMobileNavItem')?.classList.add('hidden');
      return;
    }
    const accessProfile = await applyAccessProfile(user);
    if (!accessProfile) return;
    const profileName = accessProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
    const name = resolveProfileName(profileName);
    const isAdmin = accessProfile?.role === 'admin' && accessProfile?.account_status === 'active';
    applyUserToUI(name, user.email, localStorage.getItem('ironfit_avatar'), isAdmin);

    if (isAdmin) {
      document.getElementById('userRoleBadge')?.classList.remove('hidden');
      document.getElementById('adminMenuItem')?.classList.remove('hidden');
      document.getElementById('adminNavItem')?.classList.remove('hidden');
      document.getElementById('adminMobileNavItem')?.classList.remove('hidden');
      localStorage.setItem('ironfit_userRole', 'admin');
    } else {
      document.getElementById('userRoleBadge')?.classList.add('hidden');
      document.getElementById('adminMenuItem')?.classList.add('hidden');
      document.getElementById('adminNavItem')?.classList.add('hidden');
      document.getElementById('adminMobileNavItem')?.classList.add('hidden');
      localStorage.removeItem('ironfit_userRole');
    }
  } catch (err) {
    console.warn('Nao foi possivel carregar usuario do Supabase:', err.message);
    const fallbackEmail = userEmail || 'offline@ironfit.local';
    const name = resolveProfileName('Usuário');
    applyUserToUI(name, fallbackEmail, localStorage.getItem('ironfit_avatar'));
    document.getElementById('userRoleBadge')?.classList.add('hidden');
    document.getElementById('adminMenuItem')?.classList.add('hidden');
    document.getElementById('adminNavItem')?.classList.add('hidden');
    document.getElementById('adminMobileNavItem')?.classList.add('hidden');
  }
}

function toggleUserMenu() {
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return;
  userMenu.classList.toggle('hidden');
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sidebarUser') && !e.target.closest('#userMenu')) userMenu.classList.add('hidden');
  }, { once: true });
}

async function handleLogout() {
  console.log('Logout iniciado');
  const keysToRemove = ['ironfit_profile', 'ironfit_prefs', 'ironfit_avatar', 'ironfit_plans', 'ironfit_checkins', 'user_preferences', 'user_data', 'ironfit_userEmail', 'ironfit_fullName', 'ironfit_userId', 'ironfit_loggedIn', 'userEmail', 'userId', 'userName', 'ironfit_userRole', 'auth_token'];
  keysToRemove.forEach(k => localStorage.removeItem(k));

  const client = supabaseClient || window.supabaseClient || (window.supabase && window.IronFitConfig?.SUPABASE_CONFIG ? window.supabase.createClient(window.IronFitConfig.SUPABASE_CONFIG.url, window.IronFitConfig.SUPABASE_CONFIG.key) : null);
  if (client?.auth?.signOut) {
    try {
      await client.auth.signOut();
      console.log('Supabase signOut concluído');
    } catch (e) {
      console.warn('Erro no signOut:', e);
    }
  }

  window.location.href = 'login.html';
}

window.handleLogout = handleLogout;

function showLoginPage() { setTimeout(() => { window.location.href = 'login.html'; }, 800); }

async function isUserAuthenticated() {
  if (!supabaseClient) {
    return localStorage.getItem('ironfit_loggedIn') === 'true' && !!localStorage.getItem('ironfit_userEmail');
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session?.access_token) return false;

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (user && !error) {
      syncAuthenticatedUser(user);
      const accessProfile = await applyAccessProfile(user);

      if (accessProfile && accessProfile.role === 'admin' && accessProfile.account_status === 'active') {
        if (!window.location.pathname.includes('/admin/')) {
          window.location.href = 'admin/';
          return false;
        }
        return true;
      }

      return Boolean(accessProfile);
    }
    setAdminNavigationVisible(false);
    return false;
  } catch (err) {
    console.warn('Erro ao verificar autenticação:', err?.message || err);
    return false;
  }
}

async function requireLogin() {
  const isAuthenticated = await isUserAuthenticated();
  if (!isAuthenticated) {
    console.warn('Usuário não autenticado. Redirecionando para login...');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ===========================
// SPLASH + INIT
// ===========================
function applyThemeFromStorage() {
  const storedTheme = localStorage.getItem('ironfit_theme') || 'dark';
  if (storedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  applyThemeFromStorage();
  const authValidated = await requireLogin();
  if (!authValidated) return;

  // Remove splash instantaneamente
  const splash = document.getElementById('splash');
  if (splash) splash.style.display = 'none';

  const app = document.getElementById('app');
  if (app) app.classList.remove('hidden');

  try {
    // Guards: só setar listeners se os elementos existirem na página atual
    // (evita erros ao abrir páginas diferentes, ou ao reabrir o app em modo offline).
    setupNavigation?.();
    setupChat?.();
    setupPlans?.();
    setupExercises?.();
    setupBuilder?.();
    setupProgress?.();
    loadUserData?.();

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogout();
      });
    }
  } catch (e) {
    console.error('Erro ao iniciar app:', e);
  }
});
// Registro do Service Worker para o PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado com sucesso!', reg))
      .catch(err => console.log('Falha ao registrar o Service Worker:', err));
  });
}
