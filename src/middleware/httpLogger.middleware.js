'use strict';
const morgan = require('morgan');
const logger = require('../lib/logger');

const stream = {
  write: (message) => logger.http(message.trim()),
};

const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

module.exports = httpLogger;
