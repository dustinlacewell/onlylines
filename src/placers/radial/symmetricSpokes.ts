// SymmetricSpokes placer - Spokes with n-fold rotational symmetry
// Divides canvas into N symmetric sections, fills each with radial lines

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const symmetricSpokes = registerPlacer({
  id: 2,
  name: 'symmetricSpokes',
  category: 'radial',
  description: 'Spokes with n-fold rotational symmetry',

  params: {
    symmetry: {
      type: 'smallInt',
      default: 4,
      min: 3,
      max: 8,
      description: 'Number of symmetric sections',
    },
  },

  randomize: {
    symmetry: [3, 4, 5, 6, 8] as const,
  },

  create: (count, options, { symmetry }) => {
    const speed = options.speed ?? rand(0.05, 0.15);
    const width = options.lineWidth ?? 1;
    const spokesPerSection = Math.max(1, Math.floor(count / symmetry));
    const lines: ReturnType<typeof makeLine>[] = [];
    const dir = pick([-1, 1]);

    for (let s = 0; s < symmetry; s++) {
      const sectionStart = (s / symmetry) * 4;
      const sectionWidth = 4 / symmetry;

      for (let i = 0; i < spokesPerSection && lines.length < count; i++) {
        const t = (i + 0.5) / spokesPerSection;
        const angle = sectionStart + t * sectionWidth * 0.8;
        lines.push(makeLine(angle, angle + 2, speed, dir, width));
      }
    }
    return lines;
  },
});
