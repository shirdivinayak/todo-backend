const winston = require('winston');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath));

const { applicationlogpath, meteringlogpath, tenant_id, tenant_name } = config;

const applicationLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => {
      return `${info.timestamp}|${info.level.toUpperCase()}|${tenant_name}|${tenant_id}|${info.message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: `${applicationlogpath}/application.log`,
    }),
  ],
});

const meteringLogger = winston.createLogger({
  level: 'METERING',
  levels: {
    METERING: 0
  },
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => {
      return `${info.timestamp}|${info.level.toUpperCase()}|${tenant_name}|${tenant_id}|${info.message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: `${meteringlogpath}/metering.log`,
    }),
  ],
});

function applicationMessage(level, message, email, fileName, functionName) {
  try {
    const logMessage = `${email}|${fileName}|${functionName}|${message}`;
    applicationLogger.log(level, logMessage);
  } catch (error) {
    console.error('Error logging application message:', error.message);
  }
}

function meteringMessage(message, email, fileName, functionName) {
  try {
    const logMessage = `${email}|${fileName}|${functionName}|${message}`;
    meteringLogger.log('METERING', logMessage);
  } catch (error) {
    console.error('Error logging metering message:', error.message);
  }
}

module.exports = {
  applicationMessage,
  meteringMessage
};
