const prisma = require('../prisma');

const TarefaController = {
    // 🔹 Criar Tarefa
    async criar(req, res) {
        try {
            const { titulo } = req.body;
            // Pegamos o usuarioId direto do Middleware! (Garante que a tarefa é dele)
            const usuarioId = req.usuarioId;

            if (!titulo) {
                return res.status(400).json({ erro: 'O título da tarefa é obrigatório.' });
            }

            const novaTarefa = await prisma.tarefa.create({
                data: {
                    titulo,
                    usuarioId // Relacionando a tarefa com o usuário logado
                }
            });

            res.status(201).json(novaTarefa);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao criar a tarefa.' });
        }
    },

    // 🔹 Listar apenas tarefas do usuário logado
    async listar(req, res) {
        try {
            const usuarioId = req.usuarioId;

            // Busca no banco SOMENTE onde o usuarioId for igual ao do token
            const tarefas = await prisma.tarefa.findMany({
                where: { usuarioId }
            });

            res.json(tarefas);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao listar as tarefas.' });
        }
    },

    // 🔹 Marcar como concluída (ou alterar)
    async alterarStatus(req, res) {
        try {
            // Pega o ID da tarefa pela URL (ex: /tarefas/5) e converte para número
            const tarefaId = parseInt(req.params.id); 
            const usuarioId = req.usuarioId;
            const { concluida } = req.body;

            // Segurança Extra: Verificar se a tarefa existe E se pertence a este usuário
            const tarefaExiste = await prisma.tarefa.findFirst({
                where: { id: tarefaId, usuarioId: usuarioId }
            });

            if (!tarefaExiste) {
                return res.status(404).json({ erro: 'Tarefa não encontrada ou não pertence a você.' });
            }

            // Atualiza o status
            const tarefaAtualizada = await prisma.tarefa.update({
                where: { id: tarefaId },
                data: { concluida }
            });

            res.json(tarefaAtualizada);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao atualizar a tarefa.' });
        }
    }
};

module.exports = TarefaController;