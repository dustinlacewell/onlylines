// ModularPattern placer - Modular arithmetic pattern (multiplication tables in circles)

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const modularPattern = registerPlacer({
  id: 23,
  name: 'modularPattern',
  category: 'mathematical',
  description: 'Modular arithmetic pattern (cardioid-like from number theory)',

  params: {
    multiplier: {
      type: 'smallInt',
      default: 2,
      min: 2,
      max: 13,
      description: 'Multiplication factor',
    },
  },

  randomize: {
    multiplier: [2, 3, 5, 7, 11, 13] as const,
  },

  create: (count, options, { multiplier }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const modulus = count;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const p0 = (i / count) * 4;
      const target = (i * multiplier) % modulus;
      const p1 = (target / count) * 4;
      return {
        perim0: mod(p0, 4),
        perim1: mod(p1, 4),
        speed0: speed,
        speed1: speed,
        dir0: dir,
        dir1: dir,
        lineWidth: width,
      };
    });
  },
});
