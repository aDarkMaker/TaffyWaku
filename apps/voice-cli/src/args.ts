import { EMOTIONS, PRESETS, type Emotion, type VoicePreset } from '@taffybot/voice'

export type CliMode =
  | { kind: 'single'; text: string; fileName?: string; preset: VoicePreset }
  | { kind: 'batch'; manifestPath: string }
  | { kind: 'help' }

const USAGE = `永雏塔菲语音生成工具

用法:
  taffy-voice <文本> [文件名.wav] [preset|emotion]   生成单条语音
  taffy-voice --batch <lines.json>                   批量生成外设语音包
  taffy-voice --help                                 显示帮助

preset:  ${Object.keys(PRESETS).join(' | ')}
emotion: ${EMOTIONS.join(' | ')}

环境变量:
  PPINFRA_API_TOKEN  TTS 服务令牌(必需)
  TTS_VOICE_ID       音色 ID(可选)
  TTS_API_URL        TTS 接口地址(可选)
  TTS_OUT_DIR        输出目录, 默认 assets/out`

export { USAGE }

function toPreset(raw?: string): VoicePreset {
  if (!raw) return PRESETS.cheerful

  const preset = PRESETS[raw as keyof typeof PRESETS]
  if (preset) return preset

  if (!EMOTIONS.includes(raw as Emotion)) {
    throw new Error(`未知 preset/emotion: ${raw}`)
  }
  return { emotion: raw as Emotion, speed: 1.05, pitch: 1 }
}

export function parseArgs(argv: string[]): CliMode {
  const [first, ...rest] = argv
  if (!first || first === '--help' || first === '-h') {
    return { kind: 'help' }
  }

  if (first === '--batch') {
    const manifestPath = rest[0]?.trim()
    if (!manifestPath) {
      throw new Error('--batch 需要指定 lines.json 路径')
    }
    return { kind: 'batch', manifestPath }
  }

  const fileName = rest[0]?.trim()
  return {
    kind: 'single',
    text: first.trim(),
    ...(fileName ? { fileName } : {}),
    preset: toPreset(rest[1]?.trim()),
  }
}
