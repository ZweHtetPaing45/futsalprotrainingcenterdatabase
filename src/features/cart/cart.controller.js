const services = require('./cart.service');

class cartOrderController{
    
    async order(req,res,next){
        try{

            const file = req.file;

            

            const {
                user_id,
                customer_name,
                phone,
                email,
                delivery_address,
                remark,
                payment_method,
                tax = 0,
                delivery_fee = 0,
                items
            } = req.body;

            const result = await services.order(user_id,customer_name,phone,email,delivery_address,remark,payment_method,tax,delivery_fee,items,file);

            res.status(200).json({
                success:true,
                message:'Order placed successfully',
                data:result
            });

        }catch(error){
            next(error);
        }
    }

}

module.exports = new cartOrderController();