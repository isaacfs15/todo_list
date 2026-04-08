"""
app/esquemas.py --- analyzer-service

Schemas Pydantic que definem o formato das respostas da API.

O FastAPI usa esses schemas para:
    1. Validar automaticamente o tipo dos campos de saída.
    2. Gerar a documentação Swagger em /docs.
"""

from pydantic import BaseModel


class EstatisticasTarefas(BaseModel):
    """Contagens agregadas das tarefas de um usuário."""

    total:     int
    concluidas: int
    pendentes: int


class RespostaEstatisticas(BaseModel):
    """Resposta completa do endpoint GET /api/estatisticas/{usuarioId}."""

    usuarioId:   int
    nomeUsuario: str
    estatisticas: EstatisticasTarefas


class RespostaErro(BaseModel):
    """Formato padrão para erros da API."""

    detalhe: str
