from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base

class Usuario(Base):
    __tablename__ = 'usuarios'

    id    = Column(Integer, primary_key=True, index=True)
    nome  = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)

class Tarefa(Base):
    __tablename__ = 'tarefas'

    id        = Column(Integer, primary_key=True, index=True)
    titulo    = Column(String(255), nullable=False)
    concluida = Column(Boolean, default=False)
    usuarioId = Column(Integer, ForeignKey('usuarios.id'), nullable=False)