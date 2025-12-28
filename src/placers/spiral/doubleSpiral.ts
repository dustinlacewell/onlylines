// DoubleSpiral placer - Two interleaved spiral arms

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const doubleSpiral = registerPlacer({
  id: 6,
  name: 'doubleSpiral',
  category: 'spiral',
  description: 'Two interleaved spiral arms',

  params: {
    turns: {
      type: 'smallInt',
      default: 2,
      min: 2,
      max: 5,
      description: 'Number of spiral turns (stored as 2-5, represents 1.5-3)',
    },
  },

  randomize: {
    turns: [2, 3],
  },

  create: (count, options, { turns }) => {
    const speed = options.speed ?? rand(0.1, 0.2);
    const width = options.lineWidth ?? 1;
    // Scale turns from stored 2-5 to actual 1.5-3
    const actualTurns = 1.5 + (turns - 2) * 0.5;

    return Array.from({ length: count }, (_, i) => {
      const arm = i % 2;
      const idx = Math.floor(i / 2);
      const t = idx / (count / 2);
      const angle = t * actualTurns * 4 + arm * 2;
      const reach = 0.3 + t * 1.2;
      const dir = arm === 0 ? 1 : -1;
      return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
    });
  },
});
