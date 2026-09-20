export { generateVoice, EMOTIONS, type Emotion, type VoiceOptions } from './tts'
export { trimWavEnd, findDataChunk, type DataChunk } from './wav'
export { PERSONA, PRESETS, type PresetName, type VoicePreset } from './persona'
export {
  loadLines,
  resolvePreset,
  DEFAULT_SPIN_MS,
  DEFAULT_COOLDOWN_MS,
  MAX_SPIN_MS,
  MAX_COOLDOWN_MS,
  type LineEntry,
  type LineManifest,
} from './lines'
export {
  DEFAULT_API_URL,
  DEFAULT_VOICE_ID,
  DEFAULT_TRIM_END_MS,
  DEFAULT_SAMPLE_RATE,
} from './config'
export { DEVICE_AUDIO } from './config'
