const logger = require("../utils/logger");

exports.errorHandler = (err, req, res, next)=>{
    logger.error({
        message: err.message,
        stack: err.stack
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
    })
    
}