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
    // For TL→BR diagonals, imagine sweeping a diagonal line from TL corner to BR corner.
    // The line always has one endpoint on the "TL edges" (top or left) and one on "BR edges" (bottom or right).
    //
    // As we sweep from t=0 to t=1:
    //   t=0:   TL corner - both endpoints at corner (left-top and right-bottom extremes)
    //   t=0.5: Line goes through center, connecting midpoints
    //   t=1:   BR corner - both endpoints at corner
    //
    // First half (t < 0.5): p0 on left edge, p1 on bottom edge
    // Second half (t >= 0.5): p0 on top edge, p1 on right edge

    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;

      if (direction > 0) {
        // TL→BR diagonals
        if (t < 0.5) {
          // First half: left edge → bottom edge
          const s = t * 2;  // 0→1
          const p0 = 4 - s;                // 4→3 (left edge, top→bottom)
          const p1 = 3 - s;                // 3→2 (bottom edge, left→right)
          return makeLine(p0, p1, speed, dir, width);
        } else {
          // Second half: top edge → right edge
          const s = (t - 0.5) * 2;  // 0→1
          const p0 = s;                    // 0→1 (top edge, left→right)
          const p1 = 1 + s;                // 1→2 (right edge, top→bottom)
          return makeLine(p0, p1, speed, dir, width);
        }
      } else {
        // TR→BL diagonals
        if (t < 0.5) {
          // First half: right edge → bottom edge
          const s = t * 2;  // 0→1
          const p0 = 1 + s;                // 1→2 (right edge, top→bottom)
          const p1 = 2 + s;                // 2→3 (bottom edge, right→left)
          return makeLine(p0, p1, speed, dir, width);
        } else {
          // Second half: top edge → left edge
          const s = (t - 0.5) * 2;  // 0→1
          const p0 = 1 - s;                // 1→0 (top edge, right→left)
          const p1 = 3 + s;                // 3→4 (left edge, top→bottom)
          return makeLine(p0, p1, speed, dir, width);
        }
      }
    });
  },
});
