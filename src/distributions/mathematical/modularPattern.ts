import { rand, pick, mod } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';

/**
 * ModularPattern - Modular arithmetic pattern (multiplication tables in circles)
 *
 * Lines connect point i to point (i * multiplier) % count, creating
 * beautiful cardioid-like patterns based on number theory.
 *
 * @param count - Number of lines (also the modulus)
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.multiplier - Multiplication factor (default: prime < count)
 */
export const modularPattern = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const modulus = count;
  const validMultipliers = [2, 3, 5, 7, 11, 13].filter(m => m < count);
  const multiplier = params.multiplier !== undefined
    ? Math.round(params.multiplier)
    : pick(validMultipliers.length > 0 ? validMultipliers : [2]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const p0 = (i / count) * 4;
    const target = (i * multiplier) % modulus;
    const p1 = (target / count) * 4;
    return {
      perim0: mod(p0, 4),
      perim1: mod(p1, 4),
      speed0: speed,
      speed1: speed,
      dir0: dir,
      dir1: dir,
      lineWidth: width,
    };
  });
};
