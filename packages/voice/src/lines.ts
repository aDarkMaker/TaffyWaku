// Voice line manifest: one source of truth for the offline device lines and the persona copy.

import { promises as fsp } from 'node:fs'
import { EMOTIONS, type Emotion } from './tts'
import { PRESETS, type VoicePreset } from './persona'

export const DEFAULT_SPIN_MS = 400
export const DEFAULT_COOLDOWN_MS = 800
export const MAX_SPIN_MS = 5000
export const MAX_COOLDOWN_MS = 10000

export type LineEntry = {
  key: string
  text: string
  comment?: string
  preset?: keyof typeof PRESETS
  emotion?: Emotion
  speed?: number
  pitch?: number
  spinMs?: number
  cooldownMs?: number
}

export type LineManifest = {
  lines: LineEntry[]
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/

function assertDuration(value: unknown, label: string, max: number): void {
  if (value === undefined) return
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > max) {
    throw new Error(`${label} 必须是 1 到 ${max} 之间的数值`)
  }
}

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
  assertDuration(line.spinMs, `${label}.spinMs`, MAX_SPIN_MS)
  assertDuration(line.cooldownMs, `${label}.cooldownMs`, MAX_COOLDOWN_MS)
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
