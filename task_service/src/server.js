require('dotenv').config();

const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuarioRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tarefas', tarefaRoutes);

app.get('/', (req, res) => {
    res.json({ mensagem: 'API de Tarefas rodando com sucesso! '});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serviço de Tarefas rodando na porta ${PORT}`);
});