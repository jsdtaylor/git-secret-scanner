import * as fs from "fs";
import * as path from "path";
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
const createLogger = (createLogFiles: boolean, outputDir?: string): Logger => {
  const transports: Array<ConsoleTransportInstance | FileTransportInstance> = [
    new winstonTransports.Console({}),
  ];
  const dir = path.resolve(outputDir || ".");
  if (!fs.existsSync(dir)) throw new Error("output directory does not exist");
  if (createLogFiles)
    transports.push(
      new winstonTransports.File({
        filename: `${dir}/gss-${new Date()
          .toISOString()
          .replace(/[-:.]/g, "")}.log`,
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
