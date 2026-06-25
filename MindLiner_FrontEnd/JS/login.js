// --- LÓGICA DO TEMA (DARK/LIGHT MODE) ---
const themeToggleBtn = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');

const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');
  let newTheme = theme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  updateThemeIcons(newTheme);
});

function updateThemeIcons(theme) {
  if (theme === 'light') {
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  } else {
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  }
}

// --- LÓGICA DE NOTIFICAÇÃO (TOAST) ---
function mostrarToast(mensagem, tipo = 'sucesso') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  toast.classList.add('toast');
  if (tipo === 'erro') {
    toast.classList.add('error');
  }
  toast.textContent = mensagem;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// --- LÓGICA DE LOGIN E CADASTRO ---
let modoAtual = 'login'; 

function alternarModo() {
  const titulo = document.getElementById('titulo-form');
  const subtitulo = document.getElementById('subtitulo-form');
  const grupoNome = document.getElementById('grupo-nome');
  const btnAcao = document.getElementById('btn-acao');
  const textoAlternativa = document.getElementById('texto-alternativa');
  const btnAlternar = document.getElementById('btn-alternar');

  if (modoAtual === 'login') {
    modoAtual = 'cadastro';
    titulo.textContent = 'Crie sua conta';
    subtitulo.textContent = 'Junte-se ao MindLine.';
    grupoNome.style.display = 'flex';
    btnAcao.textContent = 'Cadastrar';
    textoAlternativa.textContent = 'Já tem uma conta?';
    btnAlternar.textContent = 'Faça Login';
  } else {
    modoAtual = 'login';
    titulo.textContent = 'Acesse sua conta';
    subtitulo.textContent = 'Bem-vindo de volta! Insira seus dados.';
    grupoNome.style.display = 'none';
    btnAcao.textContent = 'Entrar';
    textoAlternativa.textContent = 'Ainda não tem uma conta?';
    btnAlternar.textContent = 'Cadastre-se';
  }
}

async function executarAcao() {
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    mostrarToast("Por favor, preencha o e-mail e a senha.", "erro");
    return;
  }

  const endpoint = modoAtual === 'login' ? '/api/usuarios/login' : '/api/usuarios/cadastrar';
  const url = `http://localhost:8080${endpoint}`;

  const corpoRequisicao = {
    email: email,
    senha: senha
  };
  
  if (modoAtual === 'cadastro') {
    corpoRequisicao.nome = nome;
  }

  const btnAcao = document.getElementById('btn-acao');
  btnAcao.disabled = true;
  btnAcao.textContent = "Aguarde...";

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpoRequisicao)
    });

    if (resposta.ok) {
      const dadosUsuario = await resposta.json();
      
      localStorage.setItem('usuarioId', dadosUsuario.id);
      localStorage.setItem('usuarioNome', dadosUsuario.nome);
      
      mostrarToast(modoAtual === 'login' ? "Login realizado com sucesso!" : "Conta criada com sucesso!");
      
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1500);

    } else {
      mostrarToast("E-mail ou senha incorretos. Verifique e tente novamente.", "erro");
      btnAcao.disabled = false;
      btnAcao.textContent = modoAtual === 'login' ? 'Entrar' : 'Cadastrar';
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    mostrarToast("Erro ao conectar com o servidor.", "erro");
    btnAcao.disabled = false;
    btnAcao.textContent = modoAtual === 'login' ? 'Entrar' : 'Cadastrar';
  }
}