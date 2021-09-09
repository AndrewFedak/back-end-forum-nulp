const express = require('express');
require('../db/mongoose');
const articlesRouter = require('./router/articles');
const usersRouter = require('./router/users');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors());
app.use(articlesRouter);
app.use(usersRouter);

app.get('/', async (req, res) => {
    res.status(200).send('Andrew Fedak')
});

app.listen(process.env.PORT, () => console.log('We are on ' + process.env.PORT + ' port, db ' + process.env.MONGODB_URL));
