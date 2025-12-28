// Flicker mapper - organic random-ish variation (like fire)

import { registerMapper } from '../../core/registry';

export const flicker = registerMapper({
  id: 13,
  name: 'flicker',
  category: 'noise',
  description: 'Organic random-ish variation (like fire)',

  params: {
    speed: {
      type: 'smallInt',
      default: 5,
      min: 1,
      max: 15,
      step: 1,
      description: 'Flicker speed',
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
    speed: [3, 10],
    intensity: [0.1, 0.3],
  },

  create: ({ speed, intensity }) => (ctx) => {
    const base = ctx.t;
    const f1 = Math.sin(ctx.time * speed + ctx.index * 0.3);
    const f2 = Math.sin(ctx.time * speed * 1.7 + ctx.index * 0.7);
    const flickerVal = (f1 * 0.6 + f2 * 0.4) * intensity;
    return Math.max(0, Math.min(1, base + flickerVal));
  },
});
