// Pulse mover - periodic pulses creating rolling wave effects

import { registerMover } from '../../core/registry';
import { TAU } from '../../utils';

export const pulse = registerMover({
  id: 3,
  name: 'pulse',
  category: 'oscillation',
  description: 'Periodic pulses creating rolling wave effects',

  params: {
    strength: {
      type: 'smallUnit',
      default: 0.03,
      min: 0.01,
      max: 0.1,
      description: 'Pulse strength',
    },
    speed: {
      type: 'speed',
      default: 0.2,
      min: 0.01,
      max: 1,
      description: 'Pulse speed',
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
    strength: [0.02, 0.08],
    speed: [0.1, 0.4],
    phaseSpread: [0.2, 0.8],
  },

  create: ({ strength, speed, phaseSpread }) => ({
    name: 'pulse',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const t = (ctx.time * speed + phase) * TAU;
      const raw = Math.sin(t);
      const pulseVal = raw > 0 ? Math.pow(raw, 4) : 0;
      const v = pulseVal * strength;
      const delta = v * ctx.dt;
      return { delta0: delta * ctx.line.dir0, delta1: delta * ctx.line.dir1 };
    },
  }),
});
