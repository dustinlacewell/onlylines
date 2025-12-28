// Bands mapper - alternating high/low bands

import { registerMapper } from '../../core/registry';

export const bands = registerMapper({
  id: 21,
  name: 'bands',
  category: 'step',
  description: 'Alternating high/low bands',

  params: {
    numBands: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 10,
      step: 1,
      description: 'Number of bands',
    },
  },

  randomize: {
    numBands: [3, 8],
  },

  create: ({ numBands }) => (ctx) => Math.floor(ctx.t * numBands) % 2,
});
