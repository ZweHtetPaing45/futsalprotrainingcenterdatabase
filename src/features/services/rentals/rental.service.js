const repo = require('./rental.repositories');


class BookingRental {

    async RentalBooking(venue_id,court_id,payment_id,date,name,phone,remark,file,court_time_slot_ids,department,items){

        const result = await repo.RentalBooking(venue_id,court_id,payment_id,date,name,phone,remark,file,court_time_slot_ids,department,items);

        return result;

    }


    async ShowVenue(){

        const result = await repo.ShowVenue();

        return result;

    }

    async ShowCourt(id){

        const result = await repo.ShowCourt(id);

        return result;

    }

    async RemainBookingTimeSlot(court_id,date){

        const result = await repo.RemainBookingTimeSlot(court_id,date);

        return result;

    }

}

module.exports = new BookingRental();