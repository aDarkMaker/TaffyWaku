// Streams PCM16 / 16 kHz / mono WAV files from the SD card into the I2S amplifier.

#pragma once

#include <Arduino.h>

namespace audio {

void begin();
bool play(const char* path);

}  // namespace audio
