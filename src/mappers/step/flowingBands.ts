// FlowingBands mapper - discrete bands that flow and morph

import { registerMapper } from '../../core/registry';

export const flowingBands = registerMapper({
  id: 23,
  name: 'flowingBands',
  category: 'step',
  description: 'Discrete bands that flow and morph',

  params: {
    numBands: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 8,
      step: 1,
      description: 'Number of bands',
    },
    speed: {
      type: 'smallUnit',
      default: 0.2,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Flow speed',
    },
    waveAmount: {
      type: 'smallUnit',
      default: 0.3,
      min: 0,
      max: 0.5,
      step: 0.1,
      description: 'Wave distortion amount',
    },
  },

  randomize: {
    numBands: [3, 6],
    speed: [0.1, 0.4],
    waveAmount: [0.1, 0.4],
  },

  create: ({ numBands, speed, waveAmount }) => (ctx) => {
    const waveOffset = Math.sin(ctx.time * speed * Math.PI * 2) * waveAmount;
    const distortedT = ctx.t + waveOffset * Math.sin(ctx.t * Math.PI * 2);
    const bandPhase = distortedT * numBands * Math.PI;
    return (Math.sin(bandPhase) + 1) / 2;
  },
});
