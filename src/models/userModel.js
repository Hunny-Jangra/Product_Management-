const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fname: {
        type: String, 
        required: true
    },
    lname: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true, 
        validate: [validator.isEmail, ' >>>> Please Provide Valid Email'],
        unique: true
    },
    profileImage: {
        type: String, 
        required: true
    }, // s3 link
    phone: {
        type: String, 
        required: true, 
        unique: true, 
    }, 
    password: {
        type: String, 
        required: true, 
        minLength : 8, 
        maxLength:  15
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: String,
                required: [true, 'Street is mandatory field in address']
            },
            city: {
                type: String, 
                required: [true, 'city is mandatory field in address']
            },
            pincode: {
                type: Number, 
                required: [true, 'pincode is mandatory field in address']
            }
        },
        billing: {
           
            street: {
                type: String, 
                required: [true, 'street is mandatory field in billing']
            },
            city: {
                type: String, 
                required: [true, 'city is mandatory field in billing']
            },
            pincode: {
                type: Number, 
                required: [true, 'pincode is mandatory field in billing'],
                // min: 6,
                // max: 6
            }
        }
    },
}, {timestamps: true})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

})

const userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;