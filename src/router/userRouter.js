const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();

router
    .route('/register')
    .post(userController.createUserdata);

router
    .route('/login')
    .post(userController.userLogin);

router
    .route('/user/:userId/profile')
    .get(userController.protect, userController.getuserData)
    .put(userController.protect, userController.updateUserData);

module.exports = router;