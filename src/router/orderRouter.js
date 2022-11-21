const orderController = require('../controllers/orderController');
const express = require('express');
const router = express.Router();

router
    .route('/users/:userId/orders')
    .post(orderController.createOrder)
    .put(orderController.updateOrderData);

module.exports = router;

