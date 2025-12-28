// Sine mapper - smooth sine wave oscillation

import { registerMapper } from '../../core/registry';

export const sine = registerMapper({
  id: 1,
  name: 'sine',
  category: 'wave',
  description: 'Smooth sine wave oscillation',

  params: {
    frequency: {
      type: 'frequency',
      default: 1,
      min: 0.1,
      max: 10,
      step: 0.1,
      description: 'Number of cycles',
    },
    phase: {
      type: 'unit',
      default: 0,
      min: 0,
      max: 1,
      step: 0.05,
      description: 'Phase offset (0.25 = cosine)',
    },
  },

  randomize: {
    frequency: [0.5, 4],
    phase: [0, 1],
  },

  create: ({ frequency, phase }) => (ctx) =>
    (Math.sin((ctx.t + phase) * Math.PI * 2 * frequency) + 1) / 2,
});
