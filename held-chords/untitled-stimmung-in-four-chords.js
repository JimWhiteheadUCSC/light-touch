/*@vfx
id: 5c51a9b6-dfa2-4dc2-ac31-a502d3c1f9fe
title: Untitled (Stimmung in Four Chords)
created: 2026-10-10
artist: Chusen (apprentice name)
lineage:
  - id: 499066a2-9abe-4791-b24e-2db2ce68c5ac
    relation: contrast
    note: Rejects the scrolling textile bolt and wallpaper lattice of Kyoto Bolt in favor of Verena Loewensberg's primary office—the singular, poised concrete composition undergoing slow polyphonic modulation.
  - id: 35feb5ba-985f-4f64-8dfb-13f3bec71b08
    relation: contrast
    note: Replaces amorphous continuous plasma fields with lawful geometric primitives (slabs, discs, bars) defined by signed distance functions and exact overlap logic.
influences:
  - verena-loewensberg
rationale: |
  Verena Loewensberg was the Zurich Concretists' quiet dissident: she
  trained in dance under Trudi Schoop, ran Zurich's experimental jazz
  record store City-Discount, and coined 'Stimmung' to describe the tuned
  mood that arises when pure geometric forms share a canvas. Where her male
  peers sought rigid mathematical demonstration, she sought asymmetric
  poise and color chords that hold tension in stillness.

  This piece brings Loewensberg's office into temporal motion as an adagio
  progression. Four geometric dancers—a monolithic structural slab, an
  orbiting solar disc, a narrow counterweight bar, and a chalk punctum—move
  across four incommensurate periodic phrases (23.3s, 18.7s, 14.3s, and 9.1s)
  warped by slow simplex drift. Each dancer moves between poise and transit:
  holding a composed, asymmetric chord for 70% of its phrase, then modulating
  to its next post in a smooth quintic cadence. Because their periods are
  pairwise coprime and drift on long noise wavelengths, the choreography never
  settles into a closed repeat.

  Crucially, where the slab and disc intersect, their colors do not blend
  transparently; following Loewensberg's overlap logic, the intersection
  produces a third, independently tuned hue—a rich Venetian plum that warms
  with the room's bass energy. The entire palette re-chords across the day via
  the clock input: cool nocturnal slate and deep madder under moonlight soften
  into warm museum linen and terracotta at midday. Pause any frame, and the
  canvas passes her freeze-frame test: poised, proportioned, silent.
@vfx*/

const meta = { name: "untitled_stimmung", fps: 30, inputs: ["clock", "audio"] };

// --- frame state & cache ----------------------------------------------------

let __cacheT = null;
let G_ax = 0, G_ay = 0, G_ahw = 0, G_ahh = 0;
let G_dx = 0, G_dy = 0, G_dr = 0;
let G_bx = 0, G_by = 0, G_bhw = 0, G_bhh = 0;
let G_cx = 0, G_cy = 0, G_cs = 0;

const G_cGround = [0, 0, 0];
const G_cAnchor = [0, 0, 0];
const G_cDisc   = [0, 0, 0];
const G_cPlum   = [0, 0, 0];
const G_cBar    = [0, 0, 0];
const G_cAccent = [0, 0, 0];

// Inlined signed distance functions (no Math.hypot/Math.max overhead)
function sdBox(x, y, cx, cy, hw, hh) {
  const dx = Math.abs(x - cx) - hw;
  const dy = Math.abs(y - cy) - hh;
  const qx = dx > 0 ? dx : 0;
  const qy = dy > 0 ? dy : 0;
  const inD = dx > dy ? dx : dy;
  return Math.sqrt(qx * qx + qy * qy) + (inD < 0 ? inD : 0);
}

function sdCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy) - r;
}

// 1.0 px filter width anti-aliased edge (-0.5 to +0.5 distance)
function edge(d) {
  const x = 0.5 - d;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

// Polyphonic step calculator: 68% poise hold, 32% smooth quintic transition
function getStep(tVal, period, numSteps) {
  const p = (((tVal % period) + period) % period) / period;
  const rawIdx = p * numSteps;
  const idx = Math.floor(rawIdx);
  const frac = rawIdx - idx;
  let u = 0;
  if (frac > 0.68) {
    const rawU = (frac - 0.68) / 0.32;
    u = rawU * rawU * rawU * (rawU * (rawU * 6 - 15) + 10);
  }
  const cur = ((idx % numSteps) + numSteps) % numSteps;
  const nxt = (cur + 1) % numSteps;
  return { idx: cur, nextIdx: nxt, u };
}

// Fixed poised geometric postures for each voice
const ANCHOR_STATES = [
  [24, 38, 15, 20],  // Left monolithic pillar
  [40, 42, 18, 16],  // Bottom-right structural base
  [32, 26, 20, 14],  // Suspended upper horizontal slab
  [20, 30, 14, 18],  // Mid-left block
];

const DISC_STATES = [
  [44, 22, 13.5],    // Top-right solar companion
  [20, 20, 11.5],    // Upper-left corner sphere
  [22, 44, 14.0],    // Lower-left counterpoint
  [46, 40, 12.5],    // Lower-right orbit
  [32, 34, 15.0],    // Central solar eclipse
];

const BAR_STATES = [
  [48, 50, 11, 4],   // Bottom-right horizontal bar
  [36, 12, 14, 3.5], // Top horizontal lintel
  [52, 28, 4, 12],   // Right vertical column
  [12, 46, 8, 4],    // Bottom-left horizontal counterweight
  [14, 24, 3.5, 14], // Left vertical stile
  [44, 46, 12, 4],   // Lower horizontal strut
];

const ACCENT_STATES = [
  [14, 14, 4.5],     // Upper-left punctum
  [52, 54, 4.0],     // Lower-right punctum
  [54, 14, 4.5],     // Upper-right punctum
  [14, 52, 4.0],     // Lower-left punctum
  [32, 54, 5.0],     // Central bottom punctum
];

function __updateFrame(t) {
  const daylight = (typeof input !== "undefined" && input.clock) ? input.clock.daylight : 0.5;

  // Slow simplex phase warping prevents exact periodicity over minutes
  const tA = t + noise2(t * 0.007, 1.1) * 3.5;
  const tD = t + noise2(t * 0.009, 3.3) * 3.5;
  const tB = t + noise2(t * 0.011, 5.5) * 3.5;
  const tC = t + noise2(t * 0.013, 7.7) * 3.5;

  // Voice 1: Anchor Slab (period 23.3s, 4 states)
  const sA = getStep(tA, 23.3, 4);
  const a0 = ANCHOR_STATES[sA.idx], a1 = ANCHOR_STATES[sA.nextIdx];
  G_ax = lerp(a0[0], a1[0], sA.u);
  G_ay = lerp(a0[1], a1[1], sA.u);
  G_ahw = lerp(a0[2], a1[2], sA.u);
  G_ahh = lerp(a0[3], a1[3], sA.u);

  // Voice 2: Solar Disc (period 18.7s, 5 states)
  const sD = getStep(tD, 18.7, 5);
  const d0 = DISC_STATES[sD.idx], d1 = DISC_STATES[sD.nextIdx];
  G_dx = lerp(d0[0], d1[0], sD.u);
  G_dy = lerp(d0[1], d1[1], sD.u);
  G_dr = lerp(d0[2], d1[2], sD.u);

  // Voice 3: Counterweight Bar (period 14.3s, 6 states)
  const sB = getStep(tB, 14.3, 6);
  const b0 = BAR_STATES[sB.idx], b1 = BAR_STATES[sB.nextIdx];
  G_bx = lerp(b0[0], b1[0], sB.u);
  G_by = lerp(b0[1], b1[1], sB.u);
  G_bhw = lerp(b0[2], b1[2], sB.u);
  G_bhh = lerp(b0[3], b1[3], sB.u);

  // Voice 4: Accent Punctum (period 9.1s, 5 states)
  const sC = getStep(tC, 9.1, 5);
  const c0 = ACCENT_STATES[sC.idx], c1 = ACCENT_STATES[sC.nextIdx];
  G_cx = lerp(c0[0], c1[0], sC.u);
  G_cy = lerp(c0[1], c1[1], sC.u);
  G_cs = lerp(c0[2], c1[2], sC.u);

  // Audio reactivity: bass gently expands solar disc & accent
  const bass = (typeof input !== "undefined" && input.audio && input.audio.ok) ? input.audio.bass : 0;
  const audioLevel = (typeof input !== "undefined" && input.audio && input.audio.ok) ? input.audio.level : 0;
  G_dr += bass * 0.9;
  G_cs += audioLevel * 0.5;

  // Palette: Re-chorded along the daylight axis (nocturnal to midday)
  // Ground: deep nocturnal slate taupe -> warm museum linen taupe
  G_cGround[0] = lerp(26, 48, daylight);
  G_cGround[1] = lerp(26, 44, daylight);
  G_cGround[2] = lerp(28, 40, daylight);

  // Anchor: nocturnal dark slate -> deep ultramarine
  G_cAnchor[0] = lerp(24, 38, daylight);
  G_cAnchor[1] = lerp(44, 64, daylight);
  G_cAnchor[2] = lerp(86, 118, daylight);

  // Disc: glowing ember amber -> radiant ochre
  G_cDisc[0] = lerp(185, 218, daylight);
  G_cDisc[1] = lerp(118, 152, daylight);
  G_cDisc[2] = lerp(34, 48, daylight);

  // Overlap (Plum / Madder): deep violet plum -> Venetian terracotta
  G_cPlum[0] = lerp(115, 146, daylight) + bass * 18;
  G_cPlum[1] = lerp(36, 52, daylight);
  G_cPlum[2] = lerp(52, 64, daylight);

  // Bar: cadmium vermilion / persimmon
  G_cBar[0] = lerp(188, 224, daylight);
  G_cBar[1] = lerp(42, 56, daylight);
  G_cBar[2] = lerp(28, 36, daylight);

  // Accent: chalk ivory
  G_cAccent[0] = lerp(220, 244, daylight);
  G_cAccent[1] = lerp(215, 240, daylight);
  G_cAccent[2] = lerp(205, 230, daylight);

  __cacheT = t;
}

function pixel(x, y, t) {
  if (t !== __cacheT) {
    __updateFrame(t);
  }

  const distA = sdBox(x, y, G_ax, G_ay, G_ahw, G_ahh);
  const distD = sdCircle(x, y, G_dx, G_dy, G_dr);
  const distB = sdBox(x, y, G_bx, G_by, G_bhw, G_bhh);
  const distC = sdBox(x, y, G_cx, G_cy, G_cs, G_cs);

  const mA = edge(distA);
  const mD = edge(distD);
  const mB = edge(distB);
  const mC = edge(distC);

  const mAD = Math.min(mA, mD);

  let r = G_cGround[0];
  let g = G_cGround[1];
  let b = G_cGround[2];

  // Layer Anchor
  if (mA > 0) {
    r = lerp(r, G_cAnchor[0], mA);
    g = lerp(g, G_cAnchor[1], mA);
    b = lerp(b, G_cAnchor[2], mA);
  }

  // Layer Disc
  if (mD > 0) {
    r = lerp(r, G_cDisc[0], mD);
    g = lerp(g, G_cDisc[1], mD);
    b = lerp(b, G_cDisc[2], mD);
  }

  // Layer Intersection: Overlap Logic
  if (mAD > 0) {
    r = lerp(r, G_cPlum[0], mAD);
    g = lerp(g, G_cPlum[1], mAD);
    b = lerp(b, G_cPlum[2], mAD);
  }

  // Layer Bar
  if (mB > 0) {
    r = lerp(r, G_cBar[0], mB);
    g = lerp(g, G_cBar[1], mB);
    b = lerp(b, G_cBar[2], mB);
  }

  // Layer Accent
  if (mC > 0) {
    r = lerp(r, G_cAccent[0], mC);
    g = lerp(g, G_cAccent[1], mC);
    b = lerp(b, G_cAccent[2], mC);
  }

  return rgb(r | 0, g | 0, b | 0);
}
