const express = require('express');
const router = express.Router();
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
        .from('produto')
        .then(produtos => res.status(200).json(produtos))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
});

router.get('/:id', checkToken, (req, res) => {

    knex.select('*')
        .from('produto')
        .where({ id: req.params.id })
        .then(produto => res.status(200).json(produto))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
});

router.post('/', checkToken, isAdmin, (req, res) => {

    if (req.body) {

        const body = req.body;

        knex('produto')
            .insert({
                descricao: body.descricao,
                valor: body.valor,
                marca: body.marca
            }, ['id'])
            .then(result => {
                let produto = result[0];
                res.status(201).json({ "id": produto.id });
                return;
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao registrar produto - ' + err.message
                })
            })
    }
});

router.put('/:id', checkToken, isAdmin, (req, res) => {

    if (req.body) {
        const id = parseInt(req.params.id);
        const body = req.body;

        knex('produto')
            .where({ id })
            .update({
                descricao: body.descricao,
                valor: body.valor,
                marca: body.marca
            })
            .then(result => {
                res.status(201).json("Atualizado com sucesso");
            });
    }
});

router.delete('/:id', checkToken, isAdmin, (req, res) => {

    const id = parseInt(req.params.id);

    knex('produto')
        .delete()
        .where({ id })
        .then(result => {
            res.status(200).json("Excluido com sucesso");
        });
});


module.exports = app => app.use('/products', router);