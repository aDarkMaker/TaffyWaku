// Command bytes must match the SU-03T configuration in the vendor tool.

#include "voice.h"

#include <Arduino.h>

#include "pins.h"

namespace {

constexpr uint8_t kByteLightOn = 0x01;
constexpr uint8_t kByteLightOff = 0x02;

VoiceCommand decode(uint8_t byte) {
  if (byte == kByteLightOn) return VoiceCommand::lightOn;
  if (byte == kByteLightOff) return VoiceCommand::lightOff;
  return VoiceCommand::none;
}

}  // namespace

namespace voice {

void begin() {
  Serial2.begin(kVoiceBaud, SERIAL_8N1, kPinVoiceRx, kPinVoiceTx);
}

VoiceCommand poll() {
  while (Serial2.available() > 0) {
    const VoiceCommand command = decode(static_cast<uint8_t>(Serial2.read()));
    if (command != VoiceCommand::none) return command;
  }
  return VoiceCommand::none;
}

}  // namespace voice
