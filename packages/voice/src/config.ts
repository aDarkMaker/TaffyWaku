// Runtime configuration for the TTS provider. Secrets come from the environment only.

export const DEFAULT_API_URL = 'https://api.ppio.com/v3/minimax-speech-2.8-turbo'
export const DEFAULT_VOICE_ID = 'voice_497db616-b807-4baa-8b2a-283c2355b7ad'
export const DEFAULT_TRIM_END_MS = 1000
export const DEFAULT_SAMPLE_RATE = 32000

// Audio contract of the offline device. The firmware parses this format only.
export const DEVICE_AUDIO = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
} as const

export function requireApiToken(): string {
  const token = process.env.PPINFRA_API_TOKEN?.trim()
  if (!token) {
    throw new Error('缺少 PPINFRA_API_TOKEN 环境变量，请先配置后再调用 TTS')
  }
  return token
}

export function resolveVoiceId(override?: string): string {
  return override?.trim() || process.env.TTS_VOICE_ID?.trim() || DEFAULT_VOICE_ID
}

export function resolveApiUrl(): string {
  return process.env.TTS_API_URL?.trim() || DEFAULT_API_URL
}
