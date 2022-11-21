const productController = require('../controllers/productController');
const express = require('express');
const router = express.Router();

router
    .route('/products')
    .post(productController.createProductDoc)
    .get(productController.getProducts_using_Filters);

router
    .route('/products/:productId')
    .get(productController.getProductsById)
    .put(productController.upadteAtleaseOne)
    .delete(productController.deleteProdData);

module.exports = router;