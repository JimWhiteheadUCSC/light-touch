/*@vfx
id: fdccb94c-2bed-45d3-ae56-fce11c39d795
title: Adagio for Three Neighbors
created: 2026-10-12
artist: Solyanka (apprentice name)
lineage:
  - id: 14472f2e-b8c5-4a91-97ae-37b62d492d0a
    relation: inspiration
    note: continued the single-office discipline after Vaults held Okazz's
      time alone; this one holds Loewensberg's frame alone, completing the
      triad of single-office studies
influences:
  - verena-loewensberg
rationale: |
  Third piece of the practice, holding Loewensberg's office alone: the
  FRAME. Compositions of three overlapping primitives (square, circle,
  bar) placed by a hidden golden-angle system that is never shown; a
  chord of three neighbor hues over a chosen (never black) ground;
  overlap regions average their parents' colors, the place where color
  logic happens. Motion is chord changes, her adagio against Okazz's
  allegro: compositions are drawn alternately into two small canvases
  and the panel watches a soft wipe travel between them - every fourth
  transition a hard cut, a cadence. A composition holds roughly thirteen
  seconds, but it is a held POSE, never a frozen canvas: each shape
  breathes on its own slow phase (her shifting optical effects, the
  still canvas that feels adjusted, not fixed), the chord's values
  breathe out of phase, and a slow diagonal sweep of light crosses the
  whole panel like afternoon sun moving across a painting. The clock
  re-chords the progression, violet-blue by night to rose by day
  (Stimmung made temporal), and a slow hue drift means no chord ever
  exactly repeats. Side taken in the roster's standing argument:
  hers - geometry is itself, though the title admits the mood she
  could not help naming.
@vfx*/

// Adagio for Three Neighbors — buffer mode
// Loewensberg's office alone: held compositions of three overlapping
// primitives on a hidden golden-angle system, a chord of three neighbor
// hues over a chosen ground. Two canvases, a soft traveling wipe between
// them; every fourth transition is a hard cut. Clock re-chords the day.

const meta = { name: "adagio_for_three_neighbors", fps: 30, inputs: ["clock"] };

const HOLD = 13;
const XF = 4.5;
const GA = 2.399963; // golden angle — the hidden system

function hash(n) { return fract(Math.sin(n * 127.1 + 311.7) * 43758.5453); }

const cA = new Uint32Array(4096); // the previous composition
const cB = new Uint32Array(4096); // the current one, redrawn each frame

const SC = new Int32Array(3);     // the chord, packed
const dX = new Float32Array(3), dY = new Float32Array(3);
const rowA = new Float32Array(64);
let groundC = 0;
let uB = 1, lastK = -1, lastCut = false;

function setChord(t) {
  const dl = input.clock.daylight;
  const drift = t * 0.0008; // slow hue drift — no chord ever exactly repeats
  const base = lerp(0.68, 0.96, dl) + drift;
  groundC = hsv(base + 0.03, 0.55, lerp(0.07, 0.12, dl));
  const hoff = [0, 0.09, -0.08], ss = [0.75, 0.7, 0.8], vv = [1.0, 0.85, 1.12];
  for (let i = 0; i < 3; i++) {
    // the chord's values breathe out of phase, like light across a painting
    const vb = 1 + 0.18 * Math.sin(t * 0.3 + i * 2.4);
    SC[i] = hsv(base + hoff[i], ss[i], clamp(lerp(0.44, 0.62, dl) * vv[i] * vb, 0, 0.72));
    // each shape breathes on its own slow phase; the poise adjusts in the hold
    dX[i] = 2.6 * Math.sin(t * 0.45 + i * 2.1) + 1.2 * Math.sin(t * 0.19 + i);
    dY[i] = 2.6 * Math.cos(t * 0.37 + i * 1.3) + 1.2 * Math.cos(t * 0.15 + i * 2.6);
  }
}

function avg2(a, b) {
  return rgb((((a >> 16) & 255) + ((b >> 16) & 255)) * 0.5,
             (((a >> 8) & 255) + ((b >> 8) & 255)) * 0.5,
             ((a & 255) + (b & 255)) * 0.5);
}

function drawComp(buf, k) {
  buf.fill(groundC);
  const s = k * 3 + 1;
  const off = hash(k * 11 + 5) * 6.2832;
  const slots = [(hash(s * 13 + 5) * 3) | 0, (hash(s * 13 + 12) * 3) | 0, (hash(s * 13 + 19) * 3) | 0];
  // never deal a monochrome composition: the chord must answer itself
  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    slots[1] = (slots[0] + 1) % 3;
    slots[2] = (slots[0] + 2) % 3;
  }
  for (let i = 0; i < 3; i++) {
    const b0 = s * 13 + i * 7;
    const th = off + i * GA + hash(b0 + 1) * 0.6;
    const r = 9 + 12 * Math.sqrt((i + 0.6) / 3) + hash(b0 + 2) * 5;
    const sz = (i === 0 ? 14 : i === 1 ? 9 : 6) + hash(b0 + 4) * 4; // size hierarchy
    const half = sz + 3; // keep the whole figure inside the frame
    const cx = clamp(32 + Math.cos(th) * r, half, 64 - half) + dX[i];
    const cy = clamp(32 + Math.sin(th) * r * 0.85, half, 64 - half) + dY[i];
    const ty = (hash(b0 + 3) * 3) | 0;             // 0 square 1 circle 2 bar
    const vert = hash(b0 + 6) < 0.5;               // bar orientation
    const col = SC[slots[i]];
    const cr = (col >> 16) & 255, cg = (col >> 8) & 255, cb = col & 255;
    const R = Math.ceil(sz) + 2;
    const x0 = Math.max(0, (cx - R) | 0), x1 = Math.min(63, (cx + R) | 0);
    const y0 = Math.max(0, (cy - R) | 0), y1 = Math.min(63, (cy + R) | 0);
    for (let y = y0; y <= y1; y++) {
      const row = y * 64;
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const ax = dx < 0 ? -dx : dx, ay = dy < 0 ? -dy : dy;
        let d;
        if (ty === 0) d = (ax > ay ? ax : ay) - sz;
        else if (ty === 1) d = Math.sqrt(dx * dx + dy * dy) - sz;
        else if (vert) d = (ax - sz * 0.32 > ay - sz ? ax - sz * 0.32 : ay - sz);
        else d = (ax - sz > ay - sz * 0.32 ? ax - sz : ay - sz * 0.32);
        if (d > 0.7) continue;
        let a = 1;
        if (d > -0.7) { // soft 0.7px edge kills the jaggies
          const u = clamp((d + 0.7) / -1.4, 0, 1);
          a = u * u * (3 - 2 * u);
        }
        const idx = row + x;
        const bc = buf[idx];
        let tr = cr, tg = cg, tb = cb;
        // overlap: average the parents' colors — where color logic happens
        if (a > 0.4 && bc !== groundC) {
          tr = (((bc >> 16) & 255) + cr) * 0.5;
          tg = (((bc >> 8) & 255) + cg) * 0.5;
          tb = ((bc & 255) + cb) * 0.5;
        }
        const br = (bc >> 16) & 255, bg = (bc >> 8) & 255, bb = bc & 255;
        buf[idx] = rgb(br + (tr - br) * a, bg + (tg - bg) * a, bb + (tb - bb) * a);
      }
    }
  }
}

function render(t, dt) {
  setChord(t);
  const k = Math.floor(t / HOLD);
  const phase = t - k * HOLD;
  const cut = k % 4 === 3;

  if (k !== lastK || cut !== lastCut) {
    lastK = k; lastCut = cut;
    if (cut || k === 0) { drawComp(cA, k); cB.set(cA); uB = 1; }
    else { drawComp(cB, k); uB = 0; }
  } else {
    drawComp(cB, k); // re-breathe the current composition
  }
  if (!cut) uB = smoothstep(0, 1, clamp((phase - (HOLD - XF)) / XF, 0, 1));

  // the wipe: a soft edge sloshing ±6px travels up the panel, carrying
  // the old composition away; at rest the boundary is fully off-panel
  const lam = 8 + 6 * Math.sin(t * 0.17);
  const b = 1.25 - 1.45 * uB;
  for (let y = 0; y < 64; y++) {
    const s = (y + lam) * 0.015625;
    let a = 1;
    if (uB < 1) {
      const u = clamp((s - b + 0.12) / 0.24, 0, 1);
      a = u * u * (3 - 2 * u);
    }
    rowA[y] = a;
  }
  // slow diagonal light sweep, like sun moving across a painting
  const sw = t * 0.3;
  for (let y = 0; y < 64; y++) {
    const row = y * 64;
    const a = rowA[y];
    for (let x = 0; x < 64; x++) {
      const i = row + x;
      let c = cB[i];
      if (a <= 0) c = cA[i];
      else if (a < 1) {
        const p = cA[i];
        const pr = (p >> 16) & 255, pg = (p >> 8) & 255, pb = p & 255;
        c = rgb(pr + (((c >> 16) & 255) - pr) * a,
                pg + (((c >> 8) & 255) - pg) * a,
                pb + ((c & 255) - pb) * a);
      }
      const lum = 1 + 0.09 * Math.sin((x + y) * 0.08 - sw);
      setPixel(x, y, rgb(((c >> 16) & 255) * lum, ((c >> 8) & 255) * lum, (c & 255) * lum));
    }
  }
}
