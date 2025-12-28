// Position evolvers - animate endpoint positions using wave functions
import type { PositionEvolver } from './types';
import type { PositionEvolverState } from '../serialize';
import { TAU } from '../utils';

// Re-export from individual files
export { billiards } from './position/billiards';

// === ROTATION ===

// Constant rotation - endpoints travel around perimeter
export const rotate = (speed = 0.1): PositionEvolver => ({
  name: 'rotate',
  getValue: (ctx) => {
    const delta = speed * ctx.line.dir0 * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === BREATHING ===

// Endpoints move toward/away from each other (line length changes)
// phaseSpread controls how much the wave spreads across lines (0 = sync, 1 = full wave)
export const breathe = (
  amplitude = 0.2,
  speed = 0.3,
  phaseSpread = 0.3
): PositionEvolver => {
  return {
    name: 'breathe',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  };
};

// === OSCILLATION ===

// Oscillate both endpoints together (line slides back and forth)
// waves controls how many wave cycles across all lines
export const oscillate = (
  amplitude = 0.3,
  speed = 0.25,
  waves = 1
): PositionEvolver => {
  return {
    name: 'oscillate',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * waves;
      // Derivative of sin(t) is cos(t)
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// === PULSE ===

// Periodic pulses that move endpoints - creates rolling wave effects
export const pulse = (
  strength = 0.03,
  speed = 0.2,
  phaseSpread = 0.5
): PositionEvolver => {
  return {
    name: 'pulse',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      // Sharp pulse using sin^4 for peaky waves
      const t = (ctx.time * speed + phase) * TAU;
      const raw = Math.sin(t);
      const pulse = raw > 0 ? Math.pow(raw, 4) : 0;
      const v = pulse * strength;
      const delta = v * ctx.dt;
      return { delta0: delta * ctx.line.dir0, delta1: delta * ctx.line.dir1 };
    },
  };
};

// === WAVE INTERFERENCE ===

// Two frequencies create beating/interference patterns
export const waveInterference = (
  freq1 = 0.2,
  freq2 = 0.3,
  amplitude = 0.3
): PositionEvolver => ({
  name: 'waveInterference',
  getValue: (ctx) => {
    const pos = ctx.index / ctx.total;
    // Derivatives: d/dt sin(t) = cos(t)
    const vel1 = Math.cos(ctx.time * freq1 * TAU + pos * TAU * 2) * freq1 * TAU;
    const vel2 = Math.cos(ctx.time * freq2 * TAU + pos * TAU * 3) * freq2 * TAU;
    const velocity = (vel1 + vel2) / 2 * amplitude;
    const delta = velocity * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === LISSAJOUS ===

// Complex orbital patterns from frequency ratios
export const lissajous = (
  freqX = 3,
  freqY = 2,
  amplitude = 0.15,
  speed = 0.1,
  phase = 0
): PositionEvolver => ({
  name: 'lissajous',
  getValue: (ctx) => {
    const t = ctx.time * speed * 0.1;
    const linePhase = (ctx.index / ctx.total) * TAU;
    // Derivatives of sin/cos for velocity
    const velX = Math.cos(t * freqX + linePhase + phase) * freqX * speed * 0.1 * amplitude;
    const velY = -Math.sin(t * freqY + linePhase) * freqY * speed * 0.1 * amplitude;
    return { delta0: velX * ctx.dt, delta1: velY * ctx.dt };
  },
});

// === PENDULUM ===

// Physical pendulum motion with gravity - perpetual swinging
// phaseSpread controls how phases are distributed across lines (0 = sync, 1 = full spread)
export const pendulum = (
  length = 0.5,
  gravity = 0.3,
  phaseSpread = 0.5
): PositionEvolver => {
  const angles: number[] = [];
  const angularVels: number[] = [];
  return {
    name: 'pendulum',
    getValue: (ctx) => {
      if (angles[ctx.index] === undefined) {
        // Start at different angles based on position and phaseSpread
        const baseAngle = ((ctx.index / ctx.total) - 0.5) * Math.PI * 0.8;
        angles[ctx.index] = baseAngle * phaseSpread;
        // Give initial velocity based on energy conservation for perpetual motion
        // v = sqrt(2g/L * (1 - cos(θ))) but we start with some to ensure motion
        angularVels[ctx.index] = Math.sqrt(gravity / length) * 0.5 * (1 - 2 * (ctx.index % 2));
      }

      // Pendulum physics without damping: d²θ/dt² = -g/L * sin(θ)
      const angularAccel = -gravity / length * Math.sin(angles[ctx.index]);
      angularVels[ctx.index] += angularAccel * ctx.dt;
      angles[ctx.index] += angularVels[ctx.index] * ctx.dt;

      // Convert angular motion to position delta
      const delta = angularVels[ctx.index] * length * ctx.dt * 0.3;
      return { delta0: delta, delta1: delta };
    },
  };
};

// === FACTORY ===

// Import billiards for factory
import { billiards } from './position/billiards';

export function createPositionEvolver(state: PositionEvolverState): PositionEvolver | null {
  const { type, params } = state;

  switch (type) {
    case 'rotate':
      return rotate(params.speed);
    case 'breathe':
      return breathe(params.amplitude, params.speed, params.phaseSpread);
    case 'oscillate':
      return oscillate(params.amplitude, params.speed, params.waves);
    case 'pulse':
      return pulse(params.strength, params.speed, params.phaseSpread);
    case 'waveInterference':
      return waveInterference(params.freq1, params.freq2, params.amplitude);
    case 'lissajous':
      return lissajous(params.freqX, params.freqY, params.amplitude, params.speed, params.phase);
    case 'pendulum':
      return pendulum(params.length, params.gravity, params.phaseSpread);
    case 'billiards':
      return billiards(params.speed, params.speedVariation);
    default:
      console.warn(`Unknown position evolver type: ${type}`);
      return null;
  }
}
