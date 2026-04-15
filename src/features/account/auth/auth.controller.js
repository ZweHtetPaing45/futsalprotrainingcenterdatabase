const AppError = require('../../../utils/AppError');
const services = require('./auth.services');

class AuthController{

    async createUser(req,res,next){
        try{ 

            const {name,email,phone,dateOfBirth,password} = req.body;

            if(!name || !email || !phone || !dateOfBirth || !password){
                throw new AppError('All fields are required',400);
            }

            const image_url = 'http://localhost:5001/uploads/futuristic-ninja-digital-art.jpg';

            const token = await services.createUser(name,email,phone,dateOfBirth,password,image_url);

            res.status(201).json({
                status: 'success',
                token
            });

        }catch(error){
            next(error);
        }
    }


    async verifyOtp(req,res,next){
        try{

            const {otp,tempToken} = req.body;

            if(!otp || !tempToken){
                throw new AppError('All fields are required',400);
            }
            const token = await services.verifyOtp(tempToken,otp);

            res.status(201).json({
                status: 'success',
                message: 'OTP verified',
                token
            });

        }catch(error){
            next(error);
        }
    }



    async loginUser(req,res,next){
        try{

            const {emailOrphone,password} = req.body;

            if(!emailOrphone || !password){
                throw new AppError('All fields are required', 400);
            }

            const token = await services.loginUser(emailOrphone,password);

            res.status(201).json({
                status: 'success',
                token
            });

        }catch(error){
            next(error);
        }
    }
}

module.exports = new AuthController();