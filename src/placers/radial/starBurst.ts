// StarBurst placer - Star pattern with alternating line lengths

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const starBurst = registerPlacer({
  id: 1,
  name: 'starBurst',
  category: 'radial',
  description: 'Star pattern with alternating line lengths',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.08, 0.2);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);
    const lengths = [2, 1.8, 1.5, 1.2];

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 4 + offset;
      const len = lengths[i % lengths.length];
      return makeLine(angle, angle + len, speed, dir, width);
    });
  },
});
