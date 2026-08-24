const AppError = require('../../utils/AppError');
const walkInService = require('./walk_in.service');


class WalkInController{


        async addbookingWalkIn(req,res,next){

        try{

            const file = req.file;
            const user = req.user;
            

            const user_id = user[0].id;

        const {walk_in_id,payment_method,vanue_id,court_id,name,phone,date,items,department} = req.body;

        if(!walk_in_id || !vanue_id || !court_id || !name || !phone || !date)throw new AppError("Please fill all the fields",500);

        const result = await walkInService.bookingWalkIn(user_id,walk_in_id,payment_method,vanue_id,court_id,name,phone,date,items,file,department);

        res.status(201).json({
            message : "Booking walk in successfully",
            result
        });
        }catch(error){
            next(error);
        }

    }

       async allCourtWalkIn(req,res,next){

        try{

            const result = await walkInService.allCourtWalkIn();

            res.status(200).json({
                message : "All list court walk in",
                result
            });

        }catch(error){
            next(error);
        }

    }


}

module.exports = new WalkInController();