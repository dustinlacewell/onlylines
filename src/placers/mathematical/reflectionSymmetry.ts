// ReflectionSymmetry placer - Lines with dihedral symmetry
// Creates patterns with n-fold rotational symmetry plus mirror lines

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const reflectionSymmetry = registerPlacer({
  id: 24,
  name: 'reflectionSymmetry',
  category: 'mathematical',
  description: 'Dihedral symmetry patterns (n-fold rotation + mirrors)',

  params: {
    folds: {
      type: 'smallInt',
      default: 4,
      min: 2,
      max: 8,
      description: 'Number of symmetry folds',
    },
    mirror: {
      type: 'bool',
      default: 1,
      description: 'Include mirror reflections (0=off, 1=on)',
    },
  },

  randomize: {
    folds: [2, 3, 4, 5, 6, 8] as const,
    mirror: [0, 1] as const,
  },

  create: (count, options, { folds, mirror }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    // How many unique lines we need before symmetry copies them
    const multiplier = mirror ? folds * 2 : folds;
    const uniqueLines = Math.ceil(count / multiplier);
    const sectorSize = 4 / folds;

    const lines: Array<{
      perim0: number;
      perim1: number;
      speed0: number;
      speed1: number;
      dir0: number;
      dir1: number;
      lineWidth: number;
    }> = [];

    // Generate unique lines within the first sector
    for (let i = 0; i < uniqueLines; i++) {
      const t = i / uniqueLines;
      // p0 stays in first half of sector, p1 can reach further
      const p0Base = t * sectorSize * 0.4;
      const p1Base = p0Base + 0.3 + t * 1.2;

      // Apply symmetry transformations
      for (let fold = 0; fold < folds; fold++) {
        const rotation = fold * sectorSize;

        // Rotated copy
        const p0Rot = p0Base + rotation + offset;
        const p1Rot = p1Base + rotation + offset;

        lines.push({
          perim0: mod(p0Rot, 4),
          perim1: mod(p1Rot, 4),
          speed0: speed,
          speed1: speed,
          dir0: dir,
          dir1: dir,
          lineWidth: width,
        });

        if (lines.length >= count) break;

        // Mirror copy (reflect within sector)
        if (mirror) {
          const mirrorAxis = rotation + sectorSize / 2;
          const p0Mirror = 2 * mirrorAxis - p0Rot;
          const p1Mirror = 2 * mirrorAxis - p1Rot;

          lines.push({
            perim0: mod(p0Mirror + offset, 4),
            perim1: mod(p1Mirror + offset, 4),
            speed0: speed,
            speed1: speed,
            dir0: dir,
            dir1: dir,
            lineWidth: width,
          });

          if (lines.length >= count) break;
        }
      }

      if (lines.length >= count) break;
    }

    return lines.slice(0, count);
  },
});