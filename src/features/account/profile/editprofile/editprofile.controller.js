const services = require('./editprofile.services');
const AppError = require('../../../../utils/AppError');

class editProfileController{

    async editProfile(req,res,next){
        try{

            //file is image
            const file = req.file;
            //token userData
            const userdata = req.user;

            if(!file)throw new AppError('Image is required',400);
            

            const tokenEmail = userdata[0].email;

            const {name,dateOfbirth,email,phone,address} = req.body;

            const result = await services.updateProfile(file,name,dateOfbirth,email,phone,address,tokenEmail);
            
           res.status(200).json({
                status: 'Edit Profile',
                result
            });


        }catch(error){
            next(error);
        }
    }
}

module.exports = new editProfileController();