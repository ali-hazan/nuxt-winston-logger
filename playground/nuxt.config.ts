export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtWinstonLogger: {
    keepSeparateFiles: ['info', 'warn', 'error', 'debug'],
  },
  devtools: { enabled: true },
})
