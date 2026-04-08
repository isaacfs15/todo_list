"""
app/crud.py --- analyzer-service

Funções de consulta ao banco via SQLAlchemy ORM.

Toda a lógica de acesso a dados fica centralizada aqui,
mantendo o main.py focado em rotas e injeção de dependências.

SOMENTE LEITURA: apenas db.query(). Nunca db.add() ou db.commit().
"""

from sqlalchemy.orm import Session
from app.modelos import Usuario, Tarefa


def buscar_usuario(bd: Session, usuario_id: int):
    """
    Busca um usuário pelo ID.

    Args:
        bd         : sessão ativa do SQLAlchemy.
        usuario_id : ID do usuário a ser consultado.

    Returns:
        Instância de Usuario ou None se não encontrado.
    """
    return bd.query(Usuario).filter(Usuario.id == usuario_id).first()


def buscar_estatisticas_tarefas(bd: Session, usuario_id: int) -> dict:
    """
    Calcula total, concluídas e pendentes das tarefas de um usuário.

    Usa apenas ORM — sem SQL puro — para garantir compatibilidade
    com diferentes dialetos de banco de dados.

    Args:
        bd         : sessão ativa do SQLAlchemy.
        usuario_id : ID do usuário cujas tarefas serão contadas.

    Returns:
        dict com as chaves: total, concluidas, pendentes.
    """
    consulta_base = bd.query(Tarefa).filter(Tarefa.usuario_id == usuario_id)

    total     = consulta_base.count()
    concluidas = consulta_base.filter(Tarefa.concluida == True).count()
    pendentes = total - concluidas

    return {
        "total":     total,
        "concluidas": concluidas,
        "pendentes": pendentes,
    }
