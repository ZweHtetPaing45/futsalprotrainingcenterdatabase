const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./src/middlewares/ErrorHandling');
const Authrouter = require('./src/api/createuserapi');
const app = express();


app.use(cors({
    origin: '*',
}));

app.use(express.json());
app.use(errorHandler);
app.use('/uploads', express.static('uploads'));
app.use('/api',Authrouter);

module.exports = app;