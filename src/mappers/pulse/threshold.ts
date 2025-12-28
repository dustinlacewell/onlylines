// Threshold mapper - binary on/off at cutoff point

import { registerMapper } from '../../core/registry';

export const threshold = registerMapper({
  id: 3,
  name: 'threshold',
  category: 'pulse',
  description: 'Binary on/off at cutoff point',

  params: {
    cutoff: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.05,
      description: 'Switch point',
    },
    invert: {
      type: 'bool',
      default: 0,
      description: 'Flip output',
    },
  },

  randomize: {
    cutoff: [0.2, 0.8],
    invert: [0, 1] as const,
  },

  create: ({ cutoff, invert }) => (ctx) => {
    const above = ctx.t >= cutoff ? 1 : 0;
    return invert ? 1 - above : above;
  },
});

// Alias for backward compatibility
export const step = threshold;
