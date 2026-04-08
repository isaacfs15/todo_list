const router             = require('express').Router();
const autenticar         = require('../middleware/middlewareAutenticacao');
const controladorTarefas = require('../controllers/controladorTarefas');

router.use(autenticar);

router.get('/',               controladorTarefas.listarTarefas);
router.post('/',              controladorTarefas.criarTarefa);
router.put('/:id',            controladorTarefas.atualizarTarefa);
router.patch('/:id/alternar', controladorTarefas.alternarTarefa);
router.delete('/:id',         controladorTarefas.excluirTarefa);

module.exports = router;