const router          = require('express').Router();
const controladorAuth = require('../controllers/controladorAutenticacao');

router.post('/cadastro', controladorAuth.cadastro);
router.post('/login',    controladorAuth.login);

module.exports = router;