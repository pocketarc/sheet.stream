import winston from "winston";

const logPath = process.env["STORAGE_PATH"] + "/logs";
const isProduction = process.env["NODE_ENV"] === "production";

const devConsole = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.simple());
const defaultFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const handlers = isProduction
    ? [new winston.transports.Console()]
    : [
          new winston.transports.Console({
              format: devConsole,
          }),
          new winston.transports.File({ filename: `${logPath}/combined.log`, format: defaultFormat }),
          new winston.transports.File({
              filename: `${logPath}/error.log`,
              format: defaultFormat,
              level: "error",
          }),
      ];

export const logger = winston.createLogger({
    level: isProduction ? "info" : "info",
    exitOnError: false,
    transports: handlers,
    exceptionHandlers: handlers,
    rejectionHandlers: handlers,
    defaultMeta: {},
});
