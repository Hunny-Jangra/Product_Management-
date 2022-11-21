const AppError = require('../AppError/appError');
const CartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');

exports.createCart = async(req, res, next) => {
    try{

        let data1 = req.body;
        let {userId, items} = data1;
    
        const userIDparams = req.params.userId;
        let totalPrice = {};
        const findUser_inDB = await CartModel.findOne({userId: userIDparams});
        console.log(findUser_inDB)
        console.log('//////////')
        if(!findUser_inDB) {
           

            if(!userId) {
                return next(new AppError(`userId is not present ! please provide UserId `, 400));
            }
            if(!items) {
                return next(new AppError(`items is not present ! please provide items `, 400));
            }

            if(items.length == 1) {
                totalPrice = {};
                const price = items[0].productId;
    
                const find_Product_Price = await productModel.findById({_id: price});
                if(!find_Product_Price) {
                    return next(new AppError(`ProductId is not exsit ! Please check and enter a valid ProductId`))
                }
                 let x1 = find_Product_Price.price;
                 
                 
                 totalPrice.userId = userIDparams;
                 totalPrice.items = items;
                 totalPrice.totalPrice = x1;
                 totalPrice.totalItems = items.length;
        
                
        
                const data = await CartModel.create(totalPrice);
        
        
                
                return res.status(201).send({
                    status: true,
                    message: "success",
                    data 
                })
            }else{
                res.status(400).send({
                    status: false,
                    message: "Items length is not more than one for te first time "
                })
            }
            
           
        }else{
            
            // console.log(items)
            let Arr = [];
            Arr = items;
            // Arr[Arr.length] = req.body.items[0];
            // length++;
            // items.push(req.body.items[0]);
            console.log(Arr);
            let sum =0;
            for(let i=0; i<Arr.length; i++) {
                
                const priceing = items[i].productId;
                
                const find_price = await productModel.findOne({_id: priceing});
                
                sum = sum +find_price.price;
                
            }
            console.log(sum);
          
            let totalPrice = {};
            totalPrice.userId = userIDparams;
             totalPrice.items = Arr;
             totalPrice.totalPrice = sum;
             totalPrice.totalItems = Arr.length;

             const find_userId = await CartModel.deleteOne({userId: totalPrice.userId});


             const createCartwithAdditional = await CartModel.create(totalPrice);
             console.log(createCartwithAdditional)
             return res.status(201).send({
                status: true,
                message: "success",
                data: createCartwithAdditional
             })


        }


        // const userIn_cartDB = await CartModel.findById({_id: userId});
        // if(userIn_cartDB) {
        //     console.log('/Ya coll find Userid')
        // } 

        





        // console.log(items[0].quantity);




    }catch(error) {
        if(error.name == 'CastError') {
            if(error.valueType == 'string') {

                const message = `Invalid UserID ${error.path}: ${error.value} ! Please provide a valid userId`;
                return next(new AppError(message, 400));
            }
            if(error.valueType == 'Object'){
                const message = `Invalid UserID ${error.path}: ${error.value._id} ! Please provide a valid userId`;
                return next(new AppError(message, 400));
            }
        }
        // if(error.code == 11000) {
        //     const message = `With this userId Cart is already created ! Please provide another UserId`;
        //     return next(new AppError(message, 400));
        // }
        return res.status(500).send({
            status: false,
            error : error,
            name : error.name

        })
    }

}

exports.updateCartData = async(req, res, next) => {
    try{
        const data1 = req.body;
        const paramsUserID = req.params.userId;
        const find_userIdInDB = await userModel.findById({_id: paramsUserID});
        
        if(!find_userIdInDB) {
            return next(new AppError(`With this Id user is not Exist`, 404));
        }
        let productId = data1.productId;
        let cartId = data1.cartId;

        if(!cartId) {
            return next(new AppError(`cartId is not present in req.body ! Please provide a valid cartID`, 400))
        }
        if(!productId) {
            return next(new AppError(`productId is not present in rq.body ! Please provide a valid ProductId`))
        }

        const getcartDoc_inDB = await CartModel.findOne({_id: cartId});
        if(getcartDoc_inDB) {

            
            console.log(getcartDoc_inDB)
            
            for(let i=0; i < getcartDoc_inDB.items.length; i++) {
                console.log(getcartDoc_inDB.items.length);
                console.log('//////yes it is')
                if(req.body.productId == getcartDoc_inDB.items[i].productId) {
                    console.log(getcartDoc_inDB.items[i]._id)
                    let productObjId = getcartDoc_inDB.items[i]._id
                    
                    // await CartModel.deleteOne({'items._id': productObjId});
                    //    $pull: {
                    //         items: productObjId
                    //    }
                    const updateCartdata = await CartModel.findOneAndUpdate({_id: cartId}, {
                        $pull: {
                            items : getcartDoc_inDB.items[i]
                        }
                    }, {new : true});

                    console.log(i);

                    // here work 
                    let Arr = [];
                    Arr = updateCartdata.items;
                    let sum =0;
                    for(let i=0; i<Arr.length; i++) {
                        let find_product_Id = updateCartdata.items[i].productId;

                        const find_price = await productModel.findById({_id: find_product_Id})

                        sum = sum + find_price.price;
                    }


                    let totalPrice = {};
                    totalPrice.userId = req.params.userId;
                    totalPrice.items = Arr;
                    totalPrice.totalPrice = sum;
                    totalPrice.totalItems = Arr.length;

                    const final_update_Data = await CartModel.findByIdAndUpdate({_id : req.body.cartId}, {$set : {userId : totalPrice.userId, items: totalPrice.items, totalPrice: totalPrice.totalPrice, totalItems: totalPrice.totalItems}}, {new : true});


                    return res.status(200).send({
                        status: true,
                        message: "Successfully updated....",
                        data : final_update_Data
                    })
                    
                }
            }
            if(i == getcartDoc_inDB.items.length) {
                return next(new AppError(``, 400));
            }
          
        }


    }catch(error) {
        if(error.name == 'CastError') {
            if(error.valueType == 'string') {

                const message = `Invalid cartId ${error.path} : ${error.value} ! Please provide a valid CartId`;
                return next(new AppError(message, 400));
            }
            if(error.valueType == 'Object') {
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

exports.get_cart_Details = async(req, res, next) => {
    try{
        const data1 = req.params;
        const {userId} = data1;

        if(!userId) {
            return next(new AppError(`userid is not exist in body ! Please provide userId`, 400));
        }
        const find_userIdInDB = await userModel.findById({_id: userId});
        if(!find_userIdInDB){
            return next(new AppError(`userid is not exist ! Please provide userId`, 404));
        }        
        const find_cart_Details = await CartModel.findOne({userId: userId});
        if(!find_cart_Details) {
            return next(new AppError(`with This userId: ${userId} no Document Found`, 404));
        }

        return res.status(200).send({
            status: true,
            message: "Success",
            data: find_cart_Details
        })


    }catch(error) {
        if(error.name == 'CastError') {
            
            if(error.valueType == 'Object'){
                const message = `Invalid userId ${error.path} : ${error.value._id} ! Please provide a valid userId`;
                return next(new AppError(message, 404));
            } 
        }
        return next(new AppError(error.message, 500));
    }
}

exports.delete_Cart_ItemsArr = async(req, res, next) => {
    try{
        const data1 = req.params;
        const {userId} = data1;
        const find_userIdInDB = await userModel.findById({_id : userId});
        if(!find_userIdInDB) {
            return next(new AppError(`userid not exist ! Please check and provide a valid userId`, 404));
        }
        const find_cart_Document = await CartModel.findOne({userId : userId});
        
        let Arr = [];
        Arr = find_cart_Document.items;
        
        console.group(Arr)
        console.log(Arr.length)
        while(Arr.length != 0) {

            Arr.pop();
        }
        const final_detailsofCart_afer_delete = {};
        final_detailsofCart_afer_delete.userId = userId
        final_detailsofCart_afer_delete.items = Arr
        final_detailsofCart_afer_delete.totalPrice = 0
        final_detailsofCart_afer_delete.totalItems = Arr.length
    
        const finalyy_upadted_cart_data = await CartModel.findOneAndUpdate({userId: userId}, {$set: {userId : final_detailsofCart_afer_delete.userId, items: final_detailsofCart_afer_delete.items, totalPrice: final_detailsofCart_afer_delete.totalPrice, totalItems: final_detailsofCart_afer_delete.totalItems}});
        return res.status(204).send({
            status: true,
            message: "success",
            data: finalyy_upadted_cart_data
        })
    }catch(error) {
        if(error.name == 'castError') {
            if(error.valueType == 'Object') {
                const message = `Invalid userId ${error.path} : ${error.value._id} ! Please provide a valid userId`;
                return nxt(new AppError(message, 400));
            }
        }
    }
}