import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createLogger } from './utils/logger.factory'

export default defineNuxtPlugin(async (nuxtApp) => {
  const options = useRuntimeConfig().public.nuxtWinstonLogger
  const logger = await createLogger(options)

  return {
    provide: {
      logger
    }
  }
})