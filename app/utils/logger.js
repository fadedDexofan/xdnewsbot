const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const DailyRotation = require("winston-daily-rotate-file");

const { printf, timestamp, combine } = format;
const logDir = "logs";

const tsFormat = () => new Date().toLocaleTimeString();
const logFormat = printf((info) => `${info.timestamp} ${info.level}: ${info.message}`);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    new DailyRotation({
      filename: `${logDir}/bot-%DATE%.log`,
      timestamp: tsFormat,
      datePattern: "DD-MM-YY",
      prepend: true,
      level: process.env.NODE_ENV === "development" ? "verbose" : "info",
      maxSize: "5mb",
      maxFiles: "14d",
    }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      timestamp: tsFormat,
      colorize: true,
      level: "info",
    }),
  );
}

module.exports = logger;
