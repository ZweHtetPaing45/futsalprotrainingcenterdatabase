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
            html: ` <div style="
    max-width: 400px;
    width: 100%;
    margin: auto;
    background-color: rgb(242, 242, 249);
    padding: 30px;
    border-radius: 20px;
    box-sizing: border-box;
    text-align: center;
">

    <h2 style="color: rgba(0, 89, 255, 0.834);">
        Confirm Your Email
    </h2>

    <p>Hi <strong>Customer</strong>,</p>

    <p>Here's your 6-digit confirmation code:</p>

    <p style="
        color: rgba(0, 89, 255, 0.834);
        letter-spacing: 7px;
        word-break: break-word;
    ">
        <strong style="font-size: 30px;">${otp}</strong>
    </p>

    <p>This code will expire in <strong>5 minutes</strong>.</p>

    <p style="color: rgb(161, 157, 157); font-size: 14px;">
        If you didn't request this, please ignore this email.
    </p>

</div>`
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
            return 'User not found';
        }

        const math = await bcrypt.compare(password,user.password);

        if(!math){
            return 'Invalid password';
        }

        const token = util.generateToken({id : user.id,name: user.name, emailOrphone: emailOrphone});

        return token;

    }
}

module.exports = new Services();