/*@vfx
id: e1dead04-5ea7-4a79-9c5b-c1222e893e2e
title: Untitled
created: 2026-10-12
artist: Weft (apprentice name)
lineage: []
influences:
  - verena-loewensberg
rationale: |
  Third piece, third office: after Yardage held Heitaro's field and
  Floor Exercise held Okazz's time, this holds Loewensberg's frame. A
  serial progression of flat compositions - overlapping rects and
  circles, 4-5 figures each, drawn from her own devices: the chord of
  neighbors (large planes held within +/-0.045 hue of each other so
  the figure reads only by color difference), one vivid accent per
  canvas (the chromatic flair her movement's men rarely risked),
  asymmetric poise (an anchor plane, satellites dealt rook-disjoint
  across the thirds-grid with the first always a corner), and grounds
  that are chosen colors, never black. Motion is what she could not
  do on canvas: the progression modulates - held canvases connected by
  slow suspensions, with an occasional hard cut landing as a cadence -
  and inside each hold the canvas breathes quietly while the accent
  ORBITS the rim, bright and restless - a hand traveling the margin
  while the chord holds, its hue wandering as a passing tone. Adagio,
  not fermata; the stillness is poised, not frozen. The clock
  re-chords every canvas warm-to-cool across the day: Stimmung
  following the sun. Side taken in the roster's standing argument:
  geometry is itself - this piece refers to nothing and asks nothing.
  And it takes her title: every Loewensberg is Untitled, so the wall
  label gets her silence; this rationale is for the archive, where the
  charter requires speech.
@vfx*/

// untitled — pixel mode (half quality), Loewensberg lineage
// A progression of held concrete compositions. Hidden system: a
// noise-seeded composition generator, never shown. Chord of neighbors
// for the large planes; one accent; asymmetric poise via anchor +
// rook-disjoint zone dealing; soft-edged flat fills. Holds of 9-15s
// connected by crossfade suspensions or hard-cut cadences; inside a
// hold the planes breathe gently while the accent orbits the rim —
// the frame's margins are always alive. Daylight re-chords the
// palette. Cost: quality:"half" (1024 pixel calls), channels baked to
// floats once per frame, bounding-box early-out per shape, incoming
// composition baked/evaluated only near and during transitions.

const meta = { name: "untitled_progression", fps: 30, inputs: ["clock"], quality: "half" };

const P = 9; // floats per primitive: type,cx,cy,a,b,hueOff,sat,val,flags

function hh(i, k) {
  return clamp(noise2(i * 0.731 + k * 3.17, k * 1.913 - i * 0.117) * 0.5 + 0.5, 0, 1);
}
function holdDur(i) { return 9 + 6 * hh(i, 9); }
function transDur(i) { return hh(i, 8) < 0.25 ? 0 : 2.5 + 1.5 * hh(i, 7); }

function genComp(idx, F, M) {
  const count = 4 + (hh(idx, 1) < 0.4 ? 1 : 0);
  M.count = count;
  M.baseHue = hh(idx, 0);
  M.driftPhase = idx * 1.3;
  M.accentR = 23 + 4 * hh(idx, 60);          // rim orbit radius 23..27
  M.accentSpeed = 0.07 + 0.04 * hh(idx, 61); // rad/s, one lap in ~1-1.5 min
  const zoneUsed = [0, 0, 0, 0, 1, 0, 0, 0, 0]; // center reserved
  const rowUsed = [0, 0, 0], colUsed = [0, 0, 0];
  // Plane 0: the anchor — a large rect near center, guarantees coverage.
  F[0] = 0;
  F[1] = 32 - 10 + 20 * hh(idx, 20);
  F[2] = 32 - 10 + 20 * hh(idx, 21);
  F[3] = 13 + 7 * hh(idx, 11);
  F[4] = 13 + 7 * hh(idx, 12);
  F[5] = 0.025 + 0.02 * hh(idx, 22);
  F[6] = 0.6 + 0.15 * hh(idx, 26);
  F[7] = 0.30 + 0.06 * hh(idx, 34);
  F[8] = 0;
  for (let j = 1; j < count; j++) {
    const b = j * P;
    const accent = j === count - 1;
    const r1 = hh(idx, 10 + j * 4), r2 = hh(idx, 11 + j * 4), r3 = hh(idx, 12 + j * 4);
    if (accent) {
      F[b] = r1 < 0.5 ? 1 : 0; // small circle or small rect
      F[b + 3] = 5 + 3 * r2;
      F[b + 4] = 5 + 3 * r3;
      F[b + 5] = 0.45 + 0.12 * hh(idx, 30); // far from the family
      F[b + 6] = 0.75;
      F[b + 7] = 0.72;
      F[b + 8] = 1; // flag: passing tone + rim orbit
      F[b + 1] = 0; // position ignored; set in bake()
      F[b + 2] = 0;
    } else {
      const isRect = r1 < 0.62;
      F[b] = isRect ? 0 : 1;
      if (isRect) { F[b + 3] = 8 + 10 * r2; F[b + 4] = 8 + 10 * r3; }
      else { F[b + 3] = 7 + 6 * r2; F[b + 4] = F[b + 3]; }
      // chord of neighbors: hue offsets +/-0.02..0.045 around the base
      F[b + 5] = (j % 2 === 0 ? 1 : -1) * (0.025 + 0.02 * hh(idx, 22 + j));
      F[b + 6] = 0.6 + 0.15 * hh(idx, 26 + j);
      const vsteps = [0.46, 0.36, 0.55];
      F[b + 7] = vsteps[j % 3] * (0.9 + 0.2 * hh(idx, 34 + j));
      F[b + 8] = 0;
      // Rook-disjoint zone assignment: no two satellites share a row or
      // column of the thirds-grid, the first satellite always a corner —
      // poise and spread by construction, not by luck.
      let z;
      if (j === 1) {
        const corners = [0, 2, 6, 8];
        z = corners[(hh(idx, 41) * 4) | 0];
      } else {
        z = ((hh(idx, 40 + j) * 9) | 0) % 9;
        let tries = 0;
        while (tries < 12 && (zoneUsed[z] || rowUsed[(z / 3) | 0] || colUsed[z % 3])) {
          z = (z + 1 + ((hh(idx, 50 + j) * 7) | 0)) % 9;
          tries++;
        }
      }
      zoneUsed[z] = 1; rowUsed[(z / 3) | 0] = 1; colUsed[z % 3] = 1;
      const zx = (z % 3) * 21.3 + 10.7, zy = ((z / 3) | 0) * 21.3 + 10.7;
      F[b + 1] = zx - 11 + 22 * hh(idx, 20 + j * 3);
      F[b + 2] = zy - 11 + 22 * hh(idx, 21 + j * 3);
    }
  }
}

const A = { F: new Float32Array(5 * P), M: { count: 0, baseHue: 0, driftPhase: 0, accentR: 25, accentSpeed: 0.09 } };
const B = { F: new Float32Array(5 * P), M: { count: 0, baseHue: 0, driftPhase: 0, accentR: 25, accentSpeed: 0.09 } };
// baked channel floats: index 0 = ground, 1..5 = shapes
const crA = new Float32Array(6), cgA = new Float32Array(6), cbA = new Float32Array(6);
const crB = new Float32Array(6), cgB = new Float32Array(6), cbB = new Float32Array(6);
const offA = new Float32Array(10), offB = new Float32Array(10);

let started = false;
let curIdx = 0, segEnd = 0, upTrans = 0;
let __cacheT = -1, mixU = 0;

function bake(M, F, cr, cg, cb, off, t, dl, idx) {
  // Stimmung follows the sun: the same composition re-chorded
  // warm-to-cool across the day.
  const base = fract(M.baseHue + lerp(-0.055, 0.055, dl));
  const vscale = lerp(0.85, 1.08, dl);
  // the ground breathes, gently
  const gv = (0.09 + 0.06 * dl) * (0.9 + 0.2 * (0.5 + 0.5 * noise2(t * 0.3, idx * 3.7)));
  let c = hsv(base, 0.55, gv);
  cr[0] = (c >> 16) & 255; cg[0] = (c >> 8) & 255; cb[0] = c & 255;
  for (let j = 0; j < M.count; j++) {
    const b = j * P;
    let hueOff = F[b + 5];
    // planes breathe softly; the accent is the restless one
    let v = F[b + 7] * (0.85 + 0.30 * (0.5 + 0.5 * noise2(t * 0.3, idx * 5.1 + j * 7.3)));
    if (F[b + 8] === 1) {
      hueOff += 0.08 * Math.sin(t * 0.3 + idx * 1.7); // passing tone
      v *= 0.6 + 0.8 * (0.5 + 0.5 * Math.sin(t * 1.2 + idx * 2.3));
      // the accent orbits the rim: a hand traveling the margin
      const ang = t * M.accentSpeed + idx * 2.4;
      F[b + 1] = 32 + Math.cos(ang) * M.accentR;
      F[b + 2] = 32 + Math.sin(ang) * M.accentR;
    }
    c = hsv(fract(base + hueOff), F[b + 6], v * vscale);
    cr[j + 1] = (c >> 16) & 255; cg[j + 1] = (c >> 8) & 255; cb[j + 1] = c & 255;
    // sub-pixel poise drift: the held canvas slowly adjusts itself
    off[j * 2] = 2.2 * Math.sin(t * (0.10 + 0.02 * j) + M.driftPhase + j * 2.1);
    off[j * 2 + 1] = 2.2 * Math.cos(t * (0.09 + 0.018 * j) + M.driftPhase * 1.7 + j * 1.3);
  }
}

// Inlined compositor: packed color out; bounding-box early-out per
// shape; no helper calls on the per-pixel path.
function evalComp(F, M, cr, cg, cb, off, px, py) {
  let r = cr[0], g = cg[0], b = cb[0];
  const n = M.count;
  for (let j = 0; j < n; j++) {
    const q = j * P;
    const cx = F[q + 1] + off[j * 2], cy = F[q + 2] + off[j * 2 + 1];
    const a = F[q + 3];
    let dx = px - cx; if (dx < 0) dx = -dx;
    if (dx > a + 1) continue;
    let dy = py - cy; if (dy < 0) dy = -dy;
    let d;
    if (F[q] === 0) {
      const bb = F[q + 4];
      if (dy > bb + 1) continue;
      const ex = dx - a, ey = dy - bb;
      d = ex > ey ? ex : ey;
    } else {
      if (dy > a + 1) continue;
      d = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) - a;
    }
    let cov = 0.5 - d;
    if (cov <= 0) continue;
    if (cov > 1) cov = 1;
    const k = j + 1;
    r += (cr[k] - r) * cov;
    g += (cg[k] - g) * cov;
    b += (cb[k] - b) * cov;
  }
  return ((r | 0) << 16) | ((g | 0) << 8) | (b | 0);
}

function copyM(dst, src) {
  dst.count = src.count; dst.baseHue = src.baseHue;
  dst.driftPhase = src.driftPhase; dst.accentR = src.accentR; dst.accentSpeed = src.accentSpeed;
}

function frame(t) {
  __cacheT = t;
  if (!started) {
    genComp(0, A.F, A.M);
    genComp(1, B.F, B.M);
    segEnd = holdDur(0);
    upTrans = transDur(0);
    started = true;
  }
  while (t >= segEnd + upTrans) {
    const bs = segEnd + upTrans;
    curIdx++;
    A.F.set(B.F); copyM(A.M, B.M);
    genComp(curIdx + 1, B.F, B.M);
    upTrans = transDur(curIdx);
    segEnd = bs + holdDur(curIdx);
  }
  const dl = clamp(input.clock.daylight, 0, 1);
  bake(A.M, A.F, crA, cgA, cbA, offA, t, dl, curIdx);
  // B is only needed near/within a transition — skip its bake otherwise.
  if (upTrans > 0 && t > segEnd - 1.0) {
    bake(B.M, B.F, crB, cgB, cbB, offB, t, dl, curIdx + 1);
  }
  if (upTrans > 0 && t > segEnd) {
    const u = clamp((t - segEnd) / upTrans, 0, 1);
    mixU = u * u * (3 - 2 * u);
  } else mixU = 0;
}

function pixel(x, y, t) {
  if (t !== __cacheT) frame(t);
  const px = x + 0.5, py = y + 0.5;
  const col = evalComp(A.F, A.M, crA, cgA, cbA, offA, px, py);
  if (mixU <= 0.001) return col;
  const col2 = evalComp(B.F, B.M, crB, cgB, cbB, offB, px, py);
  const r = ((col >> 16) & 255) + (((col2 >> 16) & 255) - ((col >> 16) & 255)) * mixU;
  const g = ((col >> 8) & 255) + (((col2 >> 8) & 255) - ((col >> 8) & 255)) * mixU;
  const b = (col & 255) + ((col2 & 255) - (col & 255)) * mixU;
  return ((r | 0) << 16) | ((g | 0) << 8) | (b | 0);
}
