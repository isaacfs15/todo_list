"""
app/main.py --- analyzer-service

Ponto de entrada da aplicação FastAPI.

Responsabilidades:
    1. Configurar o middleware de CORS.
    2. Registrar as rotas da API.
    3. Expor a documentação automática (Swagger + ReDoc).

Inicialização:
    uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

Documentação:
    http://localhost:8001/docs  → Swagger UI
    http://localhost:8001/redoc → ReDoc
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.bancoDados import obter_bd
from app.esquemas import RespostaEstatisticas
from app import crud

load_dotenv()

app = FastAPI(
    title="Analyzer Service — atividade_todo_list",
    version="1.0.0",
    description="Retorna estatísticas de tarefas por usuário",
)

# ── CORS ────────────────────────────────────────────────────────────
# Em produção, substitua "*" pelo domínio real do frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas ────────────────────────────────────────────────────────────

@app.get("/api/health", summary="Health check do serviço")
def verificar_saude():
    """Confirma que o analyzer-service está no ar. Sem autenticação."""
    return {"servico": "analyzer-service", "status": "online", "porta": 8001}


@app.get(
    "/api/estatisticas/{usuario_id}",
    response_model=RespostaEstatisticas,
    summary="Estatísticas de tarefas de um usuário",
    responses={404: {"description": "Usuário não encontrado"}},
)
def obter_estatisticas(usuario_id: int, bd: Session = Depends(obter_bd)):
    """
    Retorna o total de tarefas, quantas foram concluídas e quantas
    estão pendentes para o usuário informado na URL.

    - **usuario_id**: ID inteiro do usuário (deve existir na tabela "usuarios").
    """
    usuario = crud.buscar_usuario(bd, usuario_id)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    estatisticas = crud.buscar_estatisticas_tarefas(bd, usuario_id)

    return RespostaEstatisticas(
        usuarioId=usuario.id,
        nomeUsuario=usuario.nome,
        estatisticas=estatisticas,
    )
