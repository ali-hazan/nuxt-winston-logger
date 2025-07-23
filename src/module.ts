import { defineNuxtModule, addPlugin, createResolver, addImports } from '@nuxt/kit'
import { format } from 'winston'
import type { Logform } from 'winston'
import { defu } from 'defu'

// Module options TypeScript interface definition
export interface ModuleOptions {
  name?: string
  directory?: string
  format?: Logform.Format
  filename?: string
  rotationOptions?: {
    datePattern?: string
    maxFiles?: string
    maxSize?: string
    zippedArchive?: boolean
  }
}
const env = process.env.NUXT_ENV || process.env.NODE_ENV || 'development'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-winston-logger',
    configKey: 'nuxtWinstonLogger',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    name: 'logger',
    directory: './logs',
    filename: env === 'production' ? 'app.log' : `app.${env}.log`,
    rotationOptions: undefined,
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    const moduleOptions = defu(
      _nuxt.options.runtimeConfig.public.nuxtWinstonLogger || {},
      { ..._options },
    )
    _nuxt.options.runtimeConfig.public.nuxtWinstonLogger = moduleOptions
    addPlugin({ src: resolver.resolve('./runtime/plugin'), mode: 'server' })
  },

})
