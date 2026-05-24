const com = require('../../../config/com');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');

exports.TrainingStudent = async (name,gender,phone,email,age,address,emergency,training_program_id,training_level_id,schedule_id,payment_id,file)=>{

    let image_url;
    let public_id;

    console.log('file in repo',file);
    console.log('payment_id in repo',payment_id);
    console.log('training_program_id in repo',training_program_id);
    console.log('training_level_id in repo',training_level_id);
    console.log('schedule_id in repo',schedule_id);
    console.log('name in repo',name);
    console.log('gender in repo',gender);
    console.log('phone in repo',phone);
    console.log('email in repo',email);
    console.log('age in repo',age);
    console.log('address in repo',address);
    console.log('emergency in repo',emergency);

    if(file){

        const result = await uploader.upload(file,'training_payment_image');

        image_url = result.image_url;
        public_id = result.public_id;

    }

    const [result] = await com.pool.query(`
        insert into training_students (
        payment_id,
        training_program_id,
        training_level_id,
        training_schedule_time_slot_id,
        name,
        gender,
        phone,
        email,
        age,
        address,
        emergency_number,
        payment_image_url,
        payment_public_id
        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,[payment_id,training_program_id,training_level_id,
            schedule_id,name,gender,phone,email,age,address,emergency,image_url,public_id
        ]);

    if(!result)throw new AppError('Training Student Error',400);

    return true;

}

exports.ShowTraining = async ()=>{

    const [result] = await com.pool.query(`
        SELECT 
    tp.id,
    tp.main_title,
    tp.title,
    tp.about_title,
    tp.details,
    tp.learning_description,

    -- training levels
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', tl.id,
                'title_level', tl.title_level,
                'price', tl.price
            )
        )
        FROM training_level tl
        WHERE tl.trainning_program_id = tp.id
    ) AS levels,

    -- coaches
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', tc.id,
                'instructor_name', tc.instructor_name,
                'biography', tc.biography,
                'coach_image_url', tc.coach_image_url
            )
        )
        FROM training_coach tc
        WHERE tc.trainning_program_id = tp.id
    ) AS coaches,

    -- schedules
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'day_id', tsd.id,
                'day', tsd.day,
                'level_type', tsd.level_type,
                'start_time', tst.start_time,
                'end_time', tst.end_time
            )
        )
        FROM training_schedule_time_slots tst

        JOIN training_schedule_days tsd
        ON tsd.id = tst.training_schedule_days_id

        WHERE tst.trainning_program_id = tp.id
    ) AS schedules

FROM training_program tp;
        `);

        if(!result)throw new AppError('Show Training Error',400);

        return result;

}