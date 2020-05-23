const express = require('express');
require('../db/mongoose');
const articlesRouter = require('./router/articles');
const usersRouter = require('./router/users');

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    next();
});
app.use(express.json());

app.use(articlesRouter);
app.use(usersRouter);


app.listen(process.env.PORT, () => console.log('We are on ' + process.env.PORT + ' port, db ' + process.env.MONGODB_URL));