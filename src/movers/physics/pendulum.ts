// Pendulum mover - physical pendulum motion with gravity (perpetual swinging)

import { registerMover } from '../../core/registry';

export const pendulum = registerMover({
  id: 6,
  name: 'pendulum',
  category: 'physics',
  description: 'Physical pendulum motion with perpetual swinging',

  params: {
    length: {
      type: 'unit',
      default: 0.5,
      min: 0.1,
      max: 1,
      description: 'Pendulum length (affects period)',
    },
    gravity: {
      type: 'speed',
      default: 0.3,
      min: 0.01,
      max: 1,
      description: 'Gravity strength',
    },
    phaseSpread: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      description: 'Phase distribution across lines',
    },
  },

  randomize: {
    length: [0.3, 0.8],
    gravity: [0.2, 0.5],
    phaseSpread: [0.2, 0.8],
  },

  create: ({ length, gravity, phaseSpread }) => {
    const angles: number[] = [];
    const angularVels: number[] = [];

    return {
      name: 'pendulum',
      getValue: (ctx) => {
        if (angles[ctx.index] === undefined) {
          const baseAngle = ((ctx.index / ctx.total) - 0.5) * Math.PI * 0.8;
          angles[ctx.index] = baseAngle * phaseSpread;
          angularVels[ctx.index] = Math.sqrt(gravity / length) * 0.5 * (1 - 2 * (ctx.index % 2));
        }

        const angularAccel = -gravity / length * Math.sin(angles[ctx.index]);
        angularVels[ctx.index] += angularAccel * ctx.dt;
        angles[ctx.index] += angularVels[ctx.index] * ctx.dt;

        const delta = angularVels[ctx.index] * length * ctx.dt * 0.3;
        return { delta0: delta, delta1: delta };
      },
    };
  },
});
