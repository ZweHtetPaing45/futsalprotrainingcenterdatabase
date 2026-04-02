const {createLogger,format, transports} = require('winston');
const env = require('../config/env');

const path = require('path');

const logger = createLogger({
    level: env.node_env === 'DEVELOPMENT' ? 'debug' : 'info',

    format: format.combine(
        format.colorize(),
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.json(),
        format.printf(({timestamp, level, message})=>{
            return `${timestamp} ${level}:: ${message}`;
        })
    ),

    transports: [
        new transports.File({filename: path.join('logs', 'error.log'),level: 'error'}),
        new transports.File({filename: path.join('logs', 'combined.log')}),
        new transports.Console()
    ]
});

module.exports = logger;