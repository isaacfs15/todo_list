const prisma = require('../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UsuarioController = {

    async cadastrar(req, res) {
        try {
            const { nome, email, senha } = req.body;

            const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });
            if (usuarioExiste) {
                return res.status(400).json({ erro: 'Este email já estáem uso.'});
            }

            const senhaHash = await bcrypt.hash(senha,10);

            const novoUsuario = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senhaHash
                }
            });

            res.status(201).json({
                mensagem: 'Usuário criado com sucesso!',
                usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
            });
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar. '})
        }
    },

    async login (req, res) {
        try {
            const { email, senha } = req.body;

            const usuario = await prisma.usuario.findUnique ({ where: { email } });
            if (!usuario) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos. ' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if(!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos. '});
            }

            const token = jwt.sign(
                { usuarioId: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: '8h'}
            );

            res.json({
                mensagem: 'Login realizado com sucesso!',
                token,
                usuario: { id: usuario.id, nome: usuario.nome }
            });
        } catch (erro){
            console.error(erro);
            res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
        }
    }   
};

module.exports = UsuarioController;