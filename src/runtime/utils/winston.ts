import * as winston from 'winston'
import path from 'path'
import fs from 'fs'
import DailyRotateFile from 'winston-daily-rotate-file'
const { createLogger, transports } = winston;

export interface CreateLoggerOptions {
    directory: string
    format: winston.Logform.Format
    filename: string
    rotationOptions: {
        datePattern: string
        maxFiles: string
        maxSize: string
        zippedArchive: boolean
    }
}

export function createWinstonLogger({
    directory,
    format,
    filename,
    rotationOptions,
}: CreateLoggerOptions): winston.Logger {

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true })
    }

    const defaultRotationOptions = {
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        maxSize: '20m',
        zippedArchive: true,
    }
    const finalRotationOptions = { ...defaultRotationOptions, ...rotationOptions }

    const fileTransport = new DailyRotateFile({
        filename: path.join(directory, filename.replace(/\.log$/, '') + '-%DATE%.log'),
        ...finalRotationOptions,
    })

    const env = process.env.NUXT_ENV || process.env.NODE_ENV || 'development'
    const defaultFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`
        )
    )

    const loggerFormat = format ?? defaultFormat
    return createLogger({
        level: env === 'production' ? 'info' : 'debug',
        format: loggerFormat,
        transports: [
            fileTransport,
            new transports.Console(),
        ],
    })
}