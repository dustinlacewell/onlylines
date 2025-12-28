import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Hypocycloid - Circle rolling inside another circle (spirograph inner)
 *
 * Creates beautiful star-like and geometric patterns.
 *
 * Famous patterns:
 * - R/r = 3: Deltoid (triangular)
 * - R/r = 4: Astroid (4-pointed star)
 * - R/r = 5: 5-pointed star
 * - R/r = 6: 6-pointed star (hexagram-like)
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.points - Number of points/cusps (default: 3-8)
 */
export const hypocycloid = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  // points = R/r ratio, determines number of cusps
  const points = params.points !== undefined ? Math.round(params.points) : pick([3, 4, 5, 6, 7, 8]);
  const dir = pick([-1, 1]);

  // R = outer circle radius (fixed), r = rolling circle radius
  const R = 1;
  const r = R / points;

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU; // One full rotation of the rolling circle

    // Hypocycloid parametric equations
    const x = (R - r) * Math.cos(t) + r * Math.cos((R - r) / r * t);
    const y = (R - r) * Math.sin(t) - r * Math.sin((R - r) / r * t);

    // Convert to perimeter position
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const magnitude = Math.sqrt(x * x + y * y) / R; // Normalize to 0-1
    const reach = 0.6 + magnitude * 1.4;

    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
