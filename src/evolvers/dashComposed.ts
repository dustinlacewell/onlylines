// Composed dash evolvers with options
// These use the motion + mapper composition system internally
// but expose a clean options-based API

import type { DashEvolver } from './types';
import { createDashEvolver, toDashGap, toBinaryDash } from './compose';
import {
  focalRoll, focalBounce, focalRollAbsolute, focalBounceAbsolute,
  focalSpread, focalSpreadAbsolute,
  fieldRoll, fieldBounce, fieldRollAbsolute, fieldBounceAbsolute,
} from './motion';
import { threshold, spotLinear, sine, harmonic as harmonicMapper, interference as interferenceMapper } from './mappers';

// === OPTION TYPES ===

export type EdgeBehavior = 'wrap' | 'bounce';
export type SpeedMode = 'relative' | 'absolute';

export interface CascadeOptions {
  /** How the effect behaves at edges */
  edge?: EdgeBehavior;
  /** Speed semantics - relative (fraction/sec) or absolute (lines/sec) */
  speedMode?: SpeedMode;
  /** Speed value - meaning depends on speedMode */
  speed?: number;
  /** Width of the solid band (0-1) */
  width?: number;
}

export interface RollingSolidOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  /** Width of the effect band (0-1) */
  bandWidth?: number;
  /** Maximum gap size when far from focus */
  maxGap?: number;
}

export interface SineWaveOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  /** Number of wave cycles */
  waves?: number;
  /** Minimum gap */
  minGap?: number;
  /** Maximum gap */
  maxGap?: number;
}

export interface RippleOptions {
  speedMode?: SpeedMode;
  speed?: number;
  /** Number of ripple rings */
  rippleCount?: number;
  /** Maximum gap size */
  maxGap?: number;
}

export interface DoubleHelixOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  maxGap?: number;
}

export interface GradientRollOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  maxGap?: number;
}

export interface HarmonicOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  maxGap?: number;
}

export interface InterferenceOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  maxGap?: number;
}

export interface PendulumOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  maxGap?: number;
}

export interface DissolveOptions {
  speedMode?: SpeedMode;
  speed?: number;
  threshold?: number;
}

export interface BreathingWaveOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  minDash?: number;
  maxDash?: number;
  minGap?: number;
  maxGap?: number;
}

export interface RollingDashesOptions {
  edge?: EdgeBehavior;
  speedMode?: SpeedMode;
  speed?: number;
  dashLen?: number;
}


// === COMPOSED EVOLVERS WITH OPTIONS ===

/**
 * Cascade - a solid band travels through indices
 */
export function cascade(options: CascadeOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.4,
    width = 0.15,
  } = options;

  // Select the appropriate motion based on options
  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? focalRollAbsolute(speed) : focalRoll(speed))
      : (speedMode === 'absolute' ? focalBounceAbsolute(speed) : focalBounce(speed));

  return createDashEvolver(
    motion,
    toBinaryDash(threshold(width), 0.5),
    'cascade'
  );
}

/**
 * RollingSolid - a band of solid lines with gradient falloff
 */
export function rollingSolid(options: RollingSolidOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.3,
    bandWidth = 0.3,
    maxGap = 20,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? focalRollAbsolute(speed) : focalRoll(speed))
      : (speedMode === 'absolute' ? focalBounceAbsolute(speed) : focalBounce(speed));

  return createDashEvolver(
    motion,
    toDashGap(spotLinear(bandWidth), maxGap),
    'rollingSolid'
  );
}

/**
 * SineWaveGap - sinusoidal variation in gap size
 */
export function sineWaveGap(options: SineWaveOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.2,
    waves = 2,
    maxGap = 25,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  return createDashEvolver(
    motion,
    toDashGap(sine(waves, 0, 1), maxGap, 10),
    'sineWaveGap'
  );
}

/**
 * Ripple - concentric rings emanating from center
 */
export function ripple(options: RippleOptions = {}): DashEvolver {
  const {
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.3,
    rippleCount = 3,
    maxGap = 20,
  } = options;

  const motion = speedMode === 'absolute'
    ? focalSpreadAbsolute(speed)
    : focalSpread(speed);

  return createDashEvolver(
    motion,
    toDashGap(sine(rippleCount, 0, 1), maxGap, 10),
    'ripple'
  );
}

/**
 * DoubleHelix - two out-of-phase sine waves
 * Uses interference mapper with ratio=1.5 and phase offset
 */
export function doubleHelix(options: DoubleHelixOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.15,
    maxGap = 20,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  // doubleHelix is interference with specific params (ratio ~1.5, phase offset)
  // Use a custom inline mapper that replicates the original behavior
  const helixMapper = (t: number, ctx: { time: number }) => {
    const time = ctx.time * 0.15;
    const wave1 = (Math.sin((t + time) * Math.PI * 2) + 1) / 2;
    const wave2 = (Math.sin((t + time + 0.5) * Math.PI * 2 * 1.5) + 1) / 2;
    return (wave1 + wave2) / 2;
  };

  return createDashEvolver(
    motion,
    toDashGap(helixMapper, maxGap, 8),
    'doubleHelix'
  );
}

/**
 * GradientRoll - smooth gradient that rolls through indices
 */
export function gradientRoll(options: GradientRollOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.15,
    maxGap = 25,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  return createDashEvolver(
    motion,
    toDashGap(sine(1, 0, 1), maxGap, 10),
    'gradientRoll'
  );
}

/**
 * Harmonic - multiple frequency sine waves
 */
export function harmonic(options: HarmonicOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.15,
    maxGap = 25,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  return createDashEvolver(
    motion,
    toDashGap(harmonicMapper(1), maxGap, 10),
    'harmonic'
  );
}

/**
 * Interference - two waves traveling in opposite directions
 */
export function interference(options: InterferenceOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.2,
    maxGap = 22,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  return createDashEvolver(
    motion,
    toDashGap(interferenceMapper(0.7), maxGap, 8),
    'interference'
  );
}

/**
 * Pendulum - oscillation that slows at extremes
 */
export function pendulum(options: PendulumOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.15,
    maxGap = 25,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  // Pendulum uses cosine of sine for slower motion at extremes
  const pendulumMapper = (t: number) => {
    const swing = Math.sin(t * Math.PI * 2);
    return (Math.cos(swing * Math.PI / 2) + 1) / 2;
  };

  return createDashEvolver(
    motion,
    toDashGap((t) => 1 - pendulumMapper(t), maxGap, 10),
    'pendulum'
  );
}

/**
 * Dissolve - pseudo-random pattern
 */
export function dissolve(options: DissolveOptions = {}): DashEvolver {
  const {
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.2,
    threshold = 0.3,
  } = options;

  const motion = speedMode === 'absolute'
    ? fieldRollAbsolute(speed)
    : fieldRoll(speed);

  // Custom mapper for dissolve effect
  const dissolveMapper = (t: number, ctx: { time: number }) => {
    const phase = ctx.time * 0.2;
    const n = Math.sin(t * 47.3 + phase) * Math.cos(t * 31.7 - phase * 0.7);
    const normalized = (n + 1) / 2;
    if (normalized < threshold) return 0;
    return (normalized - threshold) / (1 - threshold);
  };

  return createDashEvolver(
    motion,
    toDashGap(dissolveMapper, 20, 8),
    'dissolve'
  );
}

/**
 * BreathingWave - dash and gap both oscillate with phase offset
 */
export function breathingWave(options: BreathingWaveOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.2,
    minDash = 3,
    maxDash = 15,
    minGap = 3,
    maxGap = 20,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  // Custom mapper that varies both dash and gap
  const breathingMapper = (t: number): { pattern: number[]; offset: number } => {
    const intensity = (Math.sin(t * Math.PI * 2) + 1) / 2;
    const dashLen = minDash + intensity * (maxDash - minDash);
    const gapIntensity = (Math.sin(t * Math.PI * 2 + Math.PI / 2) + 1) / 2;
    const gap = minGap + gapIntensity * (maxGap - minGap);
    return { pattern: [dashLen, gap], offset: 0 };
  };

  return {
    name: 'breathingWave',
    getValue: (ctx) => breathingMapper(motion(ctx)),
  };
}

/**
 * RollingDashes - dash/gap ratio rolls through lines
 */
export function rollingDashes(options: RollingDashesOptions = {}): DashEvolver {
  const {
    edge = 'wrap',
    speedMode = 'relative',
    speed = speedMode === 'absolute' ? 50 : 0.2,
    dashLen = 10,
  } = options;

  const motion =
    edge === 'wrap'
      ? (speedMode === 'absolute' ? fieldRollAbsolute(speed) : fieldRoll(speed))
      : (speedMode === 'absolute' ? fieldBounceAbsolute(speed) : fieldBounce(speed));

  // Gap varies from 0 to 2x dash length
  const rollingMapper = (t: number): { pattern: number[]; offset: number } => {
    const gap = t * dashLen * 2;
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [dashLen, gap], offset: 0 };
  };

  return {
    name: 'rollingDashes',
    getValue: (ctx) => rollingMapper(motion(ctx)),
  };
}
