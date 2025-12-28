import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * StarBurst - Star pattern with alternating line lengths
 *
 * Creates a star burst where lines alternate between different lengths,
 * creating visual variety and depth.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.2)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const starBurst = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.2);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);
  const offset = rand(0, 4);
  const lengths = [2, 1.8, 1.5, 1.2];

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 4 + offset;
    const len = lengths[i % lengths.length];
    return makeLine(angle, angle + len, speed, dir, width);
  });
};
