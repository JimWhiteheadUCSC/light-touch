/*@vfx
id: 6b736d35-3c42-43eb-b6e0-3c3839e1deaa
title: Untitled (25 Quadrate)
created: 2026-10-10
artist: Solyanka (apprentice name)
lineage:
  - id: a6319ce6-ef6f-491a-a1da-a2c1ffeb55fa
    relation: variation
    note: >-
      translates Loewensberg's concrete color algebra and adagio phrasing from continuous overlapping planes to the modular 5x5 grid of 25 Quadrate (1957). Replaces monolithic geometric sliding with polyphonic voice-leading across 25 autonomous color voices and four modal Stimmungen.
  - id: 61a550e8-9248-4546-ad5a-a076176b3ed9
    relation: inspiration
    note: >-
      inherits her jazz-inspired modal chord structures (Dorian, Lydian, Aeolian, Phrygian) and slow vinyl pacing, translating jazz harmony into the discrete harmonic voices of a 5x5 chromatic score.
  - id: fe8ca5ea-c1d1-4962-a322-bd1c43c17e77
    relation: contrast
    note: >-
      contrasts Okazz's cartoon locomotion leaps, pop character shapes, and jumping sprites on an 8x8 latent grid with Loewensberg's non-representational Swiss Concrete purity: every cell remains in its place, while time acts solely on color nuance and Stimmung through adagio polyphonic modulation.
  - id: 8e0fc91c-5e7d-44cc-9b26-8b79656c0c55
    relation: contrast
    note: >-
      contrasts Heitaro's unrolling textile conveyor scroll and decorative repeating motifs with a singular, centered 5x5 square matrix where no motifs scroll and structure is subordinate to pure chromatic counterpoint.
influences:
  - verena-loewensberg
rationale: |
  In 1957, Verena Loewensberg painted '25 Quadrate' (oil on canvas, 80x80 cm,
  Kunstmuseum Winterthur)—twenty-five squares arranged in a disciplined 5x5 grid,
  where greens, blues, predominant red nuances, and Georges Vantongerloo's signature
  purple and yellow vibrate against a dark graph-paper ground. It is one of the
  definitive masterworks of Zurich Concrete art: pure formal relationships,
  referring to nothing and needing to, yet radiating the atmospheric quality she
  termed 'Stimmung' (tuned mood).

  On the 64x64 matrix, this piece translates that historic canvas into time.
  A painted canvas holds a single poised chord forever; on an emissive LED panel,
  the twenty-five squares become a 25-part polyphonic chorale.

  Twenty-five 10x10 squares are organized into a 5x5 grid separated by 2px dark
  linen channels with faint graph-paper registration hairlines. Rather than
  moving physically across the screen, each square remains firmly grounded in its
  architectural place. Animacy enters through polyphonic voice leading: each square
  follows its own prime adagio cycle (rest-dominant meter: 55% poise, 45% smootherstep
  modulation), shifting its chromatic voice independently from its neighbors. At
  any instant, most of the grid is in contemplative repose, with three or four
  squares gently modulating their hues like voices in an experimental jazz choir.

  Harmonic relationships evolve across four authentic Concretist modes:
  1. Zurich 1957: Cadmium reds, vermilion, cobalt blue, viridian teal, Vantongerloo violet, and golden ochre.
  2. Nocturne (Chord of Neighbors): Dusty madder rose, deep amethyst, spiced coral, midnight indigo, dusk petrol, and warm amber.
  3. Mediterranean Light (Sicily 1982): Terracotta, sunlit calcarenite ochre, Aegean ultramarine, olive green, and fig violet.
  4. Stüssihofstatt Jazz: Smoked crimson, deep wine, Prussian blue, petrol teal, wisteria mauve, and antique brass.

  A passing tone soloist wanders along a prime Lissajous trajectory, casting a gentle
  luminescent highlight onto adjacent squares and introducing fluid melodic focus.
  Simultaneous contrast is modeled through subtle harmonic luminescent breathing.
  Clock daylight modulates between sunlit clarity and nocturnal intimacy. Incoming
  audio dilates the soloist's melodic reach, while musical beats delicately pulse
  the graph-paper grid lines. Every paused frame satisfies the freeze-frame test as
  a composed, poised Concrete canvas.
@vfx*/

// Untitled (25 Quadrate) — buffer mode
// Verena Loewensberg 1957 masterwork: 5x5 square grid, polyphonic voice leading,
// rest-dominant adagio phrasing, 4 modal Stimmungen, and wandering passing tone.

const meta = { name: "untitled_25_quadrate", fps: 30, inputs: ["clock", "audio", "button"] };

// Coordinates for twenty-five 10x10 squares with 2px interstitial gaps
// 5 * 10 = 50px + 4 * 2px = 58px. Margins = 3px on left/top, 3px on right/bottom -> 64px total.
const ORIGINS = [3, 15, 27, 39, 51];

// Modal color chords: 4 distinct Stimmungen
const MODES_DAY = [
  // Mode 0: Zurich 1957 (Original painting: reds predominant, blues, greens, ochre, violet)
  [
    rgb(212, 48, 38),   // 0: Cadmium Red
    rgb(182, 35, 56),   // 1: Deep Madder Red
    rgb(224, 88, 46),   // 2: Venetian Red / Vermilion
    rgb(38, 96, 178),   // 3: Cobalt Blue
    rgb(30, 134, 112),  // 4: Viridian Teal
    rgb(134, 52, 126),  // 5: Vantongerloo Violet
    rgb(228, 175, 45),  // 6: Golden Ochre
    rgb(240, 230, 212), // 7: Bone Ivory
  ],
  // Mode 1: Nocturne / Chord of Neighbors (Amethyst, dusk rose, smoky plum, amber, umber)
  [
    rgb(182, 54, 90),   // 0: Madder Rose
    rgb(152, 44, 98),   // 1: Deep Amethyst
    rgb(198, 78, 64),   // 2: Spiced Coral
    rgb(64, 70, 148),   // 3: Midnight Indigo
    rgb(46, 102, 124),  // 4: Dusk Petrol
    rgb(116, 40, 104),  // 5: Night Plum
    rgb(205, 140, 52),  // 6: Warm Amber
    rgb(124, 84, 68),   // 7: Raw Umber
  ],
  // Mode 2: Mediterranean Light (Sicily calcarenite, terracotta, olive, ultramarine, saffron)
  [
    rgb(208, 76, 46),   // 0: Terracotta Red
    rgb(178, 56, 66),   // 1: Pomegranate
    rgb(228, 120, 46),  // 2: Saffron Orange
    rgb(34, 86, 165),   // 3: Aegean Ultramarine
    rgb(78, 138, 62),   // 4: Olive Green
    rgb(118, 65, 134),  // 5: Fig Violet
    rgb(225, 185, 60),  // 6: Sunlit Calcarenite Ochre
    rgb(238, 220, 185), // 7: Antique Marble
  ],
  // Mode 3: Cool Jazz / Stüssihofstatt (Prussian blue, petrol, wisteria, bronze, carbon)
  [
    rgb(195, 52, 64),   // 0: Smoked Crimson
    rgb(148, 40, 78),   // 1: Deep Wine
    rgb(208, 92, 56),   // 2: Burnt Sienna
    rgb(28, 82, 152),   // 3: Prussian Blue
    rgb(30, 122, 130),  // 4: Petrol Teal
    rgb(105, 58, 128),  // 5: Wisteria Mauve
    rgb(195, 155, 48),  // 6: Antique Brass
    rgb(175, 185, 195), // 7: Silver Mist
  ],
];

const MODES_NIGHT = [
  // Deeper nocturnal hues with refined low-light contrast
  [
    rgb(175, 36, 28), rgb(148, 26, 44), rgb(185, 68, 36), rgb(28, 74, 142),
    rgb(24, 105, 88), rgb(106, 38, 100), rgb(185, 138, 34), rgb(195, 185, 170),
  ],
  [
    rgb(150, 42, 72), rgb(122, 34, 78), rgb(162, 62, 50), rgb(48, 54, 118),
    rgb(36, 80, 98), rgb(92, 30, 82), rgb(165, 110, 40), rgb(98, 66, 54),
  ],
  [
    rgb(168, 58, 36), rgb(142, 42, 52), rgb(185, 95, 36), rgb(26, 68, 132),
    rgb(62, 108, 48), rgb(94, 50, 106), rgb(180, 145, 46), rgb(190, 175, 146),
  ],
  [
    rgb(156, 40, 50), rgb(118, 30, 62), rgb(168, 72, 44), rgb(22, 64, 122),
    rgb(24, 96, 104), rgb(84, 46, 102), rgb(155, 122, 38), rgb(140, 148, 156),
  ],
];

// Baseline chromatic voice deal across the 25 squares
const BASE_DEAL = [
  0, 1, 2, 3, 4,
  3, 5, 0, 6, 2,
  6, 0, 1, 2, 3,
  2, 4, 6, 5, 0,
  5, 6, 0, 1, 2
];

function lerpColor(c1, c2, u) {
  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
  return rgb(lerp(r1, r2, u) | 0, lerp(g1, g2, u) | 0, lerp(b1, b2, u) | 0);
}

let buttonAdvance = 0;
let beatPulse = 0;

function render(t, dt) {
  const daylight = (typeof input !== 'undefined' && input.clock) ? input.clock.daylight : 0.5;
  const audioLvl = (typeof input !== 'undefined' && input.audio && input.audio.ok) ? input.audio.level : 0;
  const hasBeat = (typeof input !== 'undefined' && input.audio && input.audio.ok) ? input.audio.beat : false;

  // Button interaction: smooth advance to the next harmonic mode
  if (typeof input !== 'undefined' && input.button && input.button.pressed) {
    buttonAdvance += 4.0;
  }

  // Audio beat decay
  if (hasBeat) {
    beatPulse = 1.0;
  } else {
    beatPulse = Math.max(0, beatPulse - dt * 2.5);
  }

  const effectiveT = t + buttonAdvance;

  // Ground: dark woven linen
  const groundNight = rgb(18, 16, 20);
  const groundDay = rgb(32, 29, 34);
  const groundCol = lerpColor(groundNight, groundDay, daylight);
  fill(groundCol);

  // Graph paper grid registration hairlines in the 2px channels
  const gridNight = rgb(28, 25, 32);
  const gridDay = rgb(46, 42, 50);
  let gridCol = lerpColor(gridNight, gridDay, daylight);
  if (beatPulse > 0.05) {
    gridCol = lerpColor(gridCol, rgb(180, 165, 150), beatPulse * 0.22);
  }

  // Draw hairlines at gap centers (x, y = 2, 14, 26, 38, 50, 62)
  const lineCoords = [2, 14, 26, 38, 50, 62];
  for (let k = 0; k < lineCoords.length; k++) {
    const c = lineCoords[k];
    for (let p = 0; p < 64; p++) {
      setPixel(c, p, gridCol);
      setPixel(p, c, gridCol);
    }
  }

  // Mode cycle: 4 modes x 16s = 64s macro cycle
  const modeCycle = 64.0;
  const modeP = (effectiveT % modeCycle) / 16.0;
  const curModeIdx = Math.floor(modeP) % 4;
  const nextModeIdx = (curModeIdx + 1) % 4;
  const modeFrac = modeP - Math.floor(modeP);

  // In each 16s mode period: 60% hold (poised chord), 40% smootherstep crossfade
  let modeBlend = 0;
  if (modeFrac > 0.60) {
    const p = (modeFrac - 0.60) / 0.40;
    modeBlend = p * p * p * (p * (p * 6 - 15) + 10);
  }

  // Lissajous wander of the passing tone soloist
  const wanderX = 2.0 + 1.85 * Math.sin(effectiveT * 0.35 + 0.6) + 0.35 * Math.cos(effectiveT * 0.71);
  const wanderY = 2.0 + 1.85 * Math.cos(effectiveT * 0.29 + 1.3) + 0.35 * Math.sin(effectiveT * 0.63);

  // Scan and render 5x5 squares
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      const idx = gy * 5 + gx;
      const x0 = ORIGINS[gx];
      const y0 = ORIGINS[gy];

      // Polyphonic voice leading: each square follows its own prime adagio cycle
      const phase = effectiveT * 0.22 + gx * 0.71 + gy * 1.17 + idx * 0.33;
      const voiceShift = Math.floor(phase / Math.PI) % 8;

      const baseVoice = BASE_DEAL[idx];
      const activeVoiceA = (baseVoice + voiceShift) % 8;
      const activeVoiceB = (baseVoice + voiceShift + 1) % 8;

      // Rest-dominant duty cycle for local square voice shift (55% poise, 45% transition)
      const vFrac = (Math.sin(phase) + 1) * 0.5;
      let vU = 0;
      if (vFrac > 0.55) {
        const vp = (vFrac - 0.55) / 0.45;
        vU = vp * vp * (3 - 2 * vp);
      }

      // Sample day and night palette sets
      const colA1_day = MODES_DAY[curModeIdx][activeVoiceA];
      const colA2_day = MODES_DAY[curModeIdx][activeVoiceB];
      const colA_day = lerpColor(colA1_day, colA2_day, vU);

      const colB1_day = MODES_DAY[nextModeIdx][activeVoiceA];
      const colB2_day = MODES_DAY[nextModeIdx][activeVoiceB];
      const colB_day = lerpColor(colB1_day, colB2_day, vU);

      const col_day = lerpColor(colA_day, colB_day, modeBlend);

      const colA1_nit = MODES_NIGHT[curModeIdx][activeVoiceA];
      const colA2_nit = MODES_NIGHT[curModeIdx][activeVoiceB];
      const colA_nit = lerpColor(colA1_nit, colA2_nit, vU);

      const colB1_nit = MODES_NIGHT[nextModeIdx][activeVoiceA];
      const colB2_nit = MODES_NIGHT[nextModeIdx][activeVoiceB];
      const colB_nit = lerpColor(colB1_nit, colB2_nit, vU);

      const col_nit = lerpColor(colA_nit, colB_nit, modeBlend);

      let squareCol = lerpColor(col_nit, col_day, daylight);

      // Optical vibration / simultaneous contrast breathing
      const optBreath = Math.sin(effectiveT * 0.92 + idx * 0.65) * 0.10;
      if (optBreath > 0) {
        squareCol = lerpColor(squareCol, rgb(255, 245, 230), optBreath);
      } else {
        squareCol = lerpColor(squareCol, groundCol, -optBreath * 0.5);
      }

      // Passing tone soloist highlight
      const dWander = Math.hypot(gx - wanderX, gy - wanderY);
      const reach = 1.35 + audioLvl * 0.35;
      if (dWander < reach) {
        const glow = (1.0 - dWander / reach) * (0.38 + beatPulse * 0.20);
        squareCol = lerpColor(squareCol, rgb(255, 244, 222), glow);
      }

      // Rasterize 10x10 square
      for (let y = y0; y < y0 + 10; y++) {
        for (let x = x0; x < x0 + 10; x++) {
          setPixel(x, y, squareCol);
        }
      }
    }
  }
}
