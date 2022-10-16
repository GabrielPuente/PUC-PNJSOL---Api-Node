require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Aplicação rodando. <br/><br/>

    Rota para login: /users/login<br/>
    Modelo - login <br/><br/>
    {
        "login": string,
        "senha": string,
    }
    <br/><br/>

    Rota de usuario: /users<br/>
    Modelo - Usuario <br/><br/>
    {
        "id": int,
        "nome": string,
        "email": string,
        "login": string,
        "senha": string,
        "role": string
    }
    <br/><br/>

    Todos os endpoints exigem login<br/>
    Gets pode ser qualquer um,<br/>
    Posts, Puts e deletes, exigem um admin logado.<br/>
    <br/>

    Post/users/login<br/>
    "user",<br/>
    "12345"<br/>
    <br/>
    "admin",<br/>
    "12345"<br/>

    <br/><br/><br/>

    Rota de produtos: /products<br/>
    Modelo - Produto <br/><br/>
    {
        "id": int,
        "marca": string,
        "descricao": string,
        "valor": numeric,
    }
    
    <br/><br/><br/>
    
    Rota de games: /games<br/>
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