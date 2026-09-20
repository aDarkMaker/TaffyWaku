# Bill of Materials

Draft. Quantities are for one toy. Update this file in the same commit as any wiring change.

| Ref  | Part                 | Spec                               | Qty | Notes                                           |
| ---- | -------------------- | ---------------------------------- | --- | ----------------------------------------------- |
| U1   | ESP32 dev board      | ESP32-WROOM-32, 4 MB flash         | 1   | Any `esp32dev` compatible board                 |
| U2   | Audio amplifier      | MAX98357A breakout, I2S            | 1   | 3 W into 4 ohm at 5 V                           |
| U3   | Motor driver         | H-bridge module, TB6612 or DRV8833 | 1   | Must survive motor stall current                |
| U4   | Boost converter      | MT3608, 5 V 2 A output             | 1   | Feed from the 1S LiPo                           |
| U5   | Charger board        | TP4056 with protection             | 1   | 1S LiPo charge and protection                   |
| M1   | Vibration motor      | Coin type, 3-5 V, 60-100 mA        | 1   | Add a flyback diode across the terminals        |
| LS1  | Speaker              | 4 ohm 3 W, 40 mm                   | 1   | Enclosure mounted, acoustic vent required       |
| SD1  | microSD module       | SPI breakout with level shifting   | 1   | Cards must be FAT32 formatted                   |
| SW1  | Tactile button       | 6x6 mm                             | 1   | Wired to `GPIO0`, active low                    |
| SW2  | Shake sensor         | SW-420 module                      | 1   | Alternative: ball switch plus 10 kOhm pull-down |
| LED1 | Addressable LED      | WS2812B, 5 V                       | 1   | Add a 330 ohm series resistor on data           |
| B1   | LiPo cell            | 1S 3.7 V 1200 mAh                  | 1   | Protected cell preferred                        |
| C1   | Bulk capacitor       | 470 uF, 10 V electrolytic          | 1   | Across the amplifier supply, near the pins      |
| C2   | Decoupling capacitor | 100 nF ceramic                     | 2   | One per supply pin pair of the SD module        |

Estimated cost: about 120 CNY for one unit at single-quantity retail prices.

## Open questions

- Enclosure: 3D printed shell or modified off-the-shelf case.
- Motor placement: eccentric motor mounted to the shell wall for maximum shake feel.
- Charging port access and power switch position.
