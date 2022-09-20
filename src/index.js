require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Aplicação rodando. <br/><br/>

    Rota de produtos: /products<br/><br/>
    Modelo - Produto <br/><br/>
    {
        "id": int,
        "marca": string,
        "descricao": string,
        "valor": numeric,
    }
    
    <br/><br/><br/><br/>
    
    Rota de games: /games<br/><br/>
    Modelo - Game <br/><br/>
    {
        "id": int,
        "nome": string,
        "descricao": string,
        "valor": numeric,
        "data_lancamento": date
    }

    `
    
    );
});

require('./controllers/productController')(app);
require('./controllers/gameController')(app);
require('./controllers/userController')(app);

app.listen(port);