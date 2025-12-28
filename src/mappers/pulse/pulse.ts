// Pulse mapper - Gaussian-like peak at adjustable center

import { registerMapper } from '../../core/registry';

export const pulse = registerMapper({
  id: 5,
  name: 'pulse',
  category: 'pulse',
  description: 'Gaussian-like peak at adjustable center',

  params: {
    center: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.05,
      description: 'Peak position',
    },
    width: {
      type: 'smallUnit',
      default: 0.2,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Peak width',
    },
    sharpness: {
      type: 'sharpness8',
      default: 2,
      min: 1,
      max: 8,
      description: 'Falloff sharpness',
    },
  },

  randomize: {
    center: [0.2, 0.8],
    width: [0.1, 0.4],
    sharpness: [1, 4],
  },

  create: ({ center, width, sharpness }) => (ctx) =>
    Math.exp(-Math.pow((ctx.t - center) / width, sharpness * 2)),
});
