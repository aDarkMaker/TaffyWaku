// Copies generated voice assets into firmware/data, enforcing the device audio contract.

import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { DEVICE_AUDIO, findDataChunk, loadLines } from '@taffybot/voice'

const MANIFEST = path.resolve('hardware/lines.json')
const SOURCE_DIR = path.resolve(process.env.TTS_OUT_DIR?.trim() || 'assets/out')
const TARGET_DIR = path.resolve('firmware/data')

function assertDeviceFormat(buffer: Buffer, key: string): void {
  findDataChunk(buffer)
  const sampleRate = buffer.readUInt32LE(24)
  const channels = buffer.readUInt16LE(22)
  const bitsPerSample = buffer.readUInt16LE(34)

  if (
    sampleRate !== DEVICE_AUDIO.sampleRate ||
    channels !== DEVICE_AUDIO.channels ||
    bitsPerSample !== DEVICE_AUDIO.bitsPerSample
  ) {
    throw new Error(
      `${key}.wav 不符合设备音频规格: 期望 ${DEVICE_AUDIO.sampleRate}Hz/${DEVICE_AUDIO.channels}ch/` +
        `${DEVICE_AUDIO.bitsPerSample}bit, 实际 ${sampleRate}Hz/${channels}ch/${bitsPerSample}bit`,
    )
  }
}

async function main(): Promise<void> {
  const lines = await loadLines(MANIFEST)
  await fsp.mkdir(TARGET_DIR, { recursive: true })

  for (const line of lines) {
    const source = path.join(SOURCE_DIR, `${line.key}.wav`)
    let buffer: Buffer
    try {
      buffer = await fsp.readFile(source)
    } catch {
      throw new Error(`缺少 ${source}，请先执行 bun run tts:batch`)
    }

    assertDeviceFormat(buffer, line.key)
    await fsp.writeFile(path.join(TARGET_DIR, `${line.key}.wav`), buffer)
    console.log(`[sync] ${line.key}.wav -> ${TARGET_DIR}`)
  }

  console.log(`[sync] ${lines.length} file(s) ready, copy firmware/data/*.wav to the SD card root`)
}

main().catch((error: unknown) => {
  console.error(`[sync] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
