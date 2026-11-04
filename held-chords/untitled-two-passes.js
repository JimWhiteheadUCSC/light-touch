/*@vfx
id: 1a238e15-d289-44d5-958c-fa7e4ed62ed4
title: Untitled, Two Passes
created: 2026-07-29
artist: Selvedge (apprentice name)
lineage:
  - id: 14eb880e-3aad-4bb4-b914-e7d3fd080fae
    relation: contrast
    note: refused the allover repeat and its edge-to-edge texture; kept
      counterchange, but moved it out of the 16px tile and onto the
      whole frame
influences: [verena-loewensberg, okazz]
rationale: |
  Loewensberg's office, staffed alone. Where the last piece was a bolt
  of cloth - one unit, stamped sixteen times, no privileged place on
  the panel - this one is a single composition: six to ten flat
  rectangles, hard-edged, filling the frame, none of them repeating
  another. The freeze-frame test is the whole brief. Pause it anywhere
  and it should be a canvas: proportioned, chorded, poised without
  symmetry.

  The system is hidden, as hers were. Every boundary target is drawn
  from one list of sixteenths, and every division keeps a twelve-pixel
  minimum, so the proportions rhyme without ever announcing why; the
  list is never visible, only felt. Okazz supplies the clock. A single
  event timer fires every one to five seconds and does one thing:
  slides a boundary to a new ratio, gives a rectangle a new colour from
  the chord, grows a new division out of a seam, or lets one die back
  into the edge it came from. Most of the plate is resting at any
  instant. Because divisions are born and buried, the composition at
  minute eight is not a rearrangement of the composition at minute one
  - it has a different number of parts.

  Motion as chord changes, not as events. Colours cross-fade over about
  a second, and they cross-fade through RGB, not through hue: a
  rectangle modulating from the cool note to ochre passes through gray,
  a suspension, rather than inventing a green that was never in the
  chord. Rarely the entire plate re-chords at once - a cadence.

  Two discs pass over everything, slowly, on headings that wander on
  noise, and they are the only curves in the piece. Inside a pass, each
  rectangle keeps its hue and inverts its value about a fixed pivot:
  the dim fields come up, the bright field goes down, so the disc is
  never a spotlight, only a counterchange - the same argument the tiled
  piece made inside one unit, made here across a whole composition.
  Where the two passes overlap the inversion cancels and the plate
  reads as itself. That intersection is the only place in the piece
  where colour logic happens twice, and it is the thing I would watch
  for.

  Sides taken. With Loewensberg against Heitaro's for-use argument this
  time: this plate has no job, it refers to nothing, and what leaks in
  anyway is Stimmung - the chord banks warm and dims as the clock's
  daylight falls, so hour six is the same system in a different mood.
  And the title is the other half of the argument. Every Loewensberg is
  Untitled; the wall label here gets the smallest caption I can
  honestly give it, and the explanation stays in the archive where the
  next artist, not the viewer, will find it.
@vfx*/

// untitled_two_passes - buffer mode
// A guillotine partition (3 columns, each cut into 1-4 cells) of flat
// colour, driven by an event timer; two soft discs drift over it and
// invert the value of whatever they cross, XOR-combined where they
// overlap. All colour work is per-cell and per-frame; the per-pixel
// loop is one array read plus one setPixel for the ~70% of the panel
// no disc is touching.

const meta = { name: "untitled_two_passes", fps: 30, inputs: ["clock"] };

const NC = 3;                       // vertical bands
const colB = [0, 22, 43, 64];       // current column boundaries
const colT = [0, 22, 43, 64];       // their targets
const cols = [];                    // { cuts: [...], cells: [...] }
let evTimer = 1.6;
let dlS = -1;                       // smoothed daylight
let firstFrame = true;

// per-palette-entry colours, rebuilt each frame: base and inverted
const PR0 = new Float64Array(5), PG0 = new Float64Array(5), PB0 = new Float64Array(5);
const PR1 = new Float64Array(5), PG1 = new Float64Array(5), PB1 = new Float64Array(5);
const CH = new Float64Array(5), CS = new Float64Array(5), CV = new Float64Array(5);

const lens = new Float32Array(WIDTH * HEIGHT);

const discs = [
  { x: 12, y: 40, r: 14.0, a: 0.7, s: 2.6 },
  { x: 46, y: 18, r: 9.5, a: 3.4, s: 3.7 },
];

// the hidden system: every boundary lands on one of these
const RAT = [0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125];

function pickPos(lo, hi) {
  if (hi <= lo) return (lo + hi) * 0.5;
  let n = 0, pick = (lo + hi) * 0.5;
  for (let i = 0; i < RAT.length; i++) {
    const p = RAT[i] * 64;
    if (p >= lo && p <= hi) { n++; if (Math.random() < 1 / n) pick = p; }
  }
  return pick;
}

// weighted so the plate stays dark-dominant: one bright, one cool, rarely
function pickIdx() {
  const r = Math.random();
  if (r < 0.32) return 0;
  if (r < 0.56) return 1;
  if (r < 0.80) return 2;
  if (r < 0.93) return 3;
  return 4;
}

function newCell(pi) {
  return { pi: pi, r0: 0, g0: 0, b0: 0, r1: 0, g1: 0, b1: 0, c0: 0 };
}

function hasDead(col) {
  for (let j = 0; j < col.cuts.length; j++) if (col.cuts[j].dead) return true;
  return false;
}

function setup() {
  for (let c = 0; c < NC; c++) {
    const n = 2 + ((Math.random() * 2) | 0);
    const cuts = [], cells = [];
    let prev = 0;
    for (let i = 1; i < n; i++) {
      const y = pickPos(prev + 12, 64 - 12 * (n - i));
      cuts.push({ y: y, ty: y, dead: false, kill: 0 });
      prev = y;
    }
    for (let i = 0; i < n; i++) cells.push(newCell(pickIdx()));
    cols.push({ cuts: cuts, cells: cells });
  }
  discs[0].a = Math.random() * 6.283;
  discs[1].a = Math.random() * 6.283;
}

// a division is born at a seam and grows to its ratio
function trySplit() {
  for (let a = 0; a < 4; a++) {
    const col = cols[(Math.random() * NC) | 0];
    if (col.cells.length >= 4 || hasDead(col)) continue;
    const n = col.cells.length;
    const k = (Math.random() * n) | 0;
    const y0 = k === 0 ? 0 : col.cuts[k - 1].ty;
    const y1 = k === n - 1 ? 64 : col.cuts[k].ty;
    if (y1 - y0 < 24) continue;
    const ty = pickPos(y0 + 11, y1 - 11);
    const sib = col.cells[k];
    const nc = newCell(pickIdx());
    nc.r0 = sib.r0; nc.g0 = sib.g0; nc.b0 = sib.b0;
    nc.r1 = sib.r1; nc.g1 = sib.g1; nc.b1 = sib.b1;
    col.cuts.splice(k, 0, { y: y0, ty: ty, dead: false, kill: 0 });
    col.cells.splice(k, 0, nc);
    return;
  }
}

// ...and dies back into one of its own edges
function tryMerge() {
  for (let a = 0; a < 5; a++) {
    const col = cols[(Math.random() * NC) | 0];
    if (col.cuts.length === 0 || hasDead(col)) continue;
    const j = (Math.random() * col.cuts.length) | 0;
    if (Math.random() < 0.5) {
      col.cuts[j].ty = j === 0 ? 0 : col.cuts[j - 1].ty;
      col.cuts[j].kill = j;
    } else {
      col.cuts[j].ty = j === col.cuts.length - 1 ? 64 : col.cuts[j + 1].ty;
      col.cuts[j].kill = j + 1;
    }
    col.cuts[j].dead = true;
    return;
  }
}

function doEvent() {
  let total = 0;
  for (let c = 0; c < NC; c++) total += cols[c].cells.length;
  const r = Math.random();
  if (r < 0.34) {
    // a boundary eases to a new proportion
    if (Math.random() < 0.42) {
      const i = 1 + ((Math.random() * (NC - 1)) | 0);
      colT[i] = pickPos(colT[i - 1] + 13, colT[i + 1] - 13);
    } else {
      const col = cols[(Math.random() * NC) | 0];
      if (col.cuts.length && !hasDead(col)) {
        const j = (Math.random() * col.cuts.length) | 0;
        const lo = (j === 0 ? 0 : col.cuts[j - 1].ty) + 11;
        const hi = (j === col.cuts.length - 1 ? 64 : col.cuts[j + 1].ty) - 11;
        col.cuts[j].ty = pickPos(lo, hi);
      }
    }
  } else if (r < 0.62) {
    // a passing tone: one rectangle takes another colour of the chord
    const col = cols[(Math.random() * NC) | 0];
    const k = (Math.random() * col.cells.length) | 0;
    let pi = pickIdx();
    if (pi === col.cells[k].pi) pi = (pi + 1) % 5;
    col.cells[k].pi = pi;
  } else if (r < 0.84) {
    if (total < 10) trySplit(); else tryMerge();
  } else if (r < 0.95) {
    if (total > 5) tryMerge(); else trySplit();
  } else {
    // cadence: the whole plate re-chords
    for (let c = 0; c < NC; c++) {
      const cl = cols[c].cells;
      for (let k = 0; k < cl.length; k++) if (Math.random() < 0.65) cl[k].pi = pickIdx();
    }
  }
}

function render(t, dt) {
  // --- the chord, tuned by the day ----------------------------------------
  if (dlS < 0) dlS = input.clock.daylight;
  dlS += (input.clock.daylight - dlS) * (1 - Math.exp(-dt / 3));
  const dl = dlS;

  const bh = 0.075 + 0.035 * noise2(t * 0.0055, 11.2) - 0.02 * (1 - dl);
  const vs = 0.80 + 0.20 * dl;
  CH[0] = bh; CH[1] = bh + 0.05; CH[2] = bh - 0.045; CH[3] = bh + 0.10; CH[4] = bh + 0.52;
  CS[0] = 0.62; CS[1] = 0.55; CS[2] = 0.72; CS[3] = 0.52; CS[4] = 0.50;
  CV[0] = 0.44 * vs; CV[1] = 0.52 * vs; CV[2] = 0.40 * vs; CV[3] = 0.82 * vs; CV[4] = 0.58 * vs;
  for (let i = 0; i < 5; i++) {
    const c0 = hsv(CH[i], CS[i], CV[i] * CV[i]);
    PR0[i] = (c0 >> 16) & 255; PG0[i] = (c0 >> 8) & 255; PB0[i] = c0 & 255;
    // the pass: same hue, value reflected about a fixed pivot
    let lv = 0.58 + (0.58 - CV[i]) * 1.1;
    if (lv < 0.10) lv = 0.10; else if (lv > 0.88) lv = 0.88;
    const c1 = hsv(CH[i] + 0.035, CS[i] * 0.85, lv * lv);
    PR1[i] = (c1 >> 16) & 255; PG1[i] = (c1 >> 8) & 255; PB1[i] = c1 & 255;
  }

  // --- one event at a time -------------------------------------------------
  evTimer -= dt;
  if (evTimer <= 0) { doEvent(); evTimer = 1.3 + Math.random() * 3.4; }

  const kg = 1 - Math.exp(-dt / 0.42);
  const kc = firstFrame ? 1 : 1 - Math.exp(-dt / 1.1);
  for (let i = 1; i < NC; i++) colB[i] += (colT[i] - colB[i]) * kg;

  for (let c = 0; c < NC; c++) {
    const col = cols[c];
    for (let j = col.cuts.length - 1; j >= 0; j--) {
      const cu = col.cuts[j];
      cu.y += (cu.ty - cu.y) * kg;
      if (cu.dead && Math.abs(cu.ty - cu.y) < 0.6) {
        col.cuts.splice(j, 1);
        col.cells.splice(cu.kill, 1);
      }
    }
    // colours cross-fade in RGB: a modulation passes through gray, not
    // through hues that were never in the chord
    for (let k = 0; k < col.cells.length; k++) {
      const cell = col.cells[k];
      const p = cell.pi;
      cell.r0 += (PR0[p] - cell.r0) * kc;
      cell.g0 += (PG0[p] - cell.g0) * kc;
      cell.b0 += (PB0[p] - cell.b0) * kc;
      cell.r1 += (PR1[p] - cell.r1) * kc;
      cell.g1 += (PG1[p] - cell.g1) * kc;
      cell.b1 += (PB1[p] - cell.b1) * kc;
      cell.c0 = rgb(cell.r0, cell.g0, cell.b0);
    }
  }

  // --- the two passes ------------------------------------------------------
  for (let i = 0; i < lens.length; i++) lens[i] = 0;
  for (let d = 0; d < discs.length; d++) {
    const D = discs[d];
    D.a += noise2(t * 0.021, 30.5 + d * 7.7) * 0.55 * dt;
    D.x += Math.cos(D.a) * D.s * dt;
    D.y += Math.sin(D.a) * D.s * dt;
    D.x = ((D.x % 64) + 64) % 64;
    D.y = ((D.y % 64) + 64) % 64;
    const R = D.r;
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = D.x + ox * 64, cy = D.y + oy * 64;
        let x0 = Math.floor(cx - R - 1), x1 = Math.ceil(cx + R + 1);
        let y0 = Math.floor(cy - R - 1), y1 = Math.ceil(cy + R + 1);
        if (x1 < 0 || x0 > 63 || y1 < 0 || y0 > 63) continue;
        if (x0 < 0) x0 = 0; if (x1 > 63) x1 = 63;
        if (y0 < 0) y0 = 0; if (y1 > 63) y1 = 63;
        for (let y = y0; y <= y1; y++) {
          const dy = y - cy, ro = y * 64;
          for (let x = x0; x <= x1; x++) {
            const dx = x - cx;
            const a = smoothstep(R + 0.7, R - 0.7, Math.sqrt(dx * dx + dy * dy));
            if (a <= 0.002) continue;
            const pv = lens[ro + x];
            lens[ro + x] = pv + a - 2 * pv * a;   // overlap cancels
          }
        }
      }
    }
  }

  // --- the plate -----------------------------------------------------------
  let px = 0;
  for (let c = 0; c < NC; c++) {
    const x0 = px;
    let x1 = c === NC - 1 ? 64 : Math.round(colB[c + 1]);
    if (x1 < x0) x1 = x0;
    if (x1 > 64) x1 = 64;
    px = x1;
    const col = cols[c];
    const n = col.cells.length;
    let py = 0;
    for (let k = 0; k < n; k++) {
      const y0 = py;
      let y1 = k === n - 1 ? 64 : Math.round(col.cuts[k].y);
      if (y1 < y0) y1 = y0;
      if (y1 > 64) y1 = 64;
      py = y1;
      const cell = col.cells[k];
      for (let y = y0; y < y1; y++) {
        const ro = y * 64;
        for (let x = x0; x < x1; x++) {
          const a = lens[ro + x];
          if (a <= 0.004) setPixel(x, y, cell.c0);
          else setPixel(x, y, rgb(
            cell.r0 + (cell.r1 - cell.r0) * a,
            cell.g0 + (cell.g1 - cell.g0) * a,
            cell.b0 + (cell.b1 - cell.b0) * a));
        }
      }
    }
  }
  firstFrame = false;
}
