// StandingWave placer - Standing wave with nodes pattern

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const standingWave = registerPlacer({
  id: 10,
  name: 'standingWave',
  category: 'wave',
  description: 'Standing wave with nodes pattern (like a vibrating string)',

  params: {
    nodes: {
      type: 'smallInt',
      default: 3,
      min: 2,
      max: 5,
      description: 'Number of nodes',
    },
  },

  randomize: {
    nodes: [2, 3, 4, 5] as const,
  },

  create: (count, options, { nodes }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const angle = t * 4;
      const envelope = Math.sin(t * nodes * Math.PI);
      const reach = 1.5 + Math.abs(envelope) * 0.8;
      return makeLine(angle, angle + reach, speed, dir, width);
    });
  },
});
