// Evolver system - composable animation primitives

// === NEW ARCHITECTURE (Motion + Mapper + Output) ===
// See /llm/evolver-architecture.md for full design

// System types and computeT
export {
  type MotionConfig,
  type MotionMode,
  type EdgeBehavior as SystemEdgeBehavior,
  type MapperContext,
  type Mapper as SystemMapper,
  type MapperFactory,
  defaultMotionConfig,
  computeT,
  makeMapperContext,
  applyMotion,
} from './system';

// Mapper catalog
export {
  type MapperMeta,
  type MapperEntry,
  type OptionMeta,
  mapperCatalog,
  getMapper,
  getMapperMeta,
  getMappersByCategory,
  // Individual mappers
  identity,
  sine as sineMapperEntry,
  cosine as cosineMapperEntry,
  triangle as triangleMapperEntry,
  sawtooth as sawtoothMapperEntry,
  step as stepMapperEntry,
  pulse as pulseMapperEntry,
  square as squareMapperEntry,
  spot as spotMapperEntry,
  spotLinear as spotLinearMapperEntry,
  spotBinary as spotBinaryMapperEntry,
  easeIn,
  easeOut,
  easeInOut,
  noise as noiseMapperEntry,
  shimmer as shimmerMapperEntry,
  flicker as flickerMapperEntry,
  harmonic as harmonicMapperEntry,
  interference as interferenceMapperEntry,
  doubleHelix as doubleHelixMapperEntry,
  pendulum as pendulumMapperEntry,
  steps as stepsMapperEntry,
  bands as bandsMapperEntry,
} from './mapperCatalog';

// Output adapters
export {
  type DashOutputConfig,
  type ColorOutputConfig,
  type RangeOutputConfig,
  defaultDashOutput,
  defaultAlphaOutput,
  defaultLineWidthOutput,
  toDash as systemToDash,
  toBinaryDash as systemToBinaryDash,
  toVariableDash,
  toColor as systemToColor,
  toRange,
  toLineWidth as systemToLineWidth,
} from './outputAdapters';

// Evolver factory (main entry point for new system)
export {
  type EvolverSlotConfig,
  type DashSlotConfig,
  type ColorSlotConfig,
  type AlphaSlotConfig,
  type LineWidthSlotConfig,
  type WorldEvolverConfig,
  type CreatedEvolvers,
  type PresetName,
  createDashEvolverFromConfig,
  createColorEvolverFromConfig,
  createAlphaEvolverFromConfig,
  createLineWidthEvolverFromConfig,
  createEvolversFromConfig,
  presets,
} from './evolverFactory';

// === LEGACY TYPES (still used by World) ===

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
  harmonic as harmonicMapper,
  interference as interferenceMapper,
  doubleHelix as doubleHelixMapper,
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
} from './compose';

// Composed dash evolvers with options
export {
  type EdgeBehavior,
  type SpeedMode,
  type CascadeOptions,
  type RollingSolidOptions,
  type SineWaveOptions,
  type RippleOptions,
  type DoubleHelixOptions,
  type GradientRollOptions,
  type HarmonicOptions,
  type InterferenceOptions,
  type PendulumOptions,
  type DissolveOptions,
  type BreathingWaveOptions,
  type RollingDashesOptions,
  cascade,
  rollingSolid,
  sineWaveGap,
  ripple,
  doubleHelix,
  gradientRoll,
  harmonic,
  interference,
  pendulum,
  dissolve,
  breathingWave,
  rollingDashes,
} from './dashComposed';

// Grouped exports for convenience
import * as position from './position';
import * as color from './color';
import * as number from './number';
import * as waves from './waves';
import * as palettes from './palettes';
import * as motion from './motion';
import * as mappers from './mappers';
import * as compose from './compose';
import * as dashComposed from './dashComposed';
// New architecture
import * as system from './system';
import * as mapperCatalog from './mapperCatalog';
import * as outputAdapters from './outputAdapters';
import * as evolverFactory from './evolverFactory';

export const Evolvers = {
  position,
  color,
  number,
  waves,
  palettes,
  motion,
  mappers,
  compose,
  dashComposed,
  // New architecture
  system,
  mapperCatalog,
  outputAdapters,
  evolverFactory,
};
