// Harmonic mapper - multiple sine frequencies combined

import { registerMapper } from '../../core/registry';

export const harmonic = registerMapper({
  id: 14,
  name: 'harmonic',
  category: 'harmonic',
  description: 'Multiple sine frequencies combined',

  params: {
    harmonics: {
      type: 'smallInt',
      default: 3,
      min: 2,
      max: 5,
      step: 1,
      description: 'Number of harmonics',
    },
  },

  randomize: {
    harmonics: [2, 5],
  },

  create: ({ harmonics }) => (ctx) => {
    let sum = 0;
    let weight = 0;
    for (let i = 0; i < harmonics; i++) {
      const amp = 1 / (i + 1);
      sum += Math.sin(ctx.t * Math.PI * 2 * (i + 1)) * amp;
      weight += amp;
    }
    return (sum / weight + 1) / 2;
  },
});
