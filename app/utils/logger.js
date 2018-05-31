const fs = require("fs");
const { createLogger, format, transports } = require("winston");
const DailyRotation = require("winston-daily-rotate-file");

const {
  combine, colorize, timestamp, printf,
} = format;

const logDir = "logs";

const DEBUG = process.env.NODE_ENV === "development";

const logFormat = printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    new DailyRotation({
      filename: `${logDir}/%DATE%.log`,
      timestamp,
      datePattern: "YYYY-MM-DD",
      prepend: true,
      level: DEBUG ? "verbose" : "info",
      maxSize: "5mb",
      maxFiles: "14d",
    }),
  ],
  exitOnError: false,
});

if (DEBUG) {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
  );
}

module.exports = logger;
