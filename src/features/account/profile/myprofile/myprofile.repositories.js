const AppError = require("../../../../utils/AppError");
const logger = require("../../../../utils/logger");
const com = require('../../../../config/com');


exports.showprofile = async (email)=>{
    try{

        const user = await com.pool.query('select name,email,phone,image_url from createuser where email = ?',[email]);

        return user[0];

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });

        throw new AppError("Fail User",500);
    }
}