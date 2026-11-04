/*@vfx
id: 5332f9ed-4e31-4baf-a126-8f4766269226
title: Passing Tones
created: 2026-10-12
artist: Zuanya (apprentice name)
influences: [verena-loewensberg]
rationale: |
  Third piece, third office: Loewensberg's FRAME. Held compositions of
  overlapping squares, bars and discs on a chosen ground (never default
  black - the ground is a participant in the chord). A hidden 4px module
  grid governs placement and is never shown; color does the work
  structure usually does: a chord of neighbors plus one complement
  accent. Motion as chord changes: every 5-8s two or three shapes
  modulate to new module positions on a slow adagio ease, sometimes
  changing voice as they move - a passing tone, crossfaded like a
  suspension resolving. Between changes the still is never fixed: each
  voice's value is slowly re-tuned on its own period (Stimmung as
  continuous adjustment - her shifting optical effects, sequenced in
  time). The clock re-chords the piece warm and bright by day, cool
  and dim by night (hue travels the long way around the wheel, never
  through green).
@vfx*/

const meta = { name: "passing_tones", fps: 30, inputs: ["clock"] };

const N = 9;
const LLEV = 32;
let shapes = [];
let nextMod = 5;

// Slow room-light: two axis-cached sines, rebuilt once per frame.
const LX = new Float32Array(64);
const LY = new Float32Array(64);
let __lt = -1;
function lightIdx(x, y, t) {
  if (t !== __lt) {
    __lt = t;
    for (let i = 0; i < 64; i++) {
      LX[i] = Math.sin(i * 0.11 + t * 0.28);
      LY[i] = Math.sin(i * 0.09 - t * 0.22);
    }
  }
  const l = 0.85 + 0.15 * LX[x] * LY[y]; // 0.70..1.00
  return ((l - 0.7) * 106.6) | 0; // 0..31
}

function rnd(a, b) { return a + Math.random() * (b - a); }

// Asymmetric poise, not clustering: reject centers within 10px of
// another shape's current center (a few tries only).
function tooClose(s, cx, cy) {
  for (const o of shapes) {
    if (o === s) continue;
    const ox = o.type === 1 ? o.x : o.x + o.w / 2;
    const oy = o.type === 1 ? o.y : o.y + o.h / 2;
    const dx = cx - ox, dy = cy - oy;
    if (dx * dx + dy * dy < 100) return true;
  }
  return false;
}

function centerX(s) { return s.type === 1 ? s.x : s.x + s.w / 2; }
function centerY(s) { return s.type === 1 ? s.y : s.y + s.h / 2; }

function assignTarget(s, init) {
  for (let tries = 0; tries < 10; tries++) {
    if (s.type === 1) {
      s.tr = rnd(5, 12);
      s.tw = 0; s.th = 0;
      const m = Math.ceil(s.tr) + 1;
      s.tx = 2 * Math.round(rnd(m, WIDTH - m) / 2);
      s.ty = 2 * Math.round(rnd(m, HEIGHT - m) / 2);
    } else {
      s.tr = 0;
      s.tw = 4 * (2 + ((Math.random() * 5) | 0)); // 8..24 px, module grid
      s.th = 4 * (2 + ((Math.random() * 5) | 0));
      s.tx = 2 * Math.round(rnd(2, WIDTH - s.tw - 2) / 2);
      s.ty = 2 * Math.round(rnd(2, HEIGHT - s.th - 2) / 2);
    }
    const ncx = s.type === 1 ? s.tx : s.tx + s.tw / 2;
    const ncy = s.type === 1 ? s.ty : s.ty + s.th / 2;
    if (tooClose(s, ncx, ncy)) continue;
    // A modulation should travel: reject targets near the current spot.
    if (!init) {
      const dx = ncx - centerX(s), dy = ncy - centerY(s);
      if (dx * dx + dy * dy < 196) continue; // 14px min travel
    }
    break;
  }
  if (!init) {
    s.ox = s.x; s.oy = s.y; s.ow = s.w; s.oh = s.h; s.orr = s.r;
    s.orole = s.role;
    s.u = 0;
    s.dur = rnd(2, 3.5);
    // Passing tone: sometimes the shape changes voice as it moves.
    if (Math.random() < 0.4) s.role = (s.role + 1 + ((Math.random() * 2) | 0)) % 4;
  } else {
    s.orole = s.role;
  }
}

function setup() {
  for (let i = 0; i < N; i++) {
    const s = {
      type: i % 3 === 2 ? 1 : 0, // every third shape a disc
      role: i === 4 ? 3 : i % 3, // one complement accent
      phase: rnd(0, 6.28),
      u: 1, dur: 1,
      ox: 0, oy: 0, ow: 0, oh: 0, orr: 0,
      pal: new Int32Array(LLEV),
    };
    assignTarget(s, true);
    s.x = s.tx; s.y = s.ty; s.w = s.tw; s.h = s.th; s.r = s.tr;
    shapes.push(s);
  }
}

function scaleC(c, f) {
  return rgb(((c >> 16) & 255) * f, ((c >> 8) & 255) * f, (c & 255) * f);
}

function mixc(a, b, u) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return rgb(ar + (br - ar) * u, ag + (bg - ag) * u, ab + (bb - ab) * u);
}

// Build this shape's 32-entry light palette once per frame.
function buildPal(s, col, br) {
  for (let k = 0; k < LLEV; k++) {
    s.pal[k] = scaleC(col, br * (0.7 + (k * 0.3) / 31));
  }
}

function drawShape(s, t) {
  if (s.type === 0) {
    const x0 = Math.round(s.x), y0 = Math.round(s.y);
    const x1 = Math.round(s.x + s.w), y1 = Math.round(s.y + s.h);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        setPixel(x, y, s.pal[lightIdx(x, y, t)]);
      }
    }
  } else {
    const cx = s.x, cy = s.y, r = s.r;
    const x0 = Math.max(0, Math.floor(cx - r - 1));
    const x1 = Math.min(WIDTH - 1, Math.ceil(cx + r + 1));
    const y0 = Math.max(0, Math.floor(cy - r - 1));
    const y1 = Math.min(HEIGHT - 1, Math.ceil(cy + r + 1));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy);
        const a = 1 - smoothstep(r - 0.9, r + 0.2, d);
        if (a <= 0) continue;
        setPixel(x, y, mixc(getPixel(x, y), s.pal[lightIdx(x, y, t)], a));
      }
    }
  }
}

const groundPal = new Int32Array(LLEV);

function render(t, dt) {
  const dl = input.clock.daylight;
  // Hue path goes the long way around the wheel (violet night -> warm
  // day, via values >1 that hsv() wraps) so it never crosses green.
  const base = lerp(0.72, 1.06, dl) + 0.05 * Math.sin(t * 0.017);
  const sat = lerp(0.5, 0.68, dl);
  const val = lerp(0.5, 0.7, dl);

  // The chord of neighbors: hues ~0.04 apart (above the 0.02
  // quantization floor) with stepped values, plus one complement.
  // Each voice's value is slowly re-tuned on its own period - Stimmung
  // as continuous adjustment, the still canvas never fixed.
  const chord = [];
  for (let i = 0; i < 4; i++) {
    const vm = 1 + 0.2 * Math.sin(t * (0.35 + 0.07 * i) + i * 1.7);
    const vv = [1, 0.85, 1.18, 1.2][i];
    const hh = [0, 0.045, -0.04, 0.5][i];
    const ss = [1, 0.95, 1.08, 1][i];
    const v = Math.min(1, val * vv * vm);
    chord[i] = hsv(base + hh, Math.min(1, sat * ss), v * v);
  }
  const gv = lerp(0.05, 0.1, dl) * (1 + 0.15 * Math.sin(t * 0.27 + 3));
  const ground = hsv(base + 0.015, sat * 0.55, gv);

  for (let k = 0; k < LLEV; k++) {
    groundPal[k] = scaleC(ground, 0.7 + (k * 0.3) / 31);
  }
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      setPixel(x, y, groundPal[lightIdx(x, y, t)]);
    }
  }

  if (t >= nextMod) {
    nextMod = t + rnd(5, 8);
    const k = 2 + (Math.random() < 0.5 ? 1 : 0);
    for (let j = 0; j < k; j++) {
      assignTarget(shapes[(Math.random() * N) | 0], false);
    }
  }

  for (const s of shapes) {
    let col = chord[s.role];
    if (s.u < 1) {
      s.u = Math.min(1, s.u + dt / s.dur);
      const e = smoothstep(0, 1, s.u);
      s.x = lerp(s.ox, s.tx, e);
      s.y = lerp(s.oy, s.ty, e);
      if (s.type === 1) s.r = lerp(s.orr, s.tr, e);
      else { s.w = lerp(s.ow, s.tw, e); s.h = lerp(s.oh, s.th, e); }
      // Voice change crossfades across the whole move: a suspension
      // resolving, not a pop.
      col = mixc(chord[s.orole], chord[s.role], e);
    }
    // Breathing: the held chord is tuned, never frozen.
    const breathe = 0.78 + 0.22 * Math.sin(t * 0.7 + s.phase);
    buildPal(s, col, breathe);
    drawShape(s, t);
  }
}
