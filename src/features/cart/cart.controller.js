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
                items
            } = req.body;

            const result = await services.order(user_id,customer_name,phone,email,delivery_address,remark,payment_method,items,file);

            res.status(200).json({
                success:true,
                message:'Order placed successfully',
                data:result
            });

        }catch(error){
            next(error);
        }
    }

    async orderList(req,res,next){

        try{

            const userData = req.user;

            // console.log("User Data",userData)
            console.log(userData[0].id);

            const userId = userData[0].id;

            const result = await services.orderList(userId);

            res.status(200).json({
                success:true,
                message:'Order List',
                data:result
            });

        }catch(error){
            next(error);
        }

    }

}

module.exports = new cartOrderController();