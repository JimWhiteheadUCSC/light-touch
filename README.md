# Light Touch

Three ways of doing very little: a few moving dots that become a person, a ruled line with one percent of disorder, and flat shapes that drift slowly into new chords.

A multicart of 3 carts for [Grid Runner](https://github.com/JimWhiteheadUCSC/grid-runner), a generative art player for 64×64 LED panels.

Each cart is its own bank.

## Install

```bash
cd grid-runner/carts
git clone https://github.com/JimWhiteheadUCSC/light-touch.git
```

The keys are laid out as 1234 / QWER / ASDF / ZXCV. Images below are stills from
pieces that move.

## Almost Nothing

Jim Campbell’s question is how little information it takes to see a person. This cart stays right at that threshold: a few moving dots that become someone walking, a shadow on a wall, window light crossing a room. Most of the panel stays dark, and the meaning only arrives in motion, so give Passerby a moment. The core is Saccade, joined by Register’s and Selvedge’s pieces about light on walls and Ember’s Long Exposure, which share the restraint.

![Almost Nothing](almost-nothing/preview.png)

| Key | Piece | Artist | Run | Reacts to |
|---|---|---|---|---|
| 1 | Passerby | Saccade | Saccade | clock |
| 2 | Lengths | Saccade | Saccade |  |
| 3 | The Long Fall | Saccade | Saccade |  |
| 4 | Keeping Pace | Saccade | Saccade | clock |
| Q | Murmuration | Saccade | Saccade | clock |
| W | Between the Lamp and the Wall | Saccade | Saccade | clock |
| E | Two Hands, Pretending | Saccade | Saccade | clock |
| R | Each One the Sun | Saccade | Saccade | clock |
| A | Someone Else Going Home | Saccade | Saccade | clock |
| S | Before It Mists Over | Saccade | Saccade | clock, weather |
| D | Light on the Other Side of the Wall | Register | Register | clock, weather |
| F | Every Shadow Is Lit by the Other Lamp | Selvedge | Selvedge | clock, weather |
| Z | Long Exposure | Latch | Ember cold no-artists | sound |

## One Percent

Vera Molnár’s “one percent of disorder” and Casey Reas’s drawing by rule. Ruled strokes, plotter lines and marks that follow a process, where a slight deviation is the whole event. It’s the quietest graphic cart, and the one that looks most like drawing. It’s mostly Saccade, plus Register’s pieces built from one repeated motif.

![One Percent](one-percent/preview.png)

| Key | Piece | Artist | Run | Reacts to |
|---|---|---|---|---|
| 1 | Saccades, After Molnar | Saccade | Saccade | clock |
| 2 | Isobars | Saccade | Saccade | weather |
| 3 | The Plotter Comes Back | Saccade | Saccade | clock |
| 4 | The Grain Remembers | Saccade | Saccade | clock |
| Q | A Curve Nobody Drew | Saccade | Saccade | clock |
| W | Lodging | Saccade | Saccade | clock, weather |
| E | While Touching | Saccade | Saccade |  |
| R | Desire Paths | Saccade | Saccade |  |
| A | What a Knock Leaves in the Grain | Register | Register | sound, button |
| S | Every Mark Here Is the Same Motif | Register | Register | clock, weather, sound, button |

## Held Chords

Concrete painting with a jazz record shop’s color sense, after Loewensberg’s slow-moving flat shapes. Rectangles and circles drift, and their overlaps change color like chords changing. Gemini, Ember, Selvedge and Register all arrived here. It’s the most livable cart, and a good one to leave on all day.

![Held Chords](held-chords/preview.png)

| Key | Piece | Artist | Run | Reacts to |
|---|---|---|---|---|
| 1 | Untitled (Stimmung in Four Chords) | Chusen | Gemini full | clock, sound |
| 2 | Vier Variationen um ein Quadrat | Chusen | Gemini full | clock, sound |
| 3 | City-Discount (Septet in Eight Chords) | Chusen | Gemini full | clock, sound |
| 4 | Stimmung Suite | Koushi | Gemini no-argument | clock, sound |
| Q | Counterpoint Quartet | Koushi | Gemini no-argument | clock, sound, button |
| W | Untitled (Stimmung) | Solyanka | Gemini no-craft | clock, sound, button |
| E | Untitled (City Discount) | Solyanka | Gemini no-craft | clock, sound, button |
| R | Untitled (25 Quadrate) | Solyanka | Gemini no-craft | clock, sound, button |
| A | Adagio for Three Neighbors | Solyanka | Ember full | clock |
| S | City-Discount, After Hours | Solyanka | Ember full | clock, sound |
| D | Passing Tones | Zuanya | Ember no-argument | clock |
| F | Untitled | Weft | Ember no-craft | clock |
| Z | Untitled, Two Passes | Selvedge | Selvedge | clock |
| X | Nothing Here Was Placed | Selvedge | Selvedge | clock |
| C | The Chord Is Where They Cross | Selvedge | Selvedge | clock |
| V | The Agreement Has Edges | Register | Register | clock |


## What the pieces react to

The "Reacts to" column in each table shows which of these a piece uses. Every
piece still works without them.

- **Clock:** the time, the date, and how light it is outside, worked out from
  local sunrise and sunset. A piece can look different at night or change with
  the seasons.
- **Weather:** the current temperature, cloud cover and rain from
  [Open-Meteo](https://open-meteo.com). Grid Runner defaults to Santa Cruz,
  California, and `--lat` and `--lon` set your own location.
- **Sound:** loudness, bass, mid, treble and beats. Use `--audio arecord
  --audio-device plughw:1,0` for a USB microphone. Without one, pieces hear a
  built-in test signal.
- **Button:** press Enter, or the middle knob on a macro pad, and the piece
  responds. Some also react to holding it.

## About these pieces

These pieces were created using Sides Taken, an autonomous AI artist framework.
Jim Whitehead selected the inspiring artists and hand-crafted the framework, but
the artworks were created autonomously by the AI artists.

Each artist in the tables above is the name an agent chose for itself. Saccade,
Register and Selvedge are single runs. Gemini (Gemini 3.8 Flash) and Ember
(Ember-1) are the two models in a study that gave agents different materials:
`full` had artist dossiers, craft files and an argument step, `no-…` removed one,
`prior` removed all three, and `cold` means an independent one-session start.
Any other label is a follow-up test.

Pieces in this repo cite these artists as influences: Casey Reas, Jim Campbell, Mizuki Heitaro, Okazz, Vera Molnár, Verena Loewensberg. Those artists have
no connection to these pieces and haven't endorsed them.

## License

Copyright (c) 2026 Jim Whitehead. All rights reserved. You may use and copy these
pieces for your own personal, non-commercial use. See [LICENSE](LICENSE).
