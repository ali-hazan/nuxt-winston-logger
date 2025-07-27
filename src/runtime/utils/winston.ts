import * as winston from 'winston'
import path from 'path'
import fs from 'fs'
import DailyRotateFile from 'winston-daily-rotate-file'
import type { LogLevel } from '../../module'
const { createLogger, transports } = winston

export interface CreateLoggerOptions {
    directory: string
    format: winston.Logform.Format
    filename: string
    keepSeparateFiles?: LogLevel[]
    rotationOptions?: {
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
    keepSeparateFiles,
    rotationOptions,
}: CreateLoggerOptions): winston.Logger {
    if (typeof window !== 'undefined') {
        throw new Error('Winston logger should not be used on client side')
    }

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

    const env = process.env.NUXT_ENV || process.env.NODE_ENV || 'development'
    const defaultFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`
        )
    )
    const loggerFormat = format ?? defaultFormat

    // Create base file transport
    const fileTransport = new DailyRotateFile({
        filename: path.join(directory, filename.replace(/\.log$/, '') + '-%DATE%.log'),
        ...finalRotationOptions,
    })

    const logTransports: winston.transport[] = [fileTransport]

    // Only create level-specific transports if logLevels is provided and not empty
    if (keepSeparateFiles && keepSeparateFiles.length > 0) {
        keepSeparateFiles.forEach(level => {
            logTransports.push(
                new DailyRotateFile({
                    filename: path.join(directory, `${level}-%DATE%.log`),
                    level,
                    ...finalRotationOptions,
                })
            )
        })
    }

    // Add console transport in non-production
    if (env !== 'production') {
        logTransports.push(new transports.Console())
    }

    return createLogger({
        level: env === 'production' ? 'info' : 'debug',
        format: loggerFormat,
        transports: logTransports,
    })
}