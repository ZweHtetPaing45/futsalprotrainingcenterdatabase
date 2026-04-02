const AppError = require('../../../utils/AppError');
const services = require('./auth.services');
class AuthController{
    

    async createUser(req,res,next){
        try{

            const {name,email,phone,stateCode,township,type,number,dateOfBirth,password} = req.body;

            if(!name || !email || !phone || !stateCode || !township || !type || !number || !dateOfBirth || !password){
                throw new AppError('All fields are required',400);
            }

            const nrc = stateCode+ "/" + township +'('+ type +')' + number;

            const image_url = 'uploads/futuristic-ninja-digital-art.jpg';

            const token = await services.createUser(name,email,phone,nrc,dateOfBirth,password,image_url);

            res.status(201).json({
                status: 'success',
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