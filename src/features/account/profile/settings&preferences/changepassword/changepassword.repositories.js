const com = require('../../../../../config/com');
const AppError = require('../../../../../utils/AppError');
const logger = require('../../../../../utils/logger');


exports.ChangePassword = async (changePassword,user_id)=>{

    const result = await com.pool.query('update createuser set password = ? where id = ?',[changePassword,user_id]);    

    if(!result){
        throw new AppError('result error',400);
    }

    return true;

}