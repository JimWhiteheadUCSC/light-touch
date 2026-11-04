/*@vfx
id: 26b0d5b8-b5ce-4040-8cbc-1bf1d0fa20e3
title: Nothing Here Was Placed
created: 2026-08-07
artist: Selvedge (apprentice name)
lineage:
  - id: 2d1d4728-3d2b-4c92-90ed-6201c2fbc514
    relation: variation
    note: >
      kept the flat hard-edged region, the freeze-frame brief, and hue as
      hidden arithmetic rather than as mixture; refused the shapes. There
      a region was defined by which of five voices covered it, and those
      voices had positions I chose. Here nothing has a position at all -
      every region is the residue of a cut, and every cut is the child of
      another cut.
  - id: e110a8dd-9a10-499b-a80b-a46033bdcb2d
    relation: contrast
    note: >
      that piece was one performer and sixty-four fixed seats: a lattice
      given in advance, with all the life supplied by a signal read late.
      This one has no performer and no lattice. The structure IS the
      content, it is never the same structure twice, and it is the thing
      that changes.
influences: [verena-loewensberg, okazz]
rationale: |
  Every composition I have made was assembled: a lattice, and things put
  on it. Shapes with coordinates, seats with delays, screens with angles.
  This one has no coordinates anywhere in it.

  The panel starts as one undivided field. A cut arrives and it is two
  fields. A cut arrives in one of those and it is three. Nothing is ever
  placed, moved to a point, or given a size - a region is only ever the
  leftover of a division, and its proportions are whatever its ancestors
  have left it. When the panel holds eleven flat rectangles, what you are
  looking at is not eleven objects. It is one object that has been cut ten
  times, and you can read the order of the cuts off the picture.

  So colour is genealogy. Each cut hands its two children an interval -
  one up, one down - on a seven-degree scale of three warm neighbours,
  three cool ones half a turn away, and a rose at the far side reachable
  only by accumulating. A region's hue is the sum of every interval on the
  path from the root to itself. Two regions that share an edge because they
  are SIBLINGS are therefore neighbours in hue, and Loewensberg's chord of
  neighbours stops being a palette decision and becomes a structural fact:
  they are close in colour because they are close in the family. Cousins
  drift further; a region six cuts deep can be anywhere in the chord.
  Brightness is the same arithmetic read another way - the more times a
  region has been divided, the brighter it is, so the deep small cells are
  the lit incidents and the undivided fields are the calm dark mass. The
  exposure balances itself, because being bright and being small are the
  same condition here.

  The hidden system is the tree, and you never see it. What you see is what
  it leaves. And it has two lives. The cuts WANDER: each one drifts at one
  to five pixels a second and turns back when it would crush the subtree
  behind it, so every boundary on the panel is always in motion, and a
  region grows for half a minute at its sibling's expense. Now and then a
  cut stops looking and settles onto a named proportion - a half, a third,
  the golden section - holds it a few seconds, and moves on. Nothing here
  is ever at rest, but nothing here is hurrying either.

  The other life is the breathing of complexity. Over a minute or so the
  panel divides down to a dozen regions and then forgets them again: pairs
  of siblings fade back toward the single colour of their parent, the seam
  between them closes, and two rectangles become one. A split is the same
  event backwards - a field develops a line across it and the two halves
  diverge in colour until they are strangers. That is Okazz's lifecycle,
  born-acts-wilts, moved off the shape and onto the DIVISION: what is born
  and what dies here is not an object but a distinction.

  Sides taken. With Loewensberg entirely on the frame: pause it anywhere
  and it is a flat, hard-edged, asymmetric, chorded canvas, on a ground
  that is a chosen dark colour and visible only as the seams. With her on
  the withheld system, and against the version of her that needs the system
  to be static - this one is a system that keeps rewriting itself. With
  Okazz on the lifecycle and against his duty cycle: a full-field piece
  cannot rest, because in a field of flat colour stillness is not rest, it
  is a photograph. And on the standing argument about what geometry is
  about, I take the position I have not taken yet: it is about
  INHERITANCE. Not animacy, not purity, not use - descent. Every region on
  this panel is somebody's child, and its colour says whose.
@vfx*/

// nothing_here_was_placed - buffer mode
// The whole image is a guillotine partition tree. Node 0 owns the panel;
// every internal node owns a cut (axis + fraction) and its two children own
// the halves. No element has a position: rects are derived top-down every
// frame. Colour is inherited - a node's scale degree is the sum of the
// intervals on its path from the root - and value comes from depth, so
// deeply-divided regions are the small bright ones. Splits and merges
// crossfade through mix[], which also opens and closes the seam. Cuts drift
// at 1.3-4.6 px/s and bounce off bounds computed from subtree leaf counts,
// so no boundary is ever still and no subtree can be crushed. Compositing is
// three Float32 channel buffers with one setPixel pass per frame
// (knowledge/craft/compositing.md).

const meta = { name: "nothing_here_was_placed", fps: 30, inputs: ["clock"] };

const MAXN = 96, NH = 7;
// three warm neighbours, three cool a half-turn away, one rose at the far side
const HUE = [0.055, 0.095, 0.135, 0.520, 0.565, 0.615, 0.900];
const SAT = [0.92, 0.94, 0.88, 0.82, 0.86, 0.80, 0.74];
const VD  = [0.24, 0.34, 0.45, 0.56, 0.68, 0.80, 0.92];   // value by depth
const PROPS = [0.5, 0.382, 0.618, 0.333, 0.667, 0.4, 0.6, 0.294, 0.706];

const live = new Int32Array(MAXN), par = new Int32Array(MAXN);
const ca = new Int32Array(MAXN), cb = new Int32Array(MAXN);
const ax = new Int32Array(MAXN), off = new Int32Array(MAXN), dep = new Int32Array(MAXN);
const adeg = new Int32Array(MAXN), dying = new Int32Array(MAXN);
const cnt = new Int32Array(MAXN), ord = new Int32Array(MAXN);
const fcur = new Float32Array(MAXN), ftgt = new Float32Array(MAXN);
const flo = new Float32Array(MAXN), fhi = new Float32Array(MAXN);
const vpx = new Float32Array(MAXN), hold = new Int32Array(MAXN), cT = new Float32Array(MAXN);
const fph = new Float32Array(MAXN), frate = new Float32Array(MAXN);
const mix = new Float32Array(MAXN), mixT = new Float32Array(MAXN), mtau = new Float32Array(MAXN);
const rx0 = new Float32Array(MAXN), ry0 = new Float32Array(MAXN);
const rx1 = new Float32Array(MAXN), ry1 = new Float32Array(MAXN);
const ER = new Float32Array(MAXN), EG = new Float32Array(MAXN), EB = new Float32Array(MAXN);
const stack = new Int32Array(MAXN);
const leaves = new Int32Array(MAXN), CAND = new Int32Array(MAXN), CW = new Float32Array(MAXN);

const BR = new Float32Array(4096), BG = new Float32Array(4096), BB = new Float32Array(4096);
const COVX = new Float32Array(64), MUL = new Float32Array(64);
const DG = new Float32Array(81), ROWG = new Float32Array(9);
const AD = 0.10;

let nLeaf = 0, nOrd = 0, first = true;
let evT = 0.6, trT = 2;
let cphase = 0, cper = 75, clo = 4, chi = 12;
let dlS = -1, hb = 0, vs = 1, expo = 1;
let oxn = 0, oyn = 0;

function rnd(a, b) { return a + Math.random() * (b - a); }
function propPick() { return PROPS[(Math.random() * 9) | 0]; }
function stepPick() { const r = Math.random(); return r < 0.45 ? 1 : (r < 0.75 ? 2 : (r < 0.92 ? 3 : 4)); }

function alloc() {
  for (let i = 1; i < MAXN; i++) if (!live[i]) {
    live[i] = 1; ca[i] = -1; cb[i] = -1; dying[i] = 0; mix[i] = 1; mixT[i] = 1; mtau[i] = 1;
    return i;
  }
  return -1;
}

// a cut either wanders, or stops looking and settles onto a named proportion
function newCut(i) {
  if (Math.random() < 0.62) {
    hold[i] = 0;
    vpx[i] = rnd(1.3, 4.6) * (Math.random() < 0.5 ? -1 : 1);
  } else {
    hold[i] = 1;
    let f = propPick();
    if (f < flo[i]) f = flo[i]; if (f > fhi[i]) f = fhi[i];
    ftgt[i] = f;
  }
  cT[i] = rnd(3, 9);
}

// a distinction is born: one field becomes two, and they diverge in colour
function trySplit(instant) {
  let tot = 0, c = 0;
  for (let k = 0; k < nLeaf; k++) {
    const i = leaves[k];
    if (dep[i] >= 5) continue;
    const p = par[i];
    if (p >= 0 && dying[p]) continue;
    const w = rx1[i] - rx0[i], h = ry1[i] - ry0[i];
    if (w < 18 && h < 18) continue;
    // sqrt of area, not area: enough bias to divide the big fields, little
    // enough that sizes stay unequal (asymmetric poise, not a fair grid)
    const g = Math.sqrt(w * h);
    CAND[c] = i; CW[c] = g; tot += g; c++;
  }
  if (!c) return false;
  let r = Math.random() * tot, pick = CAND[c - 1];
  for (let k = 0; k < c; k++) { r -= CW[k]; if (r <= 0) { pick = CAND[k]; break; } }
  const i = pick;
  const w = rx1[i] - rx0[i], h = ry1[i] - ry0[i];
  const longAx = w >= h ? 0 : 1, shortAx = 1 - longAx;
  const shortLen = shortAx === 0 ? w : h;
  let a = (shortLen >= 19 && Math.random() < 0.36) ? shortAx : longAx;
  const len = a === 0 ? w : h;
  if (len < 18) return false;
  const A = alloc(); if (A < 0) return false;
  const B = alloc(); if (B < 0) { live[A] = 0; return false; }
  const mn = 8 / len;
  let f = propPick();
  if (f < mn) f = mn; if (f > 1 - mn) f = 1 - mn;
  ax[i] = a; fcur[i] = f; ftgt[i] = f; flo[i] = mn; fhi[i] = 1 - mn;
  fph[i] = Math.random() * 6.283; frate[i] = rnd(0.20, 0.55);
  ca[i] = A; cb[i] = B; par[A] = i; par[B] = i;
  dep[A] = dep[i] + 1; dep[B] = dep[i] + 1;
  // the inheritance: one child up the scale, one child down
  let s1 = stepPick(), s2 = stepPick();
  if (((s1 + s2) % NH) === 0) s2 = s2 === 1 ? 2 : 1;
  off[A] = s1; off[B] = NH - s2;
  mix[i] = instant ? 1 : 0; mixT[i] = 1; mtau[i] = rnd(0.6, 1.4); dying[i] = 0;
  newCut(i);
  return true;
}

// and a distinction dies: two siblings fade back into their parent's colour
// and the seam between them closes
function tryMerge() {
  let c = 0, tot = 0;
  for (let i = 0; i < MAXN; i++) {
    if (!live[i] || ca[i] < 0 || dying[i]) continue;
    if (ca[ca[i]] >= 0 || ca[cb[i]] >= 0) continue;
    const a = (rx1[i] - rx0[i]) * (ry1[i] - ry0[i]);
    const wgt = 1 / (a + 8);
    CAND[c] = i; CW[c] = wgt; tot += wgt; c++;
  }
  if (!c) return false;
  let r = Math.random() * tot, pick = CAND[c - 1];
  for (let k = 0; k < c; k++) { r -= CW[k]; if (r <= 0) { pick = CAND[k]; break; } }
  mixT[pick] = 0; dying[pick] = 1; mtau[pick] = rnd(0.7, 1.5);
  return true;
}

// one node steps its interval and every region below it re-chords at once,
// keeping all the intervals inside the subtree: a transposition
function transpose() {
  let c = 0, tot = 0;
  for (let i = 0; i < MAXN; i++) {
    if (!live[i]) continue;
    const a = (rx1[i] - rx0[i]) * (ry1[i] - ry0[i]);
    CAND[c] = i; CW[c] = a + 10; tot += a + 10; c++;
  }
  if (!c) return;
  let r = Math.random() * tot, i = CAND[c - 1];
  for (let k = 0; k < c; k++) { r -= CW[k]; if (r <= 0) { i = CAND[k]; break; } }
  let s = Math.random() < 0.62 ? 1 : (Math.random() < 0.7 ? 2 : 3);
  if (Math.random() < 0.5) s = NH - s;
  off[i] = (off[i] + s) % NH;
}

// derive everything: rects, inherited degrees, effective colours, and the
// room each cut has left to move in. Parent is always visited before child.
function build() {
  let sp = 0; stack[sp++] = 0;
  rx0[0] = 0; ry0[0] = 0; rx1[0] = 64; ry1[0] = 64;
  nLeaf = 0; nOrd = 0;
  while (sp > 0) {
    const i = stack[--sp];
    ord[nOrd++] = i;
    const p = par[i];
    const d = p < 0 ? off[i] % NH : (adeg[p] + off[i]) % NH;
    adeg[i] = d;
    const dp = dep[i] > 6 ? 6 : dep[i];
    const v = VD[dp] * vs * expo;
    const c = hsv(HUE[d] + hb, SAT[d] * (1 - 0.10 * dp / 6), v * v);
    const orr = (c >> 16) & 255, ogg = (c >> 8) & 255, obb = c & 255;
    if (p < 0) { ER[i] = orr; EG[i] = ogg; EB[i] = obb; }
    else {
      // mix[p] is how far this child has diverged from its parent
      const m = mix[p];
      ER[i] = ER[p] + (orr - ER[p]) * m;
      EG[i] = EG[p] + (ogg - EG[p]) * m;
      EB[i] = EB[p] + (obb - EB[p]) * m;
    }
    if (ca[i] < 0) { leaves[nLeaf++] = i; continue; }
    const A = ca[i], B = cb[i];
    let f = fcur[i] + 0.008 * Math.sin(fph[i]);
    if (f < 0.04) f = 0.04; if (f > 0.96) f = 0.96;
    const g = 0.9 * mix[i];        // the seam, opened by divergence
    if (ax[i] === 0) {
      const cx = rx0[i] + (rx1[i] - rx0[i]) * f;
      rx0[A] = rx0[i]; rx1[A] = cx - g * 0.5; ry0[A] = ry0[i]; ry1[A] = ry1[i];
      rx0[B] = cx + g * 0.5; rx1[B] = rx1[i]; ry0[B] = ry0[i]; ry1[B] = ry1[i];
    } else {
      const cy = ry0[i] + (ry1[i] - ry0[i]) * f;
      rx0[A] = rx0[i]; rx1[A] = rx1[i]; ry0[A] = ry0[i]; ry1[A] = cy - g * 0.5;
      rx0[B] = rx0[i]; rx1[B] = rx1[i]; ry0[B] = cy + g * 0.5; ry1[B] = ry1[i];
    }
    stack[sp++] = A; stack[sp++] = B;
  }
  for (let k = nOrd - 1; k >= 0; k--) {
    const i = ord[k];
    cnt[i] = ca[i] < 0 ? 1 : cnt[ca[i]] + cnt[cb[i]];
  }
  for (let k = 0; k < nOrd; k++) {
    const i = ord[k];
    if (ca[i] < 0) continue;
    const len = ax[i] === 0 ? rx1[i] - rx0[i] : ry1[i] - ry0[i];
    if (len < 4) { flo[i] = 0.4; fhi[i] = 0.6; continue; }
    let lo = (8 + 5.5 * (cnt[ca[i]] - 1)) / len, hi = 1 - (8 + 5.5 * (cnt[cb[i]] - 1)) / len;
    if (lo > 0.46) lo = 0.46;
    if (hi < 0.54) hi = 0.54;
    flo[i] = lo; fhi[i] = hi;
  }
}

function setup() {
  live[0] = 1; par[0] = -1; ca[0] = -1; cb[0] = -1; dep[0] = 0;
  off[0] = (Math.random() * NH) | 0; mix[0] = 1; mixT[0] = 1; mtau[0] = 1;
  oxn = Math.random() * 40; oyn = Math.random() * 40;
  cper = rnd(55, 95); clo = rnd(3.5, 5.5); chi = rnd(9, 14);
  cphase = Math.random();
}

function render(t, dt) {
  // --- the day, arriving slowly -------------------------------------------
  if (dlS < 0) dlS = input.clock.daylight;
  dlS += (input.clock.daylight - dlS) * (1 - Math.exp(-dt / 3));
  const dl = dlS;
  vs = 0.82 + 0.18 * dl;
  const tempo = 0.85 + 0.30 * dl;
  hb = 0.012 * noise2(t * 0.005, 3.3) - 0.012 * (1 - dl);

  if (first) {
    first = false;
    for (let k = 0; k < 7; k++) { build(); trySplit(true); }
    build();
  }

  // --- the breathing of complexity ----------------------------------------
  cphase += dt / cper;
  if (cphase >= 1) { cphase -= 1; cper = rnd(55, 95); clo = rnd(3.5, 5.5); chi = rnd(9, 14); }
  const chiE = chi * (0.76 + 0.24 * dl);
  const Tc = clo + (chiE - clo) * (0.5 - 0.5 * Math.cos(6.283185 * cphase));
  expo = 1 + 0.45 * smoothstep(9, 3, nLeaf);

  // --- the cuts wander; one that would crush its subtree turns back -------
  for (let i = 0; i < MAXN; i++) {
    if (!live[i]) continue;
    mix[i] += (mixT[i] - mix[i]) * (1 - Math.exp(-dt / mtau[i]));
    if (ca[i] < 0) continue;
    fph[i] += frate[i] * dt;
    cT[i] -= dt * tempo;
    if (cT[i] <= 0) newCut(i);
    if (hold[i]) {
      fcur[i] += (ftgt[i] - fcur[i]) * (1 - Math.exp(-dt / 1.5));
    } else {
      const len = ax[i] === 0 ? rx1[i] - rx0[i] : ry1[i] - ry0[i];
      if (len > 2) {
        fcur[i] += vpx[i] * tempo * dt / len;
        if (fcur[i] < flo[i]) { fcur[i] = flo[i]; vpx[i] = -vpx[i]; }
        else if (fcur[i] > fhi[i]) { fcur[i] = fhi[i]; vpx[i] = -vpx[i]; }
      }
    }
    if (dying[i] && mix[i] < 0.02) {
      live[ca[i]] = 0; live[cb[i]] = 0; ca[i] = -1; cb[i] = -1;
      dying[i] = 0; mix[i] = 1; mixT[i] = 1;
    }
  }

  evT -= dt * tempo;
  if (evT <= 0) {
    if (nLeaf < Tc - 0.4) trySplit(false);
    else if (nLeaf > Tc + 0.4) tryMerge();
    else transpose();
    evT = rnd(0.7, 1.8);
  }
  trT -= dt * tempo;
  if (trT <= 0) { transpose(); trT = rnd(1.3, 3.4); }

  build();

  // --- the ground: a chosen dark colour, seen only in the seams -----------
  const gc = hsv(HUE[adeg[0]] + hb + 0.03, 0.50, 0.036);
  const GRr = (gc >> 16) & 255, GGg = (gc >> 8) & 255, GBb = gc & 255;
  for (let i = 0; i < 4096; i++) { BR[i] = GRr; BG[i] = GGg; BB[i] = GBb; }

  // --- the regions: exact-area coverage, so a boundary can creep smoothly -
  for (let k = 0; k < nLeaf; k++) {
    const i = leaves[k];
    const x0 = rx0[i], x1 = rx1[i], y0 = ry0[i], y1 = ry1[i];
    if (x1 - x0 <= 0.02 || y1 - y0 <= 0.02) continue;
    let ix0 = x0 | 0; if (ix0 < 0) ix0 = 0;
    let ix1 = Math.ceil(x1) - 1; if (ix1 > 63) ix1 = 63;
    let iy0 = y0 | 0; if (iy0 < 0) iy0 = 0;
    let iy1 = Math.ceil(y1) - 1; if (iy1 > 63) iy1 = 63;
    for (let x = ix0; x <= ix1; x++) {
      let a = (x + 1 < x1 ? x + 1 : x1) - (x > x0 ? x : x0);
      COVX[x] = a < 0 ? 0 : (a > 1 ? 1 : a);
    }
    const cr = ER[i], cg = EG[i], cbv = EB[i];
    for (let y = iy0; y <= iy1; y++) {
      let cy = (y + 1 < y1 ? y + 1 : y1) - (y > y0 ? y : y0);
      if (cy <= 0) continue; if (cy > 1) cy = 1;
      const ro = y << 6;
      for (let x = ix0; x <= ix1; x++) {
        const al = COVX[x] * cy;
        if (al <= 0) continue;
        const idx = ro + x;
        BR[idx] += (cr - BR[idx]) * al;
        BG[idx] += (cg - BG[idx]) * al;
        BB[idx] += (cbv - BB[idx]) * al;
      }
    }
  }

  // --- the sheet is not evenly inked --------------------------------------
  oxn += 0.045 * dt; oyn += 0.03 * dt;
  for (let j = 0; j < 9; j++)
    for (let i = 0; i < 9; i++)
      DG[j * 9 + i] = 1 + AD * noise3(i * 0.44 + oxn, j * 0.44 + oyn, t * 0.08);

  // --- one crossing to the panel ------------------------------------------
  for (let y = 0; y < 64; y++) {
    const gy = y * 0.125;
    let j0 = gy | 0; if (j0 > 7) j0 = 7;
    const fy = gy - j0, r0 = j0 * 9, r1 = r0 + 9;
    for (let i = 0; i < 9; i++) {
      const a0 = DG[r0 + i];
      ROWG[i] = a0 + (DG[r1 + i] - a0) * fy;
    }
    for (let s = 0; s < 8; s++) {
      const a0 = ROWG[s], inc = (ROWG[s + 1] - a0) * 0.125;
      let v = a0, xi = s << 3;
      for (let k = 0; k < 8; k++) { MUL[xi] = v; xi++; v += inc; }
    }
    const ro = y << 6;
    for (let x = 0; x < 64; x++) {
      const i = ro + x, m = MUL[x];
      setPixel(x, y, (((BR[i] * m) | 0) << 16) | (((BG[i] * m) | 0) << 8) | ((BB[i] * m) | 0));
    }
  }
}