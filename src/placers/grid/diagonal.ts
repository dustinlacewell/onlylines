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

    // Perimeter: 0-1 top (L→R), 1-2 right (T→B), 2-3 bottom (R→L), 3-4 left (B→T)
    //
    // For TL→BR diagonals:
    //   First half:  epA: 1→2 (top-right to right-bottom), epB: 2→1 (bottom-right to top-right) - OPPOSITE
    //   Second half: epA: 4→3 (left-top to left-bottom), epB: 2→3 (bottom-right to bottom-left)

    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const d = t * 2;  // 0 to 2

      if (direction > 0) {
        // TL→BR diagonals
        // Sweep from TR corner to BL corner (continuous indexing)
        // First half (reversed): A: 1→0, B: 1→2 (diverge from TR corner)
        // Second half: A: 4→3, B: 2→3 (approach BL corner)
        let p0: number, p1: number;

        if (d < 1) {
          p0 = 1 - d;          // 1→0
          p1 = 1 + d;          // 1→2
        } else {
          const s = d - 1;
          p0 = 4 - s;          // 4→3
          p1 = 2 + s;          // 2→3
        }

        return makeLine(p0, p1, speed, dir, width);
      } else {
        // TR→BL diagonals (mirror)
        // Sweep from TL corner to BR corner (continuous indexing)
        // First half (reversed): A: 0→1, B: 4→3 (diverge from TL corner)
        // Second half: A: 1→2, B: 3→2 (approach BR corner)
        let p0: number, p1: number;

        if (d < 1) {
          p0 = d;              // 0→1
          p1 = 4 - d;          // 4→3
        } else {
          const s = d - 1;
          p0 = 1 + s;          // 1→2
          p1 = 3 - s;          // 3→2
        }

        return makeLine(p0, p1, speed, dir, width);
      }
    });
  },
});
