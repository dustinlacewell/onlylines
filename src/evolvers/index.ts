// Evolver system - composable animation primitives

// Types
export type {
  EvolverWorld,
  LineContext,
  Evolver,
  PositionEvolver,
  ColorEvolver,
  NumberEvolver,
  EvolverSet,
} from './types';
export { makeLineContext } from './types';

// Wave primitives
export {
  type WaveFn,
  type WaveContext,
  // Basic waves
  sine,
  cosine,
  triangle,
  sawtooth,
  sineNorm,
  // Pulse/beat
  pulse,
  heartbeat,
  breathe,
  // Step/discrete
  steps,
  randomSteps,
  // Modifiers
  remap,
  remapNorm,
  multiply,
  add,
  clamp,
  abs,
  power,
  constant,
  indexNorm,
} from './waves';

// Palettes
export {
  type HSL,
  type Palette,
  type PaletteName,
  palettes,
  randomPalette,
  samplePalette,
  samplePaletteWrap,
  lerpHSL,
  hslToString,
} from './palettes';

// Position evolvers
export {
  // Basic
  rotate,
  rotateBreathing,
  rotateReversing,
  // Breathing
  breathe as breathePosition,
  breatheWavePattern,
  // Oscillation
  oscillate,
  oscillateWave,
  // Drift
  drift,
  driftWander,
  // Pulse
  pulse as pulsePosition,
  // Spiral/vortex
  spiral,
  vortex,
  // Physics
  waveInterference,
} from './position';

// Color evolvers
export {
  // Static
  staticPalette,
  mono,
  triadic,
  duotone,
  temperature,
  depth,
  ink,
  noir,
  // Cycling
  cyclingRainbow,
  cyclingPalette,
  cyclingDual,
  colorWave,
  breathingColor,
  colorChase,
  strobeGroups,
  // Themed
  fire,
  ocean,
  forest,
  aurora,
  neon,
  metallic,
  vaporwave,
  candy,
} from './color';

// Number evolvers
export {
  // Alpha
  constantAlpha,
  breathingAlpha,
  pulsingAlpha,
  waveAlpha,
  depthAlpha,
  flickerAlpha,
  strobeAlpha,
  // LineWidth
  constantWidth,
  breathingWidth,
  pulsingWidth,
  waveWidth,
  depthWidth,
  taperedWidth,
  // Brightness
  constantBrightness,
  oscillatingBrightness,
  gradientBrightness,
} from './number';

// Motion primitives (first stage of composition)
export {
  type Motion,
  // Static
  staticIndex,
  staticCentered,
  // Field motions
  fieldRoll,
  fieldRollAbsolute,
  fieldBounce,
  fieldBounceAbsolute,
  // Focal motions
  focalRoll,
  focalRollAbsolute,
  focalBounce,
  focalBounceAbsolute,
  focalSpread,
  focalSpreadAbsolute,
  // Modifiers
  invert as invertMotion,
  scale as scaleMotion,
  offset as offsetMotion,
} from './motion';

// Mappers (second stage of composition)
export {
  type Mapper,
  // Continuous
  gradient,
  sine as sineMapper,
  cosine as cosineMapper,
  power as powerMapper,
  powerInverse,
  // Spot/focused
  spotGaussian,
  spotLinear,
  spotBinary,
  spot,
  // Noise
  noise,
  noiseRapid,
  // Step/band
  threshold,
  steps as stepMapper,
  // Composite
  harmonic,
  interference,
  doubleHelix,
  // Combinators
  invert as invertMapper,
  remap as remapMapper,
  clamp as clampMapper,
  multiply as multiplyMappers,
  add as addMappers,
} from './mappers';

// Composition utilities
export {
  compose,
  // Dash adapters
  toDashGap,
  toBinaryDash,
  toDashDirect,
  // Alpha adapters
  toAlpha,
  // Width adapters
  toWidthMultiplier,
  // Evolver factories
  createDashEvolver,
  createNumberEvolver,
  // Pre-built composed evolvers
  composedCascade,
  composedCascadeBounce,
  composedCascadeAbsolute,
  composedCascadeBounceAbsolute,
  composedRollingSolid,
  composedRollingSolidBounce,
  composedRollingSolidAbsolute,
  composedRollingSolidBounceAbsolute,
  composedSineWaveGap,
} from './compose';

// Grouped exports for convenience
import * as position from './position';
import * as color from './color';
import * as number from './number';
import * as waves from './waves';
import * as palettes from './palettes';
import * as motion from './motion';
import * as mappers from './mappers';
import * as compose from './compose';

export const Evolvers = {
  position,
  color,
  number,
  waves,
  palettes,
  motion,
  mappers,
  compose,
};
