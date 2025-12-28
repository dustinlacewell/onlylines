// WaveInterference mover - two frequencies creating beating patterns

import { registerMover } from '../../core/registry';
import { TAU } from '../../utils';

export const waveInterference = registerMover({
  id: 4,
  name: 'waveInterference',
  category: 'wave',
  description: 'Two frequencies creating beating/interference patterns',

  params: {
    freq1: {
      type: 'speed',
      default: 0.2,
      min: 0.1,
      max: 0.5,
      description: 'First frequency',
    },
    freq2: {
      type: 'speed',
      default: 0.3,
      min: 0.1,
      max: 0.5,
      description: 'Second frequency',
    },
    amplitude: {
      type: 'unit',
      default: 0.3,
      min: 0.1,
      max: 0.5,
      description: 'Wave amplitude',
    },
  },

  randomize: {
    freq1: [0.1, 0.4],
    freq2: [0.15, 0.5],
    amplitude: [0.2, 0.4],
  },

  create: ({ freq1, freq2, amplitude }) => ({
    name: 'waveInterference',
    getValue: (ctx) => {
      const pos = ctx.index / ctx.total;
      const vel1 = Math.cos(ctx.time * freq1 * TAU + pos * TAU * 2) * freq1 * TAU;
      const vel2 = Math.cos(ctx.time * freq2 * TAU + pos * TAU * 3) * freq2 * TAU;
      const velocity = (vel1 + vel2) / 2 * amplitude;
      const delta = velocity * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  }),
});
