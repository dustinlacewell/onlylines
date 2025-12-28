// Parallel placer - Parallel lines at any angle

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const parallel = registerPlacer({
  id: 18,
  name: 'parallel',
  category: 'grid',
  description: 'Parallel lines at any angle',

  params: {
    angle: {
      type: 'byte',
      default: 45,
      min: 0,
      max: 180,
      description: 'Angle in degrees (0=horizontal, 90=vertical)',
    },
  },

  randomize: {
    angle: [0, 30, 45, 60, 90, 120, 135, 150] as const,
  },

  create: (count, options, { angle }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const sweepStart = (angle / 90) % 4;
      const p0 = mod(sweepStart + t * 2, 4);
      const offset = 2;
      const p1 = mod(p0 + offset, 4);
      return makeLine(p0, p1, speed, dir, width);
    });
  },
});
