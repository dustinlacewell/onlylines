// Shimmer mapper - high frequency subtle variation

import { registerMapper } from '../../core/registry';

export const shimmer = registerMapper({
  id: 12,
  name: 'shimmer',
  category: 'noise',
  description: 'High frequency subtle variation',

  params: {
    frequency: {
      type: 'smallInt',
      default: 8,
      min: 1,
      max: 16,
      step: 1,
      description: 'Shimmer frequency',
    },
    intensity: {
      type: 'smallUnit',
      default: 0.2,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Variation amount',
    },
  },

  randomize: {
    frequency: [4, 12],
    intensity: [0.1, 0.3],
  },

  create: ({ frequency, intensity }) => (ctx) => {
    const base = ctx.t;
    const variation = Math.sin(ctx.time * frequency + ctx.index * 0.5) * intensity;
    return Math.max(0, Math.min(1, base + variation));
  },
});
