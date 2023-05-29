import { joinURL, withQuery } from 'ufo'
import type { NitroErrorHandler } from 'nitropack'
import type { H3Error } from 'h3'
import { setResponseHeader, getRequestHeaders } from 'h3'
import { useNitroApp, useRuntimeConfig } from '../node_modules/nitropack/dist/runtime'
import { normalizeError, isJsonRequest } from '../node_modules/nitropack/dist/runtime/utils'

export default <NitroErrorHandler> async function errorhandler (error: H3Error, event) {
  // Parse and normalize error
  const { stack, statusCode, statusMessage, message } = normalizeError(error)

  // Create an error object
  const errorObject = {
    url: event.node.req.url,
    statusCode,
    statusMessage,
    message,
    stack: process.dev && statusCode !== 404
      ? `<pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>`
      : '',
    data: error.data
  }

  // Set response code and message
  event.node.res.statusCode = (errorObject.statusCode !== 200 && errorObject.statusCode) as any as number || 500
  if (errorObject.statusMessage) {
    event.node.res.statusMessage = errorObject.statusMessage
  }
  // Console output
  if (error.unhandled || error.fatal) {
    const tags = [
      '[nuxt]',
      '[request error]',
      error.unhandled && '[unhandled]',
      error.fatal && '[fatal]',
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(' ')
    // console.error(tags, errorObject.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))
  }

  // JSON response
  if (isJsonRequest(event)) {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.end(JSON.stringify(errorObject))
    return
  }

  // HTML response (via SSR)
  const isErrorPage = event.node.req.url?.startsWith('/__nuxt_error')
  const res = !isErrorPage
    ? await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig().app.baseURL, '/__nuxt_error'), errorObject), {
      headers: getRequestHeaders(event) as Record<string, string>,
      redirect: 'manual'
    }).catch(() => null)
    : null

  // Fallback to static rendered error page
  if (!res) {
    const { template } = process.dev
      // @ts-ignore
      ? await import('@nuxt/ui-templates/templates/error-dev.mjs')
      // @ts-ignore
      : await import('@nuxt/ui-templates/templates/error-500.mjs')
    if (process.dev) {
      // TODO: Support `message` in template
      (errorObject as any).description = errorObject.message
    }
    event.node.res.setHeader('Content-Type', 'text/html;charset=UTF-8')
    event.node.res.end(template(errorObject))
    return
  }

  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value)
  }

  if (res.status && res.status !== 200) {
    event.node.res.statusCode = res.status
  }

  if (res.statusText) {
    event.node.res.statusMessage = res.statusText
  }

  event.node.res.end(await res.text())
}
