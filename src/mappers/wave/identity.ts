// Identity mapper - pass through t directly

import { registerMapper } from '../../core/registry';

export const identity = registerMapper({
  id: 0,
  name: 'identity',
  category: 'wave',
  description: 'Pass through t directly',

  params: {},

  create: () => (ctx) => ctx.t,
});
