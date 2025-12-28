// CounterFlow mapper - two waves flowing in opposite directions

import { registerMapper } from '../../core/registry';

export const counterFlow = registerMapper({
  id: 18,
  name: 'counterFlow',
  category: 'harmonic',
  description: 'Two waves flowing in opposite directions',

  params: {
    speed: {
      type: 'smallUnit',
      default: 0.3,
      min: 0.05,
      max: 1,
      step: 0.05,
      description: 'Flow speed',
    },
    frequency: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 6,
      step: 1,
      description: 'Wave frequency',
    },
  },

  randomize: {
    speed: [0.1, 0.6],
    frequency: [1, 4],
  },

  create: ({ speed, frequency }) => (ctx) => {
    const phase = ctx.time * speed;
    const wave1 = Math.sin((ctx.t + phase) * Math.PI * 2 * frequency);
    const wave2 = Math.sin((ctx.t - phase) * Math.PI * 2 * frequency);
    return ((wave1 + wave2) / 2 + 1) / 2;
  },
});
