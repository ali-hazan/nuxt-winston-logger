export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

type LogLevels = {
  [key in LogLevel]: number
}

interface LogMessage {
  level: LogLevel | string
  message: string
  timestamp: string
}

interface LoggerOptions {
  level?: LogLevel
  format?: (message: LogMessage) => string
}

export interface Logger {
  error: (...args: any[]) => void
  warn: (...args: any[]) => void
  info: (...args: any[]) => void
  http: (...args: any[]) => void
  verbose: (...args: any[]) => void
  debug: (...args: any[]) => void
  silly: (...args: any[]) => void
  log: (level: string, ...args: any[]) => void
}

const levels: LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
} as const

const interpolate = (format: string, ...args: any[]): string => {
  let i = 0
  return format.replace(/%[sdjifoO%]/g, (match: string) => {
    if (match === '%%') return '%'
    if (i >= args.length) return match
    const value = args[i++]
    switch (match) {
      case '%s': return String(value)
      case '%d': return Number(value).toString()
      case '%i': return Math.floor(Number(value)).toString()
      case '%f': return Number(value).toString()
      case '%j':
        try {
          return JSON.stringify(value)
        } catch {
          return '[Circular]'
        }
      case '%o':
      case '%O':
        try {
          return JSON.stringify(value, null, 2)
        } catch {
          return '[Circular]'
        }
      default: return match
    }
  })
}

const format = (...args: any[]): string => {
  if (typeof args[0] === 'string' && args[0].includes('%')) {
    return interpolate(args[0], ...args.slice(1))
  }

  return args.map(arg => {
    if (typeof arg === 'string') return arg
    if (arg === null) return 'null'
    if (arg === undefined) return 'undefined'
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg)
      } catch {
        return '[Circular]'
      }
    }
    return String(arg)
  }).join(' ')
}

const defaultFormatter = ({ level, message, timestamp }: LogMessage): string =>
  `${timestamp} [${level.toUpperCase()}] ${message}`

function createLogger(options: LoggerOptions = {}): Logger {
  let currentLevel: LogLevel = options.level || 'info'
  const formatter = options.format || defaultFormatter

  const getCurrentLevelIndex = (): number => levels[currentLevel]

  const formatMessage = (level: LogLevel | string, args: any[]): string => {
    const message = format(...args)
    return formatter({
      level,
      message,
      timestamp: new Date().toISOString()
    })
  }

  const logInstance = {} as Logger

  Object.keys(levels).forEach((level) => {
    const typedLevel = level as LogLevel
    logInstance[typedLevel] = (...args: any[]): void => {
      if (levels[typedLevel] <= getCurrentLevelIndex()) {
        const formatted = formatMessage(typedLevel, args)
        switch (typedLevel) {
          case 'error':
            console.error(formatted)
            break
          case 'warn':
            console.warn(formatted)
            break
          default:
            console.log(formatted)
        }
      }
    }
  })

  logInstance.log = (level: string, ...args: any[]): void => {
    if (level in logInstance) {
      (logInstance[level as LogLevel])(...args)
    } else {
      console.log(formatMessage('log', args))
    }
  }

  return logInstance
}

export default createLogger