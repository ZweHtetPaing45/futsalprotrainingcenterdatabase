
const services = require('./tagshowProduct.services');

class tagShowProductController{


    async tagShowProduct(req,res,next){
        try{

            const result = await services.tagShowProduct();

            if(!result)throw new AppError('Failed to show product',500);

            res.status(201).json({
                status: 'success',
                message: 'Successfully show product',
                result
            })

        }catch(error){
            next(error);
        }
    }
}

module.exports = new tagShowProductController();