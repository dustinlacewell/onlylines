import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Spiral - Classic expanding spiral pattern
 *
 * Lines are positioned along a spiral that expands from center outward.
 * Each line's reach increases with distance from center.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.1-0.2)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.turns - Number of spiral turns (default: random 2-5)
 */
export const spiral = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.1, 0.2);
  const width = options.lineWidth ?? 1;
  const turns = params.turns !== undefined ? params.turns : rand(2, 5);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * turns * 4;
    const reach = 0.3 + t * 1.5;
    return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
  });
};
