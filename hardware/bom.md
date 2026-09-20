# Bill of Materials

Draft. Quantities are for one switch flipper. Update this file in the same commit as any wiring change.

No soldering is required, but every module must be ordered in its **pre-soldered header** variant.
Ask the seller before ordering: boards are frequently shipped as a bare PCB plus a loose pin header.

| Ref | Part                          | Spec                                         | Qty     | Notes                                                |
| --- | ----------------------------- | -------------------------------------------- | ------- | ---------------------------------------------------- |
| U1  | ESP32 dev board               | ESP32-WROOM-32, Type-C, headers soldered     | 1       | Must have 5 V and GND broken out on both sides       |
| U2  | Offline voice module          | SU-03T breakout with on-board microphone     | 1       | Commands configured once from a PC over UART         |
| U3  | Audio amplifier               | MAX98357A breakout, I2S                      | 1       | 3 W into 4 ohm at 5 V                                |
| U4  | microSD module                | SPI breakout, headers soldered               | 1       | Skip it and use on-board flash if you prefer         |
| U5  | Servo                         | MG90S metal gear, 9 g                        | 1       | Metal gears survive repeated pressing                |
| M1  | Servo bracket and long horn   | MG90S compatible                             | 1       | Horn length sets the reach to the rocker             |
| LS1 | Speaker                       | 4 ohm 3 W, 40 mm, pre-tinned leads           | 1       | Leads go into a screw terminal                       |
| SW1 | Light sensor                  | Digital output module, optional              | 0-1     | Only if the device must report the real switch state |
| PS1 | USB adapter                   | 5 V 3 A, with Type-C cable                   | 1       | 5 V 1 A browns out the ESP32 when the servo moves    |
| BB1 | Breadboard                    | 830 tie points                               | 1       | Distributes 5 V and GND                              |
| J1  | Jumper wires                  | Female-female, male-female, male-male, 20 cm | 3 packs | Male-female for servo and module headers             |
| J2  | Screw terminal blocks         | 2.54 mm pitch, stackable 2P and 3P           | 1 set   | Speaker and power leads, no soldering                |
| C1  | Bulk capacitor                | 470 uF, 10 V electrolytic                    | 1       | Across the 5 V rail near the servo, damps brownouts  |
| C2  | Decoupling capacitor          | 100 nF ceramic                               | 2       | One per TF module supply pin pair                    |
| T1  | Mounting tape                 | 3M VHB, no-drill                             | 1       | Dorm walls, no holes allowed                         |
| T2  | Cable ties and adhesive clips | No-drill                                     | 1       | Keeps wires off the switch                           |

Estimated cost: 120 to 150 CNY for one unit at single-quantity retail prices, plus the mounting
solution.

## Servo angles

The arm needs three calibrated angles, all in `firmware/src/flipper.cpp`:

| Constant          | Start value | Meaning                    |
| ----------------- | ----------- | -------------------------- |
| `kAngleNeutral`   | 90          | Parked clear of the rocker |
| `kAnglePressUp`   | 35          | Turns the light on         |
| `kAnglePressDown` | 145         | Turns the light off        |

## Open questions

- Mounting: printed clamp around the panel frame, or a plate taped over the panel.
- Whether to add the light sensor for true on/off semantics.
- Enclosure for the breadboard, or leave it as a bare board taped behind the switch.
