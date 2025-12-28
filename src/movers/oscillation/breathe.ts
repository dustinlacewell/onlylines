// Breathe mover - endpoints move toward/away from each other (line length changes)

import { registerMover } from '../../core/registry';
import { TAU } from '../../utils';

export const breathe = registerMover({
  id: 1,
  name: 'breathe',
  category: 'oscillation',
  description: 'Endpoints move toward/away from each other (line length changes)',

  params: {
    amplitude: {
      type: 'smallUnit',
      default: 0.2,
      min: 0.01,
      max: 0.5,
      description: 'Breathing intensity',
    },
    speed: {
      type: 'speed',
      default: 0.3,
      min: 0.01,
      max: 1,
      description: 'Breathing speed',
    },
    phaseSpread: {
      type: 'unit',
      default: 0.3,
      min: 0,
      max: 1,
      description: 'How much the wave spreads across lines (0=sync, 1=full wave)',
    },
  },

  randomize: {
    amplitude: [0.1, 0.3],
    speed: [0.1, 0.5],
    phaseSpread: [0.1, 0.8],
  },

  create: ({ amplitude, speed, phaseSpread }) => ({
    name: 'breathe',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  }),
});
