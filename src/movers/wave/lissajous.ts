// Lissajous mover - complex orbital patterns from frequency ratios

import { registerMover } from '../../core/registry';
import { TAU } from '../../utils';

export const lissajous = registerMover({
  id: 5,
  name: 'lissajous',
  category: 'wave',
  description: 'Complex orbital patterns from frequency ratios',

  params: {
    freqX: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 5,
      description: 'X frequency',
    },
    freqY: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 5,
      description: 'Y frequency',
    },
    amplitude: {
      type: 'smallUnit',
      default: 0.15,
      min: 0.05,
      max: 0.3,
      description: 'Motion amplitude',
    },
    speed: {
      type: 'speed',
      default: 0.1,
      min: 0.01,
      max: 0.5,
      description: 'Animation speed',
    },
    phase: {
      type: 'angle',
      default: 0,
      min: 0,
      max: Math.PI * 2,
      description: 'Phase offset',
    },
  },

  randomize: {
    freqX: [1, 2, 3, 4, 5] as const,
    freqY: [1, 2, 3, 4, 5] as const,
    amplitude: [0.1, 0.25],
    speed: [0.05, 0.2],
    phase: [0, Math.PI * 2],
  },

  create: ({ freqX, freqY, amplitude, speed, phase }) => ({
    name: 'lissajous',
    getValue: (ctx) => {
      const t = ctx.time * speed * 0.1;
      const linePhase = (ctx.index / ctx.total) * TAU;
      const velX = Math.cos(t * freqX + linePhase + phase) * freqX * speed * 0.1 * amplitude;
      const velY = -Math.sin(t * freqY + linePhase) * freqY * speed * 0.1 * amplitude;
      return { delta0: velX * ctx.dt, delta1: velY * ctx.dt };
    },
  }),
});
