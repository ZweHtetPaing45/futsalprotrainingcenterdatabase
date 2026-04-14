const bcrypt = require('bcrypt');

class ChangePasswordController{


    async changePassword(req,res,next){
        try{

            const userdata = req.user;

            const {password} = req.body;

            const tokenPassword = userdata[0].password;

            const math = await bcrypt.compare(password,tokenPassword);

            if(math){
                    
            }

        }catch(error){
            next(error);
        }
    }
}

module.exports = new ChangePasswordController();