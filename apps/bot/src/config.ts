// Environment driven configuration. Bun loads .env automatically.

import path from 'node:path'

export type BotConfig = {
  onebotUrl: string
  onebotToken?: string
  triggerPrefix: string
  maxTextLength: number
  voiceDir: string
}

const DEFAULT_TRIGGER_PREFIX = 'taffy'
const DEFAULT_MAX_TEXT_LENGTH = 60

function readRequired(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`缺少必需的环境变量 ${name}`)
  }
  return value
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`环境变量 ${name} 必须是正整数`)
  }
  return value
}

export function loadConfig(): BotConfig {
  const onebotToken = process.env.ONEBOT_ACCESS_TOKEN?.trim()
  return {
    onebotUrl: readRequired('ONEBOT_WS_URL'),
    ...(onebotToken ? { onebotToken } : {}),
    triggerPrefix: process.env.BOT_TRIGGER_PREFIX?.trim() || DEFAULT_TRIGGER_PREFIX,
    maxTextLength: readNumber('BOT_MAX_TEXT_LENGTH', DEFAULT_MAX_TEXT_LENGTH),
    voiceDir: path.resolve(process.env.TTS_OUT_DIR?.trim() || 'assets/out'),
  }
}
