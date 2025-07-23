import { createWinstonLogger } from './utils/winston'
import type { CreateLoggerOptions } from './utils/winston'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const options: any = useRuntimeConfig().public.nuxtWinstonLogger
  const logger = createWinstonLogger(
    options
  )
  _nuxtApp.provide(options.name, logger)
})
