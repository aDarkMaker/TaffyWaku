// Shared persona presets. The device uses the offline lines, the bot speaks freely.

export type VoicePreset = {
  emotion: 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'calm' | 'fluent'
  speed: number
  pitch: number
}

export const PERSONA = {
  name: 'taffy',
  displayName: '永雏塔菲',
  pronunciation: { tone: ['永雏塔菲/taffy'] },
} as const

export const PRESETS: Record<'cheerful' | 'gentle' | 'excited' | 'sulky', VoicePreset> = {
  cheerful: { emotion: 'happy', speed: 1.08, pitch: 2 },
  gentle: { emotion: 'calm', speed: 0.95, pitch: 1 },
  excited: { emotion: 'surprised', speed: 1.15, pitch: 3 },
  sulky: { emotion: 'sad', speed: 0.95, pitch: 0 },
}

export type PresetName = keyof typeof PRESETS
