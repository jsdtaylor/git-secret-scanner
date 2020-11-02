import * as winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "scan.log",
      format: winston.format.simple(),
      options: { flags: "w" },
    }),
  ],
});

export default logger;
