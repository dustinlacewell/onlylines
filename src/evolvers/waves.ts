// Reusable wave/animation primitives
// These are pure math functions that can be used by any evolver

import { mod } from '../utils';

// Context passed to wave functions
export interface WaveContext {
  time: number;        // world time
  index: number;       // line index
  total: number;       // total line count
  dt: number;          // delta time
}

// A wave function returns a value (typically -1 to 1 or 0 to 1)
export type WaveFn = (ctx: WaveContext) => number;

// === BASIC WAVES ===

// Simple sine wave
export const sine = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    return Math.sin((ctx.time * speed + phase) * Math.PI * 2);
  };
};

// Cosine wave (sine shifted by 90 degrees)
export const cosine = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    return Math.cos((ctx.time * speed + phase) * Math.PI * 2);
  };
};

// Triangle wave (-1 to 1)
export const triangle = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    return t < 0.5 ? t * 4 - 1 : 3 - t * 4;
  };
};

// Sawtooth wave (-1 to 1)
export const sawtooth = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    return t * 2 - 1;
  };
};

// === NORMALIZED WAVES (0 to 1) ===

// Sine normalized to 0-1
export const sineNorm = (speed = 1, phaseSpread = 1): WaveFn => {
  const wave = sine(speed, phaseSpread);
  return (ctx) => (wave(ctx) + 1) / 2;
};

// === PULSE/BEAT WAVES ===

// Sharp pulse that peaks briefly
export const pulse = (speed = 1, sharpness = 4, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    return Math.exp(-Math.pow((t - 0.5) * sharpness, 2));
  };
};

// Heartbeat-like double pulse
export const heartbeat = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    const p1 = Math.exp(-Math.pow((t - 0.25) * 8, 2));
    const p2 = Math.exp(-Math.pow((t - 0.4) * 10, 2)) * 0.6;
    return Math.max(p1, p2);
  };
};

// === BREATHING/ORGANIC WAVES ===

// Smooth breathing (slower in, faster out)
export const breathe = (speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    // Ease-in-out cubic for organic feel
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
};

// === STEP/DISCRETE WAVES ===

// Steps between discrete values
export const steps = (numSteps: number, speed = 1, phaseSpread = 1): WaveFn => {
  return (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = mod(ctx.time * speed + phase, 1);
    return Math.floor(t * numSteps) / (numSteps - 1);
  };
};

// Random step changes
export const randomSteps = (changeSpeed = 0.5): WaveFn => {
  // Use a seeded pseudo-random based on time bucket
  return (ctx) => {
    const bucket = Math.floor(ctx.time * changeSpeed + ctx.index * 0.1);
    // Simple hash
    const x = Math.sin(bucket * 12.9898 + ctx.index * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
};

// === WAVE MODIFIERS ===

// Remap wave output range
export const remap = (wave: WaveFn, outMin: number, outMax: number): WaveFn => {
  return (ctx) => {
    const v = wave(ctx);
    // Assume input is -1 to 1
    const t = (v + 1) / 2;
    return outMin + t * (outMax - outMin);
  };
};

// Remap assuming 0-1 input
export const remapNorm = (wave: WaveFn, outMin: number, outMax: number): WaveFn => {
  return (ctx) => {
    const v = wave(ctx);
    return outMin + v * (outMax - outMin);
  };
};

// Multiply two waves
export const multiply = (wave1: WaveFn, wave2: WaveFn): WaveFn => {
  return (ctx) => wave1(ctx) * wave2(ctx);
};

// Add waves
export const add = (wave1: WaveFn, wave2: WaveFn): WaveFn => {
  return (ctx) => wave1(ctx) + wave2(ctx);
};

// Clamp wave output
export const clamp = (wave: WaveFn, min: number, max: number): WaveFn => {
  return (ctx) => Math.max(min, Math.min(max, wave(ctx)));
};

// Absolute value
export const abs = (wave: WaveFn): WaveFn => {
  return (ctx) => Math.abs(wave(ctx));
};

// Power curve (for easing)
export const power = (wave: WaveFn, exp: number): WaveFn => {
  return (ctx) => {
    const v = wave(ctx);
    return v >= 0 ? Math.pow(v, exp) : -Math.pow(-v, exp);
  };
};

// === CONSTANT ===

// Constant value (useful for combining)
export const constant = (value: number): WaveFn => {
  return () => value;
};

// Line's normalized index (0 to 1)
export const indexNorm: WaveFn = (ctx) => ctx.index / Math.max(1, ctx.total - 1);
