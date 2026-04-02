const services = require('./editprofile.services');

class editProfileController{

    async editProfile(req,res,next){
        try{

            //file is image
            const file = req.file;
            //token userData
            const userdata = req.user;

            const tokenEmail = userdata[0].email;

            const {name,dateOfbirth,email,phone,address} = req.body;

            const result = await services.updateProfile(file,name,dateOfbirth,email,phone,address,tokenEmail);
            
            if(result){
                res.status(200).json({
                    status: 'success',
                    message: 'Profile updated successfully'
                });
            }else{
                res.status(400).json({
                    status: 'fail',
                    message: 'Failed to update profile'
                });
            }


        }catch(error){
            next(error);
        }
    }
}

module.exports = new editProfileController();