import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Star - Perfect star burst radiating from center
 *
 * Creates evenly-spaced lines all emanating from the center,
 * each line spanning half the perimeter (reach = 2).
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.2)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const star = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.2);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);
  const offset = rand(0, 4);

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 4 + offset;
    return makeLine(angle, angle + 2, speed, dir, width);
  });
};
