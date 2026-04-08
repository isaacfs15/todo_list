const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer '))
    return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const payload = jwt.verify(cabecalho.split(' ')[1], process.env.JWT_SECRET);
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};