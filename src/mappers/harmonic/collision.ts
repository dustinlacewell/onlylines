// Collision mapper - bands that push against each other from edges

import { registerMapper } from '../../core/registry';

export const collision = registerMapper({
  id: 19,
  name: 'collision',
  category: 'harmonic',
  description: 'Bands that push against each other from edges',

  params: {
    speed: {
      type: 'smallUnit',
      default: 0.3,
      min: 0.05,
      max: 0.8,
      step: 0.05,
      description: 'Collision speed',
    },
    sharpness: {
      type: 'smallInt',
      default: 4,
      min: 1,
      max: 10,
      step: 1,
      description: 'Edge sharpness',
    },
  },

  randomize: {
    speed: [0.1, 0.5],
    sharpness: [2, 8],
  },

  create: ({ speed, sharpness }) => (ctx) => {
    const phase = (Math.sin(ctx.time * speed * Math.PI * 2) + 1) / 2;
    const meetPoint = 0.5;
    const leftFront = phase * meetPoint;
    const rightFront = 1 - phase * meetPoint;
    const leftValue = 1 / (1 + Math.exp(-sharpness * (ctx.t - leftFront) * 10));
    const rightValue = 1 / (1 + Math.exp(-sharpness * (rightFront - ctx.t) * 10));
    return leftValue * rightValue;
  },
});
