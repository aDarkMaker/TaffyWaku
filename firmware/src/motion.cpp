// Vibration motor pulse with a blocking delay, no timer dependency.

#include "motion.h"

#include <Arduino.h>

#include "pins.h"

namespace motion {

void begin() {
  pinMode(kPinMotorIn1, OUTPUT);
  pinMode(kPinMotorIn2, OUTPUT);
  digitalWrite(kPinMotorIn1, LOW);
  digitalWrite(kPinMotorIn2, LOW);
}

void spin(uint16_t milliseconds) {
  digitalWrite(kPinMotorIn1, HIGH);
  digitalWrite(kPinMotorIn2, LOW);
  delay(milliseconds);
  digitalWrite(kPinMotorIn1, LOW);
  digitalWrite(kPinMotorIn2, LOW);
}

}  // namespace motion
