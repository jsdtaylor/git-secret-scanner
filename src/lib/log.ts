import {
  createLogger as createWinstonLogger,
  format,
  transports as winstonTransports,
  Logger,
} from "winston";
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from "winston/lib/winston/transports";

const { combine, printf, timestamp } = format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});
const createLogger = (createLogFiles: boolean): Logger => {
  const transports: Array<ConsoleTransportInstance | FileTransportInstance> = [
    new winstonTransports.Console({}),
  ];
  if (createLogFiles)
    transports.push(
      new winstonTransports.File({
        filename: `${new Date().toISOString()}.log`,
        options: { flags: "w" },
      })
    );
  return createWinstonLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), logFormat),
    transports,
  });
};

export { createLogger, Logger };
