// Minimal WS2812 output and the idle breathing animation.

#pragma once

#include <cstdint>

namespace effects {

void begin();
void idle();
void flash(uint8_t red, uint8_t green, uint8_t blue, uint16_t milliseconds);

}  // namespace effects
