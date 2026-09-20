// Minimal WS2812 driver over the ESP32 RMT peripheral.

#include "effects.h"

#include <Arduino.h>
#include <driver/rmt_tx.h>

#include "pins.h"

namespace {

constexpr uint32_t kRmtResolutionHz = 10000000;
constexpr uint16_t kT0hTicks = 3;
constexpr uint16_t kT0lTicks = 9;
constexpr uint16_t kT1hTicks = 6;
constexpr uint16_t kT1lTicks = 6;
constexpr uint8_t kBytesPerLed = 3;
constexpr uint32_t kBreathStepMs = 20;
constexpr uint32_t kBreathPeriodMs = 1200;

rmt_channel_handle_t g_rmtChannel = nullptr;
rmt_encoder_handle_t g_rmtEncoder = nullptr;
uint8_t g_frame[kLedCount * kBytesPerLed] = {};

void writeFrame() {
  if (g_rmtChannel == nullptr || g_rmtEncoder == nullptr) return;
  rmt_transmit_config_t transmitConfig = {};
  rmt_transmit(g_rmtChannel, g_rmtEncoder, g_frame, sizeof(g_frame), &transmitConfig);
  rmt_tx_wait_all_done(g_rmtChannel, portMAX_DELAY);
}

uint8_t scaleChannel(uint8_t value, uint8_t brightness) {
  return static_cast<uint8_t>((static_cast<uint16_t>(value) * brightness) / 255);
}

}  // namespace

namespace effects {

void begin() {
  rmt_tx_channel_config_t channelConfig = {};
  channelConfig.gpio_num = static_cast<gpio_num_t>(kPinLedData);
  channelConfig.clk_src = RMT_CLK_SRC_DEFAULT;
  channelConfig.resolution_hz = kRmtResolutionHz;
  channelConfig.mem_block_symbols = 64;
  channelConfig.trans_queue_depth = 4;

  if (rmt_new_tx_channel(&channelConfig, &g_rmtChannel) != ESP_OK) return;

  rmt_bytes_encoder_config_t encoderConfig = {};
  encoderConfig.bit0.level0 = 1;
  encoderConfig.bit0.duration0 = kT0hTicks;
  encoderConfig.bit0.level1 = 0;
  encoderConfig.bit0.duration1 = kT0lTicks;
  encoderConfig.bit1.level0 = 1;
  encoderConfig.bit1.duration0 = kT1hTicks;
  encoderConfig.bit1.level1 = 0;
  encoderConfig.bit1.duration1 = kT1lTicks;
  encoderConfig.flags.msb_first = 1;

  if (rmt_new_bytes_encoder(&encoderConfig, &g_rmtEncoder) != ESP_OK) return;
  rmt_enable(g_rmtChannel);
}

void idle() {
  static uint32_t phase = 0;
  static uint32_t lastStepMs = 0;
  const uint32_t span = kBreathPeriodMs * 2;
  const uint32_t now = millis();

  if (now - lastStepMs >= kBreathStepMs) {
    lastStepMs = now;
    phase = (phase + kBreathStepMs) % span;
  }
  const uint16_t level = phase < kBreathPeriodMs ? phase : span - phase;
  const uint8_t brightness = static_cast<uint8_t>((level * 255) / kBreathPeriodMs);

  flash(scaleChannel(255, brightness), scaleChannel(120, brightness),
        scaleChannel(200, brightness), 0);
}

void flash(uint8_t red, uint8_t green, uint8_t blue, uint16_t milliseconds) {
  for (uint8_t led = 0; led < kLedCount; ++led) {
    const size_t base = static_cast<size_t>(led) * kBytesPerLed;
    g_frame[base] = green;
    g_frame[base + 1] = red;
    g_frame[base + 2] = blue;
  }
  writeFrame();
  if (milliseconds > 0) delay(milliseconds);
}

}  // namespace effects
