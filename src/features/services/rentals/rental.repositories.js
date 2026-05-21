const com = require('../../../config/com');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');


exports.RentalBooking = async (venue_id,court_id,payment_id,date,name,phone,remark,file,court_time_slot_ids,department,items) =>{

    let image_url;
    let public_id;

    if(file){

        const result = await uploader.upload(file, 'mobile_rental_booking');

        image_url = result.image_url;
        public_id = result.public_id;

    }

    const [booking] = await com.pool.query('insert into mobile_rental_booking (venue_id,court_id,payment_id,name,phone,remark,date,payment_image_url,payment_public_id) values(?,?,?,?,?,?,?,?,?)',[venue_id,court_id,payment_id,name,phone,remark,date,image_url,public_id]);

    if(!booking)throw new AppError('Mobile rental Booking Error',400);

    const bookingId = booking.insertId;

    console.log('booking id',bookingId);

    const [venue_price] = await com.pool.query('select price from venue where id = ?',venue_id);

    const price = venue_price[0].price;

    let mobile_booking_total_price = 0;

    const court_time_slot_ids_array = JSON.parse(court_time_slot_ids);

    console.log('court_time_slot_ids_array',court_time_slot_ids_array);

    for(let slotId of court_time_slot_ids_array){

            console.log('court_time_slot_ids_array',typeof court_time_slot_ids_array);

            mobile_booking_total_price += price;

            console.log('admin_booking_total_price ',mobile_booking_total_price);

            let slot_id = Number(slotId);

            // console.log('slot_id',slot_id);
            // console.log('slot_id',typeof slot_id);
            // console.log('slotId ',typeof slotId);
            // console.log('slotId',slotId);

            const [booking_time] = await com.pool.query('insert into mobile_rental_time_slot (mobile_rental_booking_id,court_time_slot_id) values(?,?)',[bookingId,slot_id]);

            if(!booking_time)throw new AppError('Admin booking_time Error',400);

            const booking_time_id = booking_time.insertId;

            console.log('Booking_time_id is : ', booking_time_id);

    }

    
    console.log('mobile_booking_total_price all total : ',mobile_booking_total_price);

    //price insert
    const admin_booking_all_data = await com.pool.query('update mobile_rental_booking set rental = ? where id = ?',[mobile_booking_total_price,bookingId]);

    if(!admin_booking_all_data)throw new AppError('admin booking price Error',400);

    //if equipment booking order

    if(items){

    const item = JSON.parse(items);

    console.log('item',item);

       let total = 0;

        for(const eq of item){

            const [eq_price] = await com.pool.query('select rental_price from equipment where id = ?',eq.equipment_id);

            const eqprice = eq_price[0].rental_price;

            const eq_id = eq.equipment_id;
            const quantity = eq.quantity;

            // admin_booking_total_price += eqprice;

            total = quantity * eqprice;

            mobile_booking_total_price += total;


            // total += admin_booking_total_price;

            const insert_eq = await com.pool.query('insert into mobile_rental_booking_equipment (mobile_rental_booking_id,equipment_id,quantity,price,total,department) values(?,?,?,?,?,?)',[bookingId,eq_id,quantity,eqprice,total,department]);

            if(!insert_eq)throw new AppError('Admin booking equipment Error',400);

    }

    console.log('mobile_booking_total_price ',mobile_booking_total_price);


    const [admin_booking_total_amount] = await com.pool.query('update mobile_rental_booking set amount = ? where id = ?',[mobile_booking_total_price,bookingId]);

    if(!admin_booking_total_amount)throw new AppError('admin booking total amount Error',400);


    const [prindOrder] = await com.pool.query(`
         
             select 
                a.id,
                p.payment_method,
                DATE_FORMAT(a.create_at, '%Y-%m-%d %h:%i:%s %p') AS create_at,
                DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
                a.rental,
                a.amount

                from mobile_rental_booking a
                join payment p on p.id = a.payment_id
                join venue v on v.id = a.venue_id
                join court c on c.id = a.court_id
                join mobile_rental_time_slot abts on abts.mobile_rental_booking_id = a.id
                join court_time_slot cts on cts.id = abts.court_time_slot_id
                left join mobile_rental_booking_equipment abe on abe.mobile_rental_booking_id = a.id
                left join equipment e on e.id = abe.equipment_id
                where a.id = ?
        `,[bookingId]);

    if(!prindOrder)throw new AppError('Admin Booking Print Data Error',400);

    const [mobile_booking_time] = await com.pool.query(`
                SELECT *
FROM court_time_slot
WHERE court_id = ?
AND id NOT IN (

    -- Admin booking slots
    SELECT abts.court_time_slot_id
    FROM admin_booking_time_slot abts
    JOIN admin_booking ab
        ON ab.id = abts.booking_id
    WHERE ab.date = ?

    UNION

    -- Mobile booking slots
    SELECT mrts.court_time_slot_id
    FROM mobile_rental_time_slot mrts
    JOIN mobile_rental_booking mrb
        ON mrb.id = mrts.mobile_rental_booking_id
    WHERE mrb.date = ?
);
        `,[court_id,date,date]);

    if(!mobile_booking_time)throw new AppError('mobile Booking Time Error',400);

     const grouped = {};

            prindOrder.forEach(row => {
            if (!grouped[row.order_id]) {
                grouped[row.order_id] = {
                Registration: row.id,
                payment_method: row.payment_method,
                create_at: row.create_at,
                date: row.date,
                Court_Fee: row.rental,
                Total: row.amount,
                };
            }

            });

            const result1 = Object.values(grouped);

            console.log('result1',result1);

    return {result1,mobile_booking_time};
}


}

exports.ShowVenue = async ()=>{

    let [result] = await com.pool.query('select id,venue_name,price,venue_image_url,available from venue');

    if(!result)throw new AppError('Failed to show venue',500);

    if(result.length === 0){
        return [];
    };

    result[0].available = result[0].available === 1 ? true : false;

    return result;
}

exports.ShowCourt = async (venue_id)=>{
    
    const [result] = await com.pool.query(`
               SELECT 
            c.id,
            c.court_name,
            c.hourly_price,
            c.open_at,
            c.close_at,
            c.about_court,

            -- Time Slots
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', ts.id,
                        'start_time', ts.start_time,
                        'end_time', ts.end_time
                    )
                )
                FROM court_time_slot ts
                WHERE ts.court_id = c.id
            ) AS time_slots,

            -- Gallery
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'court_image_url', g.court_image_url,
                        'court_public_id', g.court_public_id
                    )
                )
                FROM court_gallery g
                WHERE g.court_id = c.id
            ) AS gallery,

            -- Pros
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'name', p.name
                    )
                )
                FROM pros p
                WHERE p.court_id = c.id
            ) AS pros,

            -- Cons
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'name', co.name
                    )
                )
                FROM cons co
                WHERE co.court_id = c.id
            ) AS cons,

            -- Services
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'name', s.name
                    )
                )
                FROM service s
                WHERE s.venue_id = c.venue_id
            ) AS services,

            -- Rules
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'name', r.name,
                        'detail', r.description
                    )
                )
                FROM rule r
                WHERE r.venue_id = c.venue_id
            ) AS rules,

            -- Equipment
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', e.id,
                        'product_name', e.product_name,
                        'rental_price', e.rental_price,
                        'qty_total', e.qty_total
                    )
                )
                FROM equipment e
                WHERE e.venue_id = c.venue_id
            ) AS equipment

        FROM court c
        WHERE c.venue_id = ?;`,[venue_id]);

    if(!result)throw new AppError('Failed to show court',500);

    // if(result.length === 0){
    //     return "No court found";
    // };

    return result;

}

exports.RemainBookingTimeSlot = async (court_id,date)=>{

    const [remainBookingTimeSlot] = await com.pool.query(`
        SELECT *
FROM court_time_slot
WHERE court_id = ?
AND id NOT IN (

    -- Admin booking slots
    SELECT abts.court_time_slot_id
    FROM admin_booking_time_slot abts
    JOIN admin_booking ab
        ON ab.id = abts.booking_id
    WHERE ab.date = ?

    UNION

    -- Mobile booking slots
    SELECT mrts.court_time_slot_id
    FROM mobile_rental_time_slot mrts
    JOIN mobile_rental_booking mrb
        ON mrb.id = mrts.mobile_rental_booking_id
    WHERE mrb.date = ?
);
        `,[court_id,date,date]);

    if(!remainBookingTimeSlot)throw new AppError('Remain Booking Time Slot Error',400);

 
    return remainBookingTimeSlot;
}