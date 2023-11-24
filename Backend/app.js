const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const product = require('./routes/product');
const user = require('./routes/user');

const errorMiddleware = require('./middleware/error');

app.use(express.json());
app.use(cookieParser());

// routes
app.use('/', product);
app.use('/', user);

// middlerware
app.use(errorMiddleware);

module.exports = app;
