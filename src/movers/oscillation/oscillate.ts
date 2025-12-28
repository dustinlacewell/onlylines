// Oscillate mover - whole line slides back and forth

import { registerMover } from '../../core/registry';
import { TAU } from '../../utils';

export const oscillate = registerMover({
  id: 2,
  name: 'oscillate',
  category: 'oscillation',
  description: 'Whole line slides back and forth',

  params: {
    amplitude: {
      type: 'smallUnit',
      default: 0.3,
      min: 0.01,
      max: 0.5,
      description: 'Oscillation intensity',
    },
    speed: {
      type: 'speed',
      default: 0.25,
      min: 0.01,
      max: 1,
      description: 'Oscillation speed',
    },
    waves: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 4,
      description: 'Wave cycles across lines',
    },
  },

  randomize: {
    amplitude: [0.1, 0.4],
    speed: [0.1, 0.5],
    waves: [1, 2, 3, 4] as const,
  },

  create: ({ amplitude, speed, waves }) => ({
    name: 'oscillate',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * waves;
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  }),
});
