// PPIO MiniMax speech client. Returns a trimmed WAV buffer.

import {
  DEFAULT_SAMPLE_RATE,
  DEFAULT_TRIM_END_MS,
  requireApiToken,
  resolveApiUrl,
  resolveVoiceId,
} from './config'
import { trimWavEnd } from './wav'

export const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'fearful',
  'disgusted',
  'surprised',
  'calm',
  'fluent',
] as const

export type Emotion = (typeof EMOTIONS)[number]

export type VoiceOptions = {
  voiceId?: string
  emotion?: Emotion
  speed?: number
  pitch?: number
  vol?: number
  sampleRate?: number
  trimEndMs?: number
}

type TtsResponse = {
  data?: { audio?: string }
}

export async function generateVoice(text: string, options: VoiceOptions = {}): Promise<Buffer> {
  const {
    voiceId,
    emotion = 'happy',
    speed = 1.05,
    pitch = 1,
    vol = 1,
    sampleRate = DEFAULT_SAMPLE_RATE,
    trimEndMs = DEFAULT_TRIM_END_MS,
  } = options

  const body = JSON.stringify({
    text,
    stream: false,
    audio_setting: {
      format: 'wav',
      bitrate: 128000,
      channel: 1,
      force_cbr: false,
      sample_rate: sampleRate,
    },
    output_format: 'url',
    voice_setting: {
      vol,
      pitch,
      speed,
      voice_id: resolveVoiceId(voiceId),
      emotion,
      latex_read: true,
      text_normalization: true,
    },
    aigc_watermark: true,
    stream_options: { exclude_aggregated_audio: false },
    subtitle_enable: false,
    continuous_sound: true,
    pronunciation_dict: { tone: ['永雏塔菲/taffy'] },
  })

  const response = await fetch(resolveApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requireApiToken()}`,
    },
    body,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`TTS API 失败 HTTP ${response.status}: ${errText}`)
  }

  const data = (await response.json()) as TtsResponse
  const url = data.data?.audio
  if (!url) {
    throw new Error('TTS 响应缺少 audio URL')
  }

  const audioResponse = await fetch(url)
  if (!audioResponse.ok) {
    throw new Error(`下载音频失败 HTTP ${audioResponse.status}`)
  }

  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
  return trimEndMs > 0 ? trimWavEnd(audioBuffer, trimEndMs) : audioBuffer
}
