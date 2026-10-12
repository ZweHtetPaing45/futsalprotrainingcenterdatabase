const joi = require('joi');
const AppError = require('../utils/AppError');

const myanmarPhone = joi.string().pattern(/^09[0-9]{7,9}$/).messages({
    'string.pattern.base': '{{#label}} must be a Myanmar mobile number starting with 09 and containing 9 to 11 digits'
});

const createUserSchema = joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    phone: myanmarPhone.required(),
    // stateCode: joi.string().pattern(/^[0-9၀-၉]{1,2}$/).required(),
    // township: joi.string().pattern(/^[က-အ]{3}$/).required(),
    // type: joi.string().valid('နိုင်', 'ဧည့်', 'ပြု').required(),
    // number: joi.string().pattern(/^[0-9၀-၉]{6}$/).required(),
    dateOfBirth: joi.date().iso().less('now').required(),
    password: joi.string().min(6).max(20).required()
});

const loginUserSchema = joi.object({
    emailOrphone: joi.string().required(),
    password: joi.string().min(6).max(20).required(),
});

const updateProfileSchema = joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    phone: myanmarPhone.required(),
    dateOfbirth: joi.date().iso().less('now').required(),
    address: joi.string().min(1).max(255).required()
});

const showCategoryProduct = joi.object({
    name: joi.string().min(1).max(255).required()
})


const createValidate = (schema)=>{
    return (req,res,next)=>{
        const {error,value} = schema.validate(req.body);
        if(error){
            return next(new AppError(error.details[0].message, 400));
        }

        req.body = value;
        next();
    }
}

module.exports = {
    showCategoryProduct,
    createUserSchema,
    loginUserSchema,
    updateProfileSchema,
    createValidate
};
