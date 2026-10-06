const logger = require("../utils/logger");

exports.errorHandler = (err, req, res, next)=>{
    if (res.headersSent) {
        return next(err);
    }

    logger.error({
        message: err.message,
        stack: err.stack
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.code === 'MISSING_FIELD_NAME') {
        statusCode = 400;
        message = 'Multipart form contains a field without a name. Name the payment-proof file field "image" and remove blank rows.';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        message = err.message;
    } else if (err.message === 'Multipart: Boundary not found') {
        statusCode = 400;
        message = 'Malformed multipart request. Let the client set the Content-Type boundary.';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    })
    
}