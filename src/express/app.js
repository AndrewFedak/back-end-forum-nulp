const express = require('express');
require('../db/mongoose');
const articlesRouter = require('./router/articles');
const usersRouter = require('./router/users');
const cors = require('cors');
const app = express();
const path = require('path');


app.use(express.static(path.join(__dirname, '../../../build')));
app.use(express.json());
app.use(cors());
app.use(articlesRouter);
app.use(usersRouter);


app.listen(process.env.PORT, () => console.log('We are on ' + process.env.PORT + ' port, db ' + process.env.MONGODB_URL));