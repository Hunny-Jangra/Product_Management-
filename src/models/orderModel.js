const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId, 
        ref :  'userModel',
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
        required: true, 
        // comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
        type: Number, 
        required: true, 
        // comment: "Holds total number of items in the cart"
    },
    totalQuantity: {
        type: Number, 
        required : true, 
        // comment: "Holds total number of quantity in the cart"
    },
    cancellable: {
        type: Boolean, 
        default: true
    },
    status: {
        type: String, 
        enum : ["pending", "completed", "cancled"],
        default: 'pending', 
    },
    deletedAt: {
        type: Date, 
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    },
    
}, {timestamps: true});

const OrderModel = mongoose.model('OrderModel', orderSchema);

module.exports = OrderModel;