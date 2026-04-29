const repo = require('./auth.repositories');
const util = require('../../../utils/tokengenerate');
const AppError = require('../../../utils/AppError');
const bcrypt = require('bcrypt');
const {transporter, generateOTP} = require('../../../config/otptranspoter');
const com = require('../../../config/com');


const otpStore = {};


class Services {

    async createUser(name,email,phone,dateOfBirth,password,image_url){

        const exit = await repo.findUser(email,phone);

        console.log(exit);

        if(exit)throw new AppError('User already exist', 400);

        const salt = await bcrypt.genSalt(12);

        const hashpassword = await bcrypt.hash(password,salt);

        password = hashpassword;

        const otp = generateOTP();
        console.log('OTP:',otp);

        const tempToken = util.generateToken({name,email,phone});



        otpStore[tempToken]= {
            name,
            email,
            phone,
            dateOfBirth,
            password,
            image_url,
            otp,
            expire: Date.now() + 5 * 60 * 1000
        };

        console.log('otpStore',otpStore);

        await transporter.sendMail({
            from: com.env.email_user,
            to: email,
            subject: 'OTP Verification',
            html: `<h1>POS OTP is ${otp}</h1>`
        })

        return {
            message: "OTP sent",
            tempToken
        }
        
        // const result = await repo.createUser(name,email,phone,dateOfBirth,password,image_url);

        // if(result){
        //     const token = util.generateToken({name,email,phone});
        //     return token;
        // }else{
        //     throw new AppError('User creation failed', 500);
        // }

    }

    async verifyOtp(tempToken,otp){

        const record = otpStore[tempToken];

        console.log("Record",record);

        if(!record)throw new AppError('Invalid session',400);

        if(Date.now()>record.expire){
            throw new AppError('OTP expired',400);
        }

        if(record.otp !== otp){
            throw new AppError('Invalid OTP',400);
        }

        const result = await repo.createUser(record.name,record.email,record.phone,record.dateOfBirth,record.password,record.image_url);

        console.log('Result Id',result);

        if(!result)throw new AppError('User creation failed', 500);

        const token = util.generateToken({id: result,name: record.name, email: record.email, phone: record.phone});

        delete otpStore[tempToken];

        return token; 

    }


    async loginUser(emailOrphone,password){

        const user = await repo.emaliOrPhoneUserfind(emailOrphone);

        if(!user){
            throw new AppError('User not found', 404);
        }

        const math = await bcrypt.compare(password,user.password);

        if(!math){
            throw new Error('Invalid password');
        }

        const token = util.generateToken({id : user.id,name: user.name, emailOrphone: emailOrphone});

        return token;

    }
}

module.exports = new Services();