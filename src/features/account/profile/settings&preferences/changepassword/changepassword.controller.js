const service = require('./changepassword.service');
class ChangePasswordController{


    async changePassword(req,res,next){
        try{

            const userdata = req.user;

            const {password,changePassword} = req.body;

            const tokenPassword = userdata[0].password;

            const user_id = userdata[0].id;

            // console.log(userdata);
            // console.log(password);
            // console.log(user_id);

            const result = await service.changePassword(password,tokenPassword,changePassword,user_id);

            if(result){
                res.status(200).json({
                    status: 'Password Changed',
                    result
                });
            }else{
                res.status(200).json({
                    status: 'Password Not Changed',
                    result
                });
            }

            // const math = await bcrypt.compare(password,tokenPassword);

            // if(math){
                    
            // }
        }catch(error){
            next(error);
        }
    }
}

module.exports = new ChangePasswordController();