import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Diagonal - Diagonal lines at 45 degrees
 *
 * Lines run diagonally across the canvas. Direction can be
 * top-left to bottom-right or top-right to bottom-left.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.direction - 1 for TL→BR, -1 for TR→BL (default: random)
 */
export const diagonal = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const direction = params.direction !== undefined ? params.direction : pick([-1, 1]);
  const dir = pick([-1, 1]);

  // Diagonals sweep across two adjacent edges
  // For TL→BR: start on top/left edges, end on bottom/right edges
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;

    if (direction > 0) {
      // Top-left to bottom-right diagonal
      // Start: sweep from left edge (at 3.5) to top edge (at 0.5)
      // End: sweep from bottom edge (at 2.5) to right edge (at 1.5)
      const startT = t * 2; // 0 to 2 range
      const p0 = startT < 1
        ? 3 + (1 - startT)  // Left edge, going up (3.5 to 4/0)
        : startT - 1;        // Top edge, going right (0 to 0.5)

      const p1 = startT < 1
        ? 2 + startT        // Bottom edge, going right (2 to 2.5)
        : 1 + (startT - 1); // Right edge, going down (1 to 1.5)

      return makeLine(p0, p1, speed, dir, width);
    } else {
      // Top-right to bottom-left diagonal
      const startT = t * 2;
      const p0 = startT < 1
        ? startT            // Top edge, going right (0 to 0.5)
        : 1 + (startT - 1); // Right edge, going down (1 to 1.5)

      const p1 = startT < 1
        ? 3 + (1 - startT)  // Left edge, going up (3.5 to 4)
        : 2 + startT;       // Bottom edge, going right (2.5 to 3)

      return makeLine(p0, p1, speed, dir, width);
    }
  });
};
