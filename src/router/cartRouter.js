const CartController = require('../controllers/cartController');
const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();

router
    .route('/users/:userId/cart')
    .post(userController.protect, CartController.createCart)
    .put(userController.protect, CartController.updateCartData)
    .get(userController.protect, CartController.get_cart_Details)
    .delete(userController.protect, CartController.delete_Cart_ItemsArr);

module.exports = router;