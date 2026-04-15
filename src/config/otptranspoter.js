const com = require('./com');
const nodemailder = require('nodemailer');


exports.transporter = nodemailder.createTransport({
    service: 'gmail',
    auth: {
        user: com.env.email_user,
        pass: com.env.email_password
    },
});

exports.generateOTP = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

