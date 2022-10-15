const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

const checkToken = (req, res, next) => {
    let headerAuth = req.get('authorization');

    if (!headerAuth) {
        res.status(403).json({ message: "Token invalido" });
    }

    let token = headerAuth.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ message: 'Acesso negado' })
            return
        }
        req.roles = decodeToken.roles;
        next();
    });
}

const isAdmin = (req, res, next) => {
    var roles = req.roles.split(';');
    var role = roles.find(role => role == 'ADMIN');

    if (!role) {
        res.status(401).json({ message: 'Acesso negado' })
    }
    next();
}

router.get('/', checkToken, (req, res) => {

    knex.select('*')
        .from('usuario')
        .then(users => res.status(200).json(users))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar os usuarios - ' + err.message
            })
        })
});

router.get('/:id', checkToken, (req, res) => {

    knex.select('*')
        .from('usuario')
        .where({ id: req.params.id })
        .then(user => res.status(200).json(user))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar o usuario - ' + err.message
            })
        })
});

router.post('/login',  (req, res) => {

    if (req.body) {

        knex
            .select('*').from('usuario').where({ login: req.body.login })
            .then(usuarios => {

                if (usuarios.length) {
                    let usuario = usuarios[0]
                    let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha);

                    if (checkSenha) {
                        var tokenJWT = jwt.sign({ id: usuario.id, roles: usuario.roles },
                            process.env.SECRET_KEY, {
                            expiresIn: 3600
                        })

                        res.status(200).json({
                            id: usuario.id,
                            login: usuario.login,
                            nome: usuario.nome,
                            roles: usuario.roles,
                            token: tokenJWT
                        })
                        return
                    }
                    else {
                        res.status(400).json({ message: 'Login ou senha incorretos' })
                    }
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao verificar login - ' + err.message
                })
            })
    }
});

router.post('/', checkToken, isAdmin, (req, res) => {

    if (req.body) {

        const body = req.body;

        knex('usuario')
            .insert({
                nome: body.nome,
                email: body.email,
                login: body.login,
                senha: bcrypt.hashSync(body.senha, 8),
                roles: body.roles
            }, ['id'])
            .then(result => {
                let user = result[0];
                res.status(201).json({ "id": user.id });
                return;
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao registrar o usuario - ' + err.message
                })
            })
    }
});

router.put('/:id', checkToken, isAdmin, (req, res) => {

    if (req.body) {
        const id = parseInt(req.params.id);
        const body = req.body;

        knex('usuario')
            .where({ id })
            .update({
                nome: body.nome,
                email: body.email,
                login: body.login,
                senha: bcrypt.hashSync(body.senha, 8),
                roles: body.roles
            })
            .then(result => {
                res.status(201).json("Atualizado com sucesso");
            });
    }
});

router.delete('/:id', checkToken, isAdmin, (req, res) => {

    const id = parseInt(req.params.id);

    knex('usuario')
        .delete()
        .where({ id })
        .then(result => {
            res.status(200).json("Excluido com sucesso");
        });
});


module.exports = app => app.use('/users', router);