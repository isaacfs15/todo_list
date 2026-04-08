"""
app/modelos.py --- analyzer-service

Modelos SQLAlchemy que espelham as tabelas criadas pela migration
do task-service (Prisma). Este serviço é SOMENTE LEITURA.

ATENÇÃO: os __tablename__ abaixo DEVEM ser idênticos ao @map
definido em task-service/prisma/schema.prisma:
    model Usuario { @@map("usuarios") }
    model Tarefa  { @@map("tarefas")  }

Mapeamento de colunas (snake_case MySQL):
    Usuario : id, nome, email, senha, criado_em
    Tarefa  : id, titulo, concluida, usuario_id, criado_em, atualizado_em
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.bancoDados import Base


class Usuario(Base):
    """Espelha a tabela 'usuarios' do MySQL (criada pelo Prisma)."""

    __tablename__ = "usuarios"

    id        = Column(Integer, primary_key=True, index=True)
    nome      = Column(String(255), nullable=False)
    email     = Column(String(255), unique=True, nullable=False)
    senha     = Column(String(255), nullable=False)
    criado_em = Column(DateTime, server_default=func.now())


class Tarefa(Base):
    """Espelha a tabela 'tarefas' do MySQL (criada pelo Prisma)."""

    __tablename__ = "tarefas"

    id           = Column(Integer, primary_key=True, index=True)
    titulo       = Column(String(255), nullable=False)
    concluida    = Column(Boolean, default=False)
    usuario_id   = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em    = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
