# Wiring

Pin numbers are defined once in `firmware/include/pins.h`. Change that file and this table together.

## ESP32 pin map

| ESP32 pin | Direction | Connected to      | Note                                     |
| --------- | --------- | ----------------- | ---------------------------------------- |
| `GPIO5`   | out       | SD `CS`           | SPI chip select                          |
| `GPIO18`  | out       | SD `SCK`          | SPI clock                                |
| `GPIO19`  | in        | SD `MISO`         | SPI data in                              |
| `GPIO23`  | out       | SD `MOSI`         | SPI data out                             |
| `GPIO26`  | out       | MAX98357A `BCLK`  | I2S bit clock                            |
| `GPIO25`  | out       | MAX98357A `LRC`   | I2S word select                          |
| `GPIO22`  | out       | MAX98357A `DIN`   | I2S data                                 |
| `GPIO32`  | out       | Driver `IN1`      | Motor forward                            |
| `GPIO33`  | out       | Driver `IN2`      | Motor reverse                            |
| `GPIO0`   | in        | Button `SW1`      | Active low, internal pull-up             |
| `GPIO34`  | in        | Shake sensor `DO` | Input only pin, needs external pull-down |
| `GPIO13`  | out       | WS2812 `DIN`      | 330 ohm series resistor                  |

## Power connections

| From                                       | To              | Note                            |
| ------------------------------------------ | --------------- | ------------------------------- |
| LiPo `+`                                   | TP4056 `B+`     | Charger and protection board    |
| TP4056 `OUT+`                              | MT3608 `VIN+`   | Boost input                     |
| MT3608 `VOUT+`                             | ESP32 `VIN`     | 5 V rail                        |
| MT3608 `VOUT+`                             | MAX98357A `VIN` | Shared 5 V rail, 470 uF nearby  |
| MT3608 `VOUT+`                             | Driver `VM`     | Motor supply                    |
| Driver `GND`, amplifier `GND`, ESP32 `GND` | Common ground   | Star ground at the boost output |

## Amplifier configuration

| MAX98357A pin | Setting       | Effect                                     |
| ------------- | ------------- | ------------------------------------------ |
| `SD`          | not connected | Mono, left and right channels averaged     |
| `GAIN`        | tied to `GND` | 3 dB gain, adjust after enclosure assembly |
| `VIN`         | 5 V rail      | Higher rail means more headroom            |

## Verification checklist

- Continuity check every ground before first power-on.
- Confirm the 5 V rail holds above 4.8 V while the motor and audio run at the same time.
- Play a 16 kHz test file and confirm the SD card is mounted before the first trigger.
- Shake the toy and confirm no false trigger fires from motor vibration.
