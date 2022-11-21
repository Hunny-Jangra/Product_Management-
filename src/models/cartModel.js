const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId, 
        ref:  'userModel', 
        required: true
    },
  items: [{
    productId: {
        type: ObjectId, 
        ref : 'productModel', 
        required: true
    },
    quantity: {
        type: Number, 
        required: true, 
        min : 1
    }
  }],
  totalPrice: {
    type: Number, 
    // comment: "Holds total price of all the items in the cart"
    },
  totalItems: {
    type: Number, 
    // comment: "Holds total number of items in the cart"
    },
  
}, {timestamps: true});

const CartModel = mongoose.model('CartModel', cartSchema);

module.exports = CartModel;