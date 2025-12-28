import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Epicycloid - Circle rolling outside another circle (spirograph outer)
 *
 * Creates beautiful gear-tooth and spirograph-like patterns.
 * The ratio R/r determines the number of cusps.
 *
 * Common patterns:
 * - R/r = 1: Cardioid (heart shape)
 * - R/r = 2: Nephroid (kidney shape)
 * - R/r = 3, 4, 5...: Multi-cusped patterns
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.cusps - Number of cusps/lobes (default: 3-7)
 */
export const epicycloid = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  // cusps = R/r ratio, determines number of pointed lobes
  const cusps = params.cusps !== undefined ? Math.round(params.cusps) : pick([3, 4, 5, 6, 7]);
  const dir = pick([-1, 1]);

  // R = outer circle radius (fixed), r = rolling circle radius
  // For cusps k: R = k * r, so R/r = k
  const R = 1;
  const r = R / cusps;

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU * cusps; // Full pattern requires cusps rotations

    // Epicycloid parametric equations
    const x = (R + r) * Math.cos(t) - r * Math.cos((R + r) / r * t);
    const y = (R + r) * Math.sin(t) - r * Math.sin((R + r) / r * t);

    // Convert to perimeter position
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const magnitude = Math.sqrt(x * x + y * y) / (R + 2 * r); // Normalize
    const reach = 0.8 + magnitude * 1.2;

    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
