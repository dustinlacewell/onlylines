// Rotate mover - endpoints travel around perimeter at constant speed

import { registerMover } from '../../core/registry';

export const rotate = registerMover({
  id: 0,
  name: 'rotate',
  category: 'transform',
  description: 'Endpoints travel around perimeter at constant speed',

  params: {
    speed: {
      type: 'speed',
      default: 0.1,
      min: 0.01,
      max: 1,
      description: 'Rotation speed',
    },
  },

  randomize: {
    speed: [0.05, 0.3],
  },

  create: ({ speed }) => ({
    name: 'rotate',
    getValue: (ctx) => {
      const delta = speed * ctx.line.dir0 * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  }),
});
