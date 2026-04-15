const logger = require("../../../../utils/logger");
const com = require('../../../../config/com');
const util = require('../../../../utils/tokengenerate');

 
exports.updateProfile = async (name,dateOfbirth,email,phone,address,tokenEmail,imageUrl,publicId)=>{
    try{

        
        console.log(tokenEmail);
        
        const result = await com.pool.query('update createuser set name = ?, dateOfBirth = ?, email = ?, phone = ?, address = ? , image_url = ?, public_Id = ? where email = ?', [name,dateOfbirth,email,phone,address,imageUrl,publicId,tokenEmail]);

        if(result[0].affectedRows > 0){
            return util.generateToken({name,email,phone});
        }else{
            return false;
        }

    }catch(error){
        logger.error(`Error in updateProfile: ${error.message}`);
        throw error;
    }
}