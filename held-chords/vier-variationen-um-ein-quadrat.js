/*@vfx
id: d8f55848-9b2f-4e67-820f-b1f9456d0aac
title: Vier Variationen um ein Quadrat
created: 2026-10-10
artist: Chusen (apprentice name)
lineage:
  - id: 5c51a9b6-dfa2-4dc2-ac31-a502d3c1f9fe
    relation: variation
    note: Expands the single polyphonic canvas of Untitled (Stimmung in Four Chords) into a simultaneous 2x2 sampler plate of four autonomous suites of variations around a square, separated by pochoir registration gutters.
  - id: e7b33633-1301-41bc-a518-c2f562ff4c6a
    relation: inspiration
    note: Borrows the portfolio/sampler plate presentation format from Abstract Pattern Portfolio (Plate 14), but applies it to Loewensberg's concrete variation sets rather than scrolling textile bands.
  - id: d6830d63-4da4-4430-8672-230ce0fb95b0
    relation: contrast
    note: Rejects 3x3 organic amoebic modules and discrete cell-fusion blobs in favor of hard-edge concrete geometry, exact signed distance boundaries, and pure color chords.
influences:
  - verena-loewensberg
rationale: |
  In Zurich Concretism, serial variation was not an afterthought but the
  core method: Max Bill, Richard Paul Lohse, and Verena Loewensberg frequently
  explored an entire thematic idea across grouped variations—testing how
  proportions, counterweights, and color chords shift when a single geometric
  theme (here, the square) is subjected to four distinct formal systems.

  This piece realizes that discipline as a living 2x2 portfolio plate:
  four 32x32 quadrants separated by 1px sumi pochoir registration gutters,
  each holding an autonomous suite of four composed geometric variations:
  - Quadrant 0 (Top-Left): The Austere Core—a heavy structural square poised
    against an offset vermilion slab and cobalt punctum.
  - Quadrant 1 (Top-Right): Diamond & Axis—a central square engaged with a
    45-degree diamond rotation and vertical counterweight bar.
  - Quadrant 2 (Bottom-Left): Intersecting Squares—two overlapping figures
    governed by Loewensberg's overlap logic (where intersection forms an
    independently tuned plum chord) and an accent block.
  - Quadrant 3 (Bottom-Right): Concentric & Stave—nested figure-ground squares
    balanced against a narrow boundary stave.

  Each quadrant moves as an independent voice in a chamber quartet, operating
  on incommensurate phrase periods (17.3s, 21.1s, 14.7s, 19.3s) warped by slow
  simplex drift. In accordance with Loewensberg's adagio phrasing, each quadrant
  holds its composed poise in stillness for 72% of its cycle, then cross-modulates
  into its next state via a smooth quintic cadence. Because their cycles are
  pairwise coprime, the four movements modulate asynchronously: sometimes three
  rest while one modulates; occasionally a quiet chord change ripples across the
  plate. Pause any frame, and all four quadrants pass the freeze-frame test.
@vfx*/

const meta = { name: "vier_variationen", fps: 30, inputs: ["clock", "audio"] };

let __cacheT = null;

// Incommensurate periods for the 4 quadrants: 17.3s, 21.1s, 14.7s, 19.3s
const PERIODS = [17.3, 21.1, 14.7, 19.3];

// Each quadrant has 4 discrete composed states
// Q0: Variations around [Core Square (x,y,s), Slab (x,y,w,h), Dot (x,y,s)]
const Q0_STATES = [
  { core: [17, 15, 6.5], slab: [10, 23, 4.5, 3.0], dot: [23, 9, 2.5],
    cGround: [42, 44, 46], cCore: [26, 28, 32], cSlab: [204, 52, 38], cDot: [38, 84, 178] },
  { core: [15, 17, 7.0], slab: [22, 10, 3.0, 5.0], dot: [9, 23, 2.5],
    cGround: [44, 42, 44], cCore: [24, 26, 30], cSlab: [215, 145, 30], cDot: [195, 45, 45] },
  { core: [16, 16, 6.0], slab: [16, 24, 6.0, 2.5], dot: [16, 8, 2.5],
    cGround: [40, 44, 45], cCore: [30, 32, 36], cSlab: [35, 130, 115], cDot: [225, 180, 40] },
  { core: [14, 15, 6.5], slab: [23, 18, 3.0, 5.5], dot: [8, 11, 2.5],
    cGround: [45, 43, 42], cCore: [25, 27, 32], cSlab: [180, 48, 60], cDot: [230, 225, 215] }
];

// Q1: Variations around [Outer Square (x,y,s), Diamond / Rotated Square (x,y,s,ang), Bar (x,y,w,h)]
const Q1_STATES = [
  { core: [16, 16, 8.0], rot: [16, 16, 5.0, 0.785], bar: [25, 22, 2.0, 6.0],
    cGround: [46, 42, 38], cCore: [210, 156, 36], cRot: [24, 30, 36], cBar: [232, 230, 222] },
  { core: [15, 15, 7.5], rot: [17, 17, 5.5, 0.0], bar: [8, 14, 2.0, 5.5],
    cGround: [42, 44, 40], cCore: [36, 120, 105], cRot: [215, 60, 42], cBar: [225, 210, 40] },
  { core: [17, 16, 8.5], rot: [14, 15, 4.5, 0.785], bar: [24, 10, 5.0, 2.0],
    cGround: [45, 41, 44], cCore: [195, 48, 48], cRot: [25, 28, 34], cBar: [235, 230, 220] },
  { core: [16, 17, 7.5], rot: [16, 15, 5.5, 0.785], bar: [10, 24, 6.0, 2.0],
    cGround: [44, 44, 42], cCore: [40, 80, 160], cRot: [220, 165, 35], cBar: [230, 228, 220] }
];

// Q2: Variations around [Two Intersecting Squares with Overlap (sq1, sq2), Accent]
const Q2_STATES = [
  { sq1: [13, 14, 6.0], sq2: [19, 18, 5.0], acc: [9, 23, 2.5, 2.0],
    cGround: [38, 42, 40], cSq1: [32, 130, 115], cSq2: [190, 55, 40], cPlum: [110, 38, 62], cAcc: [225, 170, 40] },
  { sq1: [18, 13, 5.5], sq2: [13, 18, 6.0], acc: [23, 23, 2.0, 2.5],
    cGround: [42, 40, 44], cSq1: [195, 50, 45], cSq2: [35, 80, 165], cPlum: [95, 34, 88], cAcc: [230, 228, 220] },
  { sq1: [15, 17, 6.5], sq2: [17, 12, 5.0], acc: [8, 10, 3.0, 2.0],
    cGround: [40, 44, 42], cSq1: [215, 155, 35], cSq2: [30, 125, 110], cPlum: [85, 75, 40], cAcc: [190, 45, 40] },
  { sq1: [14, 15, 5.5], sq2: [18, 16, 5.5], acc: [23, 9, 2.0, 3.0],
    cGround: [44, 42, 38], cSq1: [185, 50, 55], cSq2: [210, 150, 30], cPlum: [140, 60, 35], cAcc: [35, 85, 170] }
];

// Q3: Variations around [Outer Square, Inner Concentric, Stave]
const Q3_STATES = [
  { outer: [16, 16, 9.0], inner: [17, 15, 4.5], stave: [7, 16, 1.5, 7.5],
    cGround: [44, 40, 44], cOuter: [28, 60, 130], cInner: [235, 232, 220], cStave: [195, 45, 45] },
  { outer: [15, 16, 8.5], inner: [14, 17, 4.0], stave: [16, 25, 7.5, 1.5],
    cGround: [45, 43, 39], cOuter: [190, 50, 40], cInner: [230, 228, 218], cStave: [35, 125, 110] },
  { outer: [17, 15, 8.5], inner: [18, 14, 4.5], stave: [25, 16, 1.5, 7.5],
    cGround: [39, 43, 43], cOuter: [210, 155, 35], cInner: [25, 30, 36], cStave: [190, 45, 45] },
  { outer: [16, 17, 9.0], inner: [15, 18, 4.5], stave: [16, 7, 7.5, 1.5],
    cGround: [43, 41, 45], cOuter: [35, 125, 110], cInner: [235, 232, 220], cStave: [215, 155, 35] }
];

const Q_CUR = [{}, {}, {}, {}];

function getQuadrantProgress(t, period, numSteps) {
  const p = (((t % period) + period) % period) / period;
  const rawIdx = p * numSteps;
  const idx = Math.floor(rawIdx);
  const frac = rawIdx - idx;
  let u = 0;
  // 72% rest/poise, 28% quintic transition
  if (frac > 0.72) {
    const rawU = (frac - 0.72) / 0.28;
    u = rawU * rawU * rawU * (rawU * (rawU * 6 - 15) + 10);
  }
  const cur = idx % numSteps;
  const nxt = (cur + 1) % numSteps;
  return { idx: cur, nextIdx: nxt, u };
}

function lerpColor(c1, c2, u, dl) {
  return [
    lerp(c1[0], c2[0], u) + dl * 4,
    lerp(c1[1], c2[1], u) + dl * 3,
    lerp(c1[2], c2[2], u) + dl * 2
  ];
}

function updateFrame(t) {
  const daylight = (typeof input !== "undefined" && input.clock) ? input.clock.daylight : 0.5;
  const dlShift = daylight - 0.5;
  const bass = (typeof input !== "undefined" && input.audio && input.audio.ok) ? input.audio.bass : 0;

  // Simplex phase warping prevents exact periodicity over minutes
  const t0 = t + noise2(t * 0.008, 0.5) * 3.0;
  const t1 = t + noise2(t * 0.007, 2.5) * 3.0;
  const t2 = t + noise2(t * 0.009, 4.5) * 3.0;
  const t3 = t + noise2(t * 0.006, 6.5) * 3.0;

  // Q0
  const s0 = getQuadrantProgress(t0, PERIODS[0], 4);
  const q0a = Q0_STATES[s0.idx], q0b = Q0_STATES[s0.nextIdx];
  Q_CUR[0] = {
    coreX: lerp(q0a.core[0], q0b.core[0], s0.u),
    coreY: lerp(q0a.core[1], q0b.core[1], s0.u),
    coreS: lerp(q0a.core[2], q0b.core[2], s0.u) + bass * 0.5,
    slabX: lerp(q0a.slab[0], q0b.slab[0], s0.u),
    slabY: lerp(q0a.slab[1], q0b.slab[1], s0.u),
    slabW: lerp(q0a.slab[2], q0b.slab[2], s0.u),
    slabH: lerp(q0a.slab[3], q0b.slab[3], s0.u),
    dotX: lerp(q0a.dot[0], q0b.dot[0], s0.u),
    dotY: lerp(q0a.dot[1], q0b.dot[1], s0.u),
    dotS: lerp(q0a.dot[2], q0b.dot[2], s0.u),
    cGround: lerpColor(q0a.cGround, q0b.cGround, s0.u, dlShift),
    cCore: lerpColor(q0a.cCore, q0b.cCore, s0.u, dlShift),
    cSlab: lerpColor(q0a.cSlab, q0b.cSlab, s0.u, dlShift),
    cDot: lerpColor(q0a.cDot, q0b.cDot, s0.u, dlShift),
  };

  // Q1
  const s1 = getQuadrantProgress(t1, PERIODS[1], 4);
  const q1a = Q1_STATES[s1.idx], q1b = Q1_STATES[s1.nextIdx];
  const rotAng = lerp(q1a.rot[3], q1b.rot[3], s1.u);
  Q_CUR[1] = {
    coreX: lerp(q1a.core[0], q1b.core[0], s1.u),
    coreY: lerp(q1a.core[1], q1b.core[1], s1.u),
    coreS: lerp(q1a.core[2], q1b.core[2], s1.u),
    rotX: lerp(q1a.rot[0], q1b.rot[0], s1.u),
    rotY: lerp(q1a.rot[1], q1b.rot[1], s1.u),
    rotS: lerp(q1a.rot[2], q1b.rot[2], s1.u) + bass * 0.4,
    rotCos: Math.cos(rotAng),
    rotSin: Math.sin(rotAng),
    barX: lerp(q1a.bar[0], q1b.bar[0], s1.u),
    barY: lerp(q1a.bar[1], q1b.bar[1], s1.u),
    barW: lerp(q1a.bar[2], q1b.bar[2], s1.u),
    barH: lerp(q1a.bar[3], q1b.bar[3], s1.u),
    cGround: lerpColor(q1a.cGround, q1b.cGround, s1.u, dlShift),
    cCore: lerpColor(q1a.cCore, q1b.cCore, s1.u, dlShift),
    cRot: lerpColor(q1a.cRot, q1b.cRot, s1.u, dlShift),
    cBar: lerpColor(q1a.cBar, q1b.cBar, s1.u, dlShift),
  };

  // Q2
  const s2 = getQuadrantProgress(t2, PERIODS[2], 4);
  const q2a = Q2_STATES[s2.idx], q2b = Q2_STATES[s2.nextIdx];
  Q_CUR[2] = {
    sq1X: lerp(q2a.sq1[0], q2b.sq1[0], s2.u),
    sq1Y: lerp(q2a.sq1[1], q2b.sq1[1], s2.u),
    sq1S: lerp(q2a.sq1[2], q2b.sq1[2], s2.u),
    sq2X: lerp(q2a.sq2[0], q2b.sq2[0], s2.u),
    sq2Y: lerp(q2a.sq2[1], q2b.sq2[1], s2.u),
    sq2S: lerp(q2a.sq2[2], q2b.sq2[2], s2.u),
    accX: lerp(q2a.acc[0], q2b.acc[0], s2.u),
    accY: lerp(q2a.acc[1], q2b.acc[1], s2.u),
    accW: lerp(q2a.acc[2], q2b.acc[2], s2.u),
    accH: lerp(q2a.acc[3], q2b.acc[3], s2.u),
    cGround: lerpColor(q2a.cGround, q2b.cGround, s2.u, dlShift),
    cSq1: lerpColor(q2a.cSq1, q2b.cSq1, s2.u, dlShift),
    cSq2: lerpColor(q2a.cSq2, q2b.cSq2, s2.u, dlShift),
    cPlum: lerpColor(q2a.cPlum, q2b.cPlum, s2.u, dlShift),
    cAcc: lerpColor(q2a.cAcc, q2b.cAcc, s2.u, dlShift),
  };

  // Q3
  const s3 = getQuadrantProgress(t3, PERIODS[3], 4);
  const q3a = Q3_STATES[s3.idx], q3b = Q3_STATES[s3.nextIdx];
  Q_CUR[3] = {
    outX: lerp(q3a.outer[0], q3b.outer[0], s3.u),
    outY: lerp(q3a.outer[1], q3b.outer[1], s3.u),
    outS: lerp(q3a.outer[2], q3b.outer[2], s3.u),
    inX: lerp(q3a.inner[0], q3b.inner[0], s3.u),
    inY: lerp(q3a.inner[1], q3b.inner[1], s3.u),
    inS: lerp(q3a.inner[2], q3b.inner[2], s3.u),
    staveX: lerp(q3a.stave[0], q3b.stave[0], s3.u),
    staveY: lerp(q3a.stave[1], q3b.stave[1], s3.u),
    staveW: lerp(q3a.stave[2], q3b.stave[2], s3.u),
    staveH: lerp(q3a.stave[3], q3b.stave[3], s3.u),
    cGround: lerpColor(q3a.cGround, q3b.cGround, s3.u, dlShift),
    cOuter: lerpColor(q3a.cOuter, q3b.cOuter, s3.u, dlShift),
    cInner: lerpColor(q3a.cInner, q3b.cInner, s3.u, dlShift),
    cStave: lerpColor(q3a.cStave, q3b.cStave, s3.u, dlShift),
  };

  __cacheT = t;
}

// Inlined signed distance functions (zero Math.hypot overhead)
function sdBox(x, y, cx, cy, hw, hh) {
  const dx = Math.abs(x - cx) - hw;
  const dy = Math.abs(y - cy) - hh;
  const qx = dx > 0 ? dx : 0;
  const qy = dy > 0 ? dy : 0;
  const inD = dx > dy ? dx : dy;
  return Math.sqrt(qx * qx + qy * qy) + (inD < 0 ? inD : 0);
}

function sdRotBoxFast(x, y, cx, cy, hw, hh, cos, sin) {
  const rx = (x - cx) * cos + (y - cy) * sin;
  const ry = -(x - cx) * sin + (y - cy) * cos;
  const dx = Math.abs(rx) - hw;
  const dy = Math.abs(ry) - hh;
  const qx = dx > 0 ? dx : 0;
  const qy = dy > 0 ? dy : 0;
  const inD = dx > dy ? dx : dy;
  return Math.sqrt(qx * qx + qy * qy) + (inD < 0 ? inD : 0);
}

// 1.0 px filter width anti-aliased edge
function edge(d) {
  const x = 0.5 - d;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

function pixel(x, y, t) {
  if (t !== __cacheT) updateFrame(t);

  // Pochoir registration gutters (1px wide at x=31, 32 and y=31, 32)
  if (x === 31 || x === 32 || y === 31 || y === 32) {
    return rgb(18, 20, 22);
  }

  const qx = x < 32 ? 0 : 1;
  const qy = y < 32 ? 0 : 1;
  const qIdx = qy * 2 + qx;

  const lx = x % 32;
  const ly = y % 32;
  const cur = Q_CUR[qIdx];

  let r = cur.cGround[0];
  let g = cur.cGround[1];
  let b = cur.cGround[2];

  if (qIdx === 0) {
    const dCore = sdBox(lx, ly, cur.coreX, cur.coreY, cur.coreS, cur.coreS);
    const dSlab = sdBox(lx, ly, cur.slabX, cur.slabY, cur.slabW, cur.slabH);
    const dDot  = sdBox(lx, ly, cur.dotX, cur.dotY, cur.dotS, cur.dotS);

    const mCore = edge(dCore);
    const mSlab = edge(dSlab);
    const mDot  = edge(dDot);

    if (mCore > 0) {
      r = lerp(r, cur.cCore[0], mCore); g = lerp(g, cur.cCore[1], mCore); b = lerp(b, cur.cCore[2], mCore);
    }
    if (mSlab > 0) {
      r = lerp(r, cur.cSlab[0], mSlab); g = lerp(g, cur.cSlab[1], mSlab); b = lerp(b, cur.cSlab[2], mSlab);
    }
    if (mDot > 0) {
      r = lerp(r, cur.cDot[0], mDot); g = lerp(g, cur.cDot[1], mDot); b = lerp(b, cur.cDot[2], mDot);
    }
  } else if (qIdx === 1) {
    const dCore = sdBox(lx, ly, cur.coreX, cur.coreY, cur.coreS, cur.coreS);
    const dRot  = sdRotBoxFast(lx, ly, cur.rotX, cur.rotY, cur.rotS, cur.rotS, cur.rotCos, cur.rotSin);
    const dBar  = sdBox(lx, ly, cur.barX, cur.barY, cur.barW, cur.barH);

    const mCore = edge(dCore);
    const mRot  = edge(dRot);
    const mBar  = edge(dBar);

    if (mCore > 0) {
      r = lerp(r, cur.cCore[0], mCore); g = lerp(g, cur.cCore[1], mCore); b = lerp(b, cur.cCore[2], mCore);
    }
    if (mRot > 0) {
      r = lerp(r, cur.cRot[0], mRot); g = lerp(g, cur.cRot[1], mRot); b = lerp(b, cur.cRot[2], mRot);
    }
    if (mBar > 0) {
      r = lerp(r, cur.cBar[0], mBar); g = lerp(g, cur.cBar[1], mBar); b = lerp(b, cur.cBar[2], mBar);
    }
  } else if (qIdx === 2) {
    const dSq1 = sdBox(lx, ly, cur.sq1X, cur.sq1Y, cur.sq1S, cur.sq1S);
    const dSq2 = sdBox(lx, ly, cur.sq2X, cur.sq2Y, cur.sq2S, cur.sq2S);
    const dAcc = sdBox(lx, ly, cur.accX, cur.accY, cur.accW, cur.accH);

    const m1 = edge(dSq1);
    const m2 = edge(dSq2);
    const mAcc = edge(dAcc);
    const mOverlap = Math.min(m1, m2);

    if (m1 > 0) {
      r = lerp(r, cur.cSq1[0], m1); g = lerp(g, cur.cSq1[1], m1); b = lerp(b, cur.cSq1[2], m1);
    }
    if (m2 > 0) {
      r = lerp(r, cur.cSq2[0], m2); g = lerp(g, cur.cSq2[1], m2); b = lerp(b, cur.cSq2[2], m2);
    }
    if (mOverlap > 0) {
      r = lerp(r, cur.cPlum[0], mOverlap); g = lerp(g, cur.cPlum[1], mOverlap); b = lerp(b, cur.cPlum[2], mOverlap);
    }
    if (mAcc > 0) {
      r = lerp(r, cur.cAcc[0], mAcc); g = lerp(g, cur.cAcc[1], mAcc); b = lerp(b, cur.cAcc[2], mAcc);
    }
  } else {
    const dOuter = sdBox(lx, ly, cur.outX, cur.outY, cur.outS, cur.outS);
    const dInner = sdBox(lx, ly, cur.inX, cur.inY, cur.inS, cur.inS);
    const dStave = sdBox(lx, ly, cur.staveX, cur.staveY, cur.staveW, cur.staveH);

    const mOuter = edge(dOuter);
    const mInner = edge(dInner);
    const mStave = edge(dStave);

    if (mOuter > 0) {
      r = lerp(r, cur.cOuter[0], mOuter); g = lerp(g, cur.cOuter[1], mOuter); b = lerp(b, cur.cOuter[2], mOuter);
    }
    if (mInner > 0) {
      r = lerp(r, cur.cInner[0], mInner); g = lerp(g, cur.cInner[1], mInner); b = lerp(b, cur.cInner[2], mInner);
    }
    if (mStave > 0) {
      r = lerp(r, cur.cStave[0], mStave); g = lerp(g, cur.cStave[1], mStave); b = lerp(b, cur.cStave[2], mStave);
    }
  }

  return rgb(r | 0, g | 0, b | 0);
}