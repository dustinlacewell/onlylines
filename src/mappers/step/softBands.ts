// SoftBands mapper - smooth undulating bands with soft transitions

import { registerMapper } from '../../core/registry';

export const softBands = registerMapper({
  id: 22,
  name: 'softBands',
  category: 'step',
  description: 'Smooth undulating bands with soft transitions',

  params: {
    numBands: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 10,
      step: 1,
      description: 'Number of bands',
    },
    softness: {
      type: 'unit',
      default: 0.3,
      min: 0.1,
      max: 0.9,
      step: 0.1,
      description: 'Transition smoothness',
    },
  },

  randomize: {
    numBands: [3, 8],
    softness: [0.2, 0.7],
  },

  create: ({ numBands, softness }) => (ctx) => {
    const bandPhase = ctx.t * numBands * Math.PI;
    const raw = (Math.sin(bandPhase) + 1) / 2;
    return Math.pow(raw, 1 - softness * 0.8);
  },
});
