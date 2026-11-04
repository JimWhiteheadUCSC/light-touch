/*@vfx
id: e53d741a-eb31-4ff3-9a74-f4db0b13a75b
title: City-Discount, After Hours
created: 2026-10-13
artist: Solyanka (apprentice name)
lineage:
  - id: fdccb94c-2bed-45d3-ae56-fce11c39d795
    relation: inspiration
    note: returns to Loewensberg's office after the Okazz triad; trades Adagio's
      chord of neighbors for her full chord, overlapping primitives for a
      guillotine division, and answers her dossier's jazz question with a
      piece that listens
influences:
  - verena-loewensberg
rationale: |
  Eighth piece of the practice, returning to Loewensberg's office after the
  Okazz triad. This one claims her unclaimed move: the FULL chord —
  wide-ranging vivid color balanced so no hue dominates — where every prior
  piece used the chord of neighbors. The canvas is a guillotine division
  into six flat fields (two tree templates, vertical-first or
  horizontal-first, redealt at each modulation); the hidden system
  governing proportion is a set of musical intervals dealt as ratios,
  never shown, only felt. Asymmetric poise is maintained kinetically:
  every boundary drifts on its own slow period, the canvas forever
  re-balancing, never fixed. Motion is chord changes: every 14-23s a
  modulation re-voices hues and re-deals proportions, eased over 2.6s;
  every fourth is a hard cut — a cadence. The piece listens, taking a
  side in her dossier's open jazz question: she sold experimental jazz
  for a decade; rhythm internalized, not illustrated. Beats become
  passing tones — one field flashes to its complement and resolves;
  loudness lifts the whole chord. In silence it keeps its own slow
  meter, a passing tone every eight and a half seconds. The clock
  re-chords the progression, cool and dim by night, warmer by day.
  Side in the standing argument: hers, still — geometry is itself —
  but the title names the record shop, because Stimmung always leaked.
@vfx*/

// City-Discount, After Hours — pixel mode
// A guillotine division of the canvas into six flat fields (two tree
// templates, vertical-first or horizontal-first), proportions dealt from
// musical-interval ratios; Loewensberg's full chord (six saturated hues,
// none dominant) re-voiced by modulations; boundaries drift on slow
// independent periods; beats (or an internal meter in silence) fire
// passing tones — one field flashing to its complement.

const meta = { name: "city_discount_after_hours", fps: 30, inputs: ["audio", "clock"] };

const NCUT = 5, NLEAF = 6;

function hash(n) { return fract(Math.sin(n * 127.1 + 311.7) * 43758.5453); }

// the full chord: six saturated hues as offsets from a drifting base
const CHORD = [0.98, 0.10, 0.30, 0.44, 0.58, 0.75];
const CSAT  = [0.85, 0.88, 0.75, 0.80, 0.85, 0.72];
// six values, none dominant; the darkest anchors as ground-participant
const CVAL  = [0.80, 0.72, 0.62, 0.52, 0.42, 0.30];

// cut state: V template [ax, by, cy, dx, ex]; H template [ay, bx, cx, dy, ey]
const curP = new Float32Array(NCUT);
const prevP = new Float32Array(NCUT);
const cutPos = new Float32Array(NCUT);
const oscA = new Float32Array(NCUT);
const oscW = new Float32Array(NCUT);
const oscP = new Float32Array(NCUT);

const hueCur = new Uint8Array(NLEAF);
const huePrev = new Uint8Array(NLEAF);
const valCur = new Uint8Array(NLEAF);
const valPrev = new Uint8Array(NLEAF);

const leafR = new Float32Array(NLEAF);
const leafG = new Float32Array(NLEAF);
const leafB = new Float32Array(NLEAF);

const toneT0 = new Float32Array(NLEAF).fill(-100);
const toneAmp = new Float32Array(NLEAF);

let treeMode = 0; // 0 vertical-first, 1 horizontal-first
let modT0 = -10, modDur = 2.6, nextMod = 12, modCount = 0;
let lastTone = -100;
let cT = -1;

function redeal(t) {
  modCount++;
  const hard = (modCount & 3) === 0;
  for (let i = 0; i < NCUT; i++) prevP[i] = curP[i];

  treeMode = hash(modCount * 31 + 7) < 0.5 ? 0 : 1;

  // proportions as intervals — the hidden system is rhythm made spatial
  const R1 = [0.30, 0.36, 0.42, 0.47, 0.55, 0.61];
  const R2 = [0.30, 0.38, 0.45, 0.52, 0.60, 0.67];
  const a = 64 * R1[(hash(modCount * 3 + 1) * 6) | 0];
  const b = 64 * R2[(hash(modCount * 5 + 2) * 6) | 0];
  const c = 64 * R2[(hash(modCount * 7 + 3) * 6) | 0];
  let d = a + 10 + hash(modCount * 11 + 4) * (46 - a);
  let e = a + 10 + hash(modCount * 13 + 5) * (46 - a);
  if (Math.abs(d - e) < 9) e = d + 9;
  curP[0] = a; curP[1] = b; curP[2] = c; curP[3] = d; curP[4] = e;

  // hue and value permutations
  const perm = [0, 1, 2, 3, 4, 5];
  for (let i = 5; i > 0; i--) {
    const j = (hash(modCount * 17 + i) * (i + 1)) | 0;
    const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (let i = 0; i < NLEAF; i++) { huePrev[i] = hueCur[i]; hueCur[i] = perm[i]; }
  const perm2 = [0, 1, 2, 3, 4, 5];
  for (let i = 5; i > 0; i--) {
    const j = (hash(modCount * 23 + i) * (i + 1)) | 0;
    const tmp = perm2[i]; perm2[i] = perm2[j]; perm2[j] = tmp;
  }
  for (let i = 0; i < NLEAF; i++) { valPrev[i] = valCur[i]; valCur[i] = perm2[i]; }

  modT0 = t;
  modDur = hard ? 0.02 : 2.6;
  nextMod = t + 14 + 9 * hash(modCount * 29 + 6);
}

function setup() {
  redeal(0);
  for (let i = 0; i < NCUT; i++) prevP[i] = curP[i];
  modT0 = -10; // crossfade already resolved at t=0
  for (let i = 0; i < NCUT; i++) {
    oscA[i] = 1.2 + hash(i * 7 + 1) * 2.2;
    oscW[i] = (Math.PI * 2) / (18 + hash(i * 7 + 2) * 22);
    oscP[i] = hash(i * 7 + 3) * 6.28;
  }
  nextMod = 12 + 8 * hash(99);
}

function rebuild(t) {
  if (t >= nextMod) redeal(t);
  const dl = input.clock.daylight;
  const lvl = input.audio.ok ? input.audio.level : 0;

  // beat -> passing tone; silence keeps its own slow meter
  if (input.audio.beat || t - lastTone > 8.5) {
    const li = (hash(t * 13.7) * NLEAF) | 0;
    toneT0[li] = t;
    toneAmp[li] = 0.45 + 0.55 * lvl;
    lastTone = t;
  }

  let u = (t - modT0) / modDur;
  u = u < 0 ? 0 : u > 1 ? 1 : u;
  const e = u * u * (3 - 2 * u);

  for (let i = 0; i < NCUT; i++) {
    cutPos[i] = prevP[i] + (curP[i] - prevP[i]) * e + oscA[i] * Math.sin(t * oscW[i] + oscP[i]);
  }
  // keep the poise legal
  cutPos[0] = clamp(cutPos[0], 16, 44);
  cutPos[1] = clamp(cutPos[1], 16, 46);
  cutPos[2] = clamp(cutPos[2], 16, 46);
  cutPos[3] = clamp(cutPos[3], cutPos[0] + 9, 55);
  cutPos[4] = clamp(cutPos[4], cutPos[0] + 9, 55);

  // the chord: base hue drifts with time, re-chorded by the day
  const baseHue = lerp(0.66, 0.50, dl) + t * 0.0035;
  const vScale = 0.72 + 0.32 * dl;
  const lift = 1 + 0.22 * lvl;

  for (let i = 0; i < NLEAF; i++) {
    const breathe = 0.94 + 0.06 * Math.sin(t * 0.13 + i * 2.1);
    const cc = hsv(fract(baseHue + CHORD[hueCur[i]]), CSAT[hueCur[i]], CVAL[valCur[i]] * vScale * breathe);
    const cp = hsv(fract(baseHue + CHORD[huePrev[i]]), CSAT[huePrev[i]], CVAL[valPrev[i]] * vScale * breathe);
    let r = lerp((cp >> 16) & 255, (cc >> 16) & 255, e);
    let g = lerp((cp >> 8) & 255, (cc >> 8) & 255, e);
    let b = lerp(cp & 255, cc & 255, e);

    // passing tone: a flash to the complement, resolving back
    const a = Math.exp(-(t - toneT0[i]) * 2.2) * toneAmp[i];
    if (a > 0.01) {
      const ca = hsv(fract(baseHue + CHORD[hueCur[i]] + 0.5), 0.85, Math.min(1, CVAL[valCur[i]] * vScale + 0.4));
      let k = a * 0.8;
      if (k > 1) k = 1;
      r += (((ca >> 16) & 255) - r) * k;
      g += (((ca >> 8) & 255) - g) * k;
      b += ((ca & 255) - b) * k;
    }

    leafR[i] = r * lift;
    leafG[i] = g * lift;
    leafB[i] = b * lift;
  }
}

function leafAt(px, py) {
  if (treeMode === 0) {
    if (px < cutPos[0]) return py < cutPos[1] ? 0 : 1;
    if (py < cutPos[2]) return px < cutPos[3] ? 2 : 3;
    return px < cutPos[4] ? 4 : 5;
  }
  if (py < cutPos[0]) return px < cutPos[1] ? 0 : 1;
  if (px < cutPos[2]) return py < cutPos[3] ? 2 : 3;
  return py < cutPos[4] ? 4 : 5;
}

function pixel(x, y, t) {
  if (t !== cT) { rebuild(t); cT = t; }
  const xp = x + 0.5, yp = y + 0.5;
  const ax = cutPos[0], by = cutPos[1], cy = cutPos[2], dx = cutPos[3], ex = cutPos[4];
  const i0 = leafAt(xp, yp);
  let r = leafR[i0], g = leafG[i0], b = leafB[i0];

  // soften any cut line within 0.9px: blend with the leaf across it
  for (let c = 0; c < 5; c++) {
    let d, inRegion;
    if (treeMode === 0) {
      if (c === 0) { d = xp - ax; inRegion = true; }
      else if (c === 1) { d = yp - by; inRegion = xp < ax; }
      else if (c === 2) { d = yp - cy; inRegion = xp >= ax; }
      else if (c === 3) { d = xp - dx; inRegion = xp >= ax && yp < cy; }
      else { d = xp - ex; inRegion = xp >= ax && yp >= cy; }
    } else {
      if (c === 0) { d = yp - ax; inRegion = true; }
      else if (c === 1) { d = xp - by; inRegion = yp < ax; }
      else if (c === 2) { d = xp - cy; inRegion = yp >= ax; }
      else if (c === 3) { d = yp - dx; inRegion = yp < ax && xp < by; }
      else { d = yp - ex; inRegion = yp >= ax && xp >= cy; }
    }
    if (!inRegion || d <= -0.9 || d >= 0.9) continue;
    const vert = treeMode === 0 ? (c === 0 || c === 3 || c === 4) : (c === 1 || c === 2);
    const off = d < 0 ? 1.8 : -1.8;
    const i1 = vert ? leafAt(xp + off, yp) : leafAt(xp, yp + off);
    const w = 0.5 + 0.5 * (d < 0 ? -d : d) / 0.9;
    r = r * w + leafR[i1] * (1 - w);
    g = g * w + leafG[i1] * (1 - w);
    b = b * w + leafB[i1] * (1 - w);
  }

  return rgb(r, g, b);
}
