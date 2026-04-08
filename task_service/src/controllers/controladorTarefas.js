const { PrismaClient } = require('@prisma/client');
const servicoLog = require('../services/servicoLog');

const prisma = new PrismaClient();

exports.listarTarefas = async (req, res) => {
  const tarefas = await prisma.tarefa.findMany({
    where:   { usuarioId: req.usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  res.json(tarefas);
};

exports.criarTarefa = async (req, res) => {
  try {
    const { titulo } = req.body;

    if (!titulo)
      return res.status(400).json({ erro: 'titulo é obrigatório' });

    const tarefa = await prisma.tarefa.create({
      data: { titulo, usuarioId: req.usuarioId },
    });

    await servicoLog.enviar('CRIACAO', req.usuarioId, tarefa.id, `Tarefa criada: ${titulo}`);

    res.status(201).json(tarefa);
  } catch (e) {
    await servicoLog.enviar('ERRO', req.usuarioId, null, `Erro ao criar tarefa: ${e.message}`);
    res.status(500).json({ erro: e.message });
  }
};

exports.alternarTarefa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tarefa = await prisma.tarefa.findUnique({ where: { id } });

    if (!tarefa)
      return res.status(404).json({ erro: 'Tarefa não encontrada' });

    if (tarefa.usuarioId !== req.usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id },
      data:  { concluida: !tarefa.concluida },
    });

    const tipoLog = tarefaAtualizada.concluida ? 'CONCLUSAO' : 'REABERTURA';
    await servicoLog.enviar(tipoLog, req.usuarioId, id,
      `Tarefa ${tarefaAtualizada.concluida ? 'concluída' : 'reaberta'}: ${tarefa.titulo}`);

    res.json(tarefaAtualizada);
  } catch (e) {
    await servicoLog.enviar('ERRO', req.usuarioId, null, e.message);
    res.status(500).json({ erro: e.message });
  }
};

exports.atualizarTarefa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tarefa = await prisma.tarefa.findUnique({ where: { id } });

    if (!tarefa)
      return res.status(404).json({ erro: 'Tarefa não encontrada' });

    if (tarefa.usuarioId !== req.usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id },
      data:  { titulo: req.body.titulo ?? tarefa.titulo },
    });

    res.json(tarefaAtualizada);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.excluirTarefa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tarefa = await prisma.tarefa.findUnique({ where: { id } });

    if (!tarefa)
      return res.status(404).json({ erro: 'Tarefa não encontrada' });

    if (tarefa.usuarioId !== req.usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    await prisma.tarefa.delete({ where: { id } });

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};