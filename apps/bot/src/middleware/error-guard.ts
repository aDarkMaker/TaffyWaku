import type { Middleware } from 'aurorax'

// Keeps one failing middleware from tearing down the whole pipeline.
export const errorGuard: Middleware = async (_ctx, next) => {
  try {
    await next()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[bot] middleware failed: ${message}`)
  }
}
