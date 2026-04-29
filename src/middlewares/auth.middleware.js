const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const util = require('../utils/tokengenerate');
const repo = require('../features/account/auth/auth.repositories');

exports.authMiddle =async (req,res,next)=>{

    try{

        const header = req.headers.authorization;

        if(!header)throw new AppError('Unauthorized',500);

        const token = header.split(' ')[1];

        if(!token)throw new AppError('Unauthorized',500);

        const decoded = util.verifyToken(token);

        console.log("decoded",decoded);

        if(!decoded)throw new AppError('Unauthorized',500);

        const user = await repo.findUserId(decoded.id);

        console.log("user",user);

        if(!user)throw new AppError('Unauthorized',500);

        req.user = user;

        next();

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        next(error);
    }

}