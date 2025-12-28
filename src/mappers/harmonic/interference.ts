// Interference mapper - two waves at different frequencies

import { registerMapper } from '../../core/registry';

export const interference = registerMapper({
  id: 15,
  name: 'interference',
  category: 'harmonic',
  description: 'Two waves at different frequencies (helix with ratio=1.5, phase=0.5)',

  params: {
    ratio: {
      type: 'ratio3',
      default: 1.5,
      min: 1,
      max: 3,
      step: 0.1,
      description: 'Frequency ratio of second wave',
    },
    phase: {
      type: 'unit',
      default: 0,
      min: 0,
      max: 1,
      step: 0.05,
      description: 'Phase offset of second wave',
    },
  },

  randomize: {
    ratio: [1.2, 2.5],
    phase: [0, 1],
  },

  create: ({ ratio, phase }) => (ctx) => {
    const w1 = Math.sin(ctx.t * Math.PI * 2);
    const w2 = Math.sin((ctx.t + phase) * Math.PI * 2 * ratio);
    return ((w1 + w2) / 2 + 1) / 2;
  },
});
