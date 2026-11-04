/*@vfx
id: c4435583-2b07-4cf0-9353-22e920fed044
title: Stimmung Suite
created: 2026-10-10
artist: Koushi (apprentice name)
influences:
  - verena-loewensberg
rationale: |
  A concrete art kinetic suite dedicated to Verena Loewensberg (1912–1986),
  Zurich Concretist, dancer with Trudi Schoop, and proprietor of Zurich's
  pioneering City-Discount jazz record shop.
  
  Loewensberg holds the FRAME in our roster: her office is the still,
  and any paused frame must be a composed canvas. Here, the 64x64 matrix
  cycles through a four-movement progression of held geometric compositions:
  1. Movement I: Two Overlapping Squares & Vertical Accent Column.
  2. Movement II: Off-Center Disc & Intersecting Petrol Column.
  3. Movement III: Asymmetric Golden Quadrants with Cantilever Key.
  4. Movement IV: Stepped Horizontal Cantilevers & Floating Wisteria Ring.
  
  The work embodies her signature moves:
  - Overlap color logic: where figures intersect, a new third tone is born
    (madder crimson, deep plum, terracotta earth) rather than a simple blend.
  - Asymmetric poise: visual weight balanced across chromatic temperature
    and area, rather than formal symmetry.
  - Motion as chord changes: an adagio dance structure (18s held poise,
    6s suspension crossfade) with subtle sub-pixel breathing (0.6–0.8 Hz
    dance sway) that keeps the composition vital without disrupting stillness.
  - City-Discount jazz swell: audio levels gently modulate chromatic luster,
    while daylight shifts the ground from midnight ink to daytime slate.
@vfx*/

// stimmung_suite — buffer mode, reactive
// Zurich Concretism in kinetic progression: four composed movements
// exploring overlap logic, asymmetric poise, and Stimmung modulation.

const meta = {
  name: "stimmung_suite",
  fps: 30,
  inputs: ["audio", "clock"],
};

// --- Fast Rasterization & Blending Helpers ----------------------------------

function fillFb(fb, r, g, b) {
  const ir = r | 0, ig = g | 0, ib = b | 0;
  for (let i = 0; i < WIDTH * HEIGHT * 3; i += 3) {
    fb[i] = ir;
    fb[i + 1] = ig;
    fb[i + 2] = ib;
  }
}

function blendFb(fb, x, y, r, g, b, alpha) {
  if (alpha <= 0.01 || x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const idx = (y * WIDTH + x) * 3;
  const or = fb[idx];
  const og = fb[idx + 1];
  const ob = fb[idx + 2];
  const a = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
  const invA = 1 - a;
  fb[idx] = (or * invA + r * a) | 0;
  fb[idx + 1] = (og * invA + g * a) | 0;
  fb[idx + 2] = (ob * invA + b * a) | 0;
}

function drawRectFb(fb, cx, cy, hw, hh, r, g, b, alpha) {
  if (alpha <= 0.01) return;
  const x0 = cx - hw, x1 = cx + hw;
  const y0 = cy - hh, y1 = cy + hh;
  const minX = Math.max(0, (x0 - 1) | 0);
  const maxX = Math.min(WIDTH - 1, Math.ceil(x1 + 1));
  const minY = Math.max(0, (y0 - 1) | 0);
  const maxY = Math.min(HEIGHT - 1, Math.ceil(y1 + 1));

  for (let y = minY; y <= maxY; y++) {
    let covY = 1.0;
    if (y < y0) covY = 0.5 - (y0 - y);
    else if (y > y1) covY = 0.5 - (y - y1);
    if (covY <= 0) continue;
    if (covY > 1) covY = 1.0;

    for (let x = minX; x <= maxX; x++) {
      let covX = 1.0;
      if (x < x0) covX = 0.5 - (x0 - x);
      else if (x > x1) covX = 0.5 - (x - x1);
      if (covX <= 0) continue;
      if (covX > 1) covX = 1.0;

      const cov = covX * covY;
      blendFb(fb, x, y, r, g, b, cov * alpha);
    }
  }
}

function drawRectOverlapFb(fb, x0A, x1A, y0A, y1A, x0B, x1B, y0B, y1B, red, green, blue, alpha) {
  const x0 = Math.max(x0A, x0B);
  const x1 = Math.min(x1A, x1B);
  const y0 = Math.max(y0A, y0B);
  const y1 = Math.min(y1A, y1B);
  if (x1 <= x0 || y1 <= y0) return;
  const hw = (x1 - x0) * 0.5;
  const hh = (y1 - y0) * 0.5;
  const cx = x0 + hw;
  const cy = y0 + hh;
  drawRectFb(fb, cx, cy, hw, hh, red, green, blue, alpha);
}

function drawCircleFb(fb, cx, cy, r, red, green, blue, alpha) {
  if (alpha <= 0.01) return;
  const rOut = r + 0.5;
  const rIn = r - 0.5;
  const r2Out = rOut * rOut;
  const r2In = rIn * rIn;
  const minX = Math.max(0, (cx - rOut) | 0);
  const maxX = Math.min(WIDTH - 1, Math.ceil(cx + rOut));
  const minY = Math.max(0, (cy - rOut) | 0);
  const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + rOut));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const d2 = dx * dx + dy2;
      if (d2 >= r2Out) continue;
      if (d2 <= r2In) {
        blendFb(fb, x, y, red, green, blue, alpha);
      } else {
        const d = Math.sqrt(d2);
        let cov = 0.5 - (d - r);
        if (cov > 1) cov = 1; else if (cov < 0) cov = 0;
        blendFb(fb, x, y, red, green, blue, cov * alpha);
      }
    }
  }
}

function drawDiscRectOverlapFb(fb, cx, cy, r, barX, barY, barHW, barHH, red, green, blue, alpha) {
  const x0 = barX - barHW, x1 = barX + barHW;
  const y0 = barY - barHH, y1 = barY + barHH;
  const minX = Math.max(0, Math.max((cx - r - 1) | 0, (x0 - 1) | 0));
  const maxX = Math.min(WIDTH - 1, Math.min(Math.ceil(cx + r + 1), Math.ceil(x1 + 1)));
  const minY = Math.max(0, Math.max((cy - r - 1) | 0, (y0 - 1) | 0));
  const maxY = Math.min(HEIGHT - 1, Math.min(Math.ceil(cy + r + 1), Math.ceil(y1 + 1)));
  if (minX > maxX || minY > maxY) return;

  for (let y = minY; y <= maxY; y++) {
    let covY = 1.0;
    if (y < y0) covY = 0.5 - (y0 - y);
    else if (y > y1) covY = 0.5 - (y - y1);
    if (covY <= 0) continue;
    if (covY > 1) covY = 1.0;

    const dy = y - cy;
    const dy2 = dy * dy;

    for (let x = minX; x <= maxX; x++) {
      let covX = 1.0;
      if (x < x0) covX = 0.5 - (x0 - x);
      else if (x > x1) covX = 0.5 - (x - x1);
      if (covX <= 0) continue;
      if (covX > 1) covX = 1.0;

      const d2 = (x - cx) * (x - cx) + dy2;
      const d = Math.sqrt(d2);
      let covCirc = 0.5 - (d - r);
      if (covCirc <= 0) continue;
      if (covCirc > 1) covCirc = 1.0;

      const covBox = covX * covY;
      const cov = Math.min(covBox, covCirc);
      blendFb(fb, x, y, red, green, blue, cov * alpha);
    }
  }
}

function drawRingFb(fb, cx, cy, rOut, rIn, red, green, blue, alpha) {
  if (alpha <= 0.01) return;
  const rOutMax = rOut + 0.5;
  const rOutMin = rOut - 0.5;
  const rInMax = rIn + 0.5;
  const rInMin = rIn - 0.5;

  const r2OutMax = rOutMax * rOutMax;
  const r2OutMin = rOutMin * rOutMin;
  const r2InMax = rInMax * rInMax;
  const r2InMin = rInMin * rInMin;

  const minX = Math.max(0, (cx - rOutMax) | 0);
  const maxX = Math.min(WIDTH - 1, Math.ceil(cx + rOutMax));
  const minY = Math.max(0, (cy - rOutMax) | 0);
  const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + rOutMax));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const d2 = dx * dx + dy2;
      if (d2 >= r2OutMax || d2 <= r2InMin) continue;
      if (d2 <= r2OutMin && d2 >= r2InMax) {
        blendFb(fb, x, y, red, green, blue, alpha);
      } else {
        const d = Math.sqrt(d2);
        let covOut = 0.5 - (d - rOut);
        let covIn = 0.5 - (rIn - d);
        if (covOut > 1) covOut = 1; else if (covOut < 0) covOut = 0;
        if (covIn > 1) covIn = 1; else if (covIn < 0) covIn = 0;
        const cov = Math.min(covOut, covIn);
        blendFb(fb, x, y, red, green, blue, cov * alpha);
      }
    }
  }
}

// --- Movement Compositions --------------------------------------------------

// Movement 0: Two Overlapping Squares & Vertical Accent Column
function drawComp0(fb, t, daylight, audioLevel) {
  const breath = Math.sin(t * 0.75) * 1.5;
  const sway = Math.cos(t * 0.48) * 1.8;
  const swell = 1.0 + 0.12 * Math.sin(t * 1.4) + (audioLevel * 0.18);

  const bgR = lerp(18, 28, daylight) | 0;
  const bgG = lerp(20, 30, daylight) | 0;
  const bgB = lerp(26, 36, daylight) | 0;
  fillFb(fb, bgR, bgG, bgB);

  const sq1_x = 24 + sway, sq1_y = 23 + breath * 0.7, sq1_h = 13.5;
  const sq2_x = 38 - sway * 0.8, sq2_y = 37 - breath * 0.8, sq2_h = 14 + breath * 0.3;
  const bar_x = 54 + sway * 0.4, bar_y = 28 + breath * 0.5, bar_hw = 2.5, bar_hh = 16.5;

  // Cobalt column
  drawRectFb(fb, bar_x, bar_y, bar_hw, bar_hh, clamp(48 * swell, 0, 255), clamp(108 * swell, 0, 255), clamp(168 * swell, 0, 255), 1.0);

  // Vermilion square
  drawRectFb(fb, sq1_x, sq1_y, sq1_h, sq1_h, clamp(218 * swell, 0, 255), clamp(72 * swell, 0, 255), clamp(42 * swell, 0, 255), 1.0);

  // Ochre gold square
  drawRectFb(fb, sq2_x, sq2_y, sq2_h, sq2_h, clamp(232 * swell, 0, 255), clamp(172 * swell, 0, 255), clamp(48 * swell, 0, 255), 1.0);

  // Overlap: deep madder crimson
  drawRectOverlapFb(
    fb,
    sq1_x - sq1_h, sq1_x + sq1_h, sq1_y - sq1_h, sq1_y + sq1_h,
    sq2_x - sq2_h, sq2_x + sq2_h, sq2_y - sq2_h, sq2_y + sq2_h,
    182, 54, 68, 1.0
  );
}

// Movement 1: Off-Center Disc & Intersecting Petrol Column
function drawComp1(fb, t, daylight, audioLevel) {
  const breath = Math.sin(t * 0.65) * 1.6;
  const sway = Math.cos(t * 0.42) * 1.6;
  const swell = 1.0 + 0.12 * Math.sin(t * 1.3) + (audioLevel * 0.18);

  const bgR = lerp(28, 36, daylight) | 0;
  const bgG = lerp(24, 30, daylight) | 0;
  const bgB = lerp(26, 32, daylight) | 0;
  fillFb(fb, bgR, bgG, bgB);

  const cxDisc = 26 + sway, cyDisc = 30 + breath, rDisc = 20;
  const barX = 42 - sway * 0.6, barY = 32 + breath * 0.4, barHW = 12, barHH = 22;
  const accX = 14 + sway * 0.4, accY = 52 - breath * 0.5, accHW = 8, accHH = 4;

  // Ochre foot accent
  drawRectFb(fb, accX, accY, accHW, accHH, clamp(235 * swell, 0, 255), clamp(180 * swell, 0, 255), clamp(50 * swell, 0, 255), 1.0);

  // Teal petrol field
  drawRectFb(fb, barX, barY, barHW, barHH, clamp(44 * swell, 0, 255), clamp(118 * swell, 0, 255), clamp(132 * swell, 0, 255), 1.0);

  // Vermilion disc
  drawCircleFb(fb, cxDisc, cyDisc, rDisc, clamp(212 * swell, 0, 255), clamp(66 * swell, 0, 255), clamp(50 * swell, 0, 255), 1.0);

  // Overlap: deep plum crescent
  drawDiscRectOverlapFb(fb, cxDisc, cyDisc, rDisc, barX, barY, barHW, barHH, 138, 48, 76, 1.0);
}

// Movement 2: Asymmetric Golden Quadrants with Cantilever Key
function drawComp2(fb, t, daylight, audioLevel) {
  const breath = Math.sin(t * 0.72) * 1.4;
  const sway = Math.cos(t * 0.52) * 1.5;
  const swell = 1.0 + 0.12 * Math.sin(t * 1.5) + (audioLevel * 0.18);

  const bgR = lerp(16, 24, daylight) | 0;
  const bgG = lerp(22, 28, daylight) | 0;
  const bgB = lerp(24, 30, daylight) | 0;
  fillFb(fb, bgR, bgG, bgB);

  const b1 = { x: 20 + sway, y: 22 + breath, hw: 14, hh: 16 };
  const b2 = { x: 26 - sway, y: 44 - breath, hw: 18, hh: 12 };
  const b3 = { x: 48 + sway * 0.5, y: 32 + breath * 0.3, hw: 10, hh: 26 };
  const bKey = { x: 34 - sway * 0.3, y: 34 + breath * 0.8, hw: 7, hh: 2.5 };

  // Deep teal indigo (b3)
  drawRectFb(fb, b3.x, b3.y, b3.hw, b3.hh, clamp(38 * swell, 0, 255), clamp(84 * swell, 0, 255), clamp(118 * swell, 0, 255), 1.0);

  // Celadon sage (b1)
  drawRectFb(fb, b1.x, b1.y, b1.hw, b1.hh, clamp(86 * swell, 0, 255), clamp(142 * swell, 0, 255), clamp(114 * swell, 0, 255), 1.0);

  // Burnt terracotta / cinnabar (b2)
  drawRectFb(fb, b2.x, b2.y, b2.hw, b2.hh, clamp(196 * swell, 0, 255), clamp(62 * swell, 0, 255), clamp(54 * swell, 0, 255), 1.0);

  // Overlap of b1 & b2
  drawRectOverlapFb(
    fb,
    b1.x - b1.hw, b1.x + b1.hw, b1.y - b1.hh, b1.y + b1.hh,
    b2.x - b2.hw, b2.x + b2.hw, b2.y - b2.hh, b2.y + b2.hh,
    142, 78, 58, 1.0
  );

  // Key chord: Warm marigold
  drawRectFb(fb, bKey.x, bKey.y, bKey.hw, bKey.hh, clamp(240 * swell, 0, 255), clamp(190 * swell, 0, 255), clamp(42 * swell, 0, 255), 1.0);
}

// Movement 3: Stepped Horizontal Cantilevers & Floating Ring
function drawComp3(fb, t, daylight, audioLevel) {
  const breath = Math.sin(t * 0.8) * 1.5;
  const sway = Math.cos(t * 0.45) * 1.6;
  const swell = 1.0 + 0.12 * Math.sin(t * 1.35) + (audioLevel * 0.18);

  const bgR = lerp(24, 32, daylight) | 0;
  const bgG = lerp(20, 26, daylight) | 0;
  const bgB = lerp(28, 34, daylight) | 0;
  fillFb(fb, bgR, bgG, bgB);

  const bar1 = { x: 30 + sway, y: 18 + breath * 0.5, hw: 18, hh: 6 };
  const bar2 = { x: 36 - sway * 0.8, y: 30 - breath * 0.4, hw: 20, hh: 6 };
  const bar3 = { x: 24 + sway * 0.6, y: 42 + breath * 0.6, hw: 16, hh: 6 };
  const discX = 46 - sway * 0.4, discY = 48 + breath, discR = 10, innerR = 4.5;

  // Ochre gold bar1
  drawRectFb(fb, bar1.x, bar1.y, bar1.hw, bar1.hh, clamp(228 * swell, 0, 255), clamp(168 * swell, 0, 255), clamp(46 * swell, 0, 255), 1.0);

  // Deep cerulean bar2
  drawRectFb(fb, bar2.x, bar2.y, bar2.hw, bar2.hh, clamp(42 * swell, 0, 255), clamp(96 * swell, 0, 255), clamp(154 * swell, 0, 255), 1.0);

  // Lacquer vermilion bar3
  drawRectFb(fb, bar3.x, bar3.y, bar3.hw, bar3.hh, clamp(214 * swell, 0, 255), clamp(64 * swell, 0, 255), clamp(46 * swell, 0, 255), 1.0);

  // Floating ring: Wisteria lilac
  drawRingFb(fb, discX, discY, discR, innerR, clamp(172 * swell, 0, 255), clamp(128 * swell, 0, 255), clamp(186 * swell, 0, 255), 1.0);
}

// Preallocated framebuffers for modulation blending
const fbA = new Uint8Array(WIDTH * HEIGHT * 3);
const fbB = new Uint8Array(WIDTH * HEIGHT * 3);

function render(t, dt) {
  const daylight = input.clock.daylight !== undefined ? input.clock.daylight : 0.5;
  const audioLevel = input.audio.ok ? input.audio.level : 0;

  // Progression pacing: 24 seconds per movement (18s held poise, 6s suspension crossfade)
  const MOVEMENT_DUR = 24.0;
  const TRANSITION_DUR = 6.0;

  const cycleTime = t % (MOVEMENT_DUR * 4);
  const movIndex = Math.floor(cycleTime / MOVEMENT_DUR);
  const movTime = cycleTime - movIndex * MOVEMENT_DUR;
  const nextIndex = (movIndex + 1) % 4;

  const drawFns = [drawComp0, drawComp1, drawComp2, drawComp3];

  if (movTime < MOVEMENT_DUR - TRANSITION_DUR) {
    // Pure held movement with adagio breathing
    drawFns[movIndex](fbA, t, daylight, audioLevel);
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const idx = (y * WIDTH + x) * 3;
        setPixel(x, y, rgb(fbA[idx], fbA[idx + 1], fbA[idx + 2]));
      }
    }
  } else {
    // Suspension crossfade modulation between movements
    const u = (movTime - (MOVEMENT_DUR - TRANSITION_DUR)) / TRANSITION_DUR;
    const fadeU = smoothstep(0, 1, u);
    const invU = 1.0 - fadeU;
    drawFns[movIndex](fbA, t, daylight, audioLevel);
    drawFns[nextIndex](fbB, t, daylight, audioLevel);

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const idx = (y * WIDTH + x) * 3;
        const r = (fbA[idx] * invU + fbB[idx] * fadeU) | 0;
        const g = (fbA[idx + 1] * invU + fbB[idx + 1] * fadeU) | 0;
        const b = (fbA[idx + 2] * invU + fbB[idx + 2] * fadeU) | 0;
        setPixel(x, y, rgb(r, g, b));
      }
    }
  }
}
