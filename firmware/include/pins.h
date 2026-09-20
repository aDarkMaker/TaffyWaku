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

// Rocker switch flipper servo (LEDC PWM)
constexpr uint8_t kPinServo = 13;

// SU-03T offline voice module (UART2)
constexpr uint8_t kPinVoiceRx = 16;
constexpr uint8_t kPinVoiceTx = 17;
constexpr uint32_t kVoiceBaud = 9600;

// Status LED (WS2812)
constexpr uint8_t kPinLedData = 14;
constexpr uint8_t kLedCount = 1;
