/*@vfx
id: 2d1d4728-3d2b-4c92-90ed-6201c2fbc514
title: The Chord Is Where They Cross
created: 2026-08-03
artist: Selvedge (apprentice name)
lineage:
  - id: 1a238e15-d289-44d5-958c-fa7e4ed62ed4
    relation: variation
    note: kept her office, the flat hard-edged plate and the slow discs
      passing over everything; refused the inversion - there an overlap
      was an operation performed on whatever lay underneath, here an
      overlap is a region with its own name and its own entry in the
      table, reachable no other way
  - id: 58e9a330-486c-40c9-a965-16afae35b735
    relation: contrast
    note: that piece let a rigid spatial grid decide colour by WHERE a
      pixel falls; this one lets logic decide by WHAT covers it - and
      that piece listened to the room, this one refuses to, on purpose
influences: [verena-loewensberg, mizuki-heitaro]
rationale: |
  Five voices are sounding on this plate: a disc, a rectangle, and three
  bars that sweep across and leave. A pixel's colour is not decided by
  the topmost shape, nor by blending the ones beneath it. It is decided
  by the SET of voices covering it - thirty-two possible sets, thirty-two
  colours, and the table that holds them is the whole composition. You
  never see the table. You see the regions it produces.

  Two laws fill it, and they are the piece.

  Light adds. A press overprints by subtraction - lay red over blue and
  the sheet goes darker, toward black. An LED cannot do that; it has only
  the one direction. So here every additional voice covering a region
  raises its value and takes saturation out of it, the way real light
  sums toward white: the ground is a deep near-black red, one voice is a
  flat colour, two is brighter, and the rare place where four agree is
  the brightest thing on the panel and always small. The press's law,
  inverted by the medium, and honestly - not a printing simulation, a
  printing argument.

  Hue is arithmetic, and hidden. Every voice holds a degree of a
  seven-note scale - three warm neighbours, three cool ones a half-turn
  away, and a rose at the far side that is reachable only by summing.
  A region's degree is the SUM of the degrees of the voices sounding
  there, modulo seven. So the colour where two voices cross is a
  sonority, not a mixture: you cannot find it between its parents,
  because it was made by adding their intervals, not their light. Every
  few seconds one voice steps its degree - a second, sometimes a third,
  rarely further - and every region containing that voice re-chords at
  once, right across the panel, while every region it does not touch
  stays exactly as it was. That is a modulation you watch travel by
  logic instead of by space, and it is the only thing here that happens
  fast.

  Everything else is slow. The bars cross at three to seven pixels a
  second, exit, rest a few seconds, and come back on a new heading and a
  new width, rotating about a degree a second as they go. The disc and
  the rectangle drift on a torus with headings that wander on noise,
  breathe, change proportion, and occasionally shrink away to nothing
  and come back - a voice tacet. Between two and five voices are
  sounding at any moment, so the plate at minute eight is not a
  rearrangement of the plate at minute one; it has a different number of
  parts. And the sheet is not evenly inked: a slow noise field varies
  the density about a tenth, drifting, so no field is quite flat.

  Sides taken. With Loewensberg, twice. The work refers to nothing and
  needs to - it is a hidden system, felt and withheld, and the freeze
  frame is the brief: pause it anywhere and it should be a canvas.
  And on the open question in her dossier - whether a woman who sold
  experimental jazz for a decade licenses audio-reactivity - I take the
  other side from my last piece, which listened. Music belongs in the
  room, not on the canvas. What her record shop is doing in this piece
  is voice leading, counterpoint, the sonority of who is sounding
  together: rhythm internalized, not metered. The clock is the only
  input, and only because a room does dim.
@vfx*/

// the_chord_is_where_they_cross - buffer mode
// Five "voices" (one disc, one rectangle, three sweeping bars) each own a
// bit. Per pixel the coverage bits form a mask 0..31, and colour comes
// from a 32-entry table: value by popcount (light adds), hue by the sum
// of the voices' scale degrees mod 7 (hidden arithmetic). The table is
// pre-multiplied against 16 ink-density levels once per frame, so the
// interior of every region is ONE array read and one setPixel; only the
// sub-pixel edges pay for a fold over the fractional voices.

const meta = { name: "chord_where_they_cross", fps: 30, inputs: ["clock"] };

const NV = 5, NM = 32, NL = 16;
// the scale: three warm neighbours, three cool, one rose reachable only by summing
const HUE = [0.00, 0.045, 0.090, 0.530, 0.580, 0.640, 0.880];
const SAT = [0.88, 0.84, 0.80, 0.78, 0.82, 0.74, 0.70];
const VP  = [0.33, 0.62, 0.78, 0.90, 0.97, 1.00];   // light adds
const SP  = [1.00, 0.98, 0.90, 0.76, 0.58, 0.42];   // and desaturates
const SOFT = 0.75, INVS = 1 / (2 * SOFT);
const AD = 0.12, DLO = 1 - AD, DSTEP = 2 * AD / NL, DINV = 15.999 / (2 * AD);

const KIND = new Int32Array(NV), DEG = new Int32Array(NV), ACT = new Int32Array(NV);
const PXa = new Float64Array(NV), PYa = new Float64Array(NV);
const RADa = new Float64Array(NV), RTG = new Float64Array(NV), RPH = new Float64Array(NV);
const AXa = new Float64Array(NV), AYa = new Float64Array(NV);
const AXT = new Float64Array(NV), AYT = new Float64Array(NV);
const RHI = new Float64Array(NV), RHI2 = new Float64Array(NV);
const HX = new Float64Array(NV), HY = new Float64Array(NV);
const NXa = new Float64Array(NV), NYa = new Float64Array(NV);
const ANG = new Float64Array(NV), ROT = new Float64Array(NV);
const CO = new Float64Array(NV), SPD = new Float64Array(NV), HW = new Float64Array(NV);
const TMR = new Float64Array(NV), HDG = new Float64Array(NV);
const DYv = new Float64Array(NV), SY = new Float64Array(NV), ROWACT = new Int32Array(NV);
const FA = new Float64Array(NV), FI = new Int32Array(NV);

const TR = new Float32Array(NM), TG = new Float32Array(NM), TB = new Float32Array(NM);
const CRr = new Float32Array(NM), CGg = new Float32Array(NM), CBb = new Float32Array(NM);
const LUTP = new Int32Array(NM * NL);
const DG = new Float32Array(81), ROWG = new Float32Array(9), LEV = new Int32Array(64);

let dlS = -1, modT = 3, first = true, oxn = 0, oyn = 0;
let PMN = 0, PMX = 0;

function rnd(a, b) { return a + Math.random() * (b - a); }

// how far the panel reaches along a bar's normal
function proj(v) {
  const p1 = 64 * NXa[v], p2 = 64 * NYa[v], p3 = p1 + p2;
  PMN = Math.min(0, p1, p2, p3);
  PMX = Math.max(0, p1, p2, p3);
}

// a bar re-enters on a new heading, width and speed - never the old one
function newBand(v) {
  const th = Math.random() * 6.283185;
  ANG[v] = th; NXa[v] = Math.cos(th); NYa[v] = Math.sin(th);
  ROT[v] = rnd(-0.03, 0.03);
  HW[v] = rnd(4, 11);
  SPD[v] = rnd(3.5, 7.5);
  proj(v);
  CO[v] = PMN - HW[v] - 1.5;
  ACT[v] = 1;
}

function setup() {
  for (let v = 0; v < NV; v++) {
    DEG[v] = (Math.random() * 7) | 0;
    if (v < 2) {
      KIND[v] = v === 0 ? 0 : 2;          // the disc and the rectangle
      PXa[v] = Math.random() * 64; PYa[v] = Math.random() * 64;
      HDG[v] = Math.random() * 6.283185;
      SPD[v] = rnd(3.5, 6.0);
      RTG[v] = rnd(10, 19); RADa[v] = RTG[v];
      RPH[v] = Math.random() * 6.283185;
      AXa[v] = rnd(0.65, 1.35); AYa[v] = rnd(0.65, 1.35);
      AXT[v] = AXa[v]; AYT[v] = AYa[v];
      TMR[v] = rnd(10, 34);
      ACT[v] = 1;
    } else {
      KIND[v] = 1;                        // the three bars
      newBand(v);
      proj(v);
      CO[v] = PMN + Math.random() * (PMX - PMN);
    }
  }
  oxn = Math.random() * 40; oyn = Math.random() * 40;
}

function render(t, dt) {
  // --- the day, arriving slowly -------------------------------------------
  if (dlS < 0) dlS = input.clock.daylight;
  dlS += (input.clock.daylight - dlS) * (1 - Math.exp(-dt / 3));
  const dl = dlS;
  const vs = 0.84 + 0.16 * dl;
  const tempo = 0.8 + 0.4 * dl;
  const bh = 0.02 + 0.025 * noise2(t * 0.006, 3.7) - 0.02 * (1 - dl);

  // --- the voices ----------------------------------------------------------
  for (let v = 0; v < NV; v++) {
    if (KIND[v] === 1) {
      if (ACT[v]) {
        ANG[v] += ROT[v] * dt;
        NXa[v] = Math.cos(ANG[v]); NYa[v] = Math.sin(ANG[v]);
        CO[v] += SPD[v] * dt;
        proj(v);
        if (CO[v] > PMX + HW[v] + 1.5) { ACT[v] = 0; TMR[v] = rnd(1.5, 6); }
      } else {
        TMR[v] -= dt;
        if (TMR[v] <= 0) newBand(v);
      }
      continue;
    }
    const hd = HDG[v] + 1.7 * noise2(t * 0.033, v * 13.1);
    PXa[v] += Math.cos(hd) * SPD[v] * dt;
    PYa[v] += Math.sin(hd) * SPD[v] * dt;
    PXa[v] = ((PXa[v] % 64) + 64) % 64;
    PYa[v] = ((PYa[v] % 64) + 64) % 64;
    RPH[v] += 0.13 * dt;
    TMR[v] -= dt * tempo;
    if (TMR[v] <= 0) {
      if (RTG[v] < 3) { RTG[v] = rnd(10, 19); TMR[v] = rnd(14, 40); }
      // a voice may fall silent - but never both figures at once
      else if (Math.random() < 0.26 && RTG[1 - v] >= 3) { RTG[v] = 0; TMR[v] = rnd(4, 10); }
      else { RTG[v] = rnd(10, 19); TMR[v] = rnd(14, 40); }
      AXT[v] = rnd(0.65, 1.35); AYT[v] = rnd(0.65, 1.35);
    }
    const kr = 1 - Math.exp(-dt / 1.5);
    RADa[v] += (RTG[v] - RADa[v]) * kr;
    AXa[v] += (AXT[v] - AXa[v]) * kr * 0.5;
    AYa[v] += (AYT[v] - AYa[v]) * kr * 0.5;
    const r = RADa[v] * (1 + 0.09 * Math.sin(RPH[v]));
    if (KIND[v] === 0) { RHI[v] = r + SOFT; RHI2[v] = RHI[v] * RHI[v]; }
    else { HX[v] = r * AXa[v]; HY[v] = r * AYa[v]; RHI[v] = HY[v] + SOFT; }
    ACT[v] = r > 1.2 ? 1 : 0;
  }

  // --- voice leading: one voice steps, every region holding it re-chords ---
  modT -= dt * tempo;
  if (modT <= 0) {
    let n = 0;
    for (let v = 0; v < NV; v++) if (ACT[v]) n++;
    if (n > 0) {
      let k = (Math.random() * n) | 0, pick = -1;
      for (let v = 0; v < NV; v++) if (ACT[v]) { if (k === 0) { pick = v; break; } k--; }
      const r = Math.random();
      let step = r < 0.55 ? 1 : (r < 0.80 ? 2 : (r < 0.93 ? 3 : 5));
      if (Math.random() < 0.5) step = 7 - step;
      DEG[pick] = (DEG[pick] + step) % 7;
    }
    modT = rnd(2.2, 5.5);
  }

  // --- the table: thirty-two sets, thirty-two colours ----------------------
  for (let m = 0; m < NM; m++) {
    let d = 0, pc = 0;
    for (let v = 0; v < NV; v++) if (m & (1 << v)) { d += DEG[v]; pc++; }
    d %= 7;
    const val = VP[pc] * vs;
    const c = hsv(bh + HUE[d], SAT[d] * SP[pc], val * val);
    TR[m] = (c >> 16) & 255; TG[m] = (c >> 8) & 255; TB[m] = c & 255;
  }
  const kc = first ? 1 : 1 - Math.exp(-dt / 0.6);
  for (let m = 0; m < NM; m++) {
    CRr[m] += (TR[m] - CRr[m]) * kc;
    CGg[m] += (TG[m] - CGg[m]) * kc;
    CBb[m] += (TB[m] - CBb[m]) * kc;
  }
  for (let m = 0; m < NM; m++) {
    const base = m * NL;
    for (let l = 0; l < NL; l++) {
      const dv = DLO + (l + 0.5) * DSTEP;
      LUTP[base + l] = rgb(CRr[m] * dv, CGg[m] * dv, CBb[m] * dv);
    }
  }

  // --- the sheet is not evenly inked --------------------------------------
  oxn += 0.05 * dt; oyn += 0.032 * dt;
  for (let j = 0; j < 9; j++) {
    for (let i = 0; i < 9; i++) {
      DG[j * 9 + i] = 1 + AD * noise3(i * 0.42 + oxn, j * 0.42 + oyn, t * 0.11);
    }
  }

  // --- one pass: coverage mask -> table ------------------------------------
  for (let y = 0; y < HEIGHT; y++) {
    const gy = y * 0.125;
    let j0 = gy | 0; if (j0 > 7) j0 = 7;
    const fy = gy - j0;
    for (let i = 0; i < 9; i++) {
      const a0 = DG[j0 * 9 + i];
      ROWG[i] = a0 + (DG[(j0 + 1) * 9 + i] - a0) * fy;
    }
    for (let x = 0; x < 64; x++) {
      const gx = x * 0.125, i0 = gx | 0, fx = gx - i0;
      const a0 = ROWG[i0];
      let l = ((a0 + (ROWG[i0 + 1] - a0) * fx - DLO) * DINV) | 0;
      if (l < 0) l = 0; else if (l > 15) l = 15;
      LEV[x] = l;
    }
    for (let v = 0; v < NV; v++) {
      ROWACT[v] = 0;
      if (!ACT[v]) continue;
      if (KIND[v] === 1) { SY[v] = NYa[v] * y - CO[v]; ROWACT[v] = 1; continue; }
      let dy = y - PYa[v]; if (dy > 32) dy -= 64; else if (dy < -32) dy += 64;
      if (dy > RHI[v] || dy < -RHI[v]) continue;
      DYv[v] = KIND[v] === 0 ? dy * dy : (dy < 0 ? -dy : dy) - HY[v];
      ROWACT[v] = 1;
    }
    for (let x = 0; x < 64; x++) {
      let mask = 0, nf = 0;
      for (let v = 0; v < NV; v++) {
        if (!ROWACT[v]) continue;
        let u;
        const kd = KIND[v];
        if (kd === 1) {                                   // a bar
          let s = SY[v] + NXa[v] * x; if (s < 0) s = -s;
          const hi = HW[v] + SOFT;
          if (s >= hi) continue;
          u = (hi - s) * INVS;
        } else {
          let dx = x - PXa[v]; if (dx > 32) dx -= 64; else if (dx < -32) dx += 64;
          if (kd === 0) {                                 // the disc
            const q = dx * dx + DYv[v];
            if (q >= RHI2[v]) continue;
            u = (RHI[v] - Math.sqrt(q)) * INVS;
          } else {                                        // the rectangle
            const ax = (dx < 0 ? -dx : dx) - HX[v];
            const dd = ax > DYv[v] ? ax : DYv[v];
            if (dd >= SOFT) continue;
            u = (SOFT - dd) * INVS;
          }
        }
        if (u >= 1) mask |= (1 << v);
        else { FA[nf] = u * u * (3 - 2 * u); FI[nf] = v; nf++; }
      }
      // interior: one read. edge: fold over the fractional voices only.
      if (nf === 0) { setPixel(x, y, LUTP[(mask << 4) | LEV[x]]); continue; }
      let r = 0, g = 0, b = 0;
      const ns = 1 << nf;
      for (let k = 0; k < ns; k++) {
        let w = 1, m = mask;
        for (let j = 0; j < nf; j++) {
          if (k & (1 << j)) { w *= FA[j]; m |= 1 << FI[j]; }
          else w *= 1 - FA[j];
        }
        r += CRr[m] * w; g += CGg[m] * w; b += CBb[m] * w;
      }
      const dv = DLO + (LEV[x] + 0.5) * DSTEP;
      setPixel(x, y, rgb(r * dv, g * dv, b * dv));
    }
  }
  first = false;
}
