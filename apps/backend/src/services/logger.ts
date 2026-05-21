import winston from "winston";

const isProduction = process.env["NODE_ENV"] === "production";

const devConsole = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.simple());
const defaultFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const handlers: winston.transport[] = [];

if (isProduction) {
    handlers.push(new winston.transports.Console());
} else {
    handlers.push(new winston.transports.Console({ format: devConsole }));

    const storagePath = process.env["STORAGE_PATH"];
    if (storagePath) {
        const logPath = `${storagePath}/logs`;
        handlers.push(
            new winston.transports.File({ filename: `${logPath}/combined.log`, format: defaultFormat }),
            new winston.transports.File({ filename: `${logPath}/error.log`, format: defaultFormat, level: "error" }),
        );
    }
}

export const logger = winston.createLogger({
    level: "info",
    exitOnError: false,
    transports: handlers,
    exceptionHandlers: handlers,
    rejectionHandlers: handlers,
    defaultMeta: {},
});
