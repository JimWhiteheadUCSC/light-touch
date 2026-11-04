/*@vfx
id: 77f3ec77-8fb0-4d75-bdbc-e08b8a374ddc
title: The Agreement Has Edges
created: 2026-09-29
artist: Register
lineage:
  - id: 62b3ae77-ba7f-4d4d-a405-5a59ddf56974
    relation: contrast
    note: >
      kept the claim that the figure is in the disagreement between periodic
      systems; refused the square-dot halftone screens and the multiplicative
      model. Here the systems are continuous harmonic gratings, not discrete
      dots, and the disagreement is a coverage set, not a beat pattern.
  - id: 3163f6d0-3041-4d28-9ef2-daa6fa4ad21b
    relation: variation
    note: >
      kept the coverage-set table and the dark-ground sparse-visible logic;
      refused the scalar noise fields and soft organic bodies. Here the voices
      are periodic, sharp-edged, and geometric.
  - id: 2d1d4728-3d2b-4c92-90ed-6201c2fbc514
    relation: variation
    note: >
      kept the overlapping-primitives coverage set as the central instrument;
      refused the placed geometric primitives. Here the primitives are infinite
      periodic half-planes, drifting.
influences: [verena-loewensberg, okazz]
rationale: |
  Three periodic systems run at different angles, frequencies, and harmonic
  signatures. Where each system says YES, it adds its voice to the pixel. Where
  they all say NO, the warm dark ground shows through. The picture is the set of
  agreements and disagreements between three independent rhythms.

  The systems are not simple sines — each carries its own 2nd and 3rd partials at
  different amplitudes, so their wavefronts have different shapes: one
  sharp-crested, one flat-topped, one gently curved. When these differently-shaped
  boundaries cross, they produce edges that belong to no single system. The
  register is imperfect not by error but by design: three different periodic laws
  asked the same question at every pixel, and the answers don't match.

  The colour is Register's coverage-set table: single voice = pale neighbour,
  two voices = saturated body, three = bright accent. The chord offices (warm,
  cool, rose) step on uneven timers, so the whole picture re-chords
  asynchronously while the geometry continues its slow drift.

  A state-change kick snaps one or two gratings to new angles and frequencies
  every 7–33 seconds, eased with a soft ease-in-out curve. Between kicks the
  picture is pure drift — the boundaries migrate, thicken, and thin as the
  relative phases turn. At night the tempo falls and the ground cools; by day
  it brightens and quickens.

  Each grating is evaluated per pixel as a harmonic series with slow-drifting
  relative phase, so no grating ever exactly repeats its tiling across the
  frame. The edge is the agreement.

  Sides taken. With Loewensberg on the chord of neighbours as structural fact
  and the freeze-frame. With Okazz on tempo — snap, then long drift. Against
  the soft organic register of Where the Agreement Lives: here the bodies are
  polygons born from three straightedges colliding, not clouds. On the standing
  argument: geometry is register — the visible evidence of three laws being
  applied to the same place at the same time, and disagreeing.
@vfx*/

const meta = { name: "the_agreement_has_edges", fps: 30, inputs: ["clock"] };

const HUE = [0.018, 0.072, 0.125, 0.515, 0.575, 0.640, 0.88];
const SAT = [0.90, 0.86, 0.83, 0.82, 0.84, 0.78, 0.82];

const PR = new Float32Array(8), PG = new Float32Array(8), PB = new Float32Array(8);
let lastSpec = [-1, -1, -1, -1];

function rebuild(dl, d0, d1, d2) {
  const gr = (18 + 10 * dl) | 0;
  const gg = (14 + 8 * dl) | 0;
  const gb = (22 + 12 * dl) | 0;
  PR[0] = gr; PG[0] = gg; PB[0] = gb;
  const masks = [1, 2, 4, 3, 5, 6, 7];
  const base = [d0, d1, d2];
  for (let k = 0; k < 7; k++) {
    const m = masks[k];
    let d = 0, cnt = 0;
    for (let i = 0; i < 3; i++) if (m & (1 << i)) { d += base[i]; cnt++; }
    d = ((d % 7) + 7) % 7;
    const v = (cnt === 1 ? 0.20 : cnt === 2 ? 0.60 : 0.92) * (0.80 + 0.24 * dl);
    const c = hsv(HUE[d], SAT[d], v * v);
    PR[m] = (c >> 16) & 255;
    PG[m] = (c >> 8) & 255;
    PB[m] = c & 255;
  }
}

let tA = [0.15, 1.82, -0.35];
let cA = [0.15, 1.82, -0.35];
let tF = [0.12, 0.175, 0.145];
let cF = [0.12, 0.175, 0.145];
let ph = [0.0, 2.8, 5.5];
let spd = [0.45, -0.62, 0.52];
let d0 = 0, d1 = 3, d2 = 5;
let kickT = 0, kickD = 8, chordT = 0;

const H2 = [0.30, 0.24, 0.32];
const H3 = [0.14, 0.11, 0.16];
let hPh = [0.0, 1.3, 2.7];
let hSp = [0.08, -0.12, 0.15];

function render(t, dt) {
  const step = clamp(dt, 0.001, 0.1);
  const dl = clamp(input.clock.daylight, 0, 1);
  const tempo = 0.80 + 0.52 * dl;

  chordT += step;
  if (chordT > 32 + Math.sin(t * 0.06) * 18) {
    chordT = 0;
    const mv = Math.random();
    if (mv < 0.38) d0 = (d0 + 1 + (Math.random() * 2 | 0)) % 7;
    else if (mv < 0.68) d1 = (d1 + 1 + (Math.random() * 2 | 0)) % 7;
    else d2 = (d2 + 1 + (Math.random() * 2 | 0)) % 7;
  }

  kickT += step * tempo;
  if (kickT > kickD) {
    kickT = 0;
    kickD = 7 + Math.random() * 26;
    const w = Math.random() * 3 | 0;
    tA[w] = -0.45 + Math.random() * 3.0;
    tF[w] = 0.08 + Math.random() * 0.18;
    if (Math.random() < 0.40) {
      const w2 = (w + 1 + (Math.random() * 2 | 0)) % 3;
      tA[w2] = -0.45 + Math.random() * 3.0;
      tF[w2] = 0.08 + Math.random() * 0.18;
    }
  }

  const eRate = 1 - Math.exp(-step * 0.50);
  for (let i = 0; i < 3; i++) {
    cA[i] += (tA[i] - cA[i]) * eRate;
    cF[i] += (tF[i] - cF[i]) * eRate;
    ph[i] += spd[i] * step * tempo;
    hPh[i] += hSp[i] * step * tempo;
  }

  if (d0 !== lastSpec[0] || d1 !== lastSpec[1] || d2 !== lastSpec[2] || Math.abs(dl - lastSpec[3]) > 0.02) {
    rebuild(dl, d0, d1, d2);
    lastSpec = [d0, d1, d2, dl];
  }

  const sa = new Float32Array(3);
  const ck = new Float32Array(3), sk = new Float32Array(3);
  const hC = new Float32Array(3), hC3 = new Float32Array(3);
  for (let i = 0; i < 3; i++) {
    sa[i] = Math.sin(cA[i]) * cF[i];
    const ks = Math.cos(cA[i]) * cF[i];
    ck[i] = Math.cos(ks);
    sk[i] = Math.sin(ks);
    hC[i] = Math.cos(hPh[i]);
    hC3[i] = Math.cos(hPh[i] * 0.7);
  }

  const h20 = H2[0] * 2 * hC[0], h30 = H3[0] * hC3[0];
  const h21 = H2[1] * 2 * hC[1], h31 = H3[1] * hC3[1];
  const h22 = H2[2] * 2 * hC[2], h32 = H3[2] * hC3[2];

  for (let y = 0; y < 64; y++) {
    let s0 = Math.sin(ph[0] + y * sa[0]);
    let c0 = Math.cos(ph[0] + y * sa[0]);
    let s1 = Math.sin(ph[1] + y * sa[1]);
    let c1 = Math.cos(ph[1] + y * sa[1]);
    let s2 = Math.sin(ph[2] + y * sa[2]);
    let c2 = Math.cos(ph[2] + y * sa[2]);

    for (let x = 0; x < 64; x++) {
      let v0 = s0 + h20 * s0 * c0 + h30 * (3 * s0 - 4 * s0 * s0 * s0);
      let v1 = s1 + h21 * s1 * c1 + h31 * (3 * s1 - 4 * s1 * s1 * s1);
      let v2 = s2 + h22 * s2 * c2 + h32 * (3 * s2 - 4 * s2 * s2 * s2);
      let mask = (v0 > 0 ? 1 : 0) | (v1 > 0 ? 2 : 0) | (v2 > 0 ? 4 : 0);
      setPixel(x, y, rgb(PR[mask] | 0, PG[mask] | 0, PB[mask] | 0));

      let ns0 = s0 * ck[0] + c0 * sk[0];
      c0 = c0 * ck[0] - s0 * sk[0];
      s0 = ns0;
      let ns1 = s1 * ck[1] + c1 * sk[1];
      c1 = c1 * ck[1] - s1 * sk[1];
      s1 = ns1;
      let ns2 = s2 * ck[2] + c2 * sk[2];
      c2 = c2 * ck[2] - s2 * sk[2];
      s2 = ns2;
    }
  }
}
