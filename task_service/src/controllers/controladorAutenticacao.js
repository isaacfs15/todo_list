const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.cadastro = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'nome, email e senha são obrigatórios' });

    const senhaHasheada = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data:   { nome, email, senha: senhaHasheada },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    res.status(201).json(usuario);
  } catch (e) {
    if (e.code === 'P2002')
      return res.status(409).json({ erro: 'E-mail já cadastrado' });

    res.status(500).json({ erro: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha)
      return res.status(400).json({ erro: 'email e senha são obrigatórios' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { usuarioId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuarioId: usuario.id, nome: usuario.nome });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};