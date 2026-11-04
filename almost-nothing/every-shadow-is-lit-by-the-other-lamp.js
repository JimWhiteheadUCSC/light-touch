/*@vfx
id: 1688e320-ecab-45a7-ba81-556dadfbbbeb
title: Every Shadow Is Lit by the Other Lamp
created: 2026-08-09
artist: Selvedge (apprentice name)
lineage:
  - id: f603c19c-7cec-45a0-9db1-ff62004fdad4
    relation: variation
    note: >
      kept the lit ground and the law that the picture is what has been
      taken away from it; refused the multiply. There the lamp WAS the
      paper and a mark subtracted by lying on it. Here the light has a
      position, so what darkens the sheet is not a mark at all - it is a
      body standing somewhere else entirely, and the dark it leaves is
      not black but whatever colour the other lamp is.
  - id: 2d1d4728-3d2b-4c92-90ed-6201c2fbc514
    relation: contrast
    note: >
      that piece argued light only adds, so more voices meant brighter and
      less saturated, and the colour of every overlap came out of a table
      I wrote. I accept the premise and refuse both conclusions. Because
      light adds, a shadow is not an absence, it is a DIFFERENT SUM - and
      the rule runs backwards: the more lamps a region is hidden from, the
      darker and the more saturated it gets. No table here is mine;
      occlusion writes it.
  - id: 96a6330b-c94f-4f99-b027-e1ce1b334d91
    relation: contrast
    note: >
      that piece was five-sixths unlit, made of thin lines, and its hidden
      thing was an abstraction - a relief nobody could stand next to. This
      one is lit edge to edge and made of soft masses, and the hidden
      thing is a BODY. Same refusal to show the subject; a different kind
      of subject to refuse.
influences: [verena-loewensberg, okazz]
rationale: |
  Two lamps are burning somewhere off the panel, and a dozen bodies are
  hanging in the air between them and this sheet. You will not see a
  lamp and you will not see a body. The whole picture is the light that
  failed to arrive.

  What makes it worth doing is a fact about addition. Light sums, so the
  place a body hides from one lamp is not dark - it is simply lit by the
  OTHER lamp, alone, and therefore takes that lamp's colour at full
  strength. So every body casts two shadows and they are different
  colours: one ochre, because only the warm lamp still reaches it, one
  blue, because only the cool one does. Where the two shadows overlap,
  nothing reaches, and that small lens between them is the only true
  black on the panel. Meanwhile the ground - the part both lamps reach -
  is the sum of the two, and a sum of opposed hues is nearly colourless.
  The bright part of this piece has no colour. All the colour is in what
  is missing.

  My third piece said an LED can only add and inverted the printer's law
  to compensate; my fifth said the panel can subtract if you spend the
  ceiling on the ground. This is the third answer and I think it is the
  true one: an emitting panel subtracts by OCCLUSION, and it costs
  nothing, because you were never removing light - you were only
  declining to send some.

  The pair of lamps is the instrument, and it is played slowly. Their
  separation opens and closes, so a body's two shadows walk apart until
  each is a clean coloured island, then close until they stack into one
  black mass - and how far apart a body's two shadows sit is exactly how
  high it is hanging, which is the only way the panel can tell you
  anything about a thing it never shows. The axis between the lamps
  turns, so every pair revolves slowly about its own body. And the two
  lamps keep their own hours: each wanders in brightness on its own
  timer, so the ground swells and ebbs, and when one of them sinks far
  enough its shadows fade out while the other's go nearly black - the
  title, stated as a measurement. A shadow is only coloured while
  something else is still lit.

  The bodies are Okazz's lifecycle moved somewhere it cannot be seen.
  One of them dissolves every few seconds - its two shadows softening
  and thinning away to nothing - and another gathers somewhere else. His
  patron liked the shapes appearing and disappearing; these appear and
  disappear without ever existing.

  It reads the sky, in the one way this subject allows. Cloud is the
  angular size of a source: an overcast hour has no sharp shadows
  anywhere in the world, so cloud spreads the penumbra until the edges
  go to vapour, and a clear hour cuts them hard. Rain pulls the whole
  room down a stop, the thermometer banks the chord warm or cold, and
  the clock sets the exposure and the tempo. With no weather station
  attached it sits at a half-clouded temperate afternoon, which is a
  perfectly good light to hang two lamps in.

  Sides taken. With Loewensberg on the overlap - the region where two
  things cross has its own name and is reachable no other way - and with
  her on the freeze-frame, which this passes on soft ellipses instead of
  hard edges. But against her chord of neighbours, on evidence: I built
  it with three lamps of related hue first and it was mud, because a
  shadow keeps whatever remains, and what remains from neighbours is the
  same colour again. This register needs its two notes OPPOSED. And on
  the standing argument about what geometry is about, a side nobody on
  the roster holds and my own archive has been circling for twelve
  pieces: geometry is EVIDENCE. Not animacy, not purity, not use, not
  descent, not measurement - testimony. Every shape here is proof that
  something is standing in the light, and the proof is all you get.
@vfx*/

// every_shadow_is_lit_by_the_other_lamp - buffer mode
// Two coloured point lamps at heights H above the panel; a dozen opaque
// ellipsoid bodies hang at a height fraction u of the way up to the lamp.
// Neither lamps nor bodies are ever drawn. For each lamp a visibility
// buffer V (1 = the lamp reaches this pixel) is filled with 1 and then
// multiplied down inside each shadow's bounding box; the shadow of a body
// is its silhouette projected from the lamp - centre displaced by
// (P - L) * k, radius scaled by m = 1 + k, penumbra = sourceRadius * k,
// with k = u / (1 - u). The frame is then light[x] = ambient + sum over
// lamps of falloff_s(x) * V_s(x) * colour_s: additive, so a region hidden
// from one lamp is fully lit by the other and takes its hue, and the
// doubly-hidden lens is ambient alone. Falloff is sampled on a 9x9 grid
// per lamp and walked linearly per row; rows and pixels with no shadow on
// them read a precomputed base-colour row instead, which is most of the
// panel. One setPixel pass per frame (knowledge/craft/compositing.md).

const meta = { name: "every_shadow_is_lit_by_the_other_lamp", fps: 24, inputs: ["clock", "env"] };

const NL = 2, NB = 12;
// three families: warm, cool, rose. The two lamps must come from families
// that are far apart, or the shadows return the ground's own colour.
const HUEZ = [0.055, 0.095, 0.135, 0.500, 0.545, 0.600, 0.820, 0.875, 0.935];
const SATZ = [0.92, 0.88, 0.82];

const V0 = new Float32Array(4096), V1 = new Float32Array(4096);
const VS = [V0, V1];
const SHF = new Uint8Array(4096), ROWSH = new Uint8Array(64);
const FG = new Float32Array(162);
const GR = new Float32Array(81), GG = new Float32Array(81), GB = new Float32Array(81);
const RR = new Float32Array(9), RGG = new Float32Array(9), RBB = new Float32Array(9);
const RF = new Float32Array(18);
const BSR = new Float32Array(64), BSG = new Float32Array(64), BSB = new Float32Array(64);
const FX = new Float32Array(128);

const LX = new Float32Array(NL), LY = new Float32Array(NL), LH = new Float32Array(NL);
const LH0 = new Float32Array(NL), LHP = new Float32Array(NL), LHR = new Float32Array(NL);
const LI = new Float32Array(NL), LIG = new Float32Array(NL), LITim = new Float32Array(NL);
const LZ = new Int32Array(NL), LDG = new Int32Array(NL), LHTim = new Float32Array(NL);
const LCR = new Float32Array(NL), LCG = new Float32Array(NL), LCB = new Float32Array(NL);
const TR = new Float32Array(NL), TG = new Float32Array(NL), TB = new Float32Array(NL);

const BX = new Float32Array(NB), BY = new Float32Array(NB);
const BVX = new Float32Array(NB), BVY = new Float32Array(NB), BVT = new Float32Array(NB);
const BU = new Float32Array(NB), BUG = new Float32Array(NB), BUT = new Float32Array(NB);
const BR0 = new Float32Array(NB), BPH = new Float32Array(NB), BPR = new Float32Array(NB);
const BD = new Float32Array(NB), BDG = new Float32Array(NB), BEL = new Float32Array(NB);

let dlS = -1, clS = 0.35, rnS = 0, tpS = 16, turnT = 7, first = true, hbG = 0;
let cx = 32, cy = 32, cvx = 0.6, cvy = 0.4, cvT = 10;
let sep = 40, sepF = 40, sepT = 40, sepM = -1, sepD = 8, sepTim = 13;
let rot = 0, rotV = 0.13, rotT = 22;

function rnd(a, b) { return a + Math.random() * (b - a); }

// a body gathers somewhere else: position, size, and how high it hangs
function spawn(b, alive) {
  BX[b] = rnd(2, 62); BY[b] = rnd(2, 62);
  const a = Math.random() * 6.283, sp = rnd(2.0, 3.6);
  BVX[b] = Math.cos(a) * sp; BVY[b] = Math.sin(a) * sp; BVT[b] = rnd(6, 15);
  BU[b] = rnd(0.12, 0.30); BUG[b] = rnd(0.10, 0.34); BUT[b] = rnd(5, 12);
  BR0[b] = Math.random() < 0.3 ? rnd(5.5, 7.5) : rnd(3.0, 5.0);
  BEL[b] = rnd(0.72, 1.4);
  BPH[b] = Math.random() * 6.283; BPR[b] = rnd(0.07, 0.18);
  BD[b] = alive ? rnd(0.7, 1) : 0; BDG[b] = 1;
}

function setDeg(s) {
  const c = hsv(HUEZ[LZ[s] * 3 + LDG[s]] + hbG, SATZ[LZ[s]], 1);
  TR[s] = (c >> 16) & 255; TG[s] = (c >> 8) & 255; TB[s] = c & 255;
}

function setup() {
  for (let s = 0; s < NL; s++) {
    LH0[s] = rnd(52, 88); LH[s] = LH0[s];
    LHP[s] = Math.random() * 6.283; LHR[s] = rnd(0.20, 0.30);
    LDG[s] = (Math.random() * 3) | 0; LHTim[s] = rnd(6, 18);
    LI[s] = rnd(0.6, 1); LIG[s] = LI[s]; LITim[s] = rnd(4, 10);
  }
  LZ[0] = Math.random() < 0.5 ? 0 : 2; LZ[1] = 1;
  for (let s = 0; s < NL; s++) { setDeg(s); LCR[s] = TR[s]; LCG[s] = TG[s]; LCB[s] = TB[s]; }
  rot = Math.random() * 6.283;
  rotV = rnd(0.10, 0.20) * (Math.random() < 0.5 ? -1 : 1);
  sep = rnd(16, 64); sepF = sep; sepT = sep;
  cx = rnd(20, 44); cy = rnd(20, 44);
  for (let b = 0; b < NB; b++) spawn(b, true);
}

function render(t, dt) {
  // --- the sky, arriving slowly -------------------------------------------
  const ev = input.env;
  const cl = ev.ok ? ev.cloud : 0.35;
  const rn = ev.ok ? ev.rain : 0;
  const tp = ev.ok ? ev.tempC : 16;
  const kc = 1 - Math.exp(-dt / 8);
  clS += (cl - clS) * kc; rnS += (rn - rnS) * kc;
  tpS += (tp - tpS) * (1 - Math.exp(-dt / 12));
  if (dlS < 0) dlS = input.clock.daylight;
  dlS += (input.clock.daylight - dlS) * (1 - Math.exp(-dt / 3));
  const dl = dlS;
  const tempo = 0.85 + 0.30 * dl;
  const srcR = 0.7 + 3.0 * clS;                 // overcast has no sharp edges
  const GAIN = (0.34 + 0.10 * dl) * (1 - 0.15 * rnS);
  const warm = clamp((tpS - 2) / 26, 0, 1);
  hbG = 0.016 * (warm - 0.5) - 0.010 * (1 - dl);

  // --- the pair: a centre that drifts, a separation that opens and closes,
  //     an axis that turns ---------------------------------------------------
  cvT -= dt;
  if (cvT <= 0) {
    const a = Math.random() * 6.283, sp = rnd(0.5, 1.4);
    cvx = Math.cos(a) * sp; cvy = Math.sin(a) * sp; cvT = rnd(10, 22);
  }
  cx += cvx * dt * tempo; cy += cvy * dt * tempo;
  if (cx < 8) { cx = 8; cvx = -cvx; } if (cx > 56) { cx = 56; cvx = -cvx; }
  if (cy < 8) { cy = 8; cvy = -cvy; } if (cy > 56) { cy = 56; cvy = -cvy; }
  sepTim -= dt;
  if (sepTim <= 0 && sepM < 0) {
    sepF = sep; sepT = rnd(10, 70); sepM = 0; sepD = rnd(6, 12); sepTim = rnd(11, 24);
  }
  if (sepM >= 0) {
    sepM += dt; let p = sepM / sepD; if (p >= 1) { p = 1; sepM = -1; }
    const e = p * p * (3 - 2 * p); sep = sepF + (sepT - sepF) * e;
  }
  rotT -= dt;
  if (rotT <= 0) { rotV = rnd(0.10, 0.20) * (Math.random() < 0.5 ? -1 : 1); rotT = rnd(20, 42); }
  rot += rotV * dt * tempo;
  const hx = Math.cos(rot) * sep * 0.5, hy = Math.sin(rot) * sep * 0.5;
  LX[0] = cx + hx; LY[0] = cy + hy;
  LX[1] = cx - hx; LY[1] = cy - hy;

  // --- each lamp keeps its own hours --------------------------------------
  for (let s = 0; s < NL; s++) {
    LHP[s] += LHR[s] * dt;
    LH[s] = LH0[s] + 13 * Math.sin(LHP[s]);
    LITim[s] -= dt;
    if (LITim[s] <= 0) {
      // one of the two is always up, or there would be nothing to be lit by
      LIG[s] = LIG[1 - s] < 0.52 ? rnd(0.72, 1.0) : rnd(0.11, 1.0);
      LITim[s] = rnd(5, 11);
    }
    LI[s] += (LIG[s] - LI[s]) * (1 - Math.exp(-dt / 2.0));
    LHTim[s] -= dt;
    if (LHTim[s] <= 0) {
      if (s === 0 && Math.random() < 0.3) LZ[0] = LZ[0] === 0 ? 2 : 0;
      let g = LDG[s];
      for (let k = 0; k < 5; k++) { const n = (Math.random() * 3) | 0; if (n !== g) { g = n; break; } }
      LDG[s] = g;
      LHTim[s] = rnd(8, 18);
    }
    setDeg(s);
    const kk = first ? 1 : 1 - Math.exp(-dt / 2.2);
    LCR[s] += (TR[s] - LCR[s]) * kk;
    LCG[s] += (TG[s] - LCG[s]) * kk;
    LCB[s] += (TB[s] - LCB[s]) * kk;
  }
  const c0r = LCR[0] * LI[0] * GAIN, c0g = LCG[0] * LI[0] * GAIN, c0b = LCB[0] * LI[0] * GAIN;
  const c1r = LCR[1] * LI[1] * GAIN, c1g = LCG[1] * LI[1] * GAIN, c1b = LCB[1] * LI[1] * GAIN;
  const ad = 0.6 + 0.4 * dl;
  const amr = 4 * ad, amg = 5 * ad, amb = 9 * ad;

  // --- the bodies, which are never drawn ----------------------------------
  turnT -= dt;
  if (turnT <= 0) {
    let alive = 0;
    for (let b = 0; b < NB; b++) if (BDG[b] > 0) alive++;
    if (alive > 9) {
      const pick = (Math.random() * NB) | 0;
      for (let k = 0; k < NB; k++) { const q = (pick + k) % NB; if (BDG[q] > 0) { BDG[q] = 0; break; } }
    }
    turnT = rnd(5, 12);
  }
  for (let b = 0; b < NB; b++) {
    BVT[b] -= dt;
    if (BVT[b] <= 0) {
      const a = Math.random() * 6.283, sp = rnd(2.0, 3.6);
      BVX[b] = Math.cos(a) * sp; BVY[b] = Math.sin(a) * sp; BVT[b] = rnd(6, 15);
    }
    BX[b] += BVX[b] * dt * tempo; BY[b] += BVY[b] * dt * tempo;
    if (BX[b] < -2) { BX[b] = -2; BVX[b] = -BVX[b]; }
    if (BX[b] > 66) { BX[b] = 66; BVX[b] = -BVX[b]; }
    if (BY[b] < -2) { BY[b] = -2; BVY[b] = -BVY[b]; }
    if (BY[b] > 66) { BY[b] = 66; BVY[b] = -BVY[b]; }
    BUT[b] -= dt;
    if (BUT[b] <= 0) { BUG[b] = rnd(0.10, 0.34); BUT[b] = rnd(5, 12); }
    BU[b] += (BUG[b] - BU[b]) * (1 - Math.exp(-dt / 3.2));
    BPH[b] += BPR[b] * dt;
    BD[b] += (BDG[b] - BD[b]) * (1 - Math.exp(-dt / 1.6));
    if (BDG[b] === 0 && BD[b] < 0.03) spawn(b, false);
  }

  // --- where each lamp cannot reach ---------------------------------------
  SHF.fill(0); ROWSH.fill(0);
  V0.fill(1); V1.fill(1);
  for (let s = 0; s < NL; s++) {
    const V = VS[s], lx = LX[s], ly = LY[s];
    for (let b = 0; b < NB; b++) {
      const dns = BD[b];
      if (dns < 0.02) continue;
      const u = BU[b], k = u / (1 - u), m = 1 + k;
      const sx = BX[b] + (BX[b] - lx) * k;     // the silhouette, projected
      const sy = BY[b] + (BY[b] - ly) * k;
      const rx = BR0[b] * (1 + 0.18 * Math.sin(BPH[b])) * m;
      const ry = BR0[b] * BEL[b] * (1 + 0.18 * Math.sin(BPH[b] * 0.71 + 1.3)) * m;
      const w = 0.55 + srcR * k;                // the penumbra
      const rmin = rx < ry ? rx : ry;
      let e = w / rmin; if (e > 1.6) e = 1.6; if (e < 0.06) e = 0.06;
      let lo = 1 - e; if (lo < 0.02) lo = 0.02;
      const hi = 1 + e, inv = 1 / (hi - lo);
      let x0 = Math.floor(sx - rx * hi) - 1, x1 = Math.ceil(sx + rx * hi) + 1;
      let y0 = Math.floor(sy - ry * hi) - 1, y1 = Math.ceil(sy + ry * hi) + 1;
      if (x0 < 0) x0 = 0; if (x1 > 63) x1 = 63;
      if (y0 < 0) y0 = 0; if (y1 > 63) y1 = 63;
      if (x1 < x0 || y1 < y0) continue;
      const irx = 1 / rx, iry = 1 / ry;
      for (let y = y0; y <= y1; y++) {
        let dy = (y - sy) * iry; if (dy < 0) dy = -dy;
        if (dy > hi) continue;
        const dy2 = dy * dy, ro = y << 6;
        let hit = 0;
        for (let x = x0; x <= x1; x++) {
          let dx = (x - sx) * irx; if (dx < 0) dx = -dx;
          if (dx > hi) continue;
          const dd = Math.sqrt(dx * dx + dy2);
          if (dd >= hi) continue;
          let a;
          if (dd <= lo) a = dns;
          else { const u2 = (hi - dd) * inv; a = dns * u2 * u2 * (3 - 2 * u2); }
          if (a < 0.004) continue;
          const i = ro + x;
          V[i] *= 1 - a;
          SHF[i] = 1; hit = 1;
        }
        if (hit) ROWSH[y] = 1;
      }
    }
  }

  // --- how much of each lamp arrives --------------------------------------
  for (let s = 0; s < NL; s++) {
    const H2 = LH[s] * LH[s], lx = LX[s], ly = LY[s], bse = s * 81;
    for (let j = 0; j < 9; j++) {
      const dy = j * 8 - ly, dy2 = dy * dy, ro = bse + j * 9;
      for (let i = 0; i < 9; i++) {
        const dx = i * 8 - lx;
        FG[ro + i] = H2 / (H2 + dx * dx + dy2);
      }
    }
  }
  for (let q = 0; q < 81; q++) {
    const f0 = FG[q], f1 = FG[81 + q];
    GR[q] = amr + f0 * c0r + f1 * c1r;
    GG[q] = amg + f0 * c0g + f1 * c1g;
    GB[q] = amb + f0 * c0b + f1 * c1b;
  }

  // --- one crossing to the panel ------------------------------------------
  for (let y = 0; y < 64; y++) {
    const gy = y * 0.125;
    let j0 = gy | 0; if (j0 > 7) j0 = 7;
    const fy = gy - j0, r0 = j0 * 9, r1 = r0 + 9;
    for (let i = 0; i < 9; i++) {
      let a = GR[r0 + i]; RR[i] = a + (GR[r1 + i] - a) * fy;
      a = GG[r0 + i]; RGG[i] = a + (GG[r1 + i] - a) * fy;
      a = GB[r0 + i]; RBB[i] = a + (GB[r1 + i] - a) * fy;
    }
    for (let sg = 0; sg < 8; sg++) {
      let a0 = RR[sg], inc = (RR[sg + 1] - a0) * 0.125, v = a0, xi = sg << 3;
      for (let q = 0; q < 8; q++) { BSR[xi] = v; xi++; v += inc; }
      a0 = RGG[sg]; inc = (RGG[sg + 1] - a0) * 0.125; v = a0; xi = sg << 3;
      for (let q = 0; q < 8; q++) { BSG[xi] = v; xi++; v += inc; }
      a0 = RBB[sg]; inc = (RBB[sg + 1] - a0) * 0.125; v = a0; xi = sg << 3;
      for (let q = 0; q < 8; q++) { BSB[xi] = v; xi++; v += inc; }
    }
    if (ROWSH[y]) {
      for (let s = 0; s < NL; s++) {
        const bse = s * 81, ob = s * 9;
        for (let i = 0; i < 9; i++) {
          const a = FG[bse + r0 + i]; RF[ob + i] = a + (FG[bse + r1 + i] - a) * fy;
        }
        const fb = s * 64;
        for (let sg = 0; sg < 8; sg++) {
          const a0 = RF[ob + sg], inc = (RF[ob + sg + 1] - a0) * 0.125;
          let v = a0, xi = fb + (sg << 3);
          for (let q = 0; q < 8; q++) { FX[xi] = v; xi++; v += inc; }
        }
      }
    }
    const ro = y << 6;
    for (let x = 0; x < 64; x++) {
      const i = ro + x;
      let r, gq, bq;
      if (SHF[i] === 0) { r = BSR[x]; gq = BSG[x]; bq = BSB[x]; }
      else {
        const g0 = FX[x] * V0[i], g1 = FX[64 + x] * V1[i];
        r = amr + g0 * c0r + g1 * c1r;
        gq = amg + g0 * c0g + g1 * c1g;
        bq = amb + g0 * c0b + g1 * c1b;
      }
      if (r > 255) r = 255; if (gq > 255) gq = 255; if (bq > 255) bq = 255;
      setPixel(x, y, ((r | 0) << 16) | ((gq | 0) << 8) | (bq | 0));
    }
  }
  first = false;
}