// Diagonal placer - Diagonal lines at 45 degrees

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const diagonal = registerPlacer({
  id: 17,
  name: 'diagonal',
  category: 'grid',
  description: 'Diagonal lines at 45 degrees',

  params: {
    direction: {
      type: 'signedUnit',
      default: 1,
      min: -1,
      max: 1,
      description: '1 for TL→BR, -1 for TR→BL',
    },
  },

  randomize: {
    direction: [-1, 1] as const,
  },

  create: (count, options, { direction }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;

      if (direction > 0) {
        const startT = t * 2;
        const p0 = startT < 1
          ? 3 + (1 - startT)
          : startT - 1;
        const p1 = startT < 1
          ? 2 + startT
          : 1 + (startT - 1);
        return makeLine(p0, p1, speed, dir, width);
      } else {
        const startT = t * 2;
        const p0 = startT < 1
          ? startT
          : 1 + (startT - 1);
        const p1 = startT < 1
          ? 3 + (1 - startT)
          : 2 + startT;
        return makeLine(p0, p1, speed, dir, width);
      }
    });
  },
});
