'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const jsonFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  format.errors({ stack: true }),
  format.json()
);

const makeRotating = (filename, level) =>
  new transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    level,
    format: jsonFormat,
    auditFile: path.join(LOG_DIR, `.${filename}-audit.json`),
  });

const logger = createLogger({
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  level: process.env.NODE_ENV === 'production' ? 'http' : 'debug',
  transports: [
    makeRotating('combined', 'debug'),
    makeRotating('error', 'error'),
    makeRotating('http', 'http'),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `${timestamp} [${level}] ${message}${metaStr}`;
        })
      ),
    })
  );
}

module.exports = logger;
