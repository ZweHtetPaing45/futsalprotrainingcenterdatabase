const repo = require('./auth.repositories');
const util = require('../../../utils/tokengenerate');
const AppError = require('../../../utils/AppError');
const bcrypt = require('bcrypt');

class Services {


    async createUser(name,email,phone,dateOfBirth,password,image_url){

        const exit = await repo.findUser(email,phone);

        console.log(exit);

        if(exit)throw new AppError('User already exist', 400);



        const salt = await bcrypt.genSalt(12);

        const hashpassword = await bcrypt.hash(password,salt);

        password = hashpassword;
        
        const result = await repo.createUser(name,email,phone,dateOfBirth,password,image_url);

        if(result){
            const token = util.generateToken({name,email,phone});
            return token;
        }else{
            throw new AppError('User creation failed', 500);
        }

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

        const token = util.generateToken({name: user.name, emailOrphone: emailOrphone});

        return token;

    }
}

module.exports = new Services();