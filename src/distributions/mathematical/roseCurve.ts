import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * RoseCurve - Rose/rhodonea curves (polar equation r = cos(k*θ))
 *
 * Creates k-petal rose patterns. When k is odd, the rose has k petals.
 * When k is even, the rose has 2k petals.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.k - Petal count parameter (default: 2-7)
 */
export const roseCurve = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const k = params.k !== undefined ? Math.round(params.k) : pick([2, 3, 4, 5, 6, 7]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const theta = (i / count) * TAU;
    const r = Math.cos(k * theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const reach = 0.8 + Math.abs(r) * 1.2;
    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
