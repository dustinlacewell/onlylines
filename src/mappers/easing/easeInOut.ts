// EaseInOut mapper - slow start and end

import { registerMapper } from '../../core/registry';

export const easeInOut = registerMapper({
  id: 10,
  name: 'easeInOut',
  category: 'easing',
  description: 'Slow start and end',

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

  create: ({ power }) => (ctx) =>
    ctx.t < 0.5
      ? Math.pow(ctx.t * 2, power) / 2
      : 1 - Math.pow((1 - ctx.t) * 2, power) / 2,
});
