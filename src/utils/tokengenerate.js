const jwt = require('jsonwebtoken');
const com = require('../config/com');

exports.generateToken = (payload)=>{
    return jwt.sign(payload, com.env.jwt_secret, { expiresIn: com.env.jwt_expires_in });
}

exports.verifyToken = (token)=>{
    return jwt.verify(token, com.env.jwt_secret);
}