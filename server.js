const app = require('./app');
const { env } = require('./src/config/com');
const logger = require('./src/utils/logger');

const port = env.port || 4000;

app.listen(port,()=>{
    logger.info(`Server is running on port ${port}`);
});