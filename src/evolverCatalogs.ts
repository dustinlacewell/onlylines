// Evolver catalogs - separated to avoid circular dependencies
import { rand, pick } from './random';
import { Distributions } from './distributions/index';

// Import evolver creators
import * as Position from './evolvers/position';
import * as Num from './evolvers/number';
import * as ColorAnim from './evolvers/colorAnimations';
import { palettes, type Palette, type PaletteName } from './evolvers/palettes';
import type { PositionEvolver, ColorEvolver, NumberEvolver, DashEvolver } from './evolvers/types';
import * as Dash from './evolvers/dash';
import * as DashComposed from './evolvers/dashComposed';

// === EVOLVER CATALOGS ===
// These are exported so the debug UI and serialization can enumerate them

export interface EvolverEntry<T> {
  name: string;
  create: () => T;
}

// Palette entry - just references the palette by name
export interface PaletteEntry {
  name: string;
  palette: Palette;
}

// Color animation entry - creates evolver given a palette
export interface ColorAnimationEntry {
  name: string;
  create: (palette: Palette) => ColorEvolver;
}

// Position evolvers catalog
export const positionEvolvers: EvolverEntry<PositionEvolver>[] = [
  // Basic
  { name: 'rotate', create: () => Position.rotate(rand(0.03, 0.15)) },
  { name: 'rotateBreathing', create: () => Position.rotateBreathing(rand(0.05, 0.12), rand(0.03, 0.08), rand(0.15, 0.4)) },
  { name: 'rotateReversing', create: () => Position.rotateReversing(rand(0.08, 0.2), rand(3, 8)) },
  { name: 'breathe', create: () => Position.breathe(rand(0.15, 0.4), rand(0.1, 0.3)) },
  { name: 'breatheWavePattern', create: () => Position.breatheWavePattern(rand(0.1, 0.25), rand(0.1, 0.25), rand(0.3, 0.8)) },
  { name: 'oscillate', create: () => Position.oscillate(rand(0.15, 0.4), rand(0.15, 0.35)) },
  { name: 'oscillateWave', create: () => Position.oscillateWave(rand(0.1, 0.25), rand(0.15, 0.3), pick([1, 2, 3, 4])) },
  { name: 'drift', create: () => Position.drift(rand(0.02, 0.06)) },
  { name: 'driftWander', create: () => Position.driftWander(rand(0.03, 0.08), rand(0.05, 0.15)) },
  { name: 'pulse', create: () => Position.pulse(rand(0.02, 0.05), rand(0.1, 0.25), rand(0.3, 0.8)) },
  { name: 'spiral', create: () => Position.spiral(rand(0.05, 0.15), rand(0.03, 0.1)) },
  { name: 'vortex', create: () => Position.vortex(rand(0.1, 0.25), rand(0.02, 0.08)) },
  { name: 'waveInterference', create: () => Position.waveInterference(rand(0.1, 0.3), rand(0.15, 0.4), rand(0.2, 0.5)) },
  // Fancy
  { name: 'lissajous', create: () => Position.lissajous(pick([2, 3, 4, 5]), pick([2, 3, 4, 5]), rand(0.1, 0.25), rand(0.05, 0.2), rand(0, Math.PI)) },
  { name: 'coupled', create: () => Position.coupled(rand(0.05, 0.2), rand(0.1, 0.3), rand(0.01, 0.05)) },
  { name: 'elastic', create: () => Position.elastic(rand(0.3, 0.8), rand(0.05, 0.2), pick([2, 3, 4, 5])) },
  { name: 'rose', create: () => Position.rose(pick([3, 4, 5, 6, 7]), pick([2, 3, 4, 5]), rand(0.1, 0.25), rand(0.05, 0.15)) },
  { name: 'pendulum', create: () => Position.pendulum(rand(0.3, 0.8), rand(0.2, 0.5), rand(0.01, 0.05)) },
  { name: 'flocking', create: () => Position.flocking(rand(0.5, 1), rand(0.3, 0.7), rand(0.2, 0.5), rand(0.1, 0.3)) },
  { name: 'attractor', create: () => Position.attractor(rand(0.3, 0.8), rand(0.2, 0.5), rand(0.05, 0.2)) },
  { name: 'chaotic', create: () => Position.chaotic(rand(0.2, 0.5), rand(0.3, 0.7), rand(0.05, 0.2), rand(0.1, 0.3)) },
];

// Palette catalog - all available color palettes
export const paletteCatalog: PaletteEntry[] = Object.entries(palettes).map(([name, palette]) => ({
  name,
  palette: { name: palette.name, colors: [...palette.colors] },
}));

// Palette names for quick lookup
export const paletteNames = Object.keys(palettes) as PaletteName[];

// Get palette by name
export function getPalette(name: string): Palette {
  const entry = paletteCatalog.find(p => p.name === name);
  if (entry) {
    return { name: entry.palette.name, colors: [...entry.palette.colors] };
  }
  // Default to first palette
  return { name: paletteCatalog[0].palette.name, colors: [...paletteCatalog[0].palette.colors] };
}

// Color animation catalog - how to apply palettes
export const colorAnimations: ColorAnimationEntry[] = [
  { name: 'static', create: (p) => ColorAnim.staticGradient(p) },
  { name: 'bands', create: (p) => ColorAnim.staticBands(p) },
  { name: 'random', create: (p) => ColorAnim.staticRandom(p) },
  { name: 'cycling', create: (p) => ColorAnim.cycling(p, rand(0.1, 0.25), rand(0.5, 1)) },
  { name: 'breathing', create: (p) => ColorAnim.breathing(p, rand(0.2, 0.5), rand(0.3, 0.8)) },
  { name: 'wave', create: (p) => ColorAnim.wave(p, rand(0.3, 0.6), pick([1, 2, 3])) },
  { name: 'pulse', create: (p) => ColorAnim.pulse(p, rand(0.3, 0.6), pick([2, 3, 4])) },
  { name: 'chase', create: (p) => ColorAnim.chase(p, rand(0.3, 0.6), rand(0.1, 0.2)) },
  { name: 'strobe', create: (p) => ColorAnim.strobe(p, rand(0.5, 1), pick([2, 3, 4])) },
  { name: 'shimmer', create: (p) => ColorAnim.shimmer(p, rand(0.15, 0.3)) },
  { name: 'flicker', create: (p) => ColorAnim.flicker(p, rand(4, 8), rand(0.15, 0.25)) },
  { name: 'depth', create: (p) => ColorAnim.depthBased(p) },
  { name: 'mono', create: (p) => ColorAnim.mono(p) },
  { name: 'rainbow', create: () => ColorAnim.rainbow(rand(0.15, 0.4), rand(0.3, 1)) },
];

// Color animation names
export const colorAnimationNames = colorAnimations.map(a => a.name);

// Create color evolver from palette name and animation name
export function createColorEvolver(paletteName: string, animationName: string): ColorEvolver {
  const palette = getPalette(paletteName);
  const animation = colorAnimations.find(a => a.name === animationName) ?? colorAnimations[0];
  return animation.create(palette);
}

// Legacy: keep colorEvolvers for backward compatibility during transition
// These combine a default palette with specific animations
export const colorEvolvers: EvolverEntry<ColorEvolver>[] = [
  { name: 'static', create: () => createColorEvolver(pick(paletteNames), 'static') },
  { name: 'cycling', create: () => createColorEvolver(pick(paletteNames), 'cycling') },
  { name: 'breathing', create: () => createColorEvolver(pick(paletteNames), 'breathing') },
  { name: 'wave', create: () => createColorEvolver(pick(paletteNames), 'wave') },
  { name: 'chase', create: () => createColorEvolver(pick(paletteNames), 'chase') },
  { name: 'rainbow', create: () => ColorAnim.rainbow(rand(0.15, 0.4), rand(0.3, 1)) },
];

// Alpha evolvers catalog
export const alphaEvolvers: EvolverEntry<NumberEvolver>[] = [
  { name: 'none', create: () => Num.constantAlpha(1) },
  { name: 'breathingAlpha', create: () => Num.breathingAlpha(rand(0, 0.3), 1, rand(0.2, 0.4), rand(0.3, 0.7)) },
  { name: 'pulsingAlpha', create: () => Num.pulsingAlpha(rand(0, 0.2), 1, rand(0.3, 0.6), rand(0.2, 0.5)) },
  { name: 'waveAlpha', create: () => Num.waveAlpha(rand(0, 0.3), 1, rand(0.15, 0.3), pick([1, 2, 3])) },
  { name: 'depthAlpha', create: () => Num.depthAlpha(1, rand(0, 0.3)) },
  { name: 'flickerAlpha', create: () => Num.flickerAlpha(rand(0, 0.3), 1, rand(1, 3)) },
];

// LineWidth evolvers catalog
export const lineWidthEvolvers: EvolverEntry<NumberEvolver>[] = [
  { name: 'none', create: () => Num.constantWidth() },
  { name: 'breathingWidth', create: () => Num.breathingWidth(rand(0, 2.5), rand(2.5, 5), rand(0.2, 0.4), rand(0.3, 0.7)) },
  { name: 'pulsingWidth', create: () => Num.pulsingWidth(rand(0, 2.5), rand(2.5, 5), rand(0.3, 0.6), rand(0.2, 0.5)) },
  { name: 'waveWidth', create: () => Num.waveWidth(rand(0, 2.5), rand(2.5, 5), rand(0.15, 0.3), pick([1, 2, 3])) },
  { name: 'depthWidth', create: () => Num.depthWidth(rand(2.5, 5), rand(0, 2.5)) },
  { name: 'taperedWidth', create: () => Num.taperedWidth(rand(0, 2.5), rand(2.5, 5)) },
];

// Dash evolvers catalog
export const dashEvolvers: EvolverEntry<DashEvolver>[] = [
  { name: 'none', create: () => Dash.solid() },
  { name: 'dashed', create: () => Dash.dashed(rand(5, 15), rand(5, 15)) },
  { name: 'dotted', create: () => Dash.dotted(rand(1, 4), rand(5, 12)) },
  { name: 'morse', create: () => Dash.morse(rand(10, 20), rand(2, 5), rand(3, 8)) },
  { name: 'marching', create: () => Dash.marching(rand(5, 15), rand(5, 15), rand(30, 80)) },
  { name: 'marchingReverse', create: () => Dash.marchingReverse(rand(5, 15), rand(5, 15), rand(30, 80)) },
  { name: 'marchingWave', create: () => Dash.marchingWave(rand(5, 15), rand(5, 15), rand(30, 80), rand(0.3, 0.8)) },
  { name: 'marchingAlternate', create: () => Dash.marchingAlternate(rand(5, 15), rand(5, 15), rand(30, 80)) },
  { name: 'breathingDash', create: () => Dash.breathingDash(rand(3, 8), rand(15, 25), rand(5, 15), rand(0.3, 0.8)) },
  { name: 'pulsingGap', create: () => Dash.pulsingGap(rand(8, 15), rand(2, 5), rand(15, 25), rand(0.3, 0.8)) },
  { name: 'depthDash', create: () => Dash.depthDash(rand(15, 25), rand(3, 8), rand(5, 15)) },
  { name: 'strobeDash', create: () => Dash.strobeDash(rand(8, 15), rand(5, 12), rand(2, 6)) },
  // Rolling/wave patterns - smooth cyclical variations (with randomized options)
  { name: 'cascade', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.cascade({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.3, 0.5),
      width: rand(0.1, 0.2),
    });
  } },
  { name: 'rollingSolid', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.rollingSolid({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.15, 0.4),
      bandWidth: rand(0.2, 0.4),
      maxGap: rand(15, 25),
    });
  } },
  { name: 'rollingDashes', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.rollingDashes({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.3),
      dashLen: rand(8, 15),
    });
  } },
  { name: 'sineWaveGap', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.sineWaveGap({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.3),
      waves: pick([1, 2, 3]),
      maxGap: rand(20, 30),
    });
  } },
  { name: 'doubleHelix', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.doubleHelix({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.25),
      maxGap: rand(15, 25),
    });
  } },
  { name: 'gradientRoll', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.gradientRoll({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.25),
      maxGap: rand(20, 30),
    });
  } },
  { name: 'ripple', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.ripple({
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.2, 0.4),
      rippleCount: pick([2, 3, 4]),
      maxGap: rand(15, 25),
    });
  } },
  { name: 'breathingWave', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.breathingWave({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.25),
      minDash: rand(3, 6),
      maxDash: rand(12, 18),
      minGap: rand(3, 6),
      maxGap: rand(15, 25),
    });
  } },
  { name: 'harmonic', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.harmonic({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.2),
      maxGap: rand(20, 30),
    });
  } },
  { name: 'interference', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.interference({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.15, 0.3),
      maxGap: rand(18, 26),
    });
  } },
  { name: 'pendulum', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.pendulum({
      edge: pick(['wrap', 'bounce'] as const),
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.2),
      maxGap: rand(20, 28),
    });
  } },
  { name: 'dissolve', create: () => {
    const speedMode = pick(['relative', 'absolute'] as const);
    return DashComposed.dissolve({
      speedMode,
      speed: speedMode === 'absolute' ? rand(30, 70) : rand(0.1, 0.3),
      threshold: rand(0.2, 0.4),
    });
  } },
];

// Dash evolver names
export const dashEvolverNames = dashEvolvers.map(e => e.name);

// Distribution names
export const distributionNames = Object.keys(Distributions) as (keyof typeof Distributions)[];
