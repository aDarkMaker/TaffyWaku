// Voice line manifest: one source of truth for the device lines and the persona copy.

import { promises as fsp } from 'node:fs'
import { EMOTIONS, type Emotion } from './tts'
import { PRESETS, type VoicePreset } from './persona'

export type LineEntry = {
  key: string
  text: string
  comment?: string
  preset?: keyof typeof PRESETS
  emotion?: Emotion
  speed?: number
  pitch?: number
}

export type LineManifest = {
  lines: LineEntry[]
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/

function assertLine(raw: unknown, index: number): LineEntry {
  const line = raw as Partial<LineEntry>
  const label = `lines[${index}]`

  if (typeof line.key !== 'string' || !KEY_PATTERN.test(line.key)) {
    throw new Error(`${label}.key 必须是 snake_case 标识符`)
  }
  if (typeof line.text !== 'string' || !line.text.trim()) {
    throw new Error(`${label}.text 不能为空`)
  }
  if (line.emotion && !EMOTIONS.includes(line.emotion)) {
    throw new Error(`${label}.emotion 非法: ${line.emotion}`)
  }
  if (line.preset && !PRESETS[line.preset]) {
    throw new Error(`${label}.preset 非法: ${line.preset}`)
  }
  return line as LineEntry
}

export async function loadLines(manifestPath: string): Promise<LineEntry[]> {
  const raw = JSON.parse(await fsp.readFile(manifestPath, 'utf8')) as LineManifest
  if (!Array.isArray(raw.lines) || raw.lines.length === 0) {
    throw new Error(`${manifestPath} 中没有 lines 定义`)
  }

  const lines = raw.lines.map(assertLine)
  if (new Set(lines.map((line) => line.key)).size !== lines.length) {
    throw new Error(`${manifestPath} 中存在重复的 key`)
  }
  return lines
}

export function resolvePreset(line: LineEntry): VoicePreset {
  const base = line.preset ? PRESETS[line.preset] : PRESETS.cheerful
  return {
    emotion: line.emotion ?? base.emotion,
    speed: line.speed ?? base.speed,
    pitch: line.pitch ?? base.pitch,
  }
}
