// Spot mapper - Gaussian falloff from focus point

import { registerMapper } from '../../core/registry';

export const spot = registerMapper({
  id: 6,
  name: 'spot',
  category: 'pulse',
  description: 'Gaussian falloff from focus point',

  params: {
    width: {
      type: 'smallUnit',
      default: 0.15,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Spot width',
    },
  },

  randomize: {
    width: [0.1, 0.3],
  },

  create: ({ width }) => (ctx) => Math.exp(-Math.pow(ctx.t / width, 2)),
});
