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

router.post('/', (req, res) => {

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

    module.exports = app => app.use('/users', router);