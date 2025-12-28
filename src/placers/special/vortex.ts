// Vortex placer - Whirlpool/vortex pattern

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const vortex = registerPlacer({
  id: 33,
  name: 'vortex',
  category: 'special',
  description: 'Whirlpool/vortex pattern (sucking spiral effect)',

  params: {
    tightness: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 3,
      description: 'How tight the spiral is',
    },
  },

  randomize: {
    tightness: [1, 3],
  },

  create: (count, options, { tightness }) => {
    const speed = options.speed ?? rand(0.15, 0.3);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const angle = t * tightness * 4;
      const reach = 0.2 + t * 1.5;
      return makeLine(angle, angle + reach, speed * (1 - t * 0.5), dir, width);
    });
  },
});
