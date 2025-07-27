import type { LogLevel } from './console'
import type { Logger } from './console'

const isBrowser = typeof window !== 'undefined'
let loggerInstance: Logger | null = null

export async function createLogger(options: any): Promise<Logger> {
  // Return cached instance if available
  if (loggerInstance) {
    return loggerInstance
  }

  // Single dynamic import based on environment
  loggerInstance = isBrowser
    ? (await import('./console')).default(options)
    : (await import('./winston')).createWinstonLogger(options)

  return loggerInstance
}