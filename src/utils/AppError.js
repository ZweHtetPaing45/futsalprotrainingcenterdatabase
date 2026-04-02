const logger = require("./logger");

class AppError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        
        logger.error({
            message: this.message,       
            stack: this.stack
        });
    }
}

module.exports = AppError;