const com = require('../../../config/com');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/logger');


exports.createUser = async (name,email,phone,dateOfBirth,password,image_url) => {

        const [resultUserId] = await com.pool.query('insert into createuser(name,email,phone,dateOfBirth,password,image_url) values(?,?,?,?,?,?)',[name,email,phone,dateOfBirth,password,image_url]);

        if(!resultUserId)throw new AppError('resultUserId error',400);

        const id = resultUserId.insertId;

        console.log('resutlUserId',id);

        return id;    
}

exports.findUserId = async (id)=>{

    const result = await com.pool.query('select * from createuser where id = ?',[id]);

    return result[0];

}

exports.findUsername = async (name)=>{
    try{
        const result = await com.pool.query('select * from createuser where name = ?',[name]);

        return result[0];

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to create user',500);
    }
}

exports.findUser = async (email,phone)=>{
    try{

        const result = await com.pool.query('select * from createuser where email = ? or phone = ?',[email,phone]);

        if(result[0].length === 0){
            return false;
        }else{
            return true;
        }

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to find user',500);
    }
}

exports.emaliOrPhoneUserfind = async (emailOrphone)=>{
    try{

        if(emailOrphone.includes('@')){
            const result = await com.pool.query('select id,name,password from createuser where email = ?',[emailOrphone])

            if(result[0].length === 0){
                return false;
            }else{
                return {
                    result: true,
                    id : result[0][0].id,
                    password: result[0][0].password,
                    name: result[0][0].name
                };
            }
        }else{
            const result = await com.pool.query('select id,name,password from createuser where phone = ?',[emailOrphone])

            if(result[0].length === 0){
                return false;
            }else{
                return {
                    result: true,
                    id : result[0][0].id,
                    password: result[0][0].password,
                    name: result[0][0].name
                };
            }
        }

    }catch(error){
        logger.error({
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Failed to find user',500);
    }
}