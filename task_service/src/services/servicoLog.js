const axios = require('axios');

exports.enviar = async (acao, usuarioId, tarefaId, descricao) => {
  try {
    await axios.post(`${process.env.LOG_SERVICE_URL}/logs`, {
      acao,
      usuarioId,
      tarefaId,
      descricao,
    });
  } catch (err) {
    console.warn(`[servicoLog] Falha ao registrar log: ${err.message}`);
  }
};