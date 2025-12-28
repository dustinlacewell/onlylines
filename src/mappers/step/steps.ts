// Steps mapper - discrete steps across t range

import { registerMapper } from '../../core/registry';

export const steps = registerMapper({
  id: 20,
  name: 'steps',
  category: 'step',
  description: 'Discrete steps across t range',

  params: {
    numSteps: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 10,
      step: 1,
      description: 'Number of steps',
    },
  },

  randomize: {
    numSteps: [3, 8],
  },

  create: ({ numSteps }) => (ctx) =>
    Math.floor(ctx.t * numSteps) / Math.max(1, numSteps - 1),
});
