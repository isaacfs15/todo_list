// ══════════════════════════════════════════════════════
//  app.js — Lógica principal do frontend
//  Integrado com: servico-tarefas (3001) + servico-analisador (8001)
// ══════════════════════════════════════════════════════

import {
  cadastrarUsuario,
  loginUsuario,
  listarTarefas,
  criarTarefa,
  alternarTarefa,
  excluirTarefa,
  buscarEstatisticas,
} from "./api.js";

// ── Estado da aplicação ──────────────────────────────
const estado = {
  usuario:  null,   // { usuarioId, nome, token }
  tarefas:  [],     // Tarefa[] (cache local)
  filtro:   "todas",
};

// ── Referências ao DOM ───────────────────────────────
const telaAuth  = document.getElementById("telaAuth");
const telaApp   = document.getElementById("telaApp");

// ════════════════════════════════════════════════════════
//  INICIALIZAÇÃO — verifica sessão salva
// ════════════════════════════════════════════════════════
function inicializar() {
  const tokenSalvo    = localStorage.getItem("token_jwt");
  const usuarioSalvo  = localStorage.getItem("usuario_dados");

  if (tokenSalvo && usuarioSalvo) {
    try {
      estado.usuario = JSON.parse(usuarioSalvo);
      mostrarApp();
      return;
    } catch (_) {
      localStorage.clear();
    }
  }
  mostrarAuth();
}

// ════════════════════════════════════════════════════════
//  NAVEGAÇÃO ENTRE TELAS
// ════════════════════════════════════════════════════════
function mostrarAuth() {
  telaApp.classList.add("oculto");
  telaAuth.classList.remove("oculto");
}

function mostrarApp() {
  telaAuth.classList.add("oculto");
  telaApp.classList.remove("oculto");
  document.getElementById("nomeUsuario").textContent = `Olá, ${estado.usuario.nome}`;
  carregarTudo();
}

async function carregarTudo() {
  mostrarCarregando(true);
  try {
    await Promise.all([renderizarTarefas(), atualizarEstatisticas()]);
  } finally {
    mostrarCarregando(false);
  }
}

// ════════════════════════════════════════════════════════
//  AUTENTICAÇÃO
// ════════════════════════════════════════════════════════

// Alterna entre as abas Login / Cadastro
window.alternarAba = function (aba) {
  document.querySelectorAll(".aba").forEach(el => el.classList.remove("aba-ativa"));
  document.querySelector(`[data-aba="${aba}"]`).classList.add("aba-ativa");

  document.getElementById("formLogin").classList.toggle("oculto",    aba !== "login");
  document.getElementById("formCadastro").classList.toggle("oculto", aba !== "cadastro");

  // Limpa mensagens ao trocar de aba
  limparMensagem("erroLogin");
  limparMensagem("erroCadastro");
  limparMensagem("sucessoCadastro");
};

// Login
window.fazerLogin = async function (evento) {
  evento.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const senha  = document.getElementById("loginSenha").value;

  definirCarregandoBtn("btnLogin", true);
  limparMensagem("erroLogin");

  try {
    const dados = await loginUsuario({ email, senha });
    // dados = { token, usuarioId, nome }

    estado.usuario = { token: dados.token, usuarioId: dados.usuarioId, nome: dados.nome };
    localStorage.setItem("token_jwt",    dados.token);
    localStorage.setItem("usuario_dados", JSON.stringify(estado.usuario));

    document.getElementById("formLogin").reset();
    mostrarApp();
  } catch (erro) {
    mostrarMensagem("erroLogin", erro.message);
  } finally {
    definirCarregandoBtn("btnLogin", false);
  }
};

// Cadastro
window.fazerCadastro = async function (evento) {
  evento.preventDefault();
  const nome  = document.getElementById("cadastroNome").value.trim();
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha  = document.getElementById("cadastroSenha").value;

  definirCarregandoBtn("btnCadastro", true);
  limparMensagem("erroCadastro");
  limparMensagem("sucessoCadastro");

  try {
    await cadastrarUsuario({ nome, email, senha });

    mostrarMensagem("sucessoCadastro", "✓ Conta criada! Faça login para continuar.");
    document.getElementById("formCadastro").reset();

    // Redireciona automaticamente para a aba de login após 1.5s
    setTimeout(() => alternarAba("login"), 1500);
  } catch (erro) {
    mostrarMensagem("erroCadastro", erro.message);
  } finally {
    definirCarregandoBtn("btnCadastro", false);
  }
};

// Logout
window.fazerLogout = function () {
  estado.usuario = null;
  estado.tarefas = [];
  localStorage.removeItem("token_jwt");
  localStorage.removeItem("usuario_dados");
  mostrarAuth();
};

// ════════════════════════════════════════════════════════
//  TAREFAS
// ════════════════════════════════════════════════════════

async function renderizarTarefas() {
  const listaDom = document.getElementById("listaTarefas");
  listaDom.innerHTML = "";

  try {
    estado.tarefas = await listarTarefas();
  } catch (erro) {
    if (erro.message.includes("401") || erro.message.toLowerCase().includes("token")) {
      fazerLogout();
      return;
    }
    estado.tarefas = [];
  }

  const tarefasFiltradas = filtrarTarefas(estado.tarefas);

  const vazio = document.getElementById("estadoVazio");
  if (tarefasFiltradas.length === 0) {
    vazio.classList.remove("oculto");
    return;
  }
  vazio.classList.add("oculto");

  tarefasFiltradas.forEach(tarefa => {
    listaDom.appendChild(criarElementoTarefa(tarefa));
  });
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement("li");
  li.className = `item-tarefa${tarefa.concluida ? " concluida" : ""}`;
  li.dataset.id = tarefa.id;

  const dataFormatada = tarefa.criadoEm
    ? new Date(tarefa.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : "";

  li.innerHTML = `
    <button class="tarefa-check" title="${tarefa.concluida ? "Reabrir tarefa" : "Concluir tarefa"}">
      ${tarefa.concluida ? "✓" : ""}
    </button>
    <span class="tarefa-titulo">${escaparHtml(tarefa.titulo)}</span>
    <span class="tarefa-data">${dataFormatada}</span>
    <button class="btn-remover" title="Remover tarefa">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
      </svg>
    </button>
  `;

  li.querySelector(".tarefa-check").addEventListener("click", () => lidarAlternar(tarefa.id, li));
  li.querySelector(".btn-remover").addEventListener("click",  () => lidarExcluir(tarefa.id, li));

  return li;
}

// Criar nova tarefa
window.criarTarefa = async function (evento) {
  evento.preventDefault();
  const input  = document.getElementById("inputTitulo");
  const titulo = input.value.trim();
  if (!titulo) return;

  const btn = document.getElementById("btnAdicionar");
  btn.disabled = true;

  try {
    await criarTarefa({ titulo });
    input.value = "";
    await carregarTudo();
  } catch (erro) {
    alert(`Erro ao criar tarefa: ${erro.message}`);
  } finally {
    btn.disabled = false;
    input.focus();
  }
};

// Alternar concluída/pendente
async function lidarAlternar(id, elementoLi) {
  const check = elementoLi.querySelector(".tarefa-check");
  check.disabled = true;

  try {
    const tarefaAtualizada = await alternarTarefa(id);

    // Atualiza estado local sem re-renderizar tudo
    const idx = estado.tarefas.findIndex(t => t.id === id);
    if (idx !== -1) estado.tarefas[idx].concluida = tarefaAtualizada.concluida;

    elementoLi.classList.toggle("concluida", tarefaAtualizada.concluida);
    check.textContent = tarefaAtualizada.concluida ? "✓" : "";
    check.title = tarefaAtualizada.concluida ? "Reabrir tarefa" : "Concluir tarefa";

    // Se houver filtro ativo, o item pode sumir da view
    if (estado.filtro !== "todas") {
      await renderizarTarefas();
    }

    await atualizarEstatisticas();
  } catch (erro) {
    alert(`Erro ao atualizar tarefa: ${erro.message}`);
  } finally {
    check.disabled = false;
  }
}

// Excluir tarefa
async function lidarExcluir(id, elementoLi) {
  const btn = elementoLi.querySelector(".btn-remover");
  btn.disabled = true;

  // Animação de saída
  elementoLi.style.opacity    = "0.4";
  elementoLi.style.transition = "opacity 0.2s";

  try {
    await excluirTarefa(id);
    estado.tarefas = estado.tarefas.filter(t => t.id !== id);

    // Remove do DOM com animação
    elementoLi.style.height   = elementoLi.offsetHeight + "px";
    elementoLi.style.overflow = "hidden";
    requestAnimationFrame(() => {
      elementoLi.style.transition = "height 0.2s ease, opacity 0.2s";
      elementoLi.style.height     = "0";
      elementoLi.style.opacity    = "0";
    });
    setTimeout(async () => {
      elementoLi.remove();
      await atualizarEstatisticas();
      // Mostra estado vazio se lista ficou vazia
      const listaDom = document.getElementById("listaTarefas");
      if (listaDom.children.length === 0) {
        document.getElementById("estadoVazio").classList.remove("oculto");
      }
    }, 220);
  } catch (erro) {
    elementoLi.style.opacity = "1";
    btn.disabled = false;
    alert(`Erro ao excluir tarefa: ${erro.message}`);
  }
}

// ════════════════════════════════════════════════════════
//  FILTROS
// ════════════════════════════════════════════════════════
window.aplicarFiltro = async function (filtro, botao) {
  estado.filtro = filtro;

  document.querySelectorAll(".filtro").forEach(el => el.classList.remove("filtro-ativo"));
  botao.classList.add("filtro-ativo");

  await renderizarTarefas();
};

function filtrarTarefas(tarefas) {
  switch (estado.filtro) {
    case "pendentes":  return tarefas.filter(t => !t.concluida);
    case "concluidas": return tarefas.filter(t =>  t.concluida);
    default:           return tarefas;
  }
}

// ════════════════════════════════════════════════════════
//  ESTATÍSTICAS (vêm do servico-analisador :8001)
// ════════════════════════════════════════════════════════
async function atualizarEstatisticas() {
  if (!estado.usuario) return;

  try {
    const dados = await buscarEstatisticas(estado.usuario.usuarioId);
    // dados = { usuarioId, nomeUsuario, estatisticas: { total, concluidas, pendentes } }
    const { total, concluidas, pendentes } = dados.estatisticas;

    animarNumero("statTotal",     total);
    animarNumero("statPendentes", pendentes);
    animarNumero("statConcluidas", concluidas);
  } catch (_) {
    // Fallback: calcula localmente se o analisador estiver offline
    const total      = estado.tarefas.length;
    const concluidas = estado.tarefas.filter(t => t.concluida).length;
    const pendentes  = total - concluidas;

    document.getElementById("statTotal").textContent     = total;
    document.getElementById("statPendentes").textContent  = pendentes;
    document.getElementById("statConcluidas").textContent = concluidas;
  }
}

// Animação suave ao atualizar números
function animarNumero(idElemento, valorFinal) {
  const el = document.getElementById(idElemento);
  const valorAtual = parseInt(el.textContent) || 0;
  if (valorAtual === valorFinal) return;

  const duracao = 300;
  const inicio  = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const easing    = 1 - Math.pow(1 - progresso, 3);
    el.textContent  = Math.round(valorAtual + (valorFinal - valorAtual) * easing);
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

// ════════════════════════════════════════════════════════
//  AUXILIARES DE UI
// ════════════════════════════════════════════════════════
function mostrarCarregando(visivel) {
  const el = document.getElementById("carregando");
  el.classList.toggle("oculto", !visivel);
}

function mostrarMensagem(idElemento, texto) {
  const el = document.getElementById(idElemento);
  el.textContent = texto;
  el.classList.remove("oculto");
}

function limparMensagem(idElemento) {
  const el = document.getElementById(idElemento);
  el.textContent = "";
  el.classList.add("oculto");
}

function definirCarregandoBtn(idBtn, carregando) {
  const btn     = document.getElementById(idBtn);
  const texto   = btn.querySelector(".btn-texto");
  const spinner = btn.querySelector(".btn-spinner");
  btn.disabled  = carregando;
  texto.classList.toggle("oculto",    carregando);
  spinner.classList.toggle("oculto", !carregando);
}

function escaparHtml(str) {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

// ══ Ponto de entrada ────────────────────────────────────
inicializar();
