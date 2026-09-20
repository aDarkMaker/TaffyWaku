// Servo arm geometry. Calibrate these three angles on the bench before mounting.
// Neutral parks the arm clear of the rocker so the switch can still be used by hand.

#include "flipper.h"

#include <Arduino.h>
#include <Servo.h>

#include "pins.h"

namespace {

constexpr uint8_t kAngleNeutral = 90;
constexpr uint8_t kAnglePressUp = 35;
constexpr uint8_t kAnglePressDown = 145;
constexpr uint16_t kReleaseMs = 250;

Servo g_servo;

void moveTo(uint8_t angle, uint16_t holdMs) {
  g_servo.write(angle);
  delay(holdMs);
}

}  // namespace

namespace flipper {

void begin() {
  g_servo.attach(kPinServo);
  moveTo(kAngleNeutral, kReleaseMs);
}

void press(SwitchSide side, uint16_t holdMs) {
  moveTo(side == SwitchSide::up ? kAnglePressUp : kAnglePressDown, holdMs);
  moveTo(kAngleNeutral, kReleaseMs);
}

}  // namespace flipper
