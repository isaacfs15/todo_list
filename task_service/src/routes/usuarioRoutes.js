const express = require ('express');;
const router = express.Router();
const UsuarioController = require('../controller/UsuarioController');

router.post('/cadastro', UsuarioController.cadastrar);
router.post('/login', UsuarioController.login);

module.exports = router;