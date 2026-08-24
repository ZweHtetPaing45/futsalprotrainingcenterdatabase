
const walkRepo = require('./walk_in.repository');

class WalkInService{

      async bookingWalkIn(user_id,walk_in_id,payment_method,vanue_id,court_id,name,phone,date,items,file,department){
        
        const result = await walkRepo.walkInBooking(user_id,walk_in_id,payment_method,vanue_id,court_id,name,phone,date,items,file,department);

        return result;

    }

        async allCourtWalkIn(){

        const result = await walkRepo.allCourtWalkIn();

        return result;

    }

    

}

module.exports = new WalkInService();