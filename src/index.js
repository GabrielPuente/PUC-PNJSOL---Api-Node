const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const port = process.env.PORT || 3000;

app.get('/', (req, res) =>{
    res.send(`Aplicação rodando. <br/><br/>

    Rotas: /products<br/><br/>
    Modelo - Product <br/>
    Campos:<br/><br/>
    id: int,<br/>
    description: string,<br/>
    value: float,<br/>
    brand: string`);
});

require('./controllers/productController')(app);

app.listen(port);