const express = require('express');
const router = express.Router();

const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

router.get('/', (req, res) => {

    knex.select('*')
        .from('game')
        .then(games => res.status(200).json(games))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar os games - ' + err.message
            })
        })
});

router.get('/:id', (req, res) => {

    knex.select('*')
        .from('game')
        .where({ id: req.params.id })
        .then(game => res.status(200).json(game))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar o game - ' + err.message
            })
        })
});

router.post('/', (req, res) => {

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

router.put('/:id', (req, res) => {

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

router.delete('/:id', (req, res) => {

    const id = parseInt(req.params.id);

    knex('game')
        .delete()
        .where({ id })
        .then(result => {
            res.status(200).json("Excluido com sucesso");
        });
});


module.exports = app => app.use('/games', router);