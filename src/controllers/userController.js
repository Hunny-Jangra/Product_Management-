const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../AppError/appError');
const bcrypt = require('bcryptjs');

exports.createUserdata = async(req, res) => {
    try {

        const data1 = req.body;
        const {fname, lname, email, profileImage, phone, password, address, shipping, billing} = data1;
    
        if(!fname) {
            return res.status(400).send({status: false, message: "Please Provide fname"})
        }
    
        if(!lname) {
            return res.status(400).send({status: false, message: "Please Provide lname"})
        }
    
        if(!email) {
            return res.status(400).send({status: false, message: "Please Provide email"})
        }
    
        if(!profileImage) {
            return res.status(400).send({status: false, message: "Please Provide profileImage"})
        }
    
        if(!phone) {
            return res.status(400).send({status: false, message: "Please Provide phone"})
        }
    
        if(!password) {
            return res.status(400).send({status: false, message: "Please Provide password"})
        }
    
        if(!address) {
            return res.status(400).send({status: false, message: "Please Provide address"})
        }
        // if(!shipping) {
        //     return res.status(400).send({status: false, message: "Please Provide shipping in address"})
        // }
        // if(!billing) {
        //     return res.status(400).send({status: false, message: "Please Provide billing in address"})
        // }
        
        const data = await userModel.create(data1);
        
        return res.status(201).send({
            status: true,
            message: "user created Successfully",
            data
        })
    }catch(error) {
        if(error.code == 11000){
            // const value = error.keyValue.phone;
            if(error.keyValue.email){
                const value = error.keyValue.email;
                const message = `Duplicate field value >> ${value} << .! Please use another value`;
                return res.status(400).send({
                   status: false,
                   message
                })
            }else if(error.keyValue.phone) {
                const value = error.keyValue.phone;
                const message = `Duplicate field value >> ${value} << .! Please use another value`;
                return res.status(400).send({
                   status: false,
                   message
                })
            }
        }
        return res.status(500).send({
            status:false,
            message: error.message
        })
    }

}

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SEC_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.userLogin = async(req, res, next) => {
    try{

        const data1 = req.body;
        const {email, password} = data1;
        // 1) check if email and password is present on req.body or not
        if(!email) {
            return res.status(400).send({
                status: false,
                message: "email is Reqired to Login"
            })
        }
        if(!password) {
            return res.status(400).send({
                status: false,
                message: "password is required to Login"
            })
        }
    
         // 2) Check if email is exsit is database and password is correct or not
         const userInDB = await userModel.findOne({email: email, password: password});
         console.log(userInDB);
         if(!userInDB) {
             res.status(404).send({
                 status: false,
                 message: "Please provide a Valid email and Password"
             })
         }
         // 3) if everything is ok then pass Token to the Client
         else{
            const token = signToken(userInDB._id);
            const cookiesOption = {
                expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
              
                httpOnly: true
            }
            if(process.env.NODE_ENV === 'production') {
                
                // cookiesOption.secure = true;
                console.log('////////////COOKIES///////')
                res.cookie('Cookies_laptop', token, cookiesOption)
            }
                console.log('////////////COOKIES///////')
            const userId = userInDB.id;
            console.log(req.params.userId)
            

                res.status(200).send({
                    status: true,
                    message: "User login successfull",
                    data:{
                        userId,
                        token
                    }
                })
            
            
        }
    }catch(error) {
        if(error.name == 'CastError') {
            message = `Invalid ${error.path}: ${error.stringValue} ! Please Check and provide a valid email`
            return next(new AppError(message, 400));
        }
        return res.status(500).send({
            status: false,
            error,
            message: error.message
        })
    }

}

exports.getuserData = async(req, res, next) => {
    try{

        const data1 = req.params.userId;
      
        const data = await userModel.findOne({_id: data1});
        if(!data) {
            return res.status(404).send({
                status: true,
                message: "Userid is not found "
            })
        }
        return res.status(200).send({
            status: true,
            message: "User profile details",
            data
            
        })
    }catch(error) {
        if(error.name == 'CastError') {
            message = `Invalid ${error.path}: ${error.value} ! Please Check and provide a valid userId`
            return next(new AppError(message, 400));
        }
        return res.status(500).send({
            status:false,
            error,
            message: error.message
        })
        
    }

}

exports.updateUserData = async(req, res, next) => {
    try{
        const data1 = req.params.userId;
        let data_address = req.body;
        let {address} = data_address;

        const bodyFromReq = JSON.parse(JSON.stringify(req.body));
        console.log(bodyFromReq)
        let newObj = {};
        const checkIdinDB = await userModel.findOne({_id: data1});
        // console.log(checkIdinDB)
        if(!checkIdinDB) {
            return next (new AppError(`Id is not Find `, 404));
        }
        const email_already_exsists = await userModel.findOne({email: req.body.email});
        if(email_already_exsists) {
            return next(new AppError(`email is to be Unique ${email_already_exsists.email}! Please try with new and different Email`, 400));
        }

        const phone_already_exsists = await userModel.findOne({phone: req.body.phone});
        if(phone_already_exsists) {
            return next(new AppError(`Phone Number is to be Unique ${phone_already_exsists.phone}! Please try with new and different Email`, 400));
        }
        
        const update_Password_with_hashing = await bcrypt.hash(req.body.password, 12);
        console.log(update_Password_with_hashing);
        
        // for Shipping ////

        let street_Shipping_Update = req.body.address.shipping.street;
        let city_Shipping_Update = req.body.address.shipping.city;
        let pincode_Shipping_Update = req.body.address.shipping.pincode;

        //// for Billing /////
        let street_Billing_Update = req.body.address.billing.street;
        let city_Billing_Update = req.body.address.billing.city;
        let pincode_Billing_Update = req.body.address.billing.pincode;

       
        
        const data = await userModel.findByIdAndUpdate({_id: req.params.userId}, {$set: {fname: req.body.fname, lname: req.body.lname, email: req.body.email, profileImage: req.body.profileImage, phone: req.body.phone, password: update_Password_with_hashing, 'address.shipping.street': street_Shipping_Update,'address.shipping.city': city_Shipping_Update,'address.shipping.pincode': pincode_Shipping_Update, 'address.billing.street': street_Billing_Update, 'address.billing.city': city_Billing_Update, 'address.billing.pincode': pincode_Billing_Update}}, {new : true});

        console.log(data);
        

        return res.status(200).send({
            status: true,
            data
        })

    }catch(error) {
        // if(error.name == 'CastError') {
        //     const message = `Invalid ${error.path} : ${error.value} ! Please provide a valid userId`;
        //     return next(new AppError(message, 400));
        // }
        return res.status(500).send({
            status: false,
            error
        });
    }
}

exports.protect = async(req, res, next) => {
    try{

        // 1) Getting Token and check it's there
    
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        console.log(token);
        console.log('/////////TOKEN/////////');
    
        if(!token) {
            return next(new AppError(`You are not logged in ! Please login to get access`, 401));
        }
            
        // 2) Verification Process
        const decoded = await jwt.verify(token, process.env.JWT_SEC_KEY);
        
        console.log(decoded);
        if(decoded.id !== req.params.userId){
            return res.status(401).send({
                status: false,
                message: "for this Id, User is not logged in ! "
            })
        }
    
        // 3) check useris Still exists or not
        const User = await userModel.findById(decoded.id);
        if(!User) {
            return next(new AppError(`The User is no longer Belonging to this token`, 401));
        }
    
        // 4) check user is changed the password after the token was issue
    
        next();
    }catch(error) {
        return next(new AppError(error.message, 500));
    }
}