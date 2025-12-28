import { rand, pick, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Interference - Two interfering sine waves creating beat pattern
 *
 * Two waves at different frequencies create constructive and
 * destructive interference patterns.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.freq1 - First frequency (default: 2-4)
 * @param params.freq2 - Second frequency (default: freq1 + 1-2)
 */
export const interference = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const freq1 = params.freq1 !== undefined ? Math.round(params.freq1) : pick([2, 3, 4]);
  const freq2 = params.freq2 !== undefined ? Math.round(params.freq2) : freq1 + pick([1, 2]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const wave1 = Math.sin(t * freq1 * TAU) * 0.4;
    const wave2 = Math.sin(t * freq2 * TAU) * 0.3;
    const combined = wave1 + wave2;
    return makeLine(angle, angle + 2 + combined, speed, dir, width);
  });
};
