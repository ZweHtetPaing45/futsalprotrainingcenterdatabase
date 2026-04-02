const cloudinary = require('cloudinary').v2;
const com = require('./com');

cloudinary.config({
    cloud_name: com.env.cloud_name,
    api_key: com.env.cloud_api_key,
    api_secret: com.env.cloud_api_secret
});

module.exports = cloudinary;