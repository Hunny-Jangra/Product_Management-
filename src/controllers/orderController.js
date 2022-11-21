const OrderModel = require('../models/orderModel');
const AppError = require('../AppError/appError');
const CartModel = require('../models/cartModel');
const userModel = require('../models/userModel');

exports.createOrder = async(req, res, next) => {
    try{
        const data1 = req.body;
        const userParams = req.params.userId;
        const find_userIdInDB = await userModel.findById({_id: userParams});
        if(!find_userIdInDB) {
            return next(new AppError(`with this Id User is not Exist`, 400));
        }
        let {cartId} = data1;
        if(!cartId){
            return next(new AppError(`cartId is must to be present in req.body ! Please provide cartId`, 400));
        }


        const find_cartDetails = await CartModel.findById({_id : cartId});
        console.log(find_cartDetails);
        console.log('//// cartId found');
        let Arr = [];
        Arr = find_cartDetails.items;
        let sum =0 ;
        console.log(find_cartDetails.items[0].quantity);
        for(let i=0; i<Arr.length; i++) {

            sum = sum+ find_cartDetails.items[i].quantity;

        }
        console.log(sum);

        const orders = {};
        orders.userId = find_cartDetails.userId;
        orders.items = find_cartDetails.items;
        orders.totalPrice = find_cartDetails.totalPrice;
        orders.totalItems = find_cartDetails.totalItems;
        orders.totalQuantity = sum;

        const createOrdersData = await OrderModel.create(orders);
        return res.status(200).send({
            status: true,
            message: "Success",
            data: createOrdersData
        })

    }catch(error) {
        if(error.name == 'CastError') {
            if(error.valueType == 'Object'){
                const message = `Invalid userId ${error.path} : ${error.value._id.userId} ! Please provide a valid userId`;
                return next(new AppError(message, 400));
            }
            if(error.valueType == 'string'){
                const message = `Invalid cartId ${error.path} : ${error.value} ! Please provide a valid cartId`;
                return next(new AppError(message, 400));
            }
            
        }
        
        return res.status(500).send({
            status: false,
            error
        })
    }
}

exports.updateOrderData = async(req ,res, next) => {
    try{
        const data1 = req.body;
        let {orderId, status} = data1;
        const paramsUserID = req.params.userId;
        const find_userId = await userModel.findById({_id : paramsUserID});
        if(!find_userId) {
            return next(new AppError(`with this Id user is not found`, 404));
        }
        if(!orderId) {
            return next(new AppError(`OrderId is not present ! Please provide an orderId`, 400));
        } 
        if(!status) {
            return next(new AppError(`status is not present ! Please provide satus for oredrModel`, 400));
        }
        const getOrder_doc = await OrderModel.findById({_id : orderId});
        console.log(getOrder_doc.cancellable == true);
        if(getOrder_doc.cancellable == true) {
            getOrder_doc.status = status;
        }else{
            return next(new AppError(`Sorry ! Order of this Product cannot be Canceled`, 400));
        }
        const updateOrder_ProductData = await OrderModel.findByIdAndUpdate({_id: orderId}, {$set: {status: getOrder_doc.status}}, {new : true});
        return res.status(200).send({
            status: true,
            message : "Success" ,
            data: updateOrder_ProductData
        })
    }catch(error) {
        if(error.name == 'CastError') {
            if(error.valueType == 'string'){
                const message = `Invalid cartId ${error.path} : ${error.value} ! Please provide a valid cartId`;
                return next(new AppError(message, 400));
            }
            if(error.valueType == 'Object'){
                const message = `Invalid userId ${error.path} : ${error.value._id} ! Please provide a valid userId`;
                return next(new AppError(message, 400));
            }
            
        }
        
        return res.status(500).send({
            status: false,
            error
        })
    }
}