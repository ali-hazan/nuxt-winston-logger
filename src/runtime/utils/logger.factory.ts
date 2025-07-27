import type { LogLevel } from './console'
import type { Logger } from './console'

export async function createLogger(options: any): Promise<Logger> {
  if (typeof window !== 'undefined') {
    const { default: createConsoleLogger } = await import('./console')
    return createConsoleLogger(options)
  }
  
  const { createWinstonLogger } = await import('./winston')
  return createWinstonLogger(options)
}