const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const mongoSanitization = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const AppError = require('../src/AppError/appError');
const globleErrorcontroller = require('../src/controllers/errorController');
const userRouter = require('./router/userRouter');
const productRouter = require('./router/productRouter');
const cartRouter = require('./router/cartRouter');
const orderRouter = require('./router/orderRouter');


const app = express();
// set security HTTP headers
app.use(helmet());
app.use(express.json());

dotenv.config({
    path: './config.env'
})
// Rate Limiter
const limiter = rateLimit({
    max: 4,
    windowsMs: 60 * 60 * 1000,
    message:  'Too many request from this IP ! Please try in an another minute'
})

app.use('/user/:userId/profile', limiter);

//  Data Sanitization 

// Data Sanitization against NOSQL Query Injection
app.use(mongoSanitization());
// Data Sanitization against XSS attacks 
app.use(xss());

app.use('/', userRouter);
app.use('/', productRouter);
app.use('/', cartRouter);
app.use('/', orderRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} to this server`, 404));
})
app.use(globleErrorcontroller);
module.exports = app;