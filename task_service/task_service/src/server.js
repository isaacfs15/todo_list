const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const rotasAutenticacao = require('./routes/rotasAutenticacao');
const rotasTarefas      = require('./routes/rotasTarefas');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',    rotasAutenticacao);
app.use('/api/tarefas', rotasTarefas);

app.get('/api/health', (_req, res) => {
  res.json({ servico: 'task-service', status: 'online', porta: process.env.PORT });
});

const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () =>
  console.log(`[task-service] Rodando em http://localhost:${PORTA}`)
);