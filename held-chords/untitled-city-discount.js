/*@vfx
id: 61a550e8-9248-4546-ad5a-a076176b3ed9
title: Untitled (City Discount)
created: 2026-10-10
artist: Solyanka (apprentice name)
lineage:
  - id: a6319ce6-ef6f-491a-a1da-a2c1ffeb55fa
    relation: variation
    note: >-
      Expands Loewensberg's concrete color algebra and adagio movement into her historic connection to jazz (City-Discount record shop, 1960–1986). Replaces rectilinear planes with segmented concentric circular discs, sector chord structures, and eccentric orbital intersections, translating modal jazz harmonies and 33 RPM vinyl rotation into pure geometric Stimmung.
  - id: 5ad2f3a9-c1ed-45d5-9935-7d6c2aa307fc
    relation: contrast
    note: >-
      Contrasts Okazz's cartoon pop character gestures, discrete micro-lattices, and jumping sprites with Loewensberg's contemplative poise, non-representational concrete geometry, and solemn adagio duty cycles.
  - id: 8e0fc91c-5e7d-44cc-9b26-8b79656c0c55
    relation: contrast
    note: >-
      Contrasts Heitaro's allover repeating textile grid and continuous conveyor scroll with a singular poised canvas, asymmetric composition, and modal harmonic modulation across time.
influences:
  - verena-loewensberg
rationale: |
  Between 1960 and 1986, Verena Loewensberg owned City-Discount on Zurich's
  Stüssihofstatt—the city's premier independent jazz record shop and one of
  the few European hubs importing experimental American free jazz, bebop, and
  modal records. While the Zurich Concretists treated mathematics as cold logic,
  Loewensberg's late circular paintings—radiating concentric rings divided into
  harmonic angular sectors and balanced by eccentric intersecting discs—pulsate
  with the rhythmic phrasing and modal chord voicings of Thelonious Monk and
  Miles Davis.

  This piece realizes that dialogue between Concrete Art and jazz. On the 64x64
  matrix, the composition is anchored by nested concentric annuli (divided into
  2, 3, and 4 angular sectors) coupled with an eccentric counter-balancing disc
  and an architectural chord bar. Rather than spinning frantically like a wheel,
  the circular structure breathes with slow 33 RPM vinyl drift (0.02–0.04 rad/s)
  and moves through five poised asymmetric movements via an adagio choreography:
  a 65% contemplative hold punctuated by a 35% quintic smootherstep glide.

  Color relationships embody her signature concept of "Stimmung" (tuned mood),
  organized around four modal jazz progressions:
  - Dorian: Prussian Blue ground, Vermilion, Cobalt, Ochre, Petrol, and Plum.
  - Lydian: Warm Linen ground, Saffron, Ultramarine, Viridian, Coral, and Umber.
  - Aeolian: Dusk Slate ground, Madder Rose, Royal Plum, Raw Amber, and Amethyst
    (an intimate "Chord of Neighbors").
  - Phrygian: Carbon Bronze ground, Deep Crimson, Brass, Chartreuse, and Petrol.

  Overlapping intersections reject mechanical alpha blending in favor of explicit
  harmonic chord substitutions. Clock daylight modulates the atmosphere between
  sunlit Zurich clarity and late-night cellar warmth. Audio level gently dilates
  the concentric rings' breath, while incoming beats pulse the eccentric overlap.
  Every paused frame satisfies the freeze-frame test as a poised, composed canvas.
@vfx*/

// Untitled (City Discount) — buffer mode
// Verena Loewensberg: Concrete Art concentric discs, eccentric poise,
// modal jazz chord progressions (City-Discount 1960-1986), adagio phrasing,
// and subpixel stencil edge anti-aliasing.

const meta = { name: "untitled_city_discount", fps: 30, inputs: ["clock", "audio", "button"] };

// Five composed movements inspired by Verena Loewensberg's late concentric paintings
const MOVEMENTS = [
  // 0: Zurich Cadence — offset slightly lower-left, eccentric disc upper-right, horizontal red foundation bar
  {
    c1: [29, 34], c2: [44, 21],
    r: [5.2, 11.5, 18.8, 26.8, 15.0],
    angles: [0.2, 1.1, 2.4],
    bar: { type: 'h', pos: 49, w: 2 },
  },
  // 1: The Monolith — shifted right, high vertical cobalt column slicing through the golden section
  {
    c1: [35, 29], c2: [18, 41],
    r: [5.8, 12.8, 20.4, 28.0, 16.5],
    angles: [1.8, 2.7, 0.5],
    bar: { type: 'v', pos: 16, w: 2 },
  },
  // 2: Suspended Third — centered low, floating upper eccentric balance, horizontal midnight lintel
  {
    c1: [28, 36], c2: [39, 23],
    r: [4.8, 10.8, 18.2, 25.8, 18.0],
    angles: [3.1, 0.4, 1.7],
    bar: { type: 'h', pos: 14, w: 2 },
  },
  // 3: Diagonal Counterpoise — center upper-right, eccentric lower-left, vertical verdigris spine
  {
    c1: [34, 27], c2: [23, 44],
    r: [5.4, 12.2, 19.6, 27.5, 14.5],
    angles: [4.2, 5.1, 3.6],
    bar: { type: 'v', pos: 50, w: 2 },
  },
  // 4: The Central Chord — poised near center, interlocking cantilevered discs, horizontal ochre axis
  {
    c1: [32, 32], c2: [45, 37],
    r: [6.2, 13.2, 21.0, 28.5, 16.0],
    angles: [0.9, 3.4, 4.8],
    bar: { type: 'h', pos: 32, w: 2 },
  }
];

// Harmonic Modes (Jazz Chord Palettes)
// Each mode defines an architectural ground, glowing core, chord bar, sector chords, eccentric disc, and overlap chord
const MODES_DAY = [
  // 0: Dorian (Prussian ground, Vermilion, Cobalt, Ochre, Petrol, Plum, Alabaster core)
  {
    ground: rgb(24, 30, 40),
    core: rgb(248, 245, 238),
    bar: rgb(185, 48, 38),
    r1: [rgb(208, 52, 42), rgb(38, 92, 178)],
    r2: [rgb(228, 170, 36), rgb(36, 142, 118), rgb(188, 44, 96), rgb(48, 106, 192)],
    r3: [rgb(126, 48, 122), rgb(216, 96, 36), rgb(42, 132, 148)],
    ecc: rgb(218, 156, 42),
    overlap: rgb(164, 46, 82),
  },
  // 1: Lydian (Warm Linen ground, Saffron, Ultramarine, Viridian, Coral, Umber)
  {
    ground: rgb(36, 32, 30),
    core: rgb(252, 250, 244),
    bar: rgb(42, 96, 172),
    r1: [rgb(238, 186, 32), rgb(34, 146, 112)],
    r2: [rgb(218, 56, 46), rgb(44, 96, 186), rgb(226, 162, 42), rgb(112, 44, 118)],
    r3: [rgb(42, 132, 136), rgb(212, 82, 42), rgb(182, 42, 76)],
    ecc: rgb(44, 102, 182),
    overlap: rgb(178, 76, 42),
  },
  // 2: Aeolian (Dusk Slate ground, Madder Rose, Royal Plum, Raw Amber, Amethyst)
  {
    ground: rgb(28, 24, 32),
    core: rgb(245, 238, 242),
    bar: rgb(172, 52, 88),
    r1: [rgb(180, 54, 88), rgb(128, 46, 138)],
    r2: [rgb(198, 88, 56), rgb(138, 62, 112), rgb(188, 68, 76), rgb(148, 52, 128)],
    r3: [rgb(162, 72, 62), rgb(118, 46, 108), rgb(182, 82, 72)],
    ecc: rgb(158, 56, 96),
    overlap: rgb(110, 38, 88),
  },
  // 3: Phrygian (Carbon Bronze ground, Deep Crimson, Brass, Chartreuse, Petrol)
  {
    ground: rgb(20, 22, 25),
    core: rgb(250, 246, 240),
    bar: rgb(222, 182, 46),
    r1: [rgb(218, 42, 46), rgb(188, 152, 36)],
    r2: [rgb(36, 116, 168), rgb(136, 166, 42), rgb(208, 76, 36), rgb(98, 42, 112)],
    r3: [rgb(198, 46, 76), rgb(42, 136, 122), rgb(212, 162, 42)],
    ecc: rgb(142, 170, 44),
    overlap: rgb(188, 96, 36),
  }
];

// Night versions of the modes: deeper, velvety, intimate Stimmung
const MODES_NIGHT = [
  {
    ground: rgb(14, 18, 24),
    core: rgb(220, 215, 205),
    bar: rgb(140, 36, 28),
    r1: [rgb(155, 38, 32), rgb(28, 68, 135)],
    r2: [rgb(175, 125, 26), rgb(26, 105, 86), rgb(140, 32, 70), rgb(35, 78, 145)],
    r3: [rgb(92, 34, 90), rgb(160, 70, 26), rgb(30, 96, 108)],
    ecc: rgb(165, 115, 30),
    overlap: rgb(120, 34, 60),
  },
  {
    ground: rgb(22, 20, 22),
    core: rgb(225, 220, 212),
    bar: rgb(32, 70, 130),
    r1: [rgb(180, 135, 24), rgb(25, 108, 82)],
    r2: [rgb(165, 42, 34), rgb(32, 72, 140), rgb(170, 120, 30), rgb(84, 32, 88)],
    r3: [rgb(30, 96, 100), rgb(155, 60, 30), rgb(135, 30, 56)],
    ecc: rgb(32, 75, 135),
    overlap: rgb(130, 55, 30),
  },
  {
    ground: rgb(18, 14, 20),
    core: rgb(215, 205, 210),
    bar: rgb(130, 38, 66),
    r1: [rgb(135, 40, 66), rgb(95, 34, 105)],
    r2: [rgb(150, 64, 42), rgb(105, 46, 84), rgb(140, 50, 56), rgb(110, 38, 95)],
    r3: [rgb(120, 52, 46), rgb(88, 34, 80), rgb(135, 60, 52)],
    ecc: rgb(118, 42, 72),
    overlap: rgb(82, 28, 66),
  },
  {
    ground: rgb(12, 14, 16),
    core: rgb(222, 218, 210),
    bar: rgb(168, 136, 34),
    r1: [rgb(165, 32, 34), rgb(140, 112, 26)],
    r2: [rgb(26, 86, 125), rgb(102, 125, 30), rgb(155, 56, 26), rgb(72, 30, 84)],
    r3: [rgb(148, 34, 56), rgb(30, 102, 90), rgb(160, 120, 30)],
    ecc: rgb(106, 128, 32),
    overlap: rgb(140, 70, 26),
  }
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

  // Button interaction: advance to the next movement
  if (typeof input !== 'undefined' && input.button && input.button.pressed) {
    buttonAdvance += 3.8;
  }

  // Beat pulse decay
  if (hasBeat) {
    beatPulse = 1.0;
  } else {
    beatPulse = Math.max(0, beatPulse - dt * 2.8);
  }

  const effectiveT = t + buttonAdvance;

  // Movement choreography (12-second phrase: 65% hold, 35% quintic smootherstep glide)
  const phraseDur = 12.0;
  const numMov = MOVEMENTS.length;
  const totalT = numMov * phraseDur; // 60 seconds
  const globalCycle = Math.floor(effectiveT / totalT);
  const cycleFrac = (effectiveT % totalT) / phraseDur;
  const curMovIdx = Math.floor(cycleFrac);
  const nextMovIdx = (curMovIdx + 1) % numMov;
  const frac = cycleFrac - curMovIdx;

  let u = 0;
  if (frac > 0.65) {
    const p = (frac - 0.65) / 0.35;
    // Quintic smootherstep
    u = p * p * p * (p * (p * 6 - 15) + 10);
  }

  const mA = MOVEMENTS[curMovIdx];
  const mB = MOVEMENTS[nextMovIdx];

  // Slow 33 RPM vinyl rotation rates for concentric discs (counter-rotating eccentric)
  const slowRot1 = effectiveT * 0.045;
  const slowRot2 = -effectiveT * 0.030;
  const slowRot3 = effectiveT * 0.022;

  // Subtle dancer's breath + slow non-repeating noise drift for orbital centers
  const driftX = noise2(effectiveT * 0.012, 3.7) * 1.4;
  const driftY = noise2(effectiveT * 0.012, 9.1) * 1.4;
  const breathX = 0.45 * Math.sin(effectiveT * 0.5);
  const breathY = 0.45 * Math.cos(effectiveT * 0.42);

  const c1x = lerp(mA.c1[0], mB.c1[0], u) + driftX + breathX;
  const c1y = lerp(mA.c1[1], mB.c1[1], u) + driftY + breathY;
  const c2x = lerp(mA.c2[0], mB.c2[0], u) - driftX * 0.8;
  const c2y = lerp(mA.c2[1], mB.c2[1], u) - driftY * 0.8;

  // Radial dilation with audio level
  const dilation = audioLvl * 1.8;
  const r0 = lerp(mA.r[0], mB.r[0], u) + dilation * 0.3;
  const r1 = lerp(mA.r[1], mB.r[1], u) + dilation * 0.6;
  const r2 = lerp(mA.r[2], mB.r[2], u) + dilation * 1.0;
  const r3 = lerp(mA.r[3], mB.r[3], u) + dilation * 1.4;
  const rEcc = lerp(mA.r[4], mB.r[4], u) + dilation * 0.8;

  const a1 = lerp(mA.angles[0], mB.angles[0], u) + slowRot1;
  const a2 = lerp(mA.angles[1], mB.angles[1], u) + slowRot2;
  const a3 = lerp(mA.angles[2], mB.angles[2], u) + slowRot3;

  // Modal chord interpolation: mix day/night by daylight, then interpolate cur/next by u
  const curM = curMovIdx % MODES_DAY.length;
  const nextM = (curMovIdx + 1) % MODES_DAY.length;

  const getModeCol = (key) => {
    const dayCur = MODES_DAY[curM][key];
    const niteCur = MODES_NIGHT[curM][key];
    const dayNext = MODES_DAY[nextM][key];
    const niteNext = MODES_NIGHT[nextM][key];
    const curC = lerpColor(niteCur, dayCur, daylight);
    const nextC = lerpColor(niteNext, dayNext, daylight);
    return lerpColor(curC, nextC, u);
  };

  const getArrayCol = (key, idx) => {
    const dayCur = MODES_DAY[curM][key][idx];
    const niteCur = MODES_NIGHT[curM][key][idx];
    const dayNext = MODES_DAY[nextM][key][idx];
    const niteNext = MODES_NIGHT[nextM][key][idx];
    const curC = lerpColor(niteCur, dayCur, daylight);
    const nextC = lerpColor(niteNext, dayNext, daylight);
    return lerpColor(curC, nextC, u);
  };

  const colGround = getModeCol('ground');
  const colCore = getModeCol('core');
  const colBar = getModeCol('bar');
  const colEcc = getModeCol('ecc');
  let colOverlap = getModeCol('overlap');

  // Accent overlap with beat pulse
  if (beatPulse > 0.05) {
    colOverlap = lerpColor(colOverlap, rgb(245, 235, 220), beatPulse * 0.32);
  }

  const colR1 = [getArrayCol('r1', 0), getArrayCol('r1', 1)];
  const colR2 = [getArrayCol('r2', 0), getArrayCol('r2', 1), getArrayCol('r2', 2), getArrayCol('r2', 3)];
  const colR3 = [getArrayCol('r3', 0), getArrayCol('r3', 1), getArrayCol('r3', 2)];

  fill(colGround);

  const barType = mA.bar.type;
  const barPos = lerp(mA.bar.pos, mB.bar.pos, u);
  const barW = mA.bar.w;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let inBar = false;
      let barAlpha = 1.0;
      if (barType === 'h') {
        const dBar = Math.abs(y - barPos);
        if (dBar <= barW + 0.5) {
          inBar = true;
          barAlpha = clamp(0.5 - (dBar - barW), 0, 1);
        }
      } else {
        const dBar = Math.abs(x - barPos);
        if (dBar <= barW + 0.5) {
          inBar = true;
          barAlpha = clamp(0.5 - (dBar - barW), 0, 1);
        }
      }

      const dx1 = x - c1x;
      const dy1 = y - c1y;
      const d1 = Math.hypot(dx1, dy1);

      const dx2 = x - c2x;
      const dy2 = y - c2y;
      const d2 = Math.hypot(dx2, dy2);

      const inEcc = (d2 <= rEcc + 0.5);
      const eccAlpha = inEcc ? clamp(0.5 - (d2 - rEcc), 0, 1) : 0;

      let col = -1;
      let alpha1 = 1.0;

      if (d1 <= r3 + 0.5) {
        if (d1 > r3 - 0.5) {
          alpha1 = clamp(0.5 - (d1 - r3), 0, 1);
        }

        if (d1 <= r0) {
          col = colCore;
        } else if (d1 <= r1) {
          let ang = Math.atan2(dy1, dx1) - a1;
          ang = (ang % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const sIdx = (ang < Math.PI) ? 0 : 1;
          col = colR1[sIdx];
        } else if (d1 <= r2) {
          let ang = Math.atan2(dy1, dx1) - a2;
          ang = (ang % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const sIdx = Math.floor(ang / (Math.PI * 0.5)) % 4;
          col = colR2[sIdx];
        } else {
          let ang = Math.atan2(dy1, dx1) - a3;
          ang = (ang % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const sIdx = Math.floor(ang / (Math.PI * 2 / 3)) % 3;
          col = colR3[sIdx];
        }

        // Interlocking overlap with eccentric disc
        if (inEcc && d1 > r0) {
          col = lerpColor(col, colOverlap, eccAlpha);
        }

        if (alpha1 < 1.0) {
          col = lerpColor(colGround, col, alpha1);
        }
      } else if (inEcc) {
        col = lerpColor(colGround, colEcc, eccAlpha);
      }

      if (inBar) {
        if (col === -1) {
          col = lerpColor(colGround, colBar, barAlpha);
        } else if (d1 > r0) {
          // Architectural bar chord intersection
          const chordCol = lerpColor(col, colBar, 0.45);
          col = lerpColor(col, chordCol, barAlpha);
        }
      }

      if (col !== -1) {
        setPixel(x, y, col);
      }
    }
  }
}