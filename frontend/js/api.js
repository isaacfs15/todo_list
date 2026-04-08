// ══════════════════════════════════════════════════════
//  api.js — Configuração e chamadas aos microsserviços
// ══════════════════════════════════════════════════════

const SERVICOS = {
  TAREFAS:    "http://localhost:3001/api",   // Node.js + Express
  LOGS:       "http://localhost:8000/api",   // PHP + Laravel
  ANALISADOR: "http://localhost:8001/api",   // Python + FastAPI
};

// ── Recupera o token JWT armazenado ──────────────────
function obterToken() {
  return localStorage.getItem("token_jwt");
}

// ── Headers padrão com JWT ────────────────────────────
function cabecalhosAutenticados() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${obterToken()}`,
  };
}

// ── Tratamento centralizado de erros de rede ─────────
async function tratarResposta(resposta) {
  if (resposta.ok) {
    // 204 No Content não tem corpo
    if (resposta.status === 204) return null;
    return resposta.json();
  }

  let mensagemErro = `Erro ${resposta.status}`;
  try {
    const corpo = await resposta.json();
    mensagemErro = corpo.erro || corpo.detail || corpo.message || mensagemErro;
  } catch (_) { /* sem corpo JSON */ }

  throw new Error(mensagemErro);
}

// ════════════════════════════════════════════════════════
//  AUTENTICAÇÃO  (POST /api/auth/cadastro  |  /api/auth/login)
// ════════════════════════════════════════════════════════

export async function cadastrarUsuario({ nome, email, senha }) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/auth/cadastro`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ nome, email, senha }),
  });
  return tratarResposta(resposta);
  // Retorno 201: { id, nome, email, criadoEm }
}

export async function loginUsuario({ email, senha }) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, senha }),
  });
  return tratarResposta(resposta);
  // Retorno 200: { token, usuarioId, nome }
}

// ════════════════════════════════════════════════════════
//  TAREFAS  (rotas protegidas por JWT)
// ════════════════════════════════════════════════════════

export async function listarTarefas() {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/tarefas`, {
    headers: cabecalhosAutenticados(),
  });
  return tratarResposta(resposta);
  // Retorno: Tarefa[] ordenadas por criadoEm desc
}

export async function criarTarefa({ titulo }) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/tarefas`, {
    method:  "POST",
    headers: cabecalhosAutenticados(),
    body:    JSON.stringify({ titulo }),
  });
  return tratarResposta(resposta);
  // Retorno 201: { id, titulo, concluida, usuarioId, criadoEm, atualizadoEm }
}

export async function alternarTarefa(id) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/tarefas/${id}/alternar`, {
    method:  "PATCH",
    headers: cabecalhosAutenticados(),
  });
  return tratarResposta(resposta);
  // Retorno: Tarefa com concluida invertido
}

export async function atualizarTarefa(id, { titulo }) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/tarefas/${id}`, {
    method:  "PUT",
    headers: cabecalhosAutenticados(),
    body:    JSON.stringify({ titulo }),
  });
  return tratarResposta(resposta);
}

export async function excluirTarefa(id) {
  const resposta = await fetch(`${SERVICOS.TAREFAS}/tarefas/${id}`, {
    method:  "DELETE",
    headers: cabecalhosAutenticados(),
  });
  return tratarResposta(resposta);
  // Retorno: 204 No Content
}

// ════════════════════════════════════════════════════════
//  ANALISADOR  (GET /api/estatisticas/{usuarioId})
// ════════════════════════════════════════════════════════

export async function buscarEstatisticas(usuarioId) {
  const resposta = await fetch(`${SERVICOS.ANALISADOR}/estatisticas/${usuarioId}`, {
    headers: { "Content-Type": "application/json" },
  });
  return tratarResposta(resposta);
  // Retorno: { usuarioId, nomeUsuario, estatisticas: { total, concluidas, pendentes } }
}
