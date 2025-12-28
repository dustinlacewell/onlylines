import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Vortex - Whirlpool/vortex pattern
 *
 * An expanding spiral where lines get longer toward the edge,
 * creating a sucking vortex effect.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.15-0.3)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.tightness - How tight the spiral is (default: 1-3)
 */
export const vortex = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.15, 0.3);
  const width = options.lineWidth ?? 1;
  const tightness = params.tightness !== undefined ? params.tightness : rand(1, 3);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * tightness * 4;
    const reach = 0.2 + t * 1.5;
    return makeLine(angle, angle + reach, speed * (1 - t * 0.5), dir, width);
  });
};
