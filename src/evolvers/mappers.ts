// Mappers - transform t (0-1) into output values
// Used as the second stage of composable evolvers
// Mappers are agnostic to how t was computed

import type { LineContext } from './types';

// A mapper transforms t (0-1) into an output value
// Gets ctx for time-based effects that need additional context
export type Mapper<T> = (t: number, ctx: LineContext) => T;

// === CONTINUOUS MAPPERS ===
// Smooth variation across t range

// Linear gradient from min to max
export const gradient = (min: number, max: number): Mapper<number> =>
  (t) => min + t * (max - min);

// Sine wave mapper
export const sine = (waves: number, min: number, max: number): Mapper<number> =>
  (t) => {
    const v = (Math.sin(t * waves * Math.PI * 2) + 1) / 2;
    return min + v * (max - min);
  };

// Cosine wave mapper
export const cosine = (waves: number, min: number, max: number): Mapper<number> =>
  (t) => {
    const v = (Math.cos(t * waves * Math.PI * 2) + 1) / 2;
    return min + v * (max - min);
  };

// Power curve (easing)
export const power = (exponent: number, min: number, max: number): Mapper<number> =>
  (t) => min + Math.pow(t, exponent) * (max - min);

// Inverse power curve
export const powerInverse = (exponent: number, min: number, max: number): Mapper<number> =>
  (t) => min + (1 - Math.pow(1 - t, exponent)) * (max - min);


// === SPOT/FOCUSED MAPPERS ===
// Effect concentrated at a point (t = distance from focus)

// Gaussian spot - smooth falloff
export const spotGaussian = (width: number): Mapper<number> =>
  (t) => Math.exp(-Math.pow(t / width, 2));

// Linear spot - linear falloff
export const spotLinear = (width: number): Mapper<number> =>
  (t) => Math.max(0, 1 - t / width);

// Binary spot - hard cutoff
export const spotBinary = (width: number): Mapper<number> =>
  (t) => t < width ? 1 : 0;

// Generic spot with falloff option
export const spot = (width: number, falloff: 'gaussian' | 'linear' | 'binary' = 'gaussian'): Mapper<number> => {
  switch (falloff) {
    case 'binary': return spotBinary(width);
    case 'linear': return spotLinear(width);
    case 'gaussian': return spotGaussian(width);
  }
};


// === NOISE MAPPERS ===
// Pseudo-random variation

// Basic noise - uses t and time to create pseudo-random output
export const noise = (seed: number = 47.3): Mapper<number> =>
  (t, ctx) => {
    const phase = ctx.time * 0.2;
    const n = Math.sin(t * seed + phase) * Math.cos(t * 31.7 - phase * 0.7);
    return (n + 1) / 2;
  };

// Faster noise variation
export const noiseRapid = (speed: number = 5, seed: number = 47.3): Mapper<number> =>
  (t, ctx) => {
    const phase = ctx.time * speed;
    const n = Math.sin(t * seed + phase) * Math.cos(t * 31.7 - phase * 0.7);
    return (n + 1) / 2;
  };


// === STEP/BAND MAPPERS ===
// Discrete zones

// Threshold - binary output based on t
export const threshold = (cutoff: number): Mapper<number> =>
  (t) => t < cutoff ? 1 : 0;

// Steps - discrete steps across t range
export const steps = (numSteps: number): Mapper<number> =>
  (t) => Math.floor(t * numSteps) / Math.max(1, numSteps - 1);


// === COMPOSITE MAPPERS ===
// Built from multiple waves - for more complex effects

// Harmonic - multiple frequency waves
export const harmonic = (fundamentalWaves: number = 1): Mapper<number> =>
  (t, ctx) => {
    const time = ctx.time * 0.15;
    const f1 = Math.sin((t * fundamentalWaves + time) * Math.PI * 2);
    const f2 = Math.sin((t * fundamentalWaves * 2 + time * 1.5) * Math.PI * 2) * 0.5;
    const f3 = Math.sin((t * fundamentalWaves * 3 + time * 0.7) * Math.PI * 2) * 0.25;
    return (f1 + f2 + f3 + 1.75) / 3.5;
  };

// Interference - two waves in opposite directions
export const interference = (waveRatio: number = 0.7): Mapper<number> =>
  (t, ctx) => {
    const speed = 0.2;
    const wave1 = Math.sin((t + ctx.time * speed) * Math.PI * 4);
    const wave2 = Math.sin((t - ctx.time * speed * waveRatio) * Math.PI * 4);
    return ((wave1 + wave2) / 2 + 1) / 2;
  };

// Double helix - two out-of-phase waves
export const doubleHelix = (phaseOffset: number = 0.5): Mapper<number> =>
  (t, ctx) => {
    const time = ctx.time * 0.15;
    const wave1 = (Math.sin((t + time) * Math.PI * 2) + 1) / 2;
    const wave2 = (Math.sin((t + time + phaseOffset) * Math.PI * 2 * 1.5) + 1) / 2;
    return (wave1 + wave2) / 2;
  };


// === MAPPER COMBINATORS ===

// Invert output (1 - value)
export const invert = <T extends number>(mapper: Mapper<T>): Mapper<number> =>
  (t, ctx) => 1 - mapper(t, ctx);

// Remap output range
export const remap = (mapper: Mapper<number>, outMin: number, outMax: number): Mapper<number> =>
  (t, ctx) => outMin + mapper(t, ctx) * (outMax - outMin);

// Clamp output
export const clamp = (mapper: Mapper<number>, min: number, max: number): Mapper<number> =>
  (t, ctx) => Math.max(min, Math.min(max, mapper(t, ctx)));

// Multiply two mappers
export const multiply = (m1: Mapper<number>, m2: Mapper<number>): Mapper<number> =>
  (t, ctx) => m1(t, ctx) * m2(t, ctx);

// Add two mappers
export const add = (m1: Mapper<number>, m2: Mapper<number>): Mapper<number> =>
  (t, ctx) => m1(t, ctx) + m2(t, ctx);
