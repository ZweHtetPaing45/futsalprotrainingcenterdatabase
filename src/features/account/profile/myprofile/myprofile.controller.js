const services = require('./myprofile.services');

class MyProfileController{

    async showprofile(req,res,next){
        try{

           const userdata = req.user;

           const emaill = userdata[0].email;

           let result = await services.showProfile(emaill);

           let warning = result[0].warning;
           let id = result[0].id;
           let name = result[0].name;
           let email = result[0].email;
           let phone = result[0].phone;
           let image_url = result[0].image_url;
           let dateOfBirth = result[0].dateOfBirth;
           let address = result[0].address;

        warning = warning === 1 ? 'true' : 'false';

           result = [
            {
                id,
                name,
                email,
                phone,
                image_url,
                dateOfBirth,
                address,
                warning
            }
           ]


                // id,
                // name,
                // email,
                // phone,
                // image_url,
                // dateOfBirth,
                // address,


           res.status(200).json({
                status: 'success',
                result,
            });

        }catch(error){
            next(error);
        }
    }

}

module.exports = new MyProfileController();