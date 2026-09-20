// Streaming WAV playback: 16-bit PCM only, data chunk read straight into I2S.

#include "audio_player.h"

#include <Arduino.h>
#include <SD.h>
#include <driver/i2s_std.h>

#include "pins.h"

namespace {

constexpr uint32_t kSampleRate = 16000;
constexpr uint8_t kBitsPerSample = 16;
constexpr uint8_t kChannels = 1;

i2s_chan_handle_t g_txChannel = nullptr;
File g_file;

struct WavFormat {
  uint32_t sampleRate;
  uint16_t channels;
  uint16_t bitsPerSample;
  uint32_t dataSize;
};

uint16_t readU16(const uint8_t* buffer) {
  return static_cast<uint16_t>(buffer[0] | (buffer[1] << 8));
}

uint32_t readU32(const uint8_t* buffer) {
  return static_cast<uint32_t>(buffer[0]) | (static_cast<uint32_t>(buffer[1]) << 8) |
         (static_cast<uint32_t>(buffer[2]) << 16) | (static_cast<uint32_t>(buffer[3]) << 24);
}

bool readHeader(WavFormat& format) {
  uint8_t header[12];
  if (g_file.read(header, sizeof(header)) != sizeof(header)) return false;
  if (memcmp(header, "RIFF", 4) != 0 || memcmp(header + 8, "WAVE", 4) != 0) return false;

  while (true) {
    uint8_t chunk[8];
    if (g_file.read(chunk, sizeof(chunk)) != sizeof(chunk)) return false;

    const uint32_t size = readU32(chunk + 4);
    uint32_t skip = size;

    if (memcmp(chunk, "fmt ", 4) == 0) {
      uint8_t fmt[16];
      if (size < sizeof(fmt) || g_file.read(fmt, sizeof(fmt)) != sizeof(fmt)) return false;
      if (readU16(fmt) != 1) return false;  // PCM only
      format.channels = readU16(fmt + 2);
      format.sampleRate = readU32(fmt + 4);
      format.bitsPerSample = readU16(fmt + 14);
      skip = size - sizeof(fmt);
    } else if (memcmp(chunk, "data", 4) == 0) {
      format.dataSize = size;
      return true;
    }

    if (size % 2 != 0) skip += 1;  // chunks are word aligned
    g_file.seek(g_file.position() + skip);
  }
}

bool formatSupported(const WavFormat& format) {
  return format.channels == kChannels && format.bitsPerSample == kBitsPerSample &&
         format.sampleRate == kSampleRate;
}

bool installChannel(uint32_t sampleRate) {
  i2s_chan_config_t channelConfig = I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_AUTO, I2S_ROLE_MASTER);
  if (i2s_new_channel(&channelConfig, &g_txChannel, nullptr) != ESP_OK) return false;

  i2s_std_config_t stdConfig = {
      .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(sampleRate),
      .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_MONO),
      .gpio_cfg =
          {
              .mclk = I2S_GPIO_UNUSED,
              .bclk = static_cast<gpio_num_t>(kPinI2sBclk),
              .ws = static_cast<gpio_num_t>(kPinI2sLrc),
              .dout = static_cast<gpio_num_t>(kPinI2sDin),
              .din = I2S_GPIO_UNUSED,
              .invert_flags = {},
          },
  };
  if (i2s_channel_init_std_mode(g_txChannel, &stdConfig) != ESP_OK) return false;
  return i2s_channel_enable(g_txChannel) == ESP_OK;
}

void pumpData(uint32_t dataSize) {
  static uint8_t buffer[512];
  uint32_t remaining = dataSize;

  while (remaining > 0) {
    const size_t wanted = remaining < sizeof(buffer) ? remaining : sizeof(buffer);
    const size_t read = g_file.read(buffer, wanted);
    if (read == 0) break;

    size_t written = 0;
    i2s_channel_write(g_txChannel, buffer, read, &written, portMAX_DELAY);
    remaining -= read;
  }
}

}  // namespace

namespace audio {

void begin() {
  if (g_txChannel != nullptr) return;
  if (!installChannel(kSampleRate)) {
    Serial.println("[audio] i2s init failed");
  }
}

bool play(const char* path) {
  if (g_txChannel == nullptr) return false;
  if (!SD.exists(path)) return false;

  g_file = SD.open(path, FILE_READ);
  if (!g_file) return false;

  WavFormat format{};
  const bool valid = readHeader(format) && formatSupported(format);
  if (valid) {
    pumpData(format.dataSize);
  } else {
    Serial.printf("[audio] unsupported wav: %s\n", path);
  }

  g_file.close();
  return valid;
}

}  // namespace audio
