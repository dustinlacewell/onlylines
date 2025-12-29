// Spiral placer - Classic expanding spiral pattern

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const spiral = registerPlacer({
  id: 5,
  name: 'spiral',
  category: 'spiral',
  description: 'Classic expanding spiral pattern',

  params: {
    turns: {
      type: 'smallInt',
      default: 3,
      min: 2,
      max: 5,
      description: 'Number of spiral turns',
    },
  },

  randomize: {
    turns: [2, 5],
  },

  create: (count, options, { turns }) => {
    const speed = options.speed ?? rand(0.1, 0.2);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const angle = t * turns * 4;
      const reach = 0.3 + t * 1.5;
      return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
    });
  },
});
