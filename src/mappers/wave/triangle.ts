// Triangle mapper - linear ramp up and down

import { registerMapper } from '../../core/registry';

export const triangle = registerMapper({
  id: 2,
  name: 'triangle',
  category: 'wave',
  description: 'Linear ramp up and down',

  params: {},

  create: () => (ctx) => ctx.t < 0.5 ? ctx.t * 2 : 2 - ctx.t * 2,
});
