const service = require('./rental.service');


class RentalController {


    async RentalBooking(req,res,next){

        try{

            const user_id = req.user[0].id;

            console.log(user_id);

            const {venue_id,court_id,payment_id,date,name,phone,remark,court_time_slot_ids,department,items} = req.body;

            const file = req.file;

            if(!venue_id || !court_id || !payment_id || !date || !name  || !phone || !remark || !court_time_slot_ids || !file ||!department){
                throw new AppError('Please fill all the fields', 400);
            }

            const result = await service.RentalBooking(venue_id,court_id,payment_id,date,name,phone,remark,file,court_time_slot_ids,department,items,user_id);

            if(result){
                res.status(201).json({
                    success: true,
                    message: 'mobile Booking added successfully',
                    data: result
                });

            }else{

                res.status(400).json({
                    success: false,
                    message: 'mobile Booking not added',
                    data: result
                });
            }



        }catch(error){
            next(error);
        }

    }


    async ShowVenue(req,res,next){

        try{

            const result = await service.ShowVenue();

            if(result){
                res.status(200).json({
                    success: true,
                    message: 'Venue shown successfully',
                    data: result
                });
            }

        }catch(error){
            next(error);
        }

    }

       async ShowCourt(req,res,next){

        try{

            const venue_id = req.params.id;

            const result = await service.ShowCourt(venue_id);

            if(result){
                res.status(200).json({
                    success: true,
                    message: 'Court shown successfully',
                    data: result
                });
            }

        }catch(error){
            next(error);
        }

    }

    async RemainBookingTimeSlot(req,res,next){

        try{

            const court_id = req.params.court_id;
            const date = req.params.date;

            const result = await service.RemainBookingTimeSlot(court_id,date);

            if(result){
                res.status(200).json({
                    success: true,
                    message: 'Remain booking time slot shown successfully',
                    data: result
                });
            }

        }catch(error){
            next(error);
        }

    }

     async ShowMobileBookingData(req,res,next){

        try{

            const user_id = req.user[0].id;

            const result = await service.ShowMobileBookingData(user_id);

            if(result){
                res.status(201).json({
                    success: true,
                    message: 'mobile Booking list successfully',
                    data: result
                });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'mobile Booking not show data list',
                    data: result
                });
            }

        }catch(error){
            next(error);
        }

    }


}

module.exports = new RentalController();