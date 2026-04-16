const app = require('./app');
const { env } = require('./src/config/com');
const logger = require('./src/utils/logger');
const uploader = require('@zwehtetpaing55/uploader');

const port = env.port || 4000;

uploader.config({
    baseURL: "http://38.60.216.25:3000/api"
});

app.listen(port,()=>{
    logger.info(`Server is running on port ${port}`);
});