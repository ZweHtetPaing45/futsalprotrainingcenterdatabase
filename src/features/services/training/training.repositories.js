const com = require('../../../config/com');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');
const uploader = require('@zwehtetpaing55/uploader');

exports.TrainingStudent = async (name,gender,phone,email,age,address,training_program_id,training_level_id,payment_id,file,user_id)=>{

    let image_url;
    let public_id;

    let training_student_id;
    let result;

    console.log('file in repo',file);
    console.log('payment_id in repo',payment_id);
    console.log('training_program_id in repo',training_program_id);
    console.log('training_level_id in repo',training_level_id);
    console.log('name in repo',name);
    console.log('gender in repo',gender);
    console.log('phone in repo',phone);
    console.log('email in repo',email);
    console.log('age in repo',age);
    console.log('address in repo',address);
    console.log('user_id in repo',user_id);

    if(file){

        console.log('First');

        const result = await uploader.upload(file,'training_payment_image');

        image_url = result.image_url;
        public_id = result.public_id;

    

    [result1] = await com.pool.query(`
        insert into mobile_training_students (
        user_id,
        payment_id,
        training_program_id,
        training_level_id,
        name,
        gender,
        phone,
        email,
        age,
        address,
        payment_image_url,
        payment_public_id
        ) values(?,?,?,?,?,?,?,?,?,?,?,?)`,[user_id,payment_id,training_program_id,training_level_id,
            name,gender,phone,email,age,address,image_url,public_id
        ]);

    if(!result1)throw new AppError('Training Student Error',400);

    training_student_id = result1.insertId;

    }else{

        console.log('Second');

        [result2] = await com.pool.query(`
        insert into mobile_training_students (
        user_id,
        training_program_id,
        training_level_id,
        name,
        gender,
        phone,
        email,
        age,
        address
        ) values(?,?,?,?,?,?,?,?,?)`,[user_id,training_program_id,training_level_id,
            name,gender,phone,email,age,address
        ]);

    if(!result2)throw new AppError('Training Student Error',400);

    training_student_id = result2.insertId;
    }

    console.log('training_student_id',training_student_id);

    const [findTimeSlots] = await com.pool.query('select * from training_schedule_time_slots where training_level_id = ? and trainning_program_id = ?;',[training_level_id,training_program_id]);

    if(!findTimeSlots)throw new AppError('Failed to find time slots',500);

    console.log('findTimeSlots',findTimeSlots);

    console.log('findTimeSlots.length',findTimeSlots.length);

    console.log(findTimeSlots[0].id);

    for(let i=0; i<findTimeSlots.length; i++){

        const [insertTrainingSchedule] = await com.pool.query('insert into mobile_training_student_time_slots (mobile_training_students_id,training_schedule_time_slot_id) values(?,?)',[training_student_id,findTimeSlots[i].id]);

        if(!insertTrainingSchedule)throw new AppError('Failed to add training student time slot',500);

        // console.log('insertTrainingSchedule',insertTrainingSchedule);

    }

    
    const [findStudent] = await com.pool.query(
        `SELECT 
        ats.name,
        ats.gender,
        ats.age,
        ats.phone,
        ats.email,
        ats.payment_image_url,
        DATE_FORMAT(ats.create_at, '%Y-%m-%d') AS date_only,
        DATE_FORMAT(ats.create_at, '%h:%i:%s %p') AS time_only,

        tp.category_card_image_url AS category_card_image_url,
        tp.course_name,

        tsts.id,
        tsts.trainning_program_id,
        tsts.training_schedule_days_id,
        tsts.start_time,
        tsts.end_time,
        tsts.training_level_id,

        tl.title_level,
        tsd.day

    FROM mobile_training_students ats

    LEFT JOIN mobile_training_student_time_slots atsts
        ON ats.id = atsts.mobile_training_students_id

    LEFT JOIN training_program tp
        ON ats.training_program_id = tp.id

    LEFT JOIN training_schedule_time_slots tsts
        ON atsts.training_schedule_time_slot_id = tsts.id

    LEFT JOIN training_level tl
        ON tsts.training_level_id = tl.id

    LEFT JOIN training_schedule_days tsd
        ON tsts.training_schedule_days_id = tsd.id

    WHERE ats.id = ?`
, [training_student_id]);



if(findStudent.length === 0){
    throw new AppError('Failed to find student',500);
}

const studentInfo = {
    Data: findStudent[0].date_only,
    Time: findStudent[0].time_only,
    name: findStudent[0].name,
    gender: findStudent[0].gender,
    age: findStudent[0].age,
    phone: findStudent[0].phone,
    email: findStudent[0].email,
    payment_image_url: findStudent[0].payment_image_url,
    category_card_image_url: findStudent[0].category_card_image_url,
    course_name: findStudent[0].course_name
};

const scheduleData = findStudent.map(item => ({
    id: item.id,
    trainning_program_id: item.trainning_program_id,
    training_schedule_days_id: item.training_schedule_days_id,
    start_time: item.start_time,
    end_time: item.end_time,
    training_level_id: item.training_level_id,
    title_level: item.title_level,
    day: item.day
}));

return {
    studentInfo,
    scheduleData
};

}

exports.ShowStudentTraining = async (user_id)=>{

    const [rows] = await com.pool.query(`
        SELECT 
            ats.id,
            ats.name,
            ats.gender,
            ats.age,
            ats.phone,
            ats.email,
            ats.payment_image_url,
            DATE_FORMAT(ats.create_at, '%Y-%m-%d') AS date_only,
            DATE_FORMAT(ats.create_at, '%h:%i:%s %p') AS time_only,

            tp.course_name,

            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', tsts.id,
                     'training_program_id', ats.training_program_id,
                    'training_schedule_days_id', tsts.training_schedule_days_id,
                    'start_time', tsts.start_time,
                    'end_time', tsts.end_time,
                    'create_at', tsts.create_at,
                    'training_level_id', tsts.training_level_id,
                    'title_level', tl.title_level,
                    'day', tsd.day
                )
            ) AS scheduleData

        FROM mobile_training_students ats

        LEFT JOIN mobile_training_student_time_slots atsts
            ON ats.id = atsts.mobile_training_students_id

        LEFT JOIN training_schedule_time_slots tsts
            ON atsts.training_schedule_time_slot_id = tsts.id

        LEFT JOIN training_program tp
            ON ats.training_program_id = tp.id

        LEFT JOIN training_level tl
            ON tsts.training_level_id = tl.id

        LEFT JOIN training_schedule_days tsd
            ON tsts.training_schedule_days_id = tsd.id

        where ats.user_id = ?

        GROUP BY ats.id
        `,[user_id]);

   if (!rows.length) {
        throw new AppError('Failed to find student', 500);
    }

    return rows.map(row => ({
        studentInfo: {
            Date: row.date_only,
            Time: row.time_only,
            id: row.id,
            name: row.name,
            gender: row.gender,
            age: row.age,
            phone: row.phone,
            email: row.email,
            payment_image_url: row.payment_image_url,
            course_name: row.course_name
        },
        scheduleData: row.scheduleData
    }));

}


exports.ShowTraining = async (id) => {

    const [result] = await com.pool.query(
        `SELECT 
            tp.id,
            tp.category_card_image_url,
           -- tp.main_program_banner_image_url,
            tp.course_name,

            -- training levels
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', tl.id,
                        'title_level', tl.title_level,
                        'price', tl.price,
                        'description', tl.description,
                        'main_title', case when tl.optional_active = 1 then tl.main_title else null end,
                        'title', case when tl.optional_active = 1 then tl.title else null end,
                        'about_title', case when tl.optional_active = 1 then tl.about_title else null end,
                        'details', case when tl.optional_active = 1 then tl.details else null end,
                        'coach_image_url', tl.coach_image_url,
                        'instsuctor_name', tl.instsuctor_name,
                        'biography' , tl.biography,
                        'learning_image_url', tl.learning_image_url,
                        'learning_description', tl.learning_description
                    )
                )
                FROM training_level tl
                WHERE tl.training_program_id = tp.id
            ) AS levels,


            -- schedules
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'slot_id', tst.id,
                        'day_id', tsd.id,
                        'day', tsd.day,
                        'training_level_id', tst.training_level_id,
                        'start_time', tst.start_time,
                        'end_time', tst.end_time
                    )
                )
                FROM training_schedule_time_slots tst
                JOIN training_schedule_days tsd
                    ON tsd.id = tst.training_schedule_days_id
                WHERE tst.trainning_program_id = tp.id
            ) AS schedules

        FROM training_program tp where tp.id = ?`, [id]
    );

    if (!result || result.length === 0) {
        return [];
    }

    return result;
};


exports.ShowTrainingImage = async () =>{
    const [result] = await com.pool.query('select id,main_program_banner_image_url from training_program');

    if(!result)throw new AppError('Show Training Image Error',400);

    return result;
}