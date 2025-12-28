// Position evolvers - animate endpoint positions using wave functions
import type { PositionEvolver } from './types';
import { breathe as breatheWave, pulse as pulseWave, sine } from './waves';
import { TAU } from '../utils';

// === BASIC POSITION EVOLVERS ===

// Constant rotation - endpoints travel around perimeter
export const rotate = (speed = 0.1): PositionEvolver => ({
  name: 'rotate',
  getValue: (ctx) => {
    const delta = speed * ctx.line.dir0 * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// Rotation with breathing speed variation
export const rotateBreathing = (
  baseSpeed = 0.08,
  speedVariation = 0.05,
  breatheSpeed = 0.3
): PositionEvolver => {
  const wave = breatheWave(breatheSpeed, 1);
  return {
    name: 'rotateBreathing',
    getValue: (ctx) => {
      const speedMod = wave(ctx);
      const speed = baseSpeed + speedVariation * speedMod;
      const delta = speed * ctx.line.dir0 * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Rotation that periodically reverses
export const rotateReversing = (speed = 0.1, reversePeriod = 5): PositionEvolver => ({
  name: 'rotateReversing',
  getValue: (ctx) => {
    const phase = Math.floor(ctx.time / reversePeriod) % 2;
    const dir = phase === 0 ? 1 : -1;
    const delta = speed * dir * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === BREATHING EVOLVERS ===

// Endpoints move toward/away from each other (line length changes)
// Uses derivative of sine for smooth oscillation
export const breathe = (amplitude = 0.2, speed = 0.3): PositionEvolver => {
  return {
    name: 'breathe',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * 0.3;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  };
};

// Breathing with wave pattern across lines
export const breatheWavePattern = (
  amplitude = 0.15,
  speed = 0.2,
  phaseSpread = 0.5
): PositionEvolver => {
  return {
    name: 'breatheWave',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  };
};

// === OSCILLATION EVOLVERS ===

// Oscillate both endpoints together (line slides back and forth)
export const oscillate = (amplitude = 0.3, speed = 0.25): PositionEvolver => {
  return {
    name: 'oscillate',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * 0.5;
      // Derivative of sin(t) is cos(t)
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Oscillate with wave pattern
export const oscillateWave = (
  amplitude = 0.2,
  speed = 0.2,
  waves = 2
): PositionEvolver => ({
  name: 'oscillateWave',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * waves;
    // Derivative of sin(t) is cos(t)
    const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
    const delta = velocity * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === DRIFT EVOLVERS ===

// Slow random-ish drift
export const drift = (speed = 0.04): PositionEvolver => ({
  name: 'drift',
  getValue: (ctx) => {
    const delta = ctx.line.speed0 * ctx.line.dir0 * speed * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// Drift with wandering direction changes
export const driftWander = (speed = 0.05, wanderSpeed = 0.1): PositionEvolver => {
  const wave = sine(wanderSpeed, 1);
  return {
    name: 'driftWander',
    getValue: (ctx) => {
      const wander = wave(ctx) * 0.5;
      const baseSpeed = ctx.line.speed0 * speed;
      const delta0 = (ctx.line.dir0 + wander) * baseSpeed * ctx.dt;
      const delta1 = (ctx.line.dir1 - wander) * baseSpeed * ctx.dt;
      return { delta0, delta1 };
    },
  };
};

// === PULSE EVOLVERS ===

// Periodic pulses that move endpoints
export const pulse = (strength = 0.03, speed = 0.2, phaseSpread = 0.5): PositionEvolver => {
  const wave = pulseWave(speed, 4, phaseSpread);
  return {
    name: 'pulse',
    getValue: (ctx) => {
      // Use the wave value directly as a velocity multiplier
      const v = wave(ctx) * strength;
      const delta = v * ctx.dt;
      return { delta0: delta * ctx.line.dir0, delta1: delta * ctx.line.dir1 };
    },
  };
};

// === SPIRAL/VORTEX EVOLVERS ===

// Spiral - rotation that speeds up toward center
export const spiral = (rotationSpeed = 0.1, contractionSpeed = 0.05): PositionEvolver => ({
  name: 'spiral',
  getValue: (ctx) => {
    // Rotation
    const rotDelta = rotationSpeed * ctx.dt;

    // Contract/expand based on position
    const breatheDelta = Math.sin(ctx.time * 0.5) * contractionSpeed * ctx.dt;

    return {
      delta0: rotDelta + breatheDelta,
      delta1: rotDelta - breatheDelta,
    };
  },
});

// Vortex - endpoints orbit around line center
export const vortex = (orbitSpeed = 0.15, wobble = 0.05): PositionEvolver => ({
  name: 'vortex',
  getValue: (ctx) => {
    const phase = ctx.index * 0.1;
    const orbit0 = Math.sin(ctx.time * orbitSpeed + phase) * wobble;
    const orbit1 = Math.cos(ctx.time * orbitSpeed + phase) * wobble;
    return { delta0: orbit0 * ctx.dt, delta1: orbit1 * ctx.dt };
  },
});

// === PHYSICS EVOLVERS ===

// Wave interference pattern
export const waveInterference = (freq1 = 0.2, freq2 = 0.3, amp = 0.3): PositionEvolver => ({
  name: 'waveInterference',
  getValue: (ctx) => {
    const pos = ctx.index / ctx.total;
    // Derivatives: d/dt sin(t) = cos(t)
    const vel1 = Math.cos(ctx.time * freq1 * TAU + pos * TAU * 2) * freq1 * TAU;
    const vel2 = Math.cos(ctx.time * freq2 * TAU + pos * TAU * 3) * freq2 * TAU;
    const velocity = (vel1 + vel2) / 2 * amp;
    const delta = velocity * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});
