// SpotLinear mapper - Linear falloff from focus point

import { registerMapper } from '../../core/registry';

export const spotLinear = registerMapper({
  id: 7,
  name: 'spotLinear',
  category: 'pulse',
  description: 'Linear falloff from focus point',

  params: {
    width: {
      type: 'smallUnit',
      default: 0.2,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Spot width',
    },
  },

  randomize: {
    width: [0.1, 0.4],
  },

  create: ({ width }) => (ctx) => Math.max(0, 1 - ctx.t / width),
});
