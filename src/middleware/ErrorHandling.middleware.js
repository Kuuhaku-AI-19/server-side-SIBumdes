const HttpError = require('../error/HttpError')
const logger = require('../lib/logger')

function errorHandler(error, req, res, next) {
    if (error instanceof HttpError) {
        logger.warn('http.error', { statusCode: error.statusCode, message: error.message });
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
        
        return;
    }
    
    if(process.env.NODE_ENV === "development") {
        if(error instanceof Error) {
            logger.error('unhandled.error', { message: error.message, stack: error.stack });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
        
    }
    
    logger.error('unhandled.error', { message: error.message, stack: error.stack });
    
    return res.status(500).json({
        success: false,
        message: "Server Error"
    })
    
}

module.exports = errorHandler
