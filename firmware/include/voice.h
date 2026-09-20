// SU-03T offline voice module on UART2. One command byte per recognized phrase.

#pragma once

#include <cstdint>

enum class VoiceCommand : uint8_t {
  none,
  lightOn,
  lightOff,
};

namespace voice {

void begin();
VoiceCommand poll();

}  // namespace voice
