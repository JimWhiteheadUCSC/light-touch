/*@vfx
id: a6319ce6-ef6f-491a-a1da-a2c1ffeb55fa
title: Untitled (Stimmung)
created: 2026-10-10
artist: Solyanka (apprentice name)
lineage:
  - id: fe8ca5ea-c1d1-4962-a322-bd1c43c17e77
    relation: contrast
    note: contrasts Okazz's cartoon rest-and-leap jumps, pop character shapes, and kinetic wit with Loewensberg's concrete rigor, asymmetric poise, and slow adagio transitions. Operates on continuous proportional planes rather than a discrete 8x8 cell grid.
  - id: 8e0fc91c-5e7d-44cc-9b26-8b79656c0c55
    relation: contrast
    note: contrasts Heitaro's allover repeating textile bolt and decorative stencil craft with Loewensberg's singular composed canvas, non-repeating asymmetric poise, and concrete color logic where meaning is found in pure formal relationships.
influences:
  - verena-loewensberg
rationale: |
  A realization of Verena Loewensberg's Office of the Frame. Where Okazz holds
  Time and Heitaro holds the Field, Loewensberg holds the still: every paused
  frame must satisfy the freeze-frame test as a composed, poised canvas.

  This piece choreographs four overlapping geometric planes through six
  carefully proportioned asymmetric compositions. Influenced by her training
  in dance with Trudi Schoop, movement is structured as an adagio progression:
  held, contemplative poise (60% duty cycle) punctuated by quintic glide
  transitions (smootherstep) that shift spatial weight and proportion without
  haste.

  Overlaps reject default additive blending or linear alpha transparency in
  favor of a strict Concretist color algebra: each pairwise intersection is
  an independent harmonic chord (Cadmium Red and Cobalt Blue yield Royal Plum;
  Cobalt and Ochre yield Citron Olive; Red and Ochre yield Burnt Sienna).
  Triple overlaps resolve into deep Sumi bronze.

  In homage to her ownership of Zurich's City-Discount jazz shop, the work
  embodies her theoretical concept of "Stimmung" (tuned mood). Clock daylight
  gently modulates between daytime Zurich Concretist primaries and nighttime
  "Chord of Neighbors" (rose, amethyst, raw amber). Audio level introduces a
  subtle outward dilation of the composition's breath, and incoming beats
  delicately accent the overlap intersections.
@vfx*/

// Untitled (Stimmung) — buffer mode
// Verena Loewensberg: Concrete art, asymmetric poise, adagio choreography,
// 4x4 intersection color algebra, and day/night Stimmung modulation.

const meta = { name: "untitled_stimmung", fps: 30, inputs: ["clock", "audio", "button"] };

// Six composed movements (proportioned around golden ratios and asymmetric poise)
const COMPOSITIONS = [
  // 0: Asymmetric Foundation — Heavy red anchor lower-left, soaring cobalt column right, floating ochre
  [
    { x: 7,  y: 22, w: 28, h: 35 },
    { x: 31, y: 7,  w: 23, h: 46 },
    { x: 17, y: 5,  w: 33, h: 23 },
    { x: 37, y: 31, w: 19, h: 27 },
  ],
  // 1: Horizontal Counterpoint — Cantilevered horizontal bands balancing across the vertical axis
  [
    { x: 9,  y: 11, w: 43, h: 19 },
    { x: 23, y: 23, w: 33, h: 31 },
    { x: 5,  y: 33, w: 27, h: 23 },
    { x: 27, y: 5,  w: 21, h: 39 },
  ],
  // 2: The Zurich Quadrant — Clustered near the upper-right golden section intersection
  [
    { x: 15, y: 13, w: 31, h: 33 },
    { x: 7,  y: 25, w: 27, h: 29 },
    { x: 33, y: 17, w: 25, h: 35 },
    { x: 23, y: 7,  w: 29, h: 21 },
  ],
  // 3: Monolithic Shift — Monumental overlapping masses creating stepped architectural balance
  [
    { x: 11, y: 15, w: 29, h: 33 },
    { x: 23, y: 9,  w: 31, h: 35 },
    { x: 15, y: 27, w: 37, h: 27 },
    { x: 27, y: 21, w: 23, h: 37 },
  ],
  // 4: Diagonal Counterpoise — Opposing weights balanced along the primary diagonal
  [
    { x: 7,  y: 7,  w: 33, h: 27 },
    { x: 27, y: 27, w: 31, h: 29 },
    { x: 13, y: 23, w: 23, h: 33 },
    { x: 33, y: 11, w: 25, h: 25 },
  ],
  // 5: Suspended Cadence — Floating central chord with cantilevered margins
  [
    { x: 13, y: 19, w: 37, h: 25 },
    { x: 21, y: 11, w: 25, h: 43 },
    { x: 29, y: 25, w: 27, h: 27 },
    { x: 9,  y: 29, w: 23, h: 25 },
  ]
];

// Harmonic Modes (Stimmung)
const STIMMUNG_DAY = {
  ground: rgb(26, 24, 22), // warm dark linen
  planes: [
    rgb(192, 44, 34),   // 0: Cadmium Red
    rgb(38, 88, 172),   // 1: Cobalt Blue
    rgb(220, 164, 38),  // 2: Golden Ochre
    rgb(36, 140, 116),  // 3: Verdigris Teal
  ],
  // Overlaps for pairs: (0,1), (0,2), (0,3), (1,2), (1,3), (2,3)
  overlaps: [
    rgb(118, 42, 114),  // Red + Blue -> Royal Plum
    rgb(204, 90, 32),   // Red + Ochre -> Burnt Sienna
    rgb(114, 72, 52),   // Red + Teal -> Umber Russet
    rgb(114, 140, 46),  // Blue + Ochre -> Citron Olive
    rgb(26, 104, 144),  // Blue + Teal -> Petrol Blue
    rgb(138, 168, 46),  // Ochre + Teal -> Chartreuse Gold
  ],
  multi: rgb(66, 52, 42) // Multi-overlap -> Sumi Bronze
};

const STIMMUNG_NIGHT = {
  ground: rgb(22, 18, 24), // deep aubergine slate
  planes: [
    rgb(172, 48, 84),   // 0: Madder Rose
    rgb(82, 42, 132),   // 1: Amethyst Violet
    rgb(204, 138, 52),  // 2: Warm Amber
    rgb(114, 66, 48),   // 3: Deep Raw Umber
  ],
  overlaps: [
    rgb(114, 36, 104),  // Rose + Violet -> Deep Aubergine
    rgb(194, 94, 44),   // Rose + Amber -> Spiced Coral
    rgb(128, 52, 44),   // Rose + Umber -> Smoked Crimson
    rgb(124, 74, 84),   // Violet + Amber -> Dusky Ochre
    rgb(64, 38, 74),    // Violet + Umber -> Night Plum
    rgb(144, 94, 44),   // Amber + Umber -> Chestnut Brown
  ],
  multi: rgb(54, 36, 46) // Multi-overlap -> Smoked Slate
};

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

  // Button interaction: smooth advance to the next movement
  if (typeof input !== 'undefined' && input.button && input.button.pressed) {
    buttonAdvance += 3.6;
  }

  // Audio beat decay
  if (hasBeat) {
    beatPulse = 1.0;
  } else {
    beatPulse = Math.max(0, beatPulse - dt * 2.8);
  }

  const effectiveT = t + buttonAdvance;

  // Interpolate active Stimmung between day and night based on daylight
  const groundCol = lerpColor(STIMMUNG_NIGHT.ground, STIMMUNG_DAY.ground, daylight);
  fill(groundCol);

  const activePlanes = [];
  for (let i = 0; i < 4; i++) {
    activePlanes.push(lerpColor(STIMMUNG_NIGHT.planes[i], STIMMUNG_DAY.planes[i], daylight));
  }
  const actOverlaps = [];
  for (let i = 0; i < 6; i++) {
    actOverlaps.push(lerpColor(STIMMUNG_NIGHT.overlaps[i], STIMMUNG_DAY.overlaps[i], daylight));
  }
  const activeMulti = lerpColor(STIMMUNG_NIGHT.multi, STIMMUNG_DAY.multi, daylight);

  // 4x4 Concrete overlap matrix
  const overlapMatrix = [
    [0, actOverlaps[0], actOverlaps[1], actOverlaps[2]],
    [actOverlaps[0], 0, actOverlaps[3], actOverlaps[4]],
    [actOverlaps[1], actOverlaps[3], 0, actOverlaps[5]],
    [actOverlaps[2], actOverlaps[4], actOverlaps[5], 0],
  ];

  // Adagio timing: 9-second phrases (60% poised hold, 40% quintic smootherstep glide)
  const numComp = COMPOSITIONS.length;
  const phraseDuration = 9.0;
  const totalCycle = numComp * phraseDuration; // 54 seconds
  const globalCycleCount = Math.floor(effectiveT / totalCycle);
  const cycleFrac = (effectiveT % totalCycle) / phraseDuration;

  const curIdx = Math.floor(cycleFrac);
  const nextIdx = (curIdx + 1) % numComp;
  const frac = cycleFrac - curIdx;

  let u = 0;
  if (frac > 0.60) {
    const p = (frac - 0.60) / 0.40;
    // Quintic smootherstep for seamless acceleration and deceleration
    u = p * p * p * (p * (p * 6 - 15) + 10);
  }

  // Dancer's breath + slow non-repeating noise drift
  const breathX = 0.65 * Math.sin(effectiveT * 0.55 + 0.3);
  const breathY = 0.55 * Math.cos(effectiveT * 0.48 + 0.8);
  const slowDriftX = noise2(effectiveT * 0.015, 6.4) * 1.6;
  const slowDriftY = noise2(effectiveT * 0.015, 14.2) * 1.6;

  // Audio dilation: gentle resonant expansion outward from center (32, 32)
  const dilation = audioLvl * 2.2;

  const cA = COMPOSITIONS[curIdx];
  const cB = COMPOSITIONS[nextIdx];

  const planes = [];
  for (let i = 0; i < 4; i++) {
    const sgnX = (i % 2 === 0) ? 1 : -1;
    const sgnY = (i >= 2) ? 1 : -1;
    const baseX = lerp(cA[i].x, cB[i].x, u) + breathX * sgnX + slowDriftX;
    const baseY = lerp(cA[i].y, cB[i].y, u) + breathY * sgnY + slowDriftY;
    const baseW = lerp(cA[i].w, cB[i].w, u);
    const baseH = lerp(cA[i].h, cB[i].h, u);

    // Permute plane chromatic voice every full 54s cycle
    const colorIdx = (i + globalCycleCount) % 4;

    const x0 = (baseX - (baseX < 32 ? dilation : -dilation)) | 0;
    const y0 = (baseY - (baseY < 32 ? dilation : -dilation)) | 0;
    const x1 = (baseX + baseW + (baseX + baseW > 32 ? dilation : -dilation)) | 0;
    const y1 = (baseY + baseH + (baseY + baseH > 32 ? dilation : -dilation)) | 0;

    planes.push({ x0, y0, x1, y1, colIdx: colorIdx });
  }

  // Scanline evaluation of Concrete Art plane intersections
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      let count = 0;
      let c0 = -1, c1 = -1;

      for (let i = 0; i < 4; i++) {
        const p = planes[i];
        if (x >= p.x0 && x < p.x1 && y >= p.y0 && y < p.y1) {
          if (count === 0) c0 = p.colIdx;
          else if (count === 1) c1 = p.colIdx;
          count++;
        }
      }

      if (count === 0) continue;

      let c = 0;
      if (count === 1) {
        c = activePlanes[c0];
      } else if (count === 2) {
        c = overlapMatrix[c0][c1];
        if (beatPulse > 0.05) {
          c = lerpColor(c, rgb(235, 220, 205), beatPulse * 0.28);
        }
      } else {
        c = activeMulti;
        if (beatPulse > 0.05) {
          c = lerpColor(c, rgb(235, 220, 205), beatPulse * 0.2);
        }
      }

      setPixel(x, y, c);
    }
  }
}
