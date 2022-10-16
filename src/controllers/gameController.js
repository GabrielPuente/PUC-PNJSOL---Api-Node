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
        return;
    }

    let token = headerAuth.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ message: 'Acesso negado' })
            return;
        }
        req.roles = decodeToken.roles;
        next();
    });
}

const isAdmin = (req, res, next) => {
    var roles = req.roles.split(';');
    var role = roles.find(role => role == 'ADMIN');

    if (!role) {
        res.status(401).json({ message: 'Acesso negado' });
        return;
    }
    next();
}

const validate = (req, res, next) => {
    const body = req.body;
    var messageError = [];
    var error = false;
    if (!body.nome) {
        error = true;
        messageError.push("Nome não preenchido");
    }
    if (!body.descricao) {
        error = true;
        messageError.push("Descricao não preenchido");
    }
    if (!body.valor || body.valor <= 0) {
        error = true;
        messageError.push("Valor não preenchido ou igual ou menor que zero");
    }
    if (!body.data_lancamento) {
        error = true;
        messageError.push("Data de lançamento não preenchida");
    }
    if (error) {
        res.status(404).json({ message: messageError.join(", ") });
        return;
    }

    next();
}

router.get('/', checkToken, (req, res) => {

    knex.select('*')
        .from('game')
        .then(games => res.status(200).json(games))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar os games - ' + err.message
            })
        })
});

router.get('/:id', checkToken, (req, res) => {

    knex.select('*')
        .from('game')
        .where({ id: req.params.id })
        .first()
        .then(game => res.status(200).json(game))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar o game - ' + err.message
            })
        })
});

router.post('/', checkToken, isAdmin, validate, (req, res) => {

    if (req.body) {

        const body = req.body;

        knex('game')
            .insert({
                nome: body.nome,
                descricao: body.descricao,
                valor: body.valor,
                data_lancamento: body.data_lancamento
            }, ['id'])
            .then(result => {
                let game = result[0];
                res.status(201).json({ "id": game.id });
                return;
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao registrar o game - ' + err.message
                })
            })
    }
});

router.put('/:id', checkToken, isAdmin, validate, (req, res) => {

    if (req.body) {
        const id = parseInt(req.params.id);
        const body = req.body;

        knex('game')
            .where({ id })
            .update({
                nome: body.nome,
                descricao: body.descricao,
                valor: body.valor,
                data_lancamento: body.data_lancamento
            })
            .then(result => {
                res.status(201).json("Atualizado com sucesso");
            });
    }
});

router.delete('/:id', checkToken, isAdmin, (req, res) => {

    const id = parseInt(req.params.id);

    knex('game')
        .delete()
        .where({ id })
        .then(result => {
            res.status(200).json("Excluido com sucesso");
        });
});


module.exports = app => app.use('/games', router);