import type { Middleware } from 'aurorax'

// Logs inbound message events only; notices and meta events stay silent.
export const logger: Middleware = async (ctx, next) => {
  const { event } = ctx
  if (event.post_type === 'message') {
    const source = event.message_type === 'group' ? `group ${event.group_id}` : 'private'
    console.log(`[bot] <- ${source} user ${event.user_id}: ${event.raw_message}`)
  }
  await next()
}
