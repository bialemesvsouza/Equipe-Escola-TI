const API_BASE_URL = 'http://localhost:8080';

const usuarioId = localStorage.getItem('usuarioId');
const usuarioNome = localStorage.getItem('usuarioNome');

const themeToggleBtn = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const ring = document.getElementById('timerRing');
const display = document.getElementById('timerDisplay');
const statusLabel = document.getElementById('timerStatusLabel');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const subjectCards = document.getElementById('subjectCards');
const materiasGrid = document.getElementById('materiasGrid');
const materiasBadge = document.getElementById('materiasBadge');
const activeSubjectName = document.getElementById('activeSubjectName');
const activeSubjectDetails = document.getElementById('activeSubjectDetails');
const progressLog = document.getElementById('progressLog');
const totalStudied = document.getElementById('totalStudied');
const totalGoal = document.getElementById('totalGoal');
const totalGoalFill = document.getElementById('totalGoalFill');
const userPoints = document.getElementById('userPoints');
const materiaForm = document.getElementById('materiaForm');
const materiaNome = document.getElementById('materiaNome');
const materiaCapitulo = document.getElementById('materiaCapitulo');
const materiaMeta = document.getElementById('materiaMeta');
const materiaCor = document.getElementById('materiaCor');
const studyMethodSelect = document.getElementById('studyMethodSelect');
const blockStartTime = document.getElementById('blockStartTime');
const methodName = document.getElementById('methodName');
const phaseName = document.getElementById('phaseName');
const methodSummary = document.getElementById('methodSummary');
const cycleCounter = document.getElementById('cycleCounter');
const phaseList = document.getElementById('phaseList');
const reviewAlerts = document.getElementById('reviewAlerts');
const methodNotes = document.getElementById('methodNotes');

const STUDY_METHODS = {
  standard: 'Padrao',
  pomodoro: 'Pomodoro',
  'time-blocking': 'Time Blocking',
  '52-17': '52/17',
  '90-20': '90/20',
  free: 'Estudo livre',
  235: 'Tecnica 2-3-5',
  spaced: 'Revisao espacada',
  'active-recall': 'Active Recall',
  interleaving: 'Intercalado',
  feynman: 'Feynman'
};

const CIRCUMFERENCE = 2 * Math.PI * 80;
ring.style.strokeDasharray = CIRCUMFERENCE;

let materias = [];
let activeMateriaId = null;
let currentMethod = localStorage.getItem('studyMethod') || 'standard';
let phasePlan = [];
let currentPhaseIndex = 0;
let totalSeconds = 25 * 60;
let remaining = totalSeconds;
let freeElapsedSeconds = 0;
let freeRunSeconds = 0;
let running = false;
let interval = null;

document.addEventListener('DOMContentLoaded', inicializarHome);

function inicializarHome() {
  if (!usuarioId) {
    window.location.href = 'login.html';
    return;
  }

  carregarUsuario();
  configurarTema();
  configurarNavegacao();
  configurarFormularioMateria();
  configurarMetodoEstudo();
  updateDisplay();
  updateRing();
  carregarMaterias();
}

function carregarUsuario() {
  const nomeElemento = document.querySelector('.user-name');
  const avatarElemento = document.querySelector('.user-avatar');

  if (!usuarioNome) {
    return;
  }

  nomeElemento.textContent = usuarioNome;
  avatarElemento.textContent = usuarioNome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function configurarTema() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  });
}

function updateThemeIcons(theme) {
  if (theme === 'light') {
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  } else {
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  }
}

function configurarNavegacao() {
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      mostrarView(item.dataset.view);
    });
  });
}

function configurarFormularioMateria() {
  materiaForm.addEventListener('submit', cadastrarMateria);

  document.querySelectorAll('.color-swatch').forEach((button) => {
    button.addEventListener('click', () => {
      materiaCor.value = button.dataset.color;
      atualizarSwatchAtivo(button.dataset.color);
    });
  });

  materiaCor.addEventListener('input', () => atualizarSwatchAtivo(materiaCor.value));
}

function configurarMetodoEstudo() {
  studyMethodSelect.value = currentMethod;
  blockStartTime.value = localStorage.getItem('blockStartTime') || getHoraAtual();
  methodNotes.value = localStorage.getItem(getNotesKey()) || '';

  studyMethodSelect.addEventListener('change', () => {
    currentMethod = studyMethodSelect.value;
    localStorage.setItem('studyMethod', currentMethod);
    methodNotes.value = localStorage.getItem(getNotesKey()) || '';
    resetTimer();
    montarPlanoEstudo(true);
  });

  blockStartTime.addEventListener('change', () => {
    localStorage.setItem('blockStartTime', blockStartTime.value);
    if (currentMethod === 'time-blocking') {
      resetTimer();
      montarPlanoEstudo(true);
    }
  });

  methodNotes.addEventListener('input', () => {
    localStorage.setItem(getNotesKey(), methodNotes.value);
  });
}

function mostrarView(view) {
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  document.getElementById('inicioView').classList.toggle('active', view === 'inicio');
  document.getElementById('materiasView').classList.toggle('active', view === 'materias');
}

async function carregarMaterias() {
  definirEstadoCarregando();

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/materias/usuario/${usuarioId}`);

    if (!resposta.ok) {
      throw new Error('Nao foi possivel carregar as materias.');
    }

    materias = await resposta.json();
    activeMateriaId = Number(localStorage.getItem('activeMateriaId')) || materias[0]?.id || null;

    if (!materias.some((materia) => materia.id === activeMateriaId)) {
      activeMateriaId = materias[0]?.id || null;
    }

    montarPlanoEstudo(true);
    renderizarTudo();
  } catch (erro) {
    console.error('Erro ao carregar materias:', erro);
    activeSubjectName.textContent = 'Backend indisponivel';
    activeSubjectDetails.textContent = 'Inicie o servidor Spring em http://localhost:8080 e recarregue a tela.';
    subjectCards.innerHTML = '<div class="empty-state">Nao foi possivel carregar as materias.</div>';
    materiasGrid.innerHTML = '<div class="empty-state">Verifique se o backend esta rodando e se o usuario esta logado.</div>';
  }
}

function definirEstadoCarregando() {
  subjectCards.innerHTML = '<div class="empty-state">Carregando...</div>';
  materiasGrid.innerHTML = '<div class="empty-state">Carregando materias...</div>';
}

function renderizarTudo() {
  renderizarMateriaAtiva();
  renderizarCardsLaterais();
  renderizarTelaMaterias();
  renderizarResumo();
  renderizarMetodo();
}

function renderizarMateriaAtiva() {
  const materia = getMateriaAtiva();

  if (!materia) {
    activeSubjectName.textContent = 'Nenhuma materia cadastrada';
    activeSubjectDetails.textContent = 'Abra Materias e cadastre sua primeira materia de estudo.';
    document.documentElement.style.setProperty('--accent', '#7C6FE0');
    return;
  }

  activeSubjectName.textContent = materia.nome;
  activeSubjectDetails.textContent = `${materia.capitulo || 'Sem conteudo definido'} - Meta diaria: ${formatarMinutos(materia.metaDiariaMinutos)}`;
  document.documentElement.style.setProperty('--accent', materia.cor || '#7C6FE0');
}

function renderizarCardsLaterais() {
  if (!materias.length) {
    subjectCards.innerHTML = '<div class="empty-state">Nenhuma materia cadastrada ainda.</div>';
    return;
  }

  subjectCards.innerHTML = materias.map((materia) => {
    const progresso = calcularProgresso(materia);
    const badgeClass = classeStatus(materia.status);

    return `
      <button class="subject-card ${materia.id === activeMateriaId ? 'current' : ''}" type="button" data-materia-id="${materia.id}">
        <div class="sc-header">
          <div class="sc-title">
            <div class="sc-dot" style="background:${materia.cor};"></div>
            <span class="sc-name">${escapeHtml(materia.nome)}</span>
          </div>
          <span class="sc-badge ${badgeClass}">${escapeHtml(materia.status)}</span>
        </div>
        <div class="sc-prog-bar">
          <div class="sc-prog-fill" style="width:${progresso}%;background:${materia.cor};"></div>
        </div>
        <div class="sc-times">
          <div class="sc-time-item">
            <span class="sc-time-val">${formatarRelogio(materia.minutosEstudadosHoje)}</span>
            <span class="sc-time-lbl">Estudado hoje</span>
          </div>
          <div class="sc-time-item text-right">
            <span class="sc-time-val">${formatarRelogio(materia.metaDiariaMinutos)}</span>
            <span class="sc-time-lbl">Meta diaria</span>
          </div>
        </div>
      </button>
    `;
  }).join('');

  subjectCards.querySelectorAll('[data-materia-id]').forEach((card) => {
    card.addEventListener('click', () => selecionarMateria(Number(card.dataset.materiaId), 'inicio'));
  });
}

function renderizarTelaMaterias() {
  materiasBadge.textContent = materias.length;

  if (!materias.length) {
    materiasGrid.innerHTML = '<div class="empty-state empty-state-wide">Cadastre sua primeira materia usando o formulario acima.</div>';
    return;
  }

  materiasGrid.innerHTML = materias.map((materia) => {
    const progresso = calcularProgresso(materia);
    const badgeClass = classeStatus(materia.status);

    return `
      <article class="materia-card ${materia.id === activeMateriaId ? 'selected' : ''}">
        <div class="materia-card-top">
          <div class="materia-color" style="background:${materia.cor};"></div>
          <span class="sc-badge ${badgeClass}">${escapeHtml(materia.status)}</span>
        </div>
        <h3>${escapeHtml(materia.nome)}</h3>
        <p>${escapeHtml(materia.capitulo || 'Sem conteudo definido')}</p>
        <div class="materia-progress">
          <div class="sc-prog-bar">
            <div class="sc-prog-fill" style="width:${progresso}%;background:${materia.cor};"></div>
          </div>
          <span>${progresso}% da meta diaria</span>
        </div>
        <div class="materia-stats">
          <strong>${formatarRelogio(materia.minutosEstudadosHoje)}</strong>
          <span>de ${formatarRelogio(materia.metaDiariaMinutos)}</span>
        </div>
        <div class="materia-actions">
          <button class="materia-action" type="button" data-materia-id="${materia.id}">Estudar agora</button>
          <button class="materia-delete" type="button" data-delete-materia-id="${materia.id}" title="Excluir materia">Excluir</button>
        </div>
      </article>
    `;
  }).join('');

  materiasGrid.querySelectorAll('[data-materia-id]').forEach((button) => {
    button.addEventListener('click', () => selecionarMateria(Number(button.dataset.materiaId), 'inicio'));
  });

  materiasGrid.querySelectorAll('[data-delete-materia-id]').forEach((button) => {
    button.addEventListener('click', () => excluirMateria(Number(button.dataset.deleteMateriaId)));
  });
}

function renderizarResumo() {
  const minutosEstudados = materias.reduce((total, materia) => total + normalizarNumero(materia.minutosEstudadosHoje), 0);
  const minutosMeta = materias.reduce((total, materia) => total + normalizarNumero(materia.metaDiariaMinutos), 0);
  const progressoTotal = minutosMeta > 0 ? Math.min(100, Math.round((minutosEstudados / minutosMeta) * 100)) : 0;

  totalStudied.textContent = formatarRelogio(minutosEstudados);
  totalGoal.textContent = formatarRelogio(minutosMeta);
  totalGoalFill.style.width = `${progressoTotal}%`;
  userPoints.textContent = `${minutosEstudados * 10} pts`;

  progressLog.innerHTML = materias
    .filter((materia) => normalizarNumero(materia.minutosEstudadosHoje) > 0)
    .map((materia) => `
      <div class="log-item">
        <div class="log-color" style="background:${materia.cor};"></div>
        <div class="log-info">
          <div class="log-subj">${escapeHtml(materia.nome)}</div>
          <div class="log-time">${escapeHtml(materia.capitulo || 'Estudo livre')}</div>
        </div>
        <span class="log-dur">${formatarDuracao(materia.minutosEstudadosHoje)}</span>
      </div>
    `)
    .join('') || '<div class="empty-state">Nenhuma sessao registrada hoje.</div>';
}

function renderizarMetodo() {
  const metodo = STUDY_METHODS[currentMethod] || 'Padrao';
  const faseAtual = getFaseAtual();
  const stats = carregarEstatisticasMetodo();

  methodName.textContent = metodo;
  phaseName.textContent = faseAtual ? faseAtual.titulo : currentMethod === 'free' ? 'Cronometro livre' : 'Pronto';
  cycleCounter.textContent = phasePlan.length ? `${currentPhaseIndex + 1}/${phasePlan.length}` : '0/0';
  methodNotes.classList.toggle('visible', currentMethod === 'feynman');
  blockStartTime.closest('.study-mode-extra').classList.toggle('visible', currentMethod === 'time-blocking');

  if (!materias.length) {
    methodSummary.textContent = 'Cadastre uma materia para habilitar os metodos.';
  } else if (currentMethod === 'free') {
    methodSummary.textContent = `Tempo livre registrado neste metodo: ${formatarMinutos(stats.free || 0)}.`;
  } else if (currentMethod === 'active-recall') {
    methodSummary.textContent = `Estudo: ${formatarMinutos(stats['Estudo focado'] || 0)} | Revisao ativa: ${formatarMinutos(stats['Revisao ativa'] || 0)}.`;
  } else if (currentMethod === 'time-blocking') {
    methodSummary.textContent = 'Blocos montados com o tempo diario cadastrado em cada materia.';
  } else if (currentMethod === 'spaced') {
    methodSummary.textContent = 'Ao concluir o estudo inicial, as revisoes D+1, D+7, D+15 e D+30 sao agendadas.';
  } else {
    methodSummary.textContent = `${metodo} aplicado na materia ativa ou na lista de materias cadastradas.`;
  }

  phaseList.innerHTML = phasePlan.length
    ? phasePlan.map((fase, index) => `
        <div class="phase-item ${index === currentPhaseIndex ? 'active' : ''}">
          <span>${escapeHtml(fase.titulo)}</span>
          <strong>${formatarMinutos(fase.duracaoMinutos)}</strong>
        </div>
      `).join('')
    : '<div class="empty-state">Nenhuma fase montada.</div>';

  renderizarAlertasRevisao();
}

function montarPlanoEstudo(resetarIndice = false) {
  const materia = getMateriaAtiva();
  phasePlan = [];
  methodNotes.value = localStorage.getItem(getNotesKey()) || '';

  if (resetarIndice) {
    currentPhaseIndex = 0;
    freeElapsedSeconds = 0;
    freeRunSeconds = 0;
  }

  if (!materias.length || (!materia && currentMethod !== 'interleaving' && currentMethod !== 'time-blocking')) {
    totalSeconds = 25 * 60;
    remaining = totalSeconds;
    updateDisplay();
    updateRing();
    renderizarMetodo();
    return;
  }

  if (currentMethod === 'standard') {
    phasePlan = [criarFase('Timer padrao', materia.metaDiariaMinutos, materia.id, 'Padrao')];
  }

  if (currentMethod === 'pomodoro') {
    phasePlan = criarCiclosComPausa(4, 25, 5, 20, 'Pomodoro');
  }

  if (currentMethod === 'time-blocking') {
    phasePlan = criarBlocosDeTempo();
  }

  if (currentMethod === '52-17') {
    phasePlan = criarCiclosComPausa(3, 52, 17, 17, '52/17');
  }

  if (currentMethod === '90-20') {
    phasePlan = criarCiclosComPausa(2, 90, 20, 20, '90/20');
  }

  if (currentMethod === 'free') {
    totalSeconds = 0;
    remaining = 0;
    statusLabel.textContent = 'Cronometro livre';
    updateDisplay();
    updateRing();
    renderizarMetodo();
    return;
  }

  if (currentMethod === '235') {
    const meta = Math.max(5, normalizarNumero(materia.metaDiariaMinutos));
    const revisao = Math.max(1, Math.round(meta * 0.2));
    const exercicios = Math.max(1, Math.round(meta * 0.3));
    const novo = Math.max(1, meta - revisao - exercicios);
    phasePlan = [
      criarFase('Revisao', revisao, materia.id, 'Revisao'),
      criarFase('Exercicios', exercicios, materia.id, 'Exercicios'),
      criarFase('Conteudo novo', novo, materia.id, 'Conteudo novo')
    ];
  }

  if (currentMethod === 'spaced') {
    phasePlan = [criarFase('Estudo inicial', materia.metaDiariaMinutos, materia.id, 'Revisao espacada')];
  }

  if (currentMethod === 'active-recall') {
    phasePlan = [
      criarFase('Estudo focado', 30, materia.id, 'Estudo focado'),
      criarFase('Revisao ativa', 15, materia.id, 'Revisao ativa')
    ];
  }

  if (currentMethod === 'interleaving') {
    const totalFases = Math.max(4, materias.length);
    phasePlan = Array.from({ length: totalFases }, (_, index) => {
      const item = materias[index % materias.length];
      return criarFase(`Intercalado - ${item.nome}`, 30, item.id, 'Intercalado');
    });
  }

  if (currentMethod === 'feynman') {
    phasePlan = [
      criarFase('Estudar conteudo', 25, materia.id, 'Feynman - estudo'),
      criarFase('Explicar em voz alta', 15, materia.id, 'Feynman - explicacao'),
      criarFase('Revisar falhas', 10, materia.id, 'Feynman - revisao')
    ];
  }

  if (currentPhaseIndex >= phasePlan.length) {
    currentPhaseIndex = 0;
  }

  aplicarFaseAtual();
  renderizarMetodo();
}

function criarFase(titulo, duracaoMinutos, materiaId, categoria, tipo = 'study') {
  return {
    titulo,
    duracaoMinutos: Math.max(1, normalizarNumero(duracaoMinutos)),
    materiaId,
    categoria,
    tipo,
    contabilizaEstudo: tipo === 'study'
  };
}

function criarPausa(titulo, duracaoMinutos) {
  return criarFase(titulo, duracaoMinutos, null, 'Pausa', 'break');
}

function criarCiclosComPausa(ciclos, estudoMinutos, pausaMinutos, pausaLongaMinutos, categoria) {
  const plano = [];
  const inicio = Math.max(0, materias.findIndex((materia) => materia.id === activeMateriaId));

  for (let ciclo = 0; ciclo < ciclos; ciclo++) {
    const materia = materias[(inicio + ciclo) % materias.length];
    plano.push(criarFase(`${materia.nome}`, estudoMinutos, materia.id, categoria));
    plano.push(criarPausa(ciclo === ciclos - 1 ? 'Pausa maior' : 'Pausa', ciclo === ciclos - 1 ? pausaLongaMinutos : pausaMinutos));
  }

  return plano;
}

function criarBlocosDeTempo() {
  let cursor = blockStartTime.value || getHoraAtual();

  return materias.map((materia) => {
    const inicio = cursor;
    cursor = somarMinutosHora(cursor, materia.metaDiariaMinutos);
    return {
      ...criarFase(`${materia.nome} (${inicio} - ${cursor})`, materia.metaDiariaMinutos, materia.id, 'Time Blocking'),
      horarioInicio: inicio,
      horarioFim: cursor
    };
  });
}

function aplicarFaseAtual() {
  const fase = getFaseAtual();

  if (!fase) {
    totalSeconds = 25 * 60;
    remaining = totalSeconds;
    statusLabel.textContent = 'Pronto';
    updateDisplay();
    updateRing();
    return;
  }

  totalSeconds = fase.duracaoMinutos * 60;
  remaining = totalSeconds;
  statusLabel.textContent = fase.tipo === 'break' ? 'Pausa' : 'Estudo ativo';
  updateDisplay();
  updateRing();
}

function getFaseAtual() {
  return phasePlan[currentPhaseIndex] || null;
}

function selecionarMateria(materiaId, view) {
  activeMateriaId = materiaId;
  localStorage.setItem('activeMateriaId', String(materiaId));
  resetTimer();
  montarPlanoEstudo(true);
  renderizarTudo();
  mostrarView(view);
}

async function cadastrarMateria(event) {
  event.preventDefault();

  const nome = materiaNome.value.trim();
  const capitulo = materiaCapitulo.value.trim();
  const metaDiariaMinutos = Number(materiaMeta.value);
  const cor = materiaCor.value;

  if (!nome || !metaDiariaMinutos || metaDiariaMinutos <= 0) {
    return;
  }

  const botao = materiaForm.querySelector('.materia-submit');
  botao.disabled = true;
  botao.textContent = 'Salvando...';

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/materias/usuario/${usuarioId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        capitulo,
        cor,
        metaDiariaMinutos,
        minutosEstudadosHoje: 0,
        status: 'Pendente'
      })
    });

    if (!resposta.ok) {
      throw new Error('Nao foi possivel cadastrar a materia.');
    }

    const materia = await resposta.json();
    materias.push(materia);
    activeMateriaId = materia.id;
    localStorage.setItem('activeMateriaId', String(materia.id));
    materiaForm.reset();
    materiaMeta.value = 60;
    materiaCor.value = '#7C6FE0';
    atualizarSwatchAtivo('#7C6FE0');
    resetTimer();
    montarPlanoEstudo(true);
    renderizarTudo();
  } catch (erro) {
    console.error('Erro ao cadastrar materia:', erro);
  } finally {
    botao.disabled = false;
    botao.textContent = 'Cadastrar';
  }
}

async function excluirMateria(materiaId) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/api/materias/${materiaId}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      throw new Error('Nao foi possivel excluir a materia.');
    }

    materias = materias.filter((materia) => materia.id !== materiaId);

    if (activeMateriaId === materiaId) {
      activeMateriaId = materias[0]?.id || null;
      if (activeMateriaId) {
        localStorage.setItem('activeMateriaId', String(activeMateriaId));
      } else {
        localStorage.removeItem('activeMateriaId');
      }
    }

    resetTimer();
    montarPlanoEstudo(true);
    renderizarTudo();
  } catch (erro) {
    console.error('Erro ao excluir materia:', erro);
  }
}

function atualizarSwatchAtivo(cor) {
  document.querySelectorAll('.color-swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color.toLowerCase() === cor.toLowerCase());
  });
}

async function salvarMinutosDeEstudo(materiaId, segundos, categoria) {
  const materia = materias.find((item) => item.id === materiaId);

  if (!materia || segundos <= 0) {
    return;
  }

  const minutos = Math.max(1, Math.round(segundos / 60));
  const minutosAtuais = normalizarNumero(materia.minutosEstudadosHoje) + minutos;
  const meta = normalizarNumero(materia.metaDiariaMinutos);
  const atualizada = {
    ...materia,
    minutosEstudadosHoje: minutosAtuais,
    status: minutosAtuais >= meta ? 'Concluido' : 'Ativo'
  };

  registrarEstatisticaMetodo(categoria, minutos);

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/materias/${materia.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(atualizada)
    });

    if (!resposta.ok) {
      throw new Error('Nao foi possivel salvar o progresso.');
    }

    const materiaSalva = await resposta.json();
    materias = materias.map((item) => item.id === materiaSalva.id ? materiaSalva : item);
    renderizarTudo();
  } catch (erro) {
    console.error('Erro ao salvar progresso:', erro);
    statusLabel.textContent = 'Sessao concluida, mas nao salva';
  }
}

async function concluirFaseAtual() {
  const fase = getFaseAtual();

  if (!fase) {
    pararTimer();
    return;
  }

  if (fase.contabilizaEstudo) {
    await salvarMinutosDeEstudo(fase.materiaId, totalSeconds, fase.categoria);
  }

  if (currentMethod === 'spaced' && fase.contabilizaEstudo) {
    agendarRevisoes(fase.materiaId);
  }

  currentPhaseIndex++;

  if (currentPhaseIndex >= phasePlan.length) {
    pararTimer();
    statusLabel.textContent = 'Metodo concluido';
    remaining = 0;
    updateDisplay();
    updateRing();
    renderizarMetodo();
    return;
  }

  aplicarFaseAtual();
  renderizarMetodo();

  if (running) {
    iniciarIntervalo();
  }
}

function toggleTimer() {
  if (running) {
    pausarTimer();
    return;
  }

  if (!materias.length) {
    statusLabel.textContent = 'Cadastre uma materia';
    return;
  }

  if (currentMethod !== 'free' && !getFaseAtual()) {
    montarPlanoEstudo(true);
  }

  running = true;
  playIcon.style.display = 'none';
  pauseIcon.style.display = '';
  statusLabel.textContent = currentMethod === 'free' ? 'Cronometro livre' : 'Estudo ativo';
  iniciarIntervalo();
}

function iniciarIntervalo() {
  clearInterval(interval);
  interval = setInterval(async () => {
    if (currentMethod === 'free') {
      freeElapsedSeconds++;
      freeRunSeconds++;
      updateDisplay();
      updateRing();
      return;
    }

    if (remaining <= 0) {
      clearInterval(interval);
      await concluirFaseAtual();
      return;
    }

    remaining--;
    updateDisplay();
    updateRing();

    if (remaining <= 0) {
      clearInterval(interval);
      await concluirFaseAtual();
    }
  }, 1000);
}

async function pausarTimer() {
  clearInterval(interval);
  running = false;
  playIcon.style.display = '';
  pauseIcon.style.display = 'none';
  statusLabel.textContent = 'Pausado';

  if (currentMethod === 'free' && freeRunSeconds > 0) {
    const materia = getMateriaAtiva();
    if (materia) {
      await salvarMinutosDeEstudo(materia.id, freeRunSeconds, 'free');
    }
    freeRunSeconds = 0;
  }
}

function pararTimer() {
  clearInterval(interval);
  running = false;
  playIcon.style.display = '';
  pauseIcon.style.display = 'none';
}

function resetTimer() {
  pararTimer();
  freeElapsedSeconds = 0;
  freeRunSeconds = 0;
  currentPhaseIndex = 0;
  aplicarFaseAtual();
  statusLabel.textContent = currentMethod === 'free' ? 'Cronometro livre' : 'Pronto';
  renderizarMetodo();
}

function skipTimer() {
  if (currentMethod === 'free') {
    resetTimer();
    return;
  }

  clearInterval(interval);
  currentPhaseIndex++;

  if (currentPhaseIndex >= phasePlan.length) {
    remaining = 0;
    pararTimer();
    statusLabel.textContent = 'Metodo concluido';
    updateDisplay();
    updateRing();
  } else {
    aplicarFaseAtual();
    if (running) {
      iniciarIntervalo();
    }
  }

  renderizarMetodo();
}

function updateDisplay() {
  const texto = currentMethod === 'free'
    ? formatarSegundos(freeElapsedSeconds)
    : formatarSegundos(remaining);

  aplicarTextoTimer(texto);
}

function aplicarTextoTimer(texto) {
  display.textContent = texto;
  display.classList.toggle('long', texto.length >= 8);
  display.classList.toggle('extra-long', texto.length >= 9);
}

function updateRing() {
  if (currentMethod === 'free') {
    const pct = (freeElapsedSeconds % 3600) / 3600;
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
    return;
  }

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
  ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
}

function getMateriaAtiva() {
  return materias.find((materia) => materia.id === activeMateriaId);
}

function calcularProgresso(materia) {
  const estudado = normalizarNumero(materia.minutosEstudadosHoje);
  const meta = normalizarNumero(materia.metaDiariaMinutos);
  return meta > 0 ? Math.min(100, Math.round((estudado / meta) * 100)) : 0;
}

function classeStatus(status = '') {
  const statusNormalizado = status.toLowerCase();

  if (statusNormalizado.includes('conclu')) {
    return 'done';
  }

  if (statusNormalizado.includes('ativo')) {
    return 'active';
  }

  return 'pending';
}

function normalizarNumero(valor) {
  return Number(valor) || 0;
}

function formatarSegundos(segundos) {
  const total = Math.max(0, normalizarNumero(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (horas > 0) {
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutos).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatarRelogio(minutos) {
  const total = normalizarNumero(minutos);
  const horas = Math.floor(total / 60);
  const mins = total % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function formatarMinutos(minutos) {
  const total = normalizarNumero(minutos);

  if (total < 60) {
    return `${total}min`;
  }

  const horas = Math.floor(total / 60);
  const mins = total % 60;
  return mins ? `${horas}h ${mins}min` : `${horas}h`;
}

function formatarDuracao(minutos) {
  const total = normalizarNumero(minutos);
  const horas = Math.floor(total / 60);
  const mins = total % 60;

  if (horas && mins) {
    return `${horas}h ${mins}m`;
  }

  return horas ? `${horas}h` : `${mins}m`;
}

function getHoraAtual() {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
}

function somarMinutosHora(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const data = new Date();
  data.setHours(h || 0, m || 0, 0, 0);
  data.setMinutes(data.getMinutes() + normalizarNumero(minutos));
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function escapeHtml(valor = '') {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getStatsKey() {
  return `studyStats_${usuarioId}_${currentMethod}`;
}

function carregarEstatisticasMetodo() {
  try {
    return JSON.parse(localStorage.getItem(getStatsKey())) || {};
  } catch {
    return {};
  }
}

function registrarEstatisticaMetodo(categoria, minutos) {
  const stats = carregarEstatisticasMetodo();
  const chave = categoria || currentMethod;
  stats[chave] = normalizarNumero(stats[chave]) + minutos;
  localStorage.setItem(getStatsKey(), JSON.stringify(stats));
}

function getNotesKey() {
  return `methodNotes_${usuarioId}_${currentMethod}_${activeMateriaId || 'geral'}`;
}

function getReviewKey() {
  return `spacedReviews_${usuarioId}`;
}

function carregarRevisoes() {
  try {
    return JSON.parse(localStorage.getItem(getReviewKey())) || [];
  } catch {
    return [];
  }
}

function salvarRevisoes(revisoes) {
  localStorage.setItem(getReviewKey(), JSON.stringify(revisoes));
}

function agendarRevisoes(materiaId) {
  const materia = materias.find((item) => item.id === materiaId);

  if (!materia) {
    return;
  }

  const revisoes = carregarRevisoes().filter((revisao) => revisao.materiaId !== materiaId);
  const hoje = new Date();
  const intervalos = [1, 7, 15, 30];

  intervalos.forEach((dias) => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + dias);
    revisoes.push({
      materiaId,
      materiaNome: materia.nome,
      data: data.toISOString().slice(0, 10),
      concluida: false
    });
  });

  salvarRevisoes(revisoes);
}

function renderizarAlertasRevisao() {
  const hoje = new Date().toISOString().slice(0, 10);
  const revisoes = carregarRevisoes();
  const pendentes = revisoes.filter((revisao) => !revisao.concluida && revisao.data <= hoje);
  const futuras = revisoes.filter((revisao) => !revisao.concluida && revisao.data > hoje).slice(0, 3);

  if (currentMethod !== 'spaced') {
    reviewAlerts.innerHTML = '';
    return;
  }

  const itens = [
    ...pendentes.map((revisao) => `<div class="review-item due">${escapeHtml(revisao.materiaNome)} - hoje</div>`),
    ...futuras.map((revisao) => `<div class="review-item">${escapeHtml(revisao.materiaNome)} - ${formatarDataCurta(revisao.data)}</div>`)
  ];

  reviewAlerts.innerHTML = itens.join('') || '<div class="review-item">Nenhuma revisao agendada ainda.</div>';
}

function formatarDataCurta(dataIso) {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano.slice(2)}`;
}

window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.skipTimer = skipTimer;
