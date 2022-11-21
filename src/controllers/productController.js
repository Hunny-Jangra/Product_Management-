const AppError = require('../AppError/appError');
const productModel = require('../models/productModel');

exports.createProductDoc = async(req, res, next) => {
    try{

        const data1 = req.body;
        let {title, description, price, currencyId, currencyFormat, productImage, } = data1;
    
        if(!title) {
            return next(new AppError(`title is not Defiend! Please provide title as a field`, 400));
        }
        if(!description) {
            return next(new AppError(`Description is not Defiend! Please provide description as a field`, 400));
        }
        if(!price){
            return next(new AppError(`price is not Defiend! Please provide price as a field`, 400));
        }
        if(!currencyId) {
            return next(new AppError(`currencyId is not Defiend! Please provide currencyId as a field`, 400));
        }
        if(!currencyFormat) {
            return next(new AppError(`currencyformat is not Defiend! Please provide currencyFormat as a field`, 400));
        }
        if(!productImage) {
            return next(new AppError(`productImage is not Defiend! Please provide productImage as a field`, 400));
        }

        const createDoc = await productModel.create(data1);
        return res.status(201).send({
            status: true,
            message: "",
            data: createDoc
        })


    }catch(error) {
        if(error.code == 11000) {
            if(error.keyValue.title) {
                const value = error.keyValue.title;
                const message = `Duplicate title value >> ${value} << ! Please provide another different title`
                return next(new AppError(message, 400));
            }
        }
        return next(new AppError(`${error.message}`, 500));
    }

}

exports.getProducts_using_Filters = async(req, res, next) => {
    try{

        const queryObj = {...req.query};
        
        let queryStr = JSON.stringify(queryObj);
        
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
        
        const Query = req.query.priceSort;
        let products = await productModel.find(JSON.parse(queryStr)).sort({"price" : Query});
        
        
       
        const product = await products
        return res.status(200).send({
            status: true,
            product
        })
    }catch(error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

exports.getProductsById = async(req, res, next) => {
    try{
        const getDataById = req.params.productId;
        const getdata = await productModel.findOne({_id: getDataById});
        if(!getdata) {
            return next(new AppError(`productId is not found`, 404));
        }
        return res.status(200).send({
            status: true,
            getdata
        })
    }catch(error) {
        if(error.name == 'CastError') {
            const message = `Invalid field ${error.path}: ${error.value}! Please provide ProductId `;
            return next(new AppError(message, 400));
        }
        res.status(500).send({
            status: true,
            message: error.message
        })
    }
}

exports.upadteAtleaseOne = async(req, res, next) => {
    try{

        let data1 = req.body;
        let productId = req.params.productId; 
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, installments, } = data1;
    
        const find_id_In_DB = await productModel.findOne({_id: productId});
        if(!find_id_In_DB) {
            return next(new AppError(`ProductId is not found `, 404));
        }

        const updateData = await productModel.findByIdAndUpdate({_id: productId}, {$set: {title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, installments}}, {new : true});

        return res.status(200).send({
            status: true,
            message: "updated Successfully",
            data: updateData
        })
        
    }catch(error) {
        if(error.name == 'CastError') {
            const message = `Invalid productId ${error.path}: ${error.value} ! Please check and provide valid ProductId `;
            return next(new AppError(message, 400));
        }
        return next(new AppError(error.message, 500));
    }
    
   
}

exports.deleteProdData = async(req, res, next) => {
    try{
        const productId = req.params.productId;

        const find_id_In_DB = await productModel.findOne({_id: productId, isDeleted: false});
        if(!find_id_In_DB) {
            return next(new AppError(`ProductId is not found `, 404));
        }
       
        const deleteProductData = await productModel.findByIdAndDelete({_id: find_id_In_DB._id});
        return res.status(200).send({
            status: true,
            message: "Deleted Successfully",
        })

    }catch(error) {
        if(error.name == 'CastError'){
            const message = `Invalid ProductID ${error.path}: ${error.value} ! Please check and provide a valid ProductId`;
            return next(new AppError(message, 400));
        }
        return next(new AppError(error.message, 500)); 
    }
} 