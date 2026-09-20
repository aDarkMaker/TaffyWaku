// Boot entry: voice command -> flip the rocker switch -> play the matching line.

#include <Arduino.h>
#include <SD.h>
#include <SPI.h>

#include "audio_player.h"
#include "effects.h"
#include "flipper.h"
#include "lines.gen.h"
#include "pins.h"
#include "voice.h"

namespace {

constexpr uint32_t kSdFrequencyHz = 4000000;
constexpr uint16_t kServoHoldMs = 350;
constexpr uint16_t kCommandCooldownMs = 1500;
constexpr uint16_t kLedStepMs = 20;

bool g_storageReady = false;
uint32_t g_lastCommandMs = 0;

const DeviceLine* findLine(const char* key) {
  for (size_t i = 0; i < kDeviceLineCount; ++i) {
    if (strcmp(kDeviceLines[i].key, key) == 0) return &kDeviceLines[i];
  }
  return nullptr;
}

void playLine(const char* key) {
  if (!g_storageReady) return;
  const DeviceLine* line = findLine(key);
  if (line != nullptr) audio::play(line->file);
}

void initStorage() {
  g_storageReady = SD.begin(kPinSdCs, SPI, kSdFrequencyHz);
  if (!g_storageReady) {
    Serial.println("[main] sd mount failed");
  }
}

void handleCommand(VoiceCommand command) {
  const uint32_t now = millis();
  if (now - g_lastCommandMs < kCommandCooldownMs) return;
  g_lastCommandMs = now;

  if (command == VoiceCommand::lightOff) {
    effects::flash(255, 120, 200, 80);
    flipper::press(SwitchSide::down, kServoHoldMs);
    playLine("light_off");
  } else if (command == VoiceCommand::lightOn) {
    effects::flash(255, 220, 120, 80);
    flipper::press(SwitchSide::up, kServoHoldMs);
    playLine("light_on");
  }
}

}  // namespace

void setup() {
  Serial.begin(115200);
  audio::begin();
  effects::begin();
  flipper::begin();
  voice::begin();
  initStorage();
  Serial.printf("[main] %u line(s) loaded\n", static_cast<unsigned>(kDeviceLineCount));
}

void loop() {
  const VoiceCommand command = voice::poll();
  if (command != VoiceCommand::none) {
    handleCommand(command);
  } else {
    effects::idle();
  }
  delay(kLedStepMs);
}
