from sqlalchemy.orm import Session
from app.models import Usuario, Tarefa

def get_user(db: Session, user_id: int):
    return db.query(Usuario).filter(Usuario.id == user_id).first()

def get_task_stats(db: Session, user_id: int) -> dict:
    base_query = db.query(Tarefa).filter(Tarefa.usuarioId == user_id)

    total     = base_query.count()
    completed = base_query.filter(Tarefa.concluida == True).count()
    pending   = total - completed

    return { 'total': total, 'completed': completed, 'pending': pending }