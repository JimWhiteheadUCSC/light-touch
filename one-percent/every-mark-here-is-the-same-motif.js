/*@vfx
id: 62817593-8fdd-4e74-ac69-eebaebc95a6a
title: Every Mark Here Is the Same Motif
created: 2026-10-01
artist: Register
lineage:
  - id: 0cbfaba3-ab31-4045-b5a7-dc0b84341e57
    relation: variation
    note: >-
      Kept its whole argument - a fault that persists as ornament rather than as an
      error is the cheapest strong subject this panel has. Refused the ladder. A
      dropped stitch is one thread in one column; this piece takes the same mistake
      and makes it the width of the cloth, so every part of the sheet carries it and
      the sheet is beautiful because of it.
  - id: e799f618-45fb-4472-a554-2caea45f292d
    relation: variation
    note: >-
      Kept equation-first, the repeat as unit-theory, and the vignette legible only
      because the middle is measured. Refused the sampler plate and the five bands:
      this is one motif and nothing else, and the design space it moves through is
      the number of times the cloth was folded.
  - id: 32e24d91-055c-4a56-ab7f-30571d519549
    relation: contrast
    note: >-
      That kaleidoscope folded the panel into a wedge and mirrored an object chamber
      across twelve radial planes - a perfect mirror every time, which is what a
      kaleidoscope is. This one is not a kaleidoscope. A fold is something a pair of
      hands did to a piece of cloth, it is done wrong, and every copy it makes
      disagrees with its neighbour by exactly as much as it was done wrong.
influences: [mizuki-heitaro, verena-loewensberg]
rationale: |
  There is exactly one mark on this panel, and it is the reason you can check the
  picture.

  It is a rule of oblique lines about five pixels apart - a weave, essentially, or
  the block you would print with. That rule is evaluated in ONE square, sixteen
  pixels on a side, and everything else on the panel is that square reflected and
  repeated. Sixteen copies at one fold; sixty-four at two; with the cloth unfolded,
  one. The number of times the cloth has been folded is the only design variable, and
  it is an integer - so this sheet has three lives rather than a continuum, which is a
  deliberate refusal of the continuous parameter space my last several pieces have
  lived in.

  What makes it a piece and not a diagram is that the fold is WRONG. A fold is a
  thing somebody did with their hands to a piece of cloth, and nobody's hands line up
  twice. The cloth comes out of the stack one layer at a time, and each layer was
  printed through a crease that sat somewhere slightly different, so the deeper the
  fold the further its copy has slid from the shallowest one. That is why colour here
  is dealt by FOLD DEPTH: two regions either side of a crease are neighbours in hue
  because they are neighbours in depth, and where two copies of the same point on the
  cloth disagree you can see the disagreement because they are not the same colour.

  Sometimes the error closes - a good fold, held for a few seconds - and the sheet
  goes momentarily true: the zigzags close up into perfect chevrons and the creases
  stop showing. That interval is the best thing on the panel and it lasts about a
  tenth of the time, which is the right proportion for a thing nobody can arrange on
  purpose.

  It reads the room the way cloth does. Overcast the sheet lies flatter and the folds
  come out truer; rain slackens the cloth and the misregistration grows. The clock
  sets the exposure and, after dark, collapses the five notes of the chord into one
  blue-violet family. A knock, or a beat, asks for a re-fold: the sheet visibly shears
  while the cloth is not yet down, and the new fold count arrives at the moment the
  slip is largest, when nothing was legible anyway. Sound is an occasion and never a
  meter. With nothing attached the block still turns, the impression still drifts out
  of depth, and the folds still come out wrong.

  Sides taken. With Heitaro: equation-first, made for use, and this is the oldest
  printing trick there is - fold the cloth, dip it, open it, and the design is
  something nobody laid down. Against The Object Chamber, which is the same geometry
  done perfectly. With Loewensberg: the chord dealt by a measurement, and a paused
  frame is a composed sheet whose only straight lines are the two selvedges down its
  left and right edges, and a crease diagram in the bottom-left corner.

  And on the standing argument about what geometry is about: this is the tenth
  reading of measurement, and the first in which the instrument is known to be broken.
  Everything else I have drawn claimed a clean relation between a number and a mark.
  This one admits that the mark was made by pressing something against cloth, that the
  pressing moved, and that the movement is in every copy. Geometry is a claim about a
  thing nobody can see; the honest version of that claim is that whoever made it was
  in a hurry.
@vfx*/

const meta = { name: "every_mark_here_is_the_same_motif", fps: 30, inputs: ["clock", "env", "audio", "button"] };

const P = 32;
const PINV = 1 / 5.2;
const ND = 5;
const ORD_H = [0.098, 0.062, 0.030, 0.578, 0.548];
const ORD_S = [0.80, 0.78, 0.74, 0.52, 0.46];
const ORD_V = [0.92, 0.86, 0.90, 0.84, 0.78];

const MAXM = new Float32Array(4096);
const MINM = new Float32Array(4096);
const ANG = new Float32Array(4096);
const GRN = new Float32Array(4096);
const FX = new Float32Array(64);
const FD = new Int32Array(64);
const FS = new Float32Array(64);
const FY = new Float32Array(64);
const FN = new Int32Array(64);
const FSV = new Float32Array(64);
const INL = new Uint8Array(65);
const IG = new Float32Array(15);
const II = new Float32Array(15);
const CR = new Float32Array(4096);
const CG = new Float32Array(4096);
const CB = new Float32Array(4096);

let m = 1;
let mT = 1;
let eT = 4;
let eTg = 1.2;
let eHold = 0;
let eaT = 0.7;
let ERR = 0.5;
let EA = 0.7;
let ang = 0.8;
let foldT = 14;
let slipping = 0;
let slipT = 0;
let slipAmp = 0;
let slip = 0;
let cool = 0;
let lastNight = -1;
let expo = 1;
let seamVis = 0;

function pickFold() {
  const r = Math.random();
  if (r < 0.17) return 0;
  if (r < 0.62) return 1;
  return 2;
}

function setup() {
  for (let i = 0; i <= 64; i++) {
    const u = i / 64;
    INL[i] = ((1 - smoothstep(0.05, 0.62, u)) * 255) | 0;
  }
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const i = (y << 6) + x;
      const ax = Math.abs(x - 31.5);
      const ay = Math.abs(y - 31.5);
      MAXM[i] = ax > ay ? ax : ay;
      MINM[i] = ax < ay ? ax : ay;
      ANG[i] = Math.atan2(ay, ax);
      GRN[i] = 0.90 + 0.20 * noise2(x * 0.29, y * 0.29);
    }
  }
  m = pickFold();
  mT = m;
}

function axis(dstW, dstD, dstS, off, mm, err) {
  for (let i = 0; i < 64; i++) {
    const p = i + off;
    let u = p - Math.floor(p / P) * P;
    let sz = P;
    let d = 0;
    for (let j = 0; j < mm; j++) {
      const h = sz >> 1;
      if (u >= h) { u = sz - 1 - u; d++; }
      sz = h;
    }
    dstW[i] = u + d * err;
    dstD[i] = d;
    let sm = 0;
    for (let j = 0; j < mm; j++) {
      const pj = P >> j;
      let dd = p - ((pj >> 1) - 0.5);
      dd = dd - Math.floor(dd / pj) * pj;
      if (dd > pj * 0.5) dd -= pj;
      const a = dd < 0 ? -dd : dd;
      const w = (1 - smoothstep(0.0, 1.45, a)) / (j + 1);
      if (w > sm) sm = w;
    }
    dstS[i] = sm;
  }
}

function render(t, dt) {
  const s = clamp(dt, 0.001, 0.1);
  const cl = input.clock;
  const ev = input.env;
  const au = input.audio;
  const day = clamp(cl.daylight, 0, 1);
  const ok = ev.ok;
  const cloud = ok ? clamp(ev.cloud, 0, 1) : 0.30;
  const rain = ok ? clamp(ev.rain, 0, 1) : 0.12;
  const tempN = ok ? clamp((ev.tempC - 14) / 20, -1, 1) : 0;
  expo = (0.70 + 0.26 * day) * (1 - 0.12 * cloud);
  const night = day < 0.35 ? 1 : 0;
  const bank = tempN * 0.013 + (1 - day) * 0.005;
  const calm = 1 - 0.55 * cloud;
  const slack = 1 + 0.45 * rain;

  const slx = t * 0.95 + 2.4 * Math.sin(t * 0.041) + 1.2 * Math.sin(t * 0.017 + 1.9);
  const sly = t * 0.30 + 1.9 * Math.sin(t * 0.029 + 0.7) + 0.9 * Math.sin(t * 0.053);

  eT -= s;
  if (eT <= 0 && eHold <= 0) {
    eT = 15 + Math.random() * 21;
    if (Math.random() < 0.30) {
      eTg = 0.04;
      eHold = 7 + Math.random() * 10;
    } else {
      eTg = (0.45 + 1.70 * Math.random()) * calm * slack;
    }
    eaT = Math.random() * 6.28318;
  }
  if (eHold > 0) {
    eHold -= s;
    if (eHold <= 0) eT = 2 + Math.random() * 4;
  }
  ERR += (eTg - ERR) * (1 - Math.exp(-s / 3.4));
  EA += (eaT - EA) * (1 - Math.exp(-s / 4.5));
  if (eHold > 0) ERR *= 0.86;
  const errMag = ERR;
  seamVis = smoothstep(0.10, 0.85, errMag);
  const EX = errMag * Math.cos(EA);
  const EY = errMag * Math.sin(EA);

  ang += (0.021 + 0.006 * Math.sin(t * 0.013)) * s;

  cool = Math.max(0, cool - s);
  const fired = input.button.pressed || (au.ok && au.beat);
  if (!slipping && (fired && cool <= 0)) {
    slipping = 1; slipT = 0; slipAmp = 5 + Math.random() * 4;
    mT = pickFold(); cool = 20; foldT = 30;
  }
  if (!slipping) {
    foldT -= s;
    if (foldT <= 0) {
      slipping = 1; slipT = 0; slipAmp = 5 + Math.random() * 4; mT = pickFold();
    }
  } else {
    slipT += s;
    const p = slipT / 1.6;
    if (p >= 1) {
      slipping = 0; slip = 0; foldT = 22 + Math.random() * 20;
    } else {
      slip = slipAmp * Math.sin(Math.PI * p);
      if (p >= 0.5 && m !== mT) m = mT;
    }
  }

  axis(FX, FD, FS, slip * 0.5, m, EX);
  axis(FY, FN, FSV, slip * 0.225, m, EY);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);

  if (lastNight !== night) {
    for (let k = 0; k < ND; k++) {
      const h = night ? 0.586 + 0.014 * k : ORD_H[k] + bank;
      const v = (night ? 0.82 : ORD_V[k]) * expo;
      const ic = hsv(h, ORD_S[k], v * v);
      II[k * 3] = (ic >> 16) & 255;
      II[k * 3 + 1] = (ic >> 8) & 255;
      II[k * 3 + 2] = ic & 255;
      const gv = (0.105 + 0.034 * (k & 1)) * expo;
      const gc = hsv(h, ORD_S[k] * 0.62, gv * gv);
      IG[k * 3] = (gc >> 16) & 255;
      IG[k * 3 + 1] = (gc >> 8) & 255;
      IG[k * 3 + 2] = gc & 255;
    }
    lastNight = night;
  }

  const fcl = 1 - 0.18 * cloud;

  for (let y = 0; y < 64; y++) {
    const wy = FY[y] + sly;
    const dy2 = FN[y];
    const sy2 = FSV[y];
    const row = y << 6;
    const lightRow = 0.84 + 0.26 * (0.5 + 0.5 * Math.sin((y + t * 2.6) * 0.075));
    for (let x = 0; x < 64; x++) {
      const i = row + x;
      const d = FD[x] + dy2;
      const wx = FX[x] + slx + d * EX;
      const yy = wy + d * EY;
      const n = wx * ca + yy * sa;
      let ph = n * PINV;
      ph -= Math.floor(ph);
      const dd = (ph < 0.5 ? ph : 1 - ph) * 2;
      const ink = INL[(dd * 64) | 0] * 0.00392157;
      const k3 = d * 3;
      const g = lightRow * GRN[i];
      let r = IG[k3] * g;
      let gg = IG[k3 + 1] * g;
      let b = IG[k3 + 2] * g;
      if (ink > 0.004) {
        r += (II[k3] - r) * ink;
        gg += (II[k3 + 1] - gg) * ink;
        b += (II[k3 + 2] - b) * ink;
      }
      const sm = (FS[x] + sy2) * seamVis * (1 - 0.45 * ink);
      if (sm > 0.01) {
        const q = sm * 0.55 * expo;
        r += II[k3] * q;
        gg += II[k3 + 1] * q;
        b += II[k3 + 2] * q;
      }
      const mx = MAXM[i];
      if (mx > 28.4 && MINM[i] < 26) {
        const a = 1 - smoothstep(0.35, 1.20, Math.abs(mx - 30.4));
        if (a > 0.01) {
          const w = a * (0.26 + 0.16 * day) * fcl;
          r += 150 * w; gg += 132 * w; b += 104 * w;
          let da = Math.abs(ANG[i] - ang);
          if (da > 1.5707963) da = 3.1415926 - da;
          const tick = (1 - smoothstep(0.016, 0.040, da)) * a;
          r += 200 * tick * fcl; gg += 150 * tick * fcl; b += 96 * tick * fcl;
        }
      }
      CR[i] = r; CG[i] = gg; CB[i] = b;
    }
  }

  const selv = hsv(night ? 0.586 : 0.098 + bank, 0.62, (night ? 0.60 : 0.56) * expo);
  const sr = (selv >> 16) & 255;
  const sg = (selv >> 8) & 255;
  const sb = selv & 255;
  for (let y = 0; y < 64; y++) {
    const row = y << 6;
    const wob = 0.86 + 0.14 * Math.sin(y * 1.9);
    const cut = ((y & 3) === 0) ? 0.62 : ((y & 3) === 2 ? 0.16 : 0.05);
    const j1 = row + 1;
    const j2 = row + 61;
    const j3 = row + 62;
    CR[j1] = sr * 0.70 * wob; CG[j1] = sg * 0.70 * wob; CB[j1] = sb * 0.70 * wob;
    CR[j2] = sr * cut; CG[j2] = sg * cut; CB[j2] = sb * cut;
    CR[j3] = sr * cut * 0.9; CG[j3] = sg * cut * 0.9; CB[j3] = sb * cut * 0.9;
  }

  const px0 = 4;
  const py0 = 48;
  const pw = 15;
  const phh = 11;
  for (let y = py0 - 1; y <= py0 + phh; y++) {
    if (y < 1 || y > 62) continue;
    const row = y << 6;
    for (let x = px0 - 1; x <= px0 + pw; x++) {
      if (x < 1 || x > 62) continue;
      CR[row + x] *= 0.16;
      CG[row + x] *= 0.16;
      CB[row + x] *= 0.16;
    }
  }
  const bone = hsv(0.100, 0.18, 0.58 * expo);
  const br = (bone >> 16) & 255;
  const bg = (bone >> 8) & 255;
  const bb = bone & 255;
  for (let x = px0; x < px0 + pw; x++) {
    for (let q = 0; q < 2; q++) {
      const yy = q === 0 ? py0 : py0 + phh;
      const j = (yy << 6) + x;
      CR[j] = br; CG[j] = bg; CB[j] = bb;
    }
  }
  for (let y = py0; y <= py0 + phh; y++) {
    for (let q = 0; q < 2; q++) {
      const xx = q === 0 ? px0 : px0 + pw - 1;
      const j = (y << 6) + xx;
      CR[j] = br; CG[j] = bg; CB[j] = bb;
    }
  }
  if (m >= 1) {
    const c0 = II[9]; const c1 = II[10]; const c2 = II[11];
    const ix = (px0 + Math.round(0.5 * (pw - 1)) + errMag * 1.2) | 0;
    for (let y = py0 + 1; y < py0 + phh; y++) {
      const j = (y << 6) + ix;
      CR[j] = c0; CG[j] = c1; CB[j] = c2;
    }
  }
  if (m >= 2) {
    const c0 = II[12]; const c1 = II[13]; const c2 = II[14];
    for (let q = 0; q < 2; q++) {
      const fr = q === 0 ? 0.25 : 0.75;
      const ix = (px0 + Math.round(fr * (pw - 1)) + errMag * 1.6) | 0;
      for (let y = py0 + 1; y < py0 + phh; y++) {
        const j = (y << 6) + ix;
        CR[j] = c0; CG[j] = c1; CB[j] = c2;
      }
    }
  }
  const mc = hsv(0.985 + bank, 0.80, 0.84 * expo);
  const m0 = (mc >> 16) & 255;
  const m1 = (mc >> 8) & 255;
  const m2 = mc & 255;
  const len = 1 + Math.round(errMag * 5);
  for (let x = px0; x < px0 + len && x < px0 + pw; x++) {
    const j = ((py0 + phh + 3) << 6) + x;
    CR[j] = m0; CG[j] = m1; CB[j] = m2;
  }

  for (let i = 0; i < 4096; i++) {
    let r = CR[i], g = CG[i], b = CB[i];
    r = r < 0 ? 0 : (r > 255 ? 255 : r);
    g = g < 0 ? 0 : (g > 255 ? 255 : g);
    b = b < 0 ? 0 : (b > 255 ? 255 : b);
    setPixel(i & 63, i >> 6, ((r | 0) << 16) | ((g | 0) << 8) | (b | 0));
  }
}
