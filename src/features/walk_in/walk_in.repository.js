const com = require('../../config/com');
const uploader = require('@zwehtetpaing55/uploader');
const AppError = require('../../utils/AppError');


exports.walkInBooking = async (user_id,walk_in_id,payment_method,vanue_id,court_id,name,phone,date,items,file,department)=>{

    // console.log('items in repo',items);

    console.log('payment_method',payment_method);
    let image_url;
    let public_id;

    let bookingId;

    if(file){

        console.log('First');

        const result = await uploader.upload(file, 'walk_in_booking');

        image_url = result.image_url;
        public_id = result.public_id;

    let [id] = await com.pool.query('select id from payment where payment_method = ?',[payment_method]);

    // console.log('payment_id',id[0].id);

    const payment_id = id[0].id;

    const [booking] = await com.pool.query('insert into mobile_walk_in_bookings (user_id,walk_in_id,payment_id,vanue_id,court_id,name,phone,date,payment_image_url,payment_public_id) values(?,?,?,?,?,?,?,?,?,?)',[user_id,walk_in_id,payment_id,vanue_id,court_id,name,phone,date,image_url,public_id]);

    if(!booking)throw new AppError('Walk In Booking Error',400);

    bookingId = booking.insertId;

    // console.log('booking id',bookingId);
}else{

    console.log('Second');

    const [booking] = await com.pool.query('insert into mobile_walk_in_bookings(user_id,walk_in_id,vanue_id,court_id,name,phone,date) values(?,?,?,?,?,?,?)',[user_id,walk_in_id,vanue_id,court_id,name,phone,date]);

    if(!booking)throw new AppError('Admin Booking Error',400);

    bookingId = booking.insertId;

    // console.log('booking id',bookingId); 

}

const [walk_in_price] = await com.pool.query('select daily_price from walk_ins where id = ?',walk_in_id);

let walk_price = walk_in_price[0].daily_price;

// console.log("walk_price",walk_price);

await com.pool.query('update mobile_walk_in_bookings set amount = ? where id = ?',[walk_price,bookingId]);

if(items){

    const item = JSON.parse(items);

    // console.log('item',item);


       let total = 0;

        for(const eq of item){

            const [eq_price] = await com.pool.query('select rental_price from equipment where id = ?',eq.equipment_id);

            const eqprice = eq_price[0].rental_price;

            const eq_id = eq.equipment_id;
            const quantity = eq.quantity;

            // admin_booking_total_price += eqprice;

            total = quantity * eqprice;

            console.log('total',total);

            walk_price += total;

            console.log("walk_price",walk_price);

            // total += admin_booking_total_price;

            const insert_eq = await com.pool.query('insert into mobile_walk_in_equipment(mobile_walk_in_booking_id,equipment_id,quantity,price,total,department) values(?,?,?,?,?,?)',[bookingId,eq_id,quantity,eqprice,total,department]);

            if(!insert_eq)throw new AppError('Walk In booking equipment Error',400);

    }

    console.log('Walk_In_booking_total_price ',walk_price);


    const [admin_booking_total_amount] = await com.pool.query('update mobile_walk_in_bookings set amount = ? where id = ?',[walk_price,bookingId]);

    if(!admin_booking_total_amount)throw new AppError('walk in booking total amount Error',400);

}

    const [rows] = await com.pool.query(`
        SELECT
    u.id As User_id,
    wi.id As Walk_In_id,
    wib.id AS booking_id,
    wib.name AS booking_name,
    wib.phone,
    wib.payment_image_url,
    DATE_FORMAT(wib.date, '%Y-%m-%d') AS date,
    DATE_FORMAT(wib.create_at, '%h:%i:%s %p') AS Time,
    CONCAT(
        TIME_FORMAT(wi.open_at, '%h:%i'),
        ' - ',
        TIME_FORMAT(wi.close_at, '%h:%i')
    ) AS operating_hour,

    v.venue_name,
    c.court_name,

    p.payment_method,

    wi.daily_price AS walk_in_price,

    COALESCE(SUM(wie.total), 0) AS equipment_price,

    wib.amount

FROM mobile_walk_in_bookings wib

LEFT JOIN walk_ins wi
    ON wi.id = wib.walk_in_id

LEFT JOIN payment p
    ON p.id = wib.payment_id

LEFT JOIN createuser u
    ON u.id = wib.user_id

LEFT JOIN venue v
    ON v.id = wib.vanue_id

LEFT JOIN court c
    ON c.id = wib.court_id

LEFT JOIN mobile_walk_in_equipment wie
    ON wie.mobile_walk_in_booking_id = wib.id

WHERE wib.id = ?

GROUP BY
    wib.id,
    wib.name,
    wib.phone,
    wib.date,
    wi.open_at,
    wi.close_at,
    v.venue_name,
    c.court_name,
    p.payment_method,
    wi.daily_price,
    wib.amount

ORDER BY wib.id;    
        `,[bookingId]);

    const row = rows[0];

    return row;

}

exports.allCourtWalkIn = async ()=>{

    const [rows] = await com.pool.query(`
                SELECT
    v.id AS venue_id,
    v.venue_name,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'court_id',
            c.id,

            'court_name',
            c.court_name,

            'walk_in_id',
            wi.id,

            'court_images',
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(cg.court_image_url)
                    FROM court_gallery AS cg
                    WHERE cg.court_id = c.id
                ),
                JSON_ARRAY()
            ),

            'walk_in_price',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                THEN wi.daily_price
                ELSE NULL
            END,

            'open_at',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                THEN TIME_FORMAT(wi.open_at, '%H:%i')
                ELSE NULL
            END,

            'close_at',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                THEN TIME_FORMAT(wi.close_at, '%H:%i')
                ELSE NULL
            END,

            'capacity',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                THEN wi.capacity
                ELSE NULL
            END,

            'booked_count',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                THEN COALESCE(b.booked_count, 0)
                ELSE NULL
            END,

            'remaining_capacity',
            CASE
                WHEN c.court_active = 1
                     AND wi.id IS NOT NULL
                     AND wi.capacity IS NOT NULL
                THEN GREATEST(
                    wi.capacity - COALESCE(b.booked_count, 0),
                    0
                )
                ELSE NULL
            END,

            'status',
            CASE
                WHEN c.id IS NULL
                    THEN NULL

                WHEN c.court_active = 0
                    THEN NULL

                WHEN wi.id IS NULL
                     OR wi.capacity IS NULL
                    THEN 'WALK_IN_NOT_AVAILABLE'

                WHEN COALESCE(b.booked_count, 0) >= wi.capacity
                    THEN 'FULLY_BOOKED'

                ELSE 'WALK_IN_ACTIVE'
            END
        )
    ) AS courts

FROM venue AS v

LEFT JOIN court AS c
    ON c.venue_id = v.id

LEFT JOIN walk_ins AS wi
    ON wi.court_id = c.id

LEFT JOIN (
    SELECT
        booking_rows.vanue_id,
        booking_rows.court_id,
        booking_rows.walk_in_id,
        COUNT(*) AS booked_count

    FROM (
        SELECT
            wib.vanue_id,
            wib.court_id,
            wib.walk_in_id
        FROM walk_in_bookings AS wib
        WHERE wib.date = CURDATE()

        UNION ALL

        SELECT
            mwib.vanue_id,
            mwib.court_id,
            mwib.walk_in_id
        FROM mobile_walk_in_bookings AS mwib
        WHERE mwib.date = CURDATE()
    ) AS booking_rows

    GROUP BY
        booking_rows.vanue_id,
        booking_rows.court_id,
        booking_rows.walk_in_id
) AS b
    ON b.vanue_id = v.id
   AND b.court_id = c.id
   AND b.walk_in_id = wi.id

GROUP BY
    v.id,
    v.venue_name,
    v.venue_image_url

ORDER BY
    v.id ASC;   
        `);

        return rows;

}


exports.findUserIdBookingList = async (user_id)=>{

    const rows = await com.pool.query(`
        SELECT
    wib.user_id,
    wi.id AS walk_in_id,
    wib.id AS booking_id,
    wib.name AS booking_name,
    wib.phone,
    wib.date,
    wib.payment_image_url,

    CONCAT(
        TIME_FORMAT(wi.open_at, '%h:%i %p'),
        ' - ',
        TIME_FORMAT(wi.close_at, '%h:%i %p')
    ) AS time,

    v.venue_name,
    c.court_name,
    p.payment_method,
    wi.daily_price AS walk_in_price,

    COALESCE(SUM(wie.total), 0) AS equipment_price,

    wib.amount

FROM mobile_walk_in_bookings AS wib

LEFT JOIN walk_ins AS wi
    ON wi.id = wib.walk_in_id

LEFT JOIN payment AS p
    ON p.id = wib.payment_id

LEFT JOIN venue AS v
    ON v.id = wib.vanue_id

LEFT JOIN court AS c
    ON c.id = wib.court_id

LEFT JOIN mobile_walk_in_equipment AS wie
    ON wie.mobile_walk_in_booking_id = wib.id

WHERE wib.user_id = ?

GROUP BY
    wib.user_id,
    wi.id,
    wib.id,
    wib.name,
    wib.phone,
    wib.date,
    wib.payment_image_url,
    wi.open_at,
    wi.close_at,
    v.venue_name,
    c.court_name,
    p.payment_method,
    wi.daily_price,
    wib.amount

ORDER BY wib.id DESC;  
        `,user_id);


        const row = rows[0];
        return row;

}