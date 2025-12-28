import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Spirograph - Classic spirograph toy pattern (epitrochoid/hypotrochoid)
 *
 * Simulates the patterns created by a spirograph toy - a smaller
 * circle rolling inside or outside a larger circle with a pen
 * at a variable distance from the rolling circle's center.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.R - Outer circle radius ratio (default: 3-8)
 * @param params.r - Inner circle radius ratio (default: 1-3)
 * @param params.d - Pen distance from center (default: 0.5-1.5)
 */
export const spirograph = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const R = params.R !== undefined ? params.R : pick([3, 4, 5, 6, 7, 8]);
  const r = params.r !== undefined ? params.r : pick([1, 1.5, 2, 2.5, 3].filter(x => x < R));
  const d = params.d !== undefined ? params.d : rand(0.5, 1.5);
  const dir = pick([-1, 1]);

  // Calculate how many rotations needed for pattern to close
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (R * r) / gcd(Math.round(R), Math.round(r));
  const rotations = lcm / R;

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU * Math.min(rotations, 10); // Cap at 10 rotations

    // Hypotrochoid equations (inner rolling)
    const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);

    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const maxRadius = R - r + d;
    const magnitude = Math.sqrt(x * x + y * y) / maxRadius;
    const reach = 0.6 + magnitude * 1.4;

    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
