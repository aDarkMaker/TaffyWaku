// Board pin map. Every module reads its pins from here, never from a literal.

#pragma once

#include <cstdint>

// SD card (SPI)
constexpr uint8_t kPinSdCs = 5;
constexpr uint8_t kPinSdSck = 18;
constexpr uint8_t kPinSdMiso = 19;
constexpr uint8_t kPinSdMosi = 23;

// I2S amplifier (MAX98357A)
constexpr uint8_t kPinI2sBclk = 26;
constexpr uint8_t kPinI2sLrc = 25;
constexpr uint8_t kPinI2sDin = 22;

// Motor driver (H-bridge)
constexpr uint8_t kPinMotorIn1 = 32;
constexpr uint8_t kPinMotorIn2 = 33;

// User input
constexpr uint8_t kPinButton = 0;
constexpr uint8_t kPinShakeSensor = 34;

// Addressable status LED (WS2812)
constexpr uint8_t kPinLedData = 13;
constexpr uint8_t kLedCount = 1;
