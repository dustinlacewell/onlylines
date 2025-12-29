// StringArt placer - Classic string art parabola envelopes
//
// String art creates parabolic envelope curves by connecting evenly spaced points
// on two edges. As i increases, p0 moves forward along one edge while p1 moves
// backward along an adjacent edge. The crossing pattern creates a parabolic curve.
//
// With multiple segments, we can create star-like patterns with parabolas in each corner.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const stringArt = registerPlacer({
  id: 35,
  name: 'stringArt',
  category: 'mathematical',
  description: 'Classic string art parabola envelopes',

  params: {
    corners: {
      type: 'smallInt',
      default: 4,
      min: 1,
      max: 4,
      description: 'Number of corners with parabolas (1-4)',
    },
    curvature: {
      type: 'unit',
      default: 0.5,
      min: 0.1,
      max: 0.9,
      description: 'How much of each edge to use (affects curve tightness)',
    },
  },

  randomize: {
    corners: [1, 2, 3, 4] as const,
    curvature: [0.3, 0.7],
  },

  create: (count, options, { corners, curvature }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    const linesPerCorner = Math.floor(count / corners);
    const lines: Array<{
      perim0: number;
      perim1: number;
      speed0: number;
      speed1: number;
      dir0: number;
      dir1: number;
      lineWidth: number;
    }> = [];

    for (let corner = 0; corner < corners; corner++) {
      // Each corner spans from cornerStart to cornerStart + 1 (one edge)
      // and connects to the next edge (cornerStart + 1 to cornerStart + 2)
      const cornerStart = corner;

      for (let i = 0; i < linesPerCorner; i++) {
        const t = i / linesPerCorner;

        // p0 moves forward along first edge (toward the corner)
        // p1 moves backward along second edge (away from the corner)
        // The crossing creates the parabola envelope
        const p0 = cornerStart + (1 - curvature) + t * curvature;
        const p1 = cornerStart + 1 + (1 - t) * curvature;

        lines.push({
          perim0: mod(p0, 4),
          perim1: mod(p1, 4),
          speed0: speed,
          speed1: speed,
          dir0: dir,
          dir1: dir,
          lineWidth: width,
        });
      }
    }

    return lines;
  },
});
