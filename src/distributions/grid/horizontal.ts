import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Horizontal - Simple horizontal lines spanning the canvas
 *
 * Lines run from left edge to right edge, evenly distributed
 * vertically.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const horizontal = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);

  // Perimeter: 0=top-left corner, 1=top-right, 2=bottom-right, 3=bottom-left
  // Horizontal lines: left edge (3 to 4/0) to right edge (1 to 2)
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    // Left edge position: 3 + t (going down the left side)
    const p0 = 3 + t;
    // Right edge position: 1 + (1-t) (going up the right side to match)
    const p1 = 1 + (1 - t);
    return makeLine(p0, p1, speed, dir, width);
  });
};
