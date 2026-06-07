const service = require('./contactus.service');

class ContactUsController{

      async showgeneralSetting(req,res,next){
        try{

            const result = await service.showgeneralSetting();

            if(!result) throw new AppError('Failed to show general setting',500);

            res.status(200).json({
                status: 'success',
                data: result
            });

        }catch(error){
            next(error);
        }
    }


}

module.exports = new ContactUsController();