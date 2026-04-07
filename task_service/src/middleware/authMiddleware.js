const jwt = require ('jsonwebtoken');
 function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ erro: 'Acesso negadoToken não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token mal formatado.' });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);

        req.usuarioId = decodificado.usuarioId;
        next();
    } catch (erro){
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
 }
 module.exports = verificarToken;