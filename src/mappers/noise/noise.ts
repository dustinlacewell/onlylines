// Noise mapper - deterministic noise based on t and index

import { registerMapper } from '../../core/registry';

export const noise = registerMapper({
  id: 11,
  name: 'noise',
  category: 'noise',
  description: 'Deterministic noise based on t and index',

  params: {
    scale: {
      type: 'scale5',
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      description: 'Noise scale',
    },
  },

  randomize: {
    scale: [0.5, 3],
  },

  create: ({ scale }) => (ctx) => {
    const n = Math.sin(ctx.t * 47.3 * scale + ctx.index * 31.7) *
              Math.cos(ctx.t * 31.7 * scale - ctx.index * 47.3);
    return (n + 1) / 2;
  },
});
