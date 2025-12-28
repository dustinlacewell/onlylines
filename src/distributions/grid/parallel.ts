import { rand, pick, mod } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Parallel - Parallel lines at any angle
 *
 * Creates evenly-spaced parallel lines at a specified angle.
 * Generalizes horizontal, vertical, and diagonal into one.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.angle - Angle in degrees (0=horizontal, 90=vertical, 45=diagonal)
 */
export const parallel = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  // Default to a random common angle
  const angleDeg = params.angle !== undefined ? params.angle : pick([0, 30, 45, 60, 90, 120, 135, 150]);
  const dir = pick([-1, 1]);

  // For parallel lines, we need consistent spacing perpendicular to the line direction
  // We'll sweep the start point along the perimeter and calculate matching end point
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;

    // Start position sweeps around perimeter
    // We offset based on angle to get good coverage
    const sweepStart = (angleDeg / 90) % 4; // Which edge to start sweeping from
    const p0 = mod(sweepStart + t * 2, 4);

    // End position is offset by ~2 (opposite side) adjusted by angle
    // This creates lines that cross the canvas
    const offset = 2; // Lines cross to opposite-ish side
    const p1 = mod(p0 + offset, 4);

    return makeLine(p0, p1, speed, dir, width);
  });
};
