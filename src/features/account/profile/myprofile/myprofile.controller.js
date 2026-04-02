const services = require('./myprofile.services');

class MyProfileController{

    async showprofile(req,res,next){
        try{

           const userdata = req.user;

           const email = userdata[0].email;

           const result = await services.showProfile(email);

           res.status(200).json({
                status: 'success',
                result
            });

        }catch(error){
            next(error);
        }
    }

}

module.exports = new MyProfileController();