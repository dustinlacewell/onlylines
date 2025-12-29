// Vertical placer - Simple vertical lines spanning the canvas

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const vertical = registerPlacer({
  id: 16,
  name: 'vertical',
  category: 'grid',
  description: 'Simple vertical lines spanning the canvas',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const p0 = t;
      const p1 = 2 + (1 - t);
      return makeLine(p0, p1, speed, dir, width);
    });
  },
});
