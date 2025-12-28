// EaseIn mapper - slow start, fast end

import { registerMapper } from '../../core/registry';

export const easeIn = registerMapper({
  id: 8,
  name: 'easeIn',
  category: 'easing',
  description: 'Slow start, fast end',

  params: {
    power: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 5,
      step: 0.5,
      description: 'Curve power',
    },
  },

  randomize: {
    power: [2, 4],
  },

  create: ({ power }) => (ctx) => Math.pow(ctx.t, power),
});
