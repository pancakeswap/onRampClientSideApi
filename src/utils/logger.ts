import chalk from "chalk";
import winston from "winston";

export const createLogger = () => {
    return winston.createLogger({
        level: "debug",
        defaultMeta: {},
        transports: [
            // Write debug and up logs to the console and the debug log file.
            new winston.transports.Console({
                level: "debug",
                format: winston.format.combine(
                    winston.format.cli(),
                    winston.format.simple(),
                ),
            }),
            new winston.transports.File({
                filename: '../config/log.txt',
                dirname: '../config',
                level: "debug",
                format: winston.format.combine(
                    winston.format.uncolorize(),
                    winston.format.simple(),
                ),
            }),

            // Write error and up logs to the error log file.
            new winston.transports.File({
                filename: '../config/error.txt',
                dirname: '../config/',
                level: "error",
                format: winston.format.combine(
                    winston.format.uncolorize(),
                    winston.format.simple(),
                ),
            }),
        ],
    });
};

const color =
    (colorEscapeCode: string) =>
    (...params: any[]) =>
        `${colorEscapeCode}${params.map(String).join(" ")}\x1b[0m`;

export const colors = chalk;
