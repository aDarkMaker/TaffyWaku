// Boot entry: trigger -> pick a line -> play audio with motor and LED feedback.

#include <Arduino.h>
#include <SD.h>
#include <SPI.h>

#include "audio_player.h"
#include "effects.h"
#include "lines.gen.h"
#include "motion.h"
#include "pins.h"
#include "trigger.h"

namespace {

constexpr uint16_t kBreathPeriodMs = 1200;
constexpr uint16_t kLoopTickMs = 20;
constexpr uint32_t kSdFrequencyHz = 4000000;

bool g_storageReady = false;
uint32_t g_lastTriggerMs = 0;
size_t g_lineIndex = 0;

void initStorage() {
  g_storageReady = SD.begin(kPinSdCs, SPI, kSdFrequencyHz);
  if (!g_storageReady) {
    Serial.println("[main] sd mount failed");
  }
}

void runLine(const DeviceLine& line) {
  const uint32_t now = millis();
  if (now - g_lastTriggerMs < line.cooldownMs) return;
  g_lastTriggerMs = now;

  effects::flash(255, 120, 200, 80);
  motion::spin(line.spinMs);
  if (g_storageReady) {
    audio::play(line.file);
  }
}

}  // namespace

void setup() {
  Serial.begin(115200);
  audio::begin();
  effects::begin();
  motion::begin();
  trigger::begin();
  initStorage();
  Serial.printf("[main] %u line(s) loaded\n", static_cast<unsigned>(kDeviceLineCount));
}

void loop() {
  effects::breathe(kBreathPeriodMs);
  delay(kLoopTickMs);
  if (!trigger::polled()) return;

  runLine(kDeviceLines[g_lineIndex]);
  g_lineIndex = (g_lineIndex + 1) % kDeviceLineCount;
}
