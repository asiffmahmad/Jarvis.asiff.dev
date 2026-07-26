import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tts-agent' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'storage/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'storage/combined.log' })
  ],
});

export default logger;
