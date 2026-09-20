import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { generateVoice, type VoicePreset } from '@taffybot/voice'
import { USAGE, parseArgs } from './args'
import { runBatch } from './batch'

function resolveOutDir(): string {
  return path.resolve(process.env.TTS_OUT_DIR?.trim() || 'assets/out')
}

function safeFileName(text: string): string {
  const base = text
    .slice(0, 24)
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  return base || 'output'
}

async function runSingle(
  text: string,
  fileName: string | undefined,
  preset: VoicePreset,
  outDir: string,
): Promise<void> {
  const name = fileName
    ? fileName.endsWith('.wav')
      ? fileName
      : `${fileName}.wav`
    : `${safeFileName(text)}_${Date.now()}.wav`

  await fsp.mkdir(outDir, { recursive: true })
  const target = path.join(outDir, name)
  const buffer = await generateVoice(text, preset)
  await fsp.writeFile(target, buffer)
  console.log(`[voice] ${text} -> ${target} (${buffer.length} bytes)`)
}

async function main(): Promise<void> {
  const mode = parseArgs(process.argv.slice(2))
  const outDir = resolveOutDir()

  if (mode.kind === 'help') {
    console.log(USAGE)
    return
  }
  if (mode.kind === 'batch') {
    await runBatch(mode.manifestPath, outDir)
    return
  }
  await runSingle(mode.text, mode.fileName, mode.preset, outDir)
}

main().catch((error: unknown) => {
  console.error(`[voice] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
