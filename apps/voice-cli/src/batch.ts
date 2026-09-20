// Batch mode emits one <key>.wav per line at the device sample rate, so the firmware stays dumb.
// Per line: trimmed WAV -> linear resample to 16 kHz -> PCM16 downmix.

import { promises as fsp } from 'node:fs'
import path from 'node:path'
import {
  DEVICE_AUDIO,
  findDataChunk,
  generateVoice,
  loadLines,
  resolvePreset,
  type LineEntry,
} from '@taffybot/voice'

function readHeader(buffer: Buffer): {
  sampleRate: number
  channels: number
  bitsPerSample: number
} {
  return {
    sampleRate: buffer.readUInt32LE(24),
    channels: buffer.readUInt16LE(22),
    bitsPerSample: buffer.readUInt16LE(34),
  }
}

function decodePcm16(buffer: Buffer): Int16Array {
  const { dataOffset, dataSize } = findDataChunk(buffer)
  const samples = new Int16Array(Math.floor(dataSize / 2))
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = buffer.readInt16LE(dataOffset + i * 2)
  }
  return samples
}

function toMono(samples: Int16Array, channels: number): Int16Array {
  if (channels === 1) return samples

  const frames = Math.floor(samples.length / channels)
  const mono = new Int16Array(frames)
  for (let frame = 0; frame < frames; frame += 1) {
    let sum = 0
    for (let channel = 0; channel < channels; channel += 1) {
      sum += samples[frame * channels + channel] ?? 0
    }
    mono[frame] = Math.round(sum / channels)
  }
  return mono
}

function resample(samples: Int16Array, fromRate: number, toRate: number): Int16Array {
  if (fromRate === toRate) return samples

  const ratio = toRate / fromRate
  const length = Math.floor(samples.length * ratio)
  const out = new Int16Array(length)
  for (let i = 0; i < length; i += 1) {
    out[i] = samples[Math.min(Math.round(i / ratio), samples.length - 1)] ?? 0
  }
  return out
}

function encodeWav(samples: Int16Array, sampleRate: number): Buffer {
  const { channels, bitsPerSample } = DEVICE_AUDIO
  const blockAlign = (bitsPerSample / 8) * channels
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0, 'ascii')
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8, 'ascii')
  buffer.write('fmt ', 12, 'ascii')
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(channels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * blockAlign, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36, 'ascii')
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(samples[i] ?? 0, 44 + i * 2)
  }
  return buffer
}

async function renderLine(line: LineEntry): Promise<Buffer> {
  const raw = await generateVoice(line.text, resolvePreset(line))
  const { sampleRate, channels, bitsPerSample } = readHeader(raw)
  if (bitsPerSample !== 16) {
    throw new Error(`${line.key}: 只支持 16-bit PCM 输出`)
  }

  const pcm = toMono(decodePcm16(raw), channels)
  const converted = resample(pcm, sampleRate, DEVICE_AUDIO.sampleRate)
  return encodeWav(converted, DEVICE_AUDIO.sampleRate)
}

export async function runBatch(manifestPath: string, outDir: string): Promise<void> {
  const lines = await loadLines(manifestPath)
  await fsp.mkdir(outDir, { recursive: true })

  for (const line of lines) {
    const target = path.join(outDir, `${line.key}.wav`)
    const buffer = await renderLine(line)
    await fsp.writeFile(target, buffer)
    console.log(`[voice] ${line.key} -> ${target} (${buffer.length} bytes)`)
  }

  console.log(`[voice] ${lines.length} line(s) written to ${outDir}`)
}
