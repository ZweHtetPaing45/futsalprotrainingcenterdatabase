const AppError = require('../../../utils/AppError');
const services = require('./auth.services');

class AuthController{

    async createUser(req,res,next){
        try{ 

            const {name,email,phone,dateOfBirth,password} = req.body;

            if(!name || !email || !phone || !dateOfBirth || !password){
                throw new AppError('All fields are required',400);
            }

            const image_url = 'http://38.60.216.25:5001/uploads/futuristic-ninja-digital-art.jpg';

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

    async forgetPassword(req,res,next){

        try{

            const {email} = req.body;

            if(!email){
                throw new AppError('All fields are required', 400);
            }

            const result = await services.forgetPassword(email);

            if(result){
                res.status(201).json({
                    status: 'success',
                    message: result
                });
            }else{
                res.status(400).json({
                    status: 'fail',
                    message: result
                });
            }

        }catch(error){
            next(error);
        }

    }

    async verifyOtpForForgetPassword(req,res,next){

        try{

            const {otp,tempToken} = req.body;

            if(!otp || !tempToken){
                throw new AppError('All fields are required',400);
            }

            const token = await services.verifyForgetPassword(tempToken,otp);

            if(token){
                res.status(201).json({
                    status: 'success',
                    token
                });
            }else{
                res.status(400).json({
                    status: 'fail',
                    message: 'Invalid OTP'
                });
            }

        }catch(error){
            next(error);
        }

    }

    async VerifyUpdatePassword(req,res,next){
        try{

            const {tempToken,change_password,email} = req.body;

            if(!tempToken || !change_password || !email){
                    throw new AppError('All fields are required',400);
            }
    
            const result = await services.VerifyUpdatePassword(tempToken,change_password,email);

            if(result){
                res.status(201).json({
                        status: 'success',
                        result
                    });
            }else{
                res.status(400).json({
                    status: 'fail',
                    message: 'Can not email'
                });
            }

        }catch(error){
            next(error);
        }
    }

    async DeleteUser(req,res,next){

        try{

            const userdata = req.user;

            const user_id = userdata[0].id;

            console.log(user_id);

            const result = await services.DeleteUser(user_id);

            if(result){
                res.status(201).json({
                        status: 'success',
                        result
                    });
            }else{
                res.status(400).json({
                    status: 'fail',
                    message: 'Can not delete'
                });
            }

        }catch(error){
            next(error);
        }

    }
}

module.exports = new AuthController();