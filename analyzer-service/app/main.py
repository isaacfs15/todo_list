from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.database import get_db
from app.schemas  import StatsResponse
from app          import crud

load_dotenv()

app = FastAPI(
    title='Analyzer Service — atividade_todo_list',
    version='1.0.0',
    description='Retorna estatísticas de tarefas por usuário'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/api/health')
def health_check():
    return { 'service': 'analyzer-service', 'status': 'online', 'port': 8001 }

@app.get(
    '/api/stats/{usuario_id}',
    response_model=StatsResponse,
    summary='Estatísticas de tarefas de um usuário',
    responses={404: {'description': 'Usuário não encontrado'}}
)
def get_stats(usuario_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')

    stats = crud.get_task_stats(db, usuario_id)

    # Traduz os campos do banco (user.id, user.nome) para o inglês que o Front pede (userId, userName)
    return StatsResponse(
        userId   = user.id,
        userName = user.nome,
        stats    = stats
    )