// Rocker switch flipper: a servo arm presses one side of the switch, then returns.

#pragma once

#include <cstdint>

enum class SwitchSide : uint8_t {
  up,
  down,
};

namespace flipper {

void begin();
void press(SwitchSide side, uint16_t holdMs);

}  // namespace flipper
