require('dotenv').config();

module.exports ={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    jwt_secret: process.env.JWT_SECRET_KEY,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    port: process.env.PORT,
    cloud_name: process.env.CLOUD_NAME,
    cloud_api_key: process.env.CLOUD_API_KEY,
    cloud_api_secret: process.env.CLOUD_API_SECRET,
    email_user: process.env.EMAIL_USER,
    email_password: process.env.EMAIL_PASS
}