import { promises as fsp } from 'node:fs'
import path from 'node:path'
import type { Middleware, MessageSegmentSend, OnebotEvent } from 'aurorax'
import { PRESETS, generateVoice } from '@taffybot/voice'
import type { BotConfig } from '../config'

type MessageEvent = Extract<OnebotEvent, { post_type: 'message' }>

// Returns the text after the trigger prefix, or null when the message is not addressed to the bot.
function matchTrigger(event: MessageEvent, prefix: string): string | null {
  const raw = event.raw_message.trim()
  const matched = new RegExp(`^${prefix}[\\s,:，：]*`, 'i').exec(raw)
  if (!matched) return null
  return raw.slice(matched[0].length).trim()
}

function buildSegments(filePath: string): MessageSegmentSend[] {
  return [{ type: 'record', data: { file: filePath } }]
}

function buildRequest(event: MessageEvent, segments: MessageSegmentSend[]) {
  if (event.message_type === 'group') {
    return {
      action: 'send_group_msg' as const,
      params: { group_id: event.group_id, message: segments },
    }
  }
  return {
    action: 'send_private_msg' as const,
    params: { user_id: event.user_id, message: segments },
  }
}

// Synthesizes a reply on demand and sends it as a QQ voice message.
export function voiceReply(config: BotConfig): Middleware {
  return async (ctx, next) => {
    const { event } = ctx
    if (event.post_type !== 'message') {
      await next()
      return
    }

    const text = matchTrigger(event, config.triggerPrefix)
    if (!text) {
      await next()
      return
    }
    if (text.length > config.maxTextLength) {
      console.warn(`[bot] text too long (${text.length} > ${config.maxTextLength}), skipped`)
      await next()
      return
    }

    await fsp.mkdir(config.voiceDir, { recursive: true })
    const filePath = path.join(config.voiceDir, `${Date.now()}.wav`)
    const buffer = await generateVoice(text, PRESETS.cheerful)
    await fsp.writeFile(filePath, buffer)
    console.log(`[bot] -> ${text} (${buffer.length} bytes)`)

    ctx.send(buildRequest(event, buildSegments(filePath)))
    await next()
  }
}
