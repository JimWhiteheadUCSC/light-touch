/*@vfx
id: 998802e3-3b0d-40e2-91be-ac7a8f4089cb
title: Counterpoint Quartet
created: 2026-10-10
artist: Koushi (apprentice name)
influences:
  - verena-loewensberg
  - okazz
rationale: |
  A polyphonic kinetic artwork inspired by Verena Loewensberg's dual life
  as Zurich Concretist painter and proprietor of City-Discount, Zurich's
  pioneering 1960s experimental jazz record shop.
  
  Here, concrete geometry meets jazz polyrhythm across four 32x32 quadrants:
  1. Top-Left (The Drums): A syncopated 8-beat escapement dial and rotating
     dentil wheel that ticks through rhythmic subdivisions.
  2. Top-Right (The Harmony): Interlocking Loewensberg squares and columns
     modulating through four held chordal arrangements, where intersections
     produce dedicated third-tone harmonies (madder plum, port wine, bronze).
  3. Bottom-Left (The Cantilever): Stepped horizontal cantilevers and a golden
     key pip shifting across syncopated offset steps.
  4. Bottom-Right (The Bass): A walking horizontal bass bar traversing
     stave stations in polyrhythmic counterpoint.
  
  Weaving across all four quadrants is an Okazz-inspired Call-and-Response Duet:
  two kinetic character soloists (Soloist A and Soloist B) vaulting cell-to-cell
  between six distinct perch stations on easeInOutQuint arcs, squashing mid-flight
  and mutating shapes (disc-crescent, diamond spark, cantilever-key) upon lifecycle
  turnover.
  
  Reactivity: daylight shifts Stimmung across four authentic modal jazz chords
  ("Kind of Blue" Dorian slate, "Round Midnight" B-flat minor, "A Love Supreme"
  pine & saffron, and "Giant Steps" chromatic persimmon), audio beats trigger
  escapement ticks and bass walks, loudness adds brass luster, and the button
  ignites an instant syncopated duet leap.
@vfx*/

// counterpoint_quartet — buffer mode, reactive
// Loewensberg City-Discount jazz counterpoint meets Okazz kinetic character vaults.

const meta = {
  name: "counterpoint_quartet",
  fps: 30,
  inputs: ["audio", "clock", "button"],
};

// 4 Modal Jazz Chords (Loewensberg Stimmung)
const MODES = [
  // 0: "Kind of Blue" (Modal D Dorian - Slate, Cobalt, Vermilion, Ochre Gold)
  {
    bg: [22, 26, 36],
    ground2: [30, 36, 50],
    bar: [38, 72, 118],       // Cobalt bass bar
    square: [216, 72, 48],    // Lacquer vermilion
    col: [234, 182, 52],      // Ochre gold
    overlap: [188, 56, 84],   // Madder plum
    soloistA: [54, 162, 184], // Celadon teal
    soloistB: [246, 204, 68], // Marigold trumpet
    accent: [246, 204, 68],   // Marigold
    chalk: [248, 246, 240],   // Chalk ivory
  },
  // 1: "Round Midnight" (B-flat Minor - Midnight Charcoal, Wine, Burnt Cinnabar, Mauve)
  {
    bg: [28, 22, 32],
    ground2: [40, 30, 46],
    bar: [78, 52, 104],       // Midnight violet bar
    square: [204, 76, 58],    // Burnt cinnabar
    col: [156, 96, 168],      // Wisteria mauve
    overlap: [168, 62, 96],   // Port wine
    soloistA: [238, 162, 54], // Burnished amber
    soloistB: [224, 88, 118], // Rose lacquer
    accent: [224, 98, 122],   // Rose lacquer
    chalk: [246, 242, 250],   // Mist white
  },
  // 2: "A Love Supreme" (Coltrane Modal - Forest Slate, Pine, Saffron, Jade)
  {
    bg: [20, 28, 24],
    ground2: [28, 42, 34],
    bar: [38, 84, 72],        // Deep pine bar
    square: [242, 176, 46],   // Saffron gold
    col: [72, 152, 132],      // Celadon jade
    overlap: [186, 148, 58],  // Olive bronze
    soloistA: [224, 68, 52],  // Fiery vermilion
    soloistB: [118, 196, 164],// Mint jade
    accent: [248, 218, 78],   // Sunlit brass
    chalk: [242, 248, 242],   // Rice paper white
  },
  // 3: "Giant Steps" (Chromatic Cadence - Sumi, Cerulean, Persimmon, Lavender)
  {
    bg: [20, 22, 28],
    ground2: [30, 34, 44],
    bar: [54, 86, 138],       // French cobalt bar
    square: [226, 86, 48],    // Persimmon orange
    col: [56, 126, 152],      // Cerulean column
    overlap: [154, 74, 98],   // Mulberry
    soloistA: [244, 192, 56], // Marigold brass
    soloistB: [172, 132, 212],// Lavender mist
    accent: [236, 104, 68],   // Coral copper
    chalk: [248, 248, 254],   // Silver chalk
  },
];

const pal = {
  bg: [0, 0, 0],
  ground2: [0, 0, 0],
  bar: [0, 0, 0],
  square: [0, 0, 0],
  col: [0, 0, 0],
  overlap: [0, 0, 0],
  soloistA: [0, 0, 0],
  soloistB: [0, 0, 0],
  accent: [0, 0, 0],
  chalk: [0, 0, 0],
};

function lerp3(out, a, b, u) {
  out[0] = lerp(a[0], b[0], u) | 0;
  out[1] = lerp(a[1], b[1], u) | 0;
  out[2] = lerp(a[2], b[2], u) | 0;
}

function updatePalette(t, daylight, audioLuster) {
  const cycle = (t * 0.008 + daylight * 2.0) % 4.0;
  const mA = Math.floor(cycle);
  const mB = (mA + 1) % 4;
  const u = cycle - mA;
  const pA = MODES[mA];
  const pB = MODES[mB];

  lerp3(pal.bg, pA.bg, pB.bg, u);
  lerp3(pal.ground2, pA.ground2, pB.ground2, u);
  lerp3(pal.bar, pA.bar, pB.bar, u);
  lerp3(pal.square, pA.square, pB.square, u);
  lerp3(pal.col, pA.col, pB.col, u);
  lerp3(pal.overlap, pA.overlap, pB.overlap, u);
  lerp3(pal.soloistA, pA.soloistA, pB.soloistA, u);
  lerp3(pal.soloistB, pA.soloistB, pB.soloistB, u);
  lerp3(pal.accent, pA.accent, pB.accent, u);
  lerp3(pal.chalk, pA.chalk, pB.chalk, u);

  if (audioLuster > 1.0) {
    pal.accent[0] = Math.min(255, (pal.accent[0] * audioLuster) | 0);
    pal.accent[1] = Math.min(255, (pal.accent[1] * audioLuster) | 0);
    pal.accent[2] = Math.min(255, (pal.accent[2] * audioLuster) | 0);
    pal.chalk[0] = Math.min(255, (pal.chalk[0] * audioLuster) | 0);
    pal.chalk[1] = Math.min(255, (pal.chalk[1] * audioLuster) | 0);
    pal.chalk[2] = Math.min(255, (pal.chalk[2] * audioLuster) | 0);
  }
}

function easeInOutQuint(u) {
  return u < 0.5 ? 16 * u * u * u * u * u : 1 - Math.pow(-2 * u + 2, 5) / 2;
}

// Entities & States
let q0Dial = {
  angle: 0, toAngle: 0,
  cx: 15.5, cy: 15.5, r: 11.5,
  timer: 0.2, restDur: 1.1, moveDur: 0.26,
  state: "rest",
};

let q1Chord = {
  arrIdx: 0, timer: 0, phraseDur: 6.5, modDur: 1.2, isMod: false,
};
const Q1_CONFIGS = [
  { sqX: 43, sqY: 13, sqW: 13, sqH: 13, colX: 52, colY: 17, colW: 7, colH: 22 },
  { sqX: 47, sqY: 17, sqW: 15, sqH: 12, colX: 40, colY: 12, colW: 8, colH: 18 },
  { sqX: 41, sqY: 15, sqW: 12, sqH: 15, colX: 53, colY: 14, colW: 9, colH: 20 },
  { sqX: 48, sqY: 13, sqW: 14, sqH: 14, colX: 42, colY: 19, colW: 8, colH: 20 },
];

let q2Cantilever = {
  step: 0, timer: 0.8, restDur: 2.2, moveDur: 0.35, state: "rest",
  curOff: 0, toOff: 0,
};

let q3Bass = {
  step: 0, timer: 0.4, restDur: 1.6, moveDur: 0.32, state: "rest",
  curX: 48, toX: 48,
};
const Q3_TARGETS = [42, 52, 38, 54];

// Soloist Character Anchors (6 perch locations across 4 quadrants)
const QUAD_ANCHORS = [
  { q: 0, x: 15.5, y: 15.5 }, // Q0 Center Pin
  { q: 1, x: 48,   y: 12 },   // Q1 Upper Harmony
  { q: 2, x: 14,   y: 46 },   // Q2 Cantilever Key
  { q: 3, x: 48,   y: 48 },   // Q3 Bass Step
  { q: 1, x: 53,   y: 22 },   // Q1 Low Overlap
  { q: 2, x: 22,   y: 38 },   // Q2 Upper Step
];

// Call-and-Response Duet: Soloist A (Lead) and Soloist B (Counterpoint)
let soloistA = {
  id: 0, idx: 0, toIdx: 1,
  timer: 0.2, restDur: 1.4, moveDur: 0.42, state: "rest",
  shape: 0, actsLeft: 12,
};

let soloistB = {
  id: 1, idx: 3, toIdx: 2,
  timer: 0.8, restDur: 1.8, moveDur: 0.42, state: "rest",
  shape: 1, actsLeft: 10,
};

function drawBox(x0, y0, x1, y1, r, g, b) {
  const minX = Math.max(0, Math.round(x0));
  const maxX = Math.min(WIDTH - 1, Math.round(x1));
  const minY = Math.max(0, Math.round(y0));
  const maxY = Math.min(HEIGHT - 1, Math.round(y1));
  if (minX > maxX || minY > maxY) return;

  const col = rgb(r, g, b);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      setPixel(x, y, col);
    }
  }
}

function drawCircleAA(cx, cy, r, red, green, blue) {
  const rOut = r + 0.5;
  const rIn = Math.max(0, r - 0.5);
  const rOut2 = rOut * rOut;
  const rIn2 = rIn * rIn;
  const minX = Math.max(0, Math.floor(cx - rOut));
  const maxX = Math.min(WIDTH - 1, Math.ceil(cx + rOut));
  const minY = Math.max(0, Math.floor(cy - rOut));
  const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + rOut));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    if (dy2 >= rOut2) continue;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const d2 = dx * dx + dy2;
      if (d2 >= rOut2) continue;
      if (d2 <= rIn2) {
        setPixel(x, y, rgb(red, green, blue));
      } else {
        const dist = Math.sqrt(d2);
        const cov = smoothstep(rOut, rIn, dist);
        const prev = getPixel(x, y);
        const pr = (prev >> 16) & 255;
        const pg = (prev >> 8) & 255;
        const pb = prev & 255;
        const nr = lerp(pr, red, cov) | 0;
        const ng = lerp(pg, green, cov) | 0;
        const nb = lerp(pb, blue, cov) | 0;
        setPixel(x, y, rgb(nr, ng, nb));
      }
    }
  }
}

function updateSoloist(s, otherS, dt) {
  s.timer += dt;
  if (s.state === "rest") {
    if (s.timer >= s.restDur) {
      s.state = "vault";
      s.timer = 0;
      let nextIdx;
      let tries = 0;
      do {
        nextIdx = (Math.random() * QUAD_ANCHORS.length) | 0;
        tries++;
      } while ((nextIdx === s.idx || nextIdx === otherS.idx || nextIdx === otherS.toIdx) && tries < 8);
      s.toIdx = nextIdx;
      s.actsLeft--;
      if (s.actsLeft <= 0) {
        s.shape = (s.shape + 1) % 3;
        s.actsLeft = 8 + ((Math.random() * 6) | 0);
      }
    }
  } else if (s.state === "vault") {
    if (s.timer >= s.moveDur) {
      s.idx = s.toIdx;
      s.state = "rest";
      s.timer = 0;
      s.restDur = 1.0 + Math.random() * 1.5;
    }
  }
}

function updateState(dt, beat, btnPressed) {
  // Button reactivity: Trigger immediate syncopated takeoff for soloists
  if (btnPressed) {
    if (soloistA.state === "rest") soloistA.timer = soloistA.restDur;
    if (soloistB.state === "rest") soloistB.timer = soloistB.restDur;
    if (q0Dial.state === "rest") q0Dial.timer = q0Dial.restDur;
  }

  // Q0 Dial
  q0Dial.timer += dt;
  if (beat && q0Dial.state === "rest" && q0Dial.timer > 0.4) {
    q0Dial.timer = q0Dial.restDur;
  }
  if (q0Dial.state === "rest") {
    if (q0Dial.timer >= q0Dial.restDur) {
      q0Dial.state = "tick";
      q0Dial.timer = 0;
      q0Dial.toAngle = q0Dial.angle + Math.PI * 0.25;
    }
  } else if (q0Dial.state === "tick") {
    if (q0Dial.timer >= q0Dial.moveDur) {
      q0Dial.angle = q0Dial.toAngle % (Math.PI * 2);
      q0Dial.state = "rest";
      q0Dial.timer = 0;
      q0Dial.restDur = 0.9 + Math.random() * 0.8;
    }
  }

  // Q1 Harmony
  q1Chord.timer += dt;
  if (!q1Chord.isMod) {
    if (q1Chord.timer >= q1Chord.phraseDur) {
      q1Chord.isMod = true;
      q1Chord.timer = 0;
    }
  } else {
    if (q1Chord.timer >= q1Chord.modDur) {
      q1Chord.isMod = false;
      q1Chord.timer = 0;
      q1Chord.arrIdx = (q1Chord.arrIdx + 1) % Q1_CONFIGS.length;
    }
  }

  // Q2 Cantilever
  q2Cantilever.timer += dt;
  if (q2Cantilever.state === "rest") {
    if (q2Cantilever.timer >= q2Cantilever.restDur) {
      q2Cantilever.state = "move";
      q2Cantilever.timer = 0;
      q2Cantilever.step = (q2Cantilever.step + 1) % 3;
      const offs = [0, 4, -3];
      q2Cantilever.toOff = offs[q2Cantilever.step];
    }
  } else if (q2Cantilever.state === "move") {
    if (q2Cantilever.timer >= q2Cantilever.moveDur) {
      q2Cantilever.curOff = q2Cantilever.toOff;
      q2Cantilever.state = "rest";
      q2Cantilever.timer = 0;
      q2Cantilever.restDur = 1.8 + Math.random() * 1.2;
    }
  }

  // Q3 Bass
  q3Bass.timer += dt;
  if (beat && q3Bass.state === "rest" && q3Bass.timer > 0.5) {
    q3Bass.timer = q3Bass.restDur;
  }
  if (q3Bass.state === "rest") {
    if (q3Bass.timer >= q3Bass.restDur) {
      q3Bass.state = "step";
      q3Bass.timer = 0;
      q3Bass.step = (q3Bass.step + 1) % Q3_TARGETS.length;
      q3Bass.toX = Q3_TARGETS[q3Bass.step];
    }
  } else if (q3Bass.state === "step") {
    if (q3Bass.timer >= q3Bass.moveDur) {
      q3Bass.curX = q3Bass.toX;
      q3Bass.state = "rest";
      q3Bass.timer = 0;
      q3Bass.restDur = 1.4 + Math.random() * 0.9;
    }
  }

  // Soloists Update (Call and Response Duet)
  updateSoloist(soloistA, soloistB, dt);
  updateSoloist(soloistB, soloistA, dt);
}

function render(t, dt) {
  const stepDt = dt || 0.033;
  const daylight = input.clock.daylight !== undefined ? input.clock.daylight : 0.5;
  const audioLevel = input.audio.ok ? input.audio.level : 0;
  const beat = input.audio.ok && input.audio.beat;
  const btnPressed = input.button && input.button.pressed;
  const audioLuster = 1.0 + audioLevel * 0.35 + (input.button && input.button.down ? 0.25 : 0);

  updatePalette(t, daylight, audioLuster);
  updateState(stepDt, beat, btnPressed);

  // Backgrounds: Counterchanged Quadrant Grounds (Loewensberg Counterchange)
  drawBox(0, 0, 31, 31, pal.bg[0], pal.bg[1], pal.bg[2]);
  drawBox(32, 0, 63, 31, pal.ground2[0], pal.ground2[1], pal.ground2[2]);
  drawBox(0, 32, 31, 63, pal.ground2[0], pal.ground2[1], pal.ground2[2]);
  drawBox(32, 32, 63, 63, pal.bg[0], pal.bg[1], pal.bg[2]);

  // Quadrant dividing selvedges (Heitaro dentil lines)
  const selvedgeCol = rgb(pal.chalk[0] * 0.35, pal.chalk[1] * 0.35, pal.chalk[2] * 0.35);
  for (let i = 0; i < 64; i += 2) {
    setPixel(31, i, selvedgeCol);
    setPixel(i, 31, selvedgeCol);
  }

  // --- Q0: Drum Dial & Escapement Belt ---
  let curAng = q0Dial.angle;
  if (q0Dial.state === "tick") {
    const u = clamp(q0Dial.timer / q0Dial.moveDur, 0, 1);
    curAng = lerp(q0Dial.angle, q0Dial.toAngle, easeInOutQuint(u));
  }
  drawCircleAA(q0Dial.cx, q0Dial.cy, q0Dial.r, pal.bar[0], pal.bar[1], pal.bar[2]);
  drawCircleAA(q0Dial.cx, q0Dial.cy, q0Dial.r - 2.8, pal.bg[0], pal.bg[1], pal.bg[2]);
  for (let s = 0; s < 4; s++) {
    const th = curAng + s * (Math.PI * 0.5);
    const cosT = Math.cos(th), sinT = Math.sin(th);
    for (let d = 2; d < q0Dial.r - 1; d++) {
      const px = Math.round(q0Dial.cx + cosT * d);
      const py = Math.round(q0Dial.cy + sinT * d);
      setPixel(px, py, rgb(pal.accent[0], pal.accent[1], pal.accent[2]));
    }
  }
  drawCircleAA(q0Dial.cx, q0Dial.cy, 2.0, pal.chalk[0], pal.chalk[1], pal.chalk[2]);

  // --- Q1: Upper Harmony (Loewensberg Interlocking Figures) ---
  const curCfg = Q1_CONFIGS[q1Chord.arrIdx];
  const nextCfg = Q1_CONFIGS[(q1Chord.arrIdx + 1) % Q1_CONFIGS.length];
  let sqX = curCfg.sqX, sqY = curCfg.sqY, sqW = curCfg.sqW, sqH = curCfg.sqH;
  let colX = curCfg.colX, colY = curCfg.colY, colW = curCfg.colW, colH = curCfg.colH;

  if (q1Chord.isMod) {
    const u = clamp(q1Chord.timer / q1Chord.modDur, 0, 1);
    const eu = easeInOutQuint(u);
    sqX = lerp(curCfg.sqX, nextCfg.sqX, eu);
    sqY = lerp(curCfg.sqY, nextCfg.sqY, eu);
    sqW = lerp(curCfg.sqW, nextCfg.sqW, eu);
    sqH = lerp(curCfg.sqH, nextCfg.sqH, eu);
    colX = lerp(curCfg.colX, nextCfg.colX, eu);
    colY = lerp(curCfg.colY, nextCfg.colY, eu);
    colW = lerp(curCfg.colW, nextCfg.colW, eu);
    colH = lerp(curCfg.colH, nextCfg.colH, eu);
  }
  const sway = 0.4 * Math.sin(t * 1.5);
  sqX += sway; colY -= sway * 0.7;

  const sqX0 = sqX - sqW * 0.5, sqX1 = sqX + sqW * 0.5;
  const sqY0 = sqY - sqH * 0.5, sqY1 = sqY + sqH * 0.5;
  const colX0 = colX - colW * 0.5, colX1 = colX + colW * 0.5;
  const colY0 = colY - colH * 0.5, colY1 = colY + colH * 0.5;

  drawBox(sqX0, sqY0, sqX1, sqY1, pal.square[0], pal.square[1], pal.square[2]);
  drawBox(colX0, colY0, colX1, colY1, pal.col[0], pal.col[1], pal.col[2]);

  const ovX0 = Math.max(sqX0, colX0), ovX1 = Math.min(sqX1, colX1);
  const ovY0 = Math.max(sqY0, colY0), ovY1 = Math.min(sqY1, colY1);
  if (ovX1 > ovX0 && ovY1 > ovY0) {
    drawBox(ovX0, ovY0, ovX1, ovY1, pal.overlap[0], pal.overlap[1], pal.overlap[2]);
  }

  // --- Q2: Lower Harmony (Stepped Cantilevers & Key) ---
  let cOff = q2Cantilever.curOff;
  if (q2Cantilever.state === "move") {
    const u = clamp(q2Cantilever.timer / q2Cantilever.moveDur, 0, 1);
    cOff = lerp(q2Cantilever.curOff, q2Cantilever.toOff, easeInOutQuint(u));
  }
  drawBox(4, 40, 24 + cOff, 46, pal.bar[0], pal.bar[1], pal.bar[2]);
  drawBox(8 - cOff, 48, 28, 54, pal.square[0], pal.square[1], pal.square[2]);
  drawBox(18 + cOff * 0.5, 45, 22 + cOff * 0.5, 49, pal.accent[0], pal.accent[1], pal.accent[2]);

  // --- Q3: Walking Bass Bar & Rhythm Stave ---
  let curBassX = q3Bass.curX;
  if (q3Bass.state === "step") {
    const u = clamp(q3Bass.timer / q3Bass.moveDur, 0, 1);
    curBassX = lerp(q3Bass.curX, q3Bass.toX, easeInOutQuint(u));
  }
  drawBox(curBassX - 11, 47, curBassX + 11, 55, pal.bar[0], pal.bar[1], pal.bar[2]);
  drawBox(curBassX - 7, 49, curBassX + 7, 52, pal.col[0], pal.col[1], pal.col[2]);
  for (let y = 37; y <= 59; y += 7) {
    for (let x = 34; x <= 61; x += 4) {
      setPixel(x, y, rgb((pal.bg[0] * 1.5) | 0, (pal.bg[1] * 1.5) | 0, (pal.bg[2] * 1.5) | 0));
    }
  }

  // --- Render Soloists Duet (Call and Response) ---
  const soloists = [
    { s: soloistA, col: pal.soloistA, shape: soloistA.shape },
    { s: soloistB, col: pal.soloistB, shape: soloistB.shape },
  ];

  for (let i = 0; i < soloists.length; i++) {
    const item = soloists[i];
    const s = item.s;
    const ancFrom = QUAD_ANCHORS[s.idx];
    const ancTo = QUAD_ANCHORS[s.toIdx];
    let solX = ancFrom.x, solY = ancFrom.y;
    let lift = 0;
    let sqx = 1.0, sqy = 1.0;

    if (s.state === "vault") {
      const u = clamp(s.timer / s.moveDur, 0, 1);
      const eu = easeInOutQuint(u);
      solX = lerp(ancFrom.x, ancTo.x, eu);
      solY = lerp(ancFrom.y, ancTo.y, eu);
      lift = Math.sin(u * Math.PI) * 5.0;
      solY -= lift;
      sqx = 1.0 + 0.3 * Math.sin(u * Math.PI);
      sqy = 1.0 - 0.25 * Math.sin(u * Math.PI);
    }

    drawCircleAA(solX, solY, 3.4 * sqx, item.col[0], item.col[1], item.col[2]);
    drawCircleAA(solX, solY, 1.3, pal.chalk[0], pal.chalk[1], pal.chalk[2]);

    if (item.shape === 0) {
      drawCircleAA(solX + 2.0, solY - 1.4, 1.4, pal.bg[0], pal.bg[1], pal.bg[2]);
    } else if (item.shape === 1) {
      setPixel(Math.round(solX - 4), Math.round(solY), rgb(pal.accent[0], pal.accent[1], pal.accent[2]));
      setPixel(Math.round(solX + 4), Math.round(solY), rgb(pal.accent[0], pal.accent[1], pal.accent[2]));
      setPixel(Math.round(solX), Math.round(solY - 4), rgb(pal.accent[0], pal.accent[1], pal.accent[2]));
      setPixel(Math.round(solX), Math.round(solY + 4), rgb(pal.accent[0], pal.accent[1], pal.accent[2]));
    } else {
      drawBox(solX - 4, solY + 2.5, solX + 4, solY + 4.5, pal.accent[0], pal.accent[1], pal.accent[2]);
    }
  }
}
