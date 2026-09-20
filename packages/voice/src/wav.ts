// WAV container helpers: locate the data chunk and drop trailing silence padding.

export type DataChunk = {
  dataOffset: number
  dataSize: number
}

export function findDataChunk(wavBuffer: Buffer): DataChunk {
  let offset = 12
  while (offset < wavBuffer.length - 8) {
    const chunkId = wavBuffer.toString('ascii', offset, offset + 4)
    const chunkSize = wavBuffer.readUInt32LE(offset + 4)
    if (chunkId === 'data') {
      return { dataOffset: offset + 8, dataSize: chunkSize }
    }
    offset += 8 + chunkSize
    if (chunkSize % 2 !== 0) offset += 1
  }
  throw new Error('找不到 data chunk，不是合法的 WAV 文件')
}

export function trimWavEnd(wavBuffer: Buffer, trimMs: number): Buffer {
  const sampleRate = wavBuffer.readUInt32LE(24)
  const numChannels = wavBuffer.readUInt16LE(22)
  const bitDepth = wavBuffer.readUInt16LE(34)
  const bytesPerSample = (bitDepth / 8) * numChannels
  const bytesPerSecond = sampleRate * bytesPerSample
  const trimBytes = Math.floor((trimMs / 1000) * bytesPerSecond)
  const { dataOffset, dataSize } = findDataChunk(wavBuffer)
  const newDataSize = dataSize - trimBytes
  if (newDataSize <= 0) {
    throw new Error(`trimMs (${trimMs}ms) 超过了音频总时长`)
  }
  const headerPart = wavBuffer.subarray(0, dataOffset)
  const pcmSlice = wavBuffer.subarray(dataOffset, dataOffset + newDataSize)
  const out = Buffer.alloc(headerPart.length + pcmSlice.length)
  headerPart.copy(out, 0)
  pcmSlice.copy(out, headerPart.length)
  out.writeUInt32LE(newDataSize, dataOffset - 4)
  out.writeUInt32LE(out.length - 8, 4)
  return out
}
