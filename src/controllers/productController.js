const express = require('express');
const router = express.Router();

const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = lowdb(adapter)


router.get('/', (req, res) => {

    const product = db
        .get('products')
        .value()

    return res.json(product);
});

router.get('/:id', (req, res) => {

    const product = db
        .get('products')
        .find({ id: parseInt(req.params.id) })
        .value()

    return res.json(product);
});

router.post('/', (req, res) => {

    const body = req.body;

    db
        .get('products')
        .push({
            id: Math.floor(Math.random() * 9999),
            description: body.description,
            value: body.value,
            brand: body.brand
        })
        .write()

    return res.json('ok');
});

router.put('/:id', (req, res) => {

    const body = req.body;

    db
        .get('products')
        .find({ id: parseInt(req.params.id) })
        .assign({ description: body.description }, { value: body.value, }, { brand: body.brand, },)
        .value()

    db.write();

    return res.json('ok');
});

router.delete('/:id', (req, res) => {

    console.log(parseInt(req.params.id));

    db
        .get('products')
        .remove({ id: parseInt(req.params.id) })
        .write();

    return res.json('ok');
});


module.exports = app => app.use('/products', router);