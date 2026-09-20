# Wiring

Pin numbers are defined once in `firmware/include/pins.h`. Change that file and this table together.
No soldering anywhere: modules plug into the breadboard, wires screw into terminal blocks.

## ESP32 pin map

| ESP32 pin | Direction | Connected to                                | Note                                |
| --------- | --------- | ------------------------------------------- | ----------------------------------- |
| `GPIO5`   | out       | TF module `CS`                              | SPI chip select                     |
| `GPIO18`  | out       | TF module `SCK`                             | SPI clock                           |
| `GPIO19`  | in        | TF module `MISO`                            | SPI data in                         |
| `GPIO23`  | out       | TF module `MOSI`                            | SPI data out                        |
| `GPIO26`  | out       | MAX98357A `BCLK`                            | I2S bit clock                       |
| `GPIO25`  | out       | MAX98357A `LRC`                             | I2S word select                     |
| `GPIO22`  | out       | MAX98357A `DIN`                             | I2S data                            |
| `GPIO16`  | in        | SU-03T `TX`                                 | UART2 receive                       |
| `GPIO17`  | out       | SU-03T `RX`                                 | UART2 transmit                      |
| `GPIO13`  | out       | Servo signal (orange or yellow)             | PWM, 50 Hz                          |
| `GPIO14`  | out       | WS2812 `DIN`                                | Status LED, 330 ohm series resistor |
| `5V`      | out       | Servo `V+`, MAX98357A `VIN`                 | Breadboard rail, not `3V3`          |
| `GND`     | —         | Servo `GND`, amplifier `GND`, modules `GND` | Common ground is mandatory          |

## Servo wiring

| Servo wire       | Goes to             | Note                      |
| ---------------- | ------------------- | ------------------------- |
| Red              | Breadboard 5 V rail | Never the ESP32 `3V3` pin |
| Brown or black   | Breadboard GND rail | Shared with the ESP32     |
| Orange or yellow | `GPIO13`            | Signal only, no load      |

## SU-03T wiring

| SU-03T pin | Goes to  | Note                                                |
| ---------- | -------- | --------------------------------------------------- |
| `VCC`      | 5 V rail | Most breakout boards have their own 3.3 V regulator |
| `GND`      | GND rail |                                                     |
| `TX`       | `GPIO16` | Module transmit into ESP32 receive                  |
| `RX`       | `GPIO17` | Only needed to reconfigure the module               |

Cross TX and RX: module TX goes to ESP32 RX and the other way round. If commands never arrive,
swap the two wires first.

## Amplifier wiring

| MAX98357A pin | Setting       | Effect                                            |
| ------------- | ------------- | ------------------------------------------------- |
| `VIN`         | 5 V rail      | More rail means more headroom                     |
| `GND`         | GND rail      |                                                   |
| `SD`          | not connected | Mono, both channels averaged                      |
| `GAIN`        | tied to GND   | 3 dB gain, raise it after the enclosure is closed |

Speaker output goes into a 2P screw terminal block, not soldered directly to the speaker leads.

## Assembly order

1. Plug the ESP32, TF module, amplifier and SU-03T into the breadboard.
2. Wire the 5 V and GND rails first, then check continuity.
3. Add the signal wires, keeping servo and I2S wires away from the microphone leads.
4. Power up with the servo arm removed and confirm the ESP32 boots and mounts the TF card.
5. Attach the arm, calibrate the three angles in `firmware/src/flipper.cpp`, then mount on the wall.

## Verification checklist

- Continuity check every ground before first power-on.
- Confirm the 5 V rail stays above 4.8 V while the servo moves and audio plays together.
- Confirm the ESP32 does not reboot when the servo presses the rocker.
- Speak the wake word plus each command and confirm the serial log prints the decoded command byte.
- Confirm the servo parks at neutral so the switch can still be operated by hand.
