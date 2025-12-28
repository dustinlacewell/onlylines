// EaseOut mapper - fast start, slow end

import { registerMapper } from '../../core/registry';

export const easeOut = registerMapper({
  id: 9,
  name: 'easeOut',
  category: 'easing',
  description: 'Fast start, slow end',

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

  create: ({ power }) => (ctx) => 1 - Math.pow(1 - ctx.t, power),
});
