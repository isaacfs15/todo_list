"""
app/bancoDados.py --- analyzer-service

Configura a conexão com o banco MySQL compartilhado via SQLAlchemy.

Exporta:
    engine       --- objeto de conexão com pool_pre_ping ativado.
    SessaoLocal  --- fábrica de sessões ORM.
    Base         --- classe base para os modelos declarativos.
    obter_bd     --- dependency de injeção de sessão para rotas FastAPI.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

URL_BANCO = os.getenv("DATABASE_URL")

engine = create_engine(
    URL_BANCO,
    echo=False,           # True → exibe SQL gerado no console (modo debug)
    pool_pre_ping=True,   # testa a conexão antes de usar (evita timeout)
)

SessaoLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe base para todos os modelos SQLAlchemy deste serviço."""
    pass


def obter_bd():
    """
    Dependency de injeção de sessão para as rotas FastAPI.
    Garante que a sessão seja fechada ao final de cada requisição,
    mesmo em caso de exceção, evitando vazamento de conexões.
    """
    bd = SessaoLocal()
    try:
        yield bd
    finally:
        bd.close()
