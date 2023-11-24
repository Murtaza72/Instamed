const express = require('express');
const app = express();

const product = require('./routes/product');

const errorMiddleware = require('./middlerware/error');
app.use(express.json());

// routes
app.use('/', product);

// middlerware
app.use(errorMiddleware);

module.exports = app;
