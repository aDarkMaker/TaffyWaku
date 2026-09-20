// Debounced trigger input: the button fires on press, the shake sensor on level change.

#include "trigger.h"

#include <Arduino.h>

#include "pins.h"

namespace {

constexpr uint32_t kDebounceMs = 50;
constexpr uint32_t kShakeHoldMs = 80;

uint32_t g_lastShakeMs = 0;

}  // namespace

namespace trigger {

void begin() {
  pinMode(kPinButton, INPUT_PULLUP);
  pinMode(kPinShakeSensor, INPUT);
}

bool polled() {
  if (digitalRead(kPinButton) == LOW) {
    delay(kDebounceMs);
    if (digitalRead(kPinButton) == LOW) {
      while (digitalRead(kPinButton) == LOW) {
        delay(10);
      }
      return true;
    }
  }

  if (digitalRead(kPinShakeSensor) == HIGH) {
    const uint32_t now = millis();
    if (now - g_lastShakeMs > kShakeHoldMs) {
      g_lastShakeMs = now;
      return true;
    }
  }
  return false;
}

}  // namespace trigger
