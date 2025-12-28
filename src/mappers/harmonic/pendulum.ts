// Pendulum mapper - oscillation that slows at extremes

import { registerMapper } from '../../core/registry';

export const pendulum = registerMapper({
  id: 16,
  name: 'pendulum',
  category: 'harmonic',
  description: 'Oscillation that slows at extremes',

  params: {},

  create: () => (ctx) => {
    const swing = Math.sin(ctx.t * Math.PI * 2);
    return (Math.cos(swing * Math.PI / 2) + 1) / 2;
  },
});
