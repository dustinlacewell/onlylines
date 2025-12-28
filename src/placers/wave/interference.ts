// Interference placer - Two interfering sine waves creating beat pattern

import { registerPlacer } from '../../core/registry';
import { rand, pick, TAU } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const interference = registerPlacer({
  id: 11,
  name: 'interference',
  category: 'wave',
  description: 'Two interfering sine waves creating beat pattern',

  params: {
    freq1: {
      type: 'smallInt',
      default: 3,
      min: 2,
      max: 4,
      description: 'First frequency',
    },
    freq2: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 4,
      description: 'Second frequency',
    },
  },

  randomize: {
    freq1: [2, 3, 4] as const,
    freq2: [3, 4, 5] as const,
  },

  create: (count, options, { freq1, freq2 }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const angle = t * 4;
      const wave1 = Math.sin(t * freq1 * TAU) * 0.4;
      const wave2 = Math.sin(t * freq2 * TAU) * 0.3;
      const combined = wave1 + wave2;
      return makeLine(angle, angle + 2 + combined, speed, dir, width);
    });
  },
});
