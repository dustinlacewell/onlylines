// RotationalSymmetry placer - N-fold rotational symmetry

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const rotationalSymmetry = registerPlacer({
  id: 13,
  name: 'rotationalSymmetry',
  category: 'symmetry',
  description: 'N-fold rotational symmetry',

  params: {
    folds: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 8,
      description: 'Number of symmetry folds',
    },
  },

  randomize: {
    folds: [2, 3, 4, 5, 6, 8] as const,
  },

  create: (count, options, { folds }) => {
    const speed = options.speed ?? rand(0.05, 0.15);
    const width = options.lineWidth ?? 1;
    const linesPerFold = Math.floor(count / folds);
    const lines: ReturnType<typeof makeLine>[] = [];
    const dir = pick([-1, 1]);

    const basePattern: Array<{ offset: number; reach: number }> = [];
    for (let i = 0; i < linesPerFold; i++) {
      const t = (i + 0.5) / linesPerFold;
      basePattern.push({
        offset: t * (4 / folds) * 0.9,
        reach: 1 + t * 0.8,
      });
    }

    for (let fold = 0; fold < folds; fold++) {
      const foldOffset = (fold / folds) * 4;
      for (const p of basePattern) {
        if (lines.length >= count) break;
        lines.push(makeLine(foldOffset + p.offset, foldOffset + p.offset + p.reach, speed, dir, width));
      }
    }
    return lines;
  },
});
