// WavePacket mapper - localized oscillation that fades at edges

import { registerMapper } from '../../core/registry';

export const wavePacket = registerMapper({
  id: 17,
  name: 'wavePacket',
  category: 'harmonic',
  description: 'Localized oscillation that fades at edges',

  params: {
    frequency: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      description: 'Oscillation frequency',
    },
    width: {
      type: 'unit',
      default: 0.4,
      min: 0.1,
      max: 0.8,
      step: 0.1,
      description: 'Packet width',
    },
    center: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.1,
      description: 'Packet center',
    },
  },

  randomize: {
    frequency: [2, 6],
    width: [0.2, 0.6],
    center: [0.3, 0.7],
  },

  create: ({ frequency, width, center }) => (ctx) => {
    const envelope = Math.exp(-Math.pow((ctx.t - center) / width, 2));
    const oscillation = (Math.sin(ctx.t * Math.PI * 2 * frequency) + 1) / 2;
    return 0.5 + (oscillation - 0.5) * envelope;
  },
});
