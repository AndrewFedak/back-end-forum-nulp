const express = require('express');
require('dotenv').config({path: "./src/express/.env"});
require('../db/mongoose');
const articlesRouter = require('./router/articles');
const usersRouter = require('./router/users');
const roomsRouter = require('./router/rooms');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(articlesRouter);
app.use(usersRouter);
app.use(roomsRouter);

app.listen(port, () => console.log('We are on ' + port + ' port, db ' + process.env.MONGODB_URL));
