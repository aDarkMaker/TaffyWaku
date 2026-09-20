// Drives the vibration motor through the H-bridge.

#pragma once

#include <cstdint>

namespace motion {

void begin();
void spin(uint16_t milliseconds);

}  // namespace motion
