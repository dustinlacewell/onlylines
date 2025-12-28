import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Vertical - Simple vertical lines spanning the canvas
 *
 * Lines run from top edge to bottom edge, evenly distributed
 * horizontally.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const vertical = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);

  // Perimeter: 0=top-left corner, 1=top-right, 2=bottom-right, 3=bottom-left
  // Vertical lines: top edge (0 to 1) to bottom edge (2 to 3)
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    // Top edge position: 0 + t (going right along top)
    const p0 = t;
    // Bottom edge position: 2 + (1-t) (going left along bottom to match)
    const p1 = 2 + (1 - t);
    return makeLine(p0, p1, speed, dir, width);
  });
};
