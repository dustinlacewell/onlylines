import { rand } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * DoubleSpiral - Two interleaved spiral arms
 *
 * Creates two spiral arms that interweave, with alternating
 * direction for visual contrast.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.1-0.2)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.turns - Number of spiral turns (default: random 1.5-3)
 */
export const doubleSpiral = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.1, 0.2);
  const width = options.lineWidth ?? 1;
  const turns = params.turns !== undefined ? params.turns : rand(1.5, 3);

  return Array.from({ length: count }, (_, i) => {
    const arm = i % 2;
    const idx = Math.floor(i / 2);
    const t = idx / (count / 2);
    const angle = t * turns * 4 + arm * 2;
    const reach = 0.3 + t * 1.2;
    const dir = arm === 0 ? 1 : -1;
    return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
  });
};
