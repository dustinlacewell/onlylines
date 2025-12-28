import { rand, pick, mod } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Chladni - Chladni plate vibration patterns
 *
 * Simulates the nodal line patterns formed when a plate vibrates,
 * creating beautiful geometric interference patterns.
 *
 * Based on the Chladni equation: cos(n*π*x)*cos(m*π*y) ± cos(m*π*x)*cos(n*π*y)
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.1)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.n - First mode number (default: 1-5)
 * @param params.m - Second mode number (default: 1-5)
 */
export const chladni = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.1);
  const width = options.lineWidth ?? 1;
  const n = params.n !== undefined ? Math.round(params.n) : pick([1, 2, 3, 4, 5]);
  const m = params.m !== undefined ? Math.round(params.m) : pick([1, 2, 3, 4, 5].filter(x => x !== n));
  const dir = pick([-1, 1]);

  // Sample points along the nodal lines (where amplitude ≈ 0)
  return Array.from({ length: count }, (_, i) => {
    const t = i / count;

    // Sample in a spiral pattern through the 2D space
    const angle = t * Math.PI * 8; // Multiple rotations
    const radius = 0.1 + t * 0.9; // Expand outward

    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    // Chladni function value
    const chladniValue =
      Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) +
      Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);

    // Convert position to perimeter
    const p0 = mod((Math.atan2(y, x) / (Math.PI * 2) + 0.5) * 4, 4);

    // Reach varies with Chladni amplitude - creates visual of nodal pattern
    const normalizedValue = (chladniValue + 2) / 4; // Normalize to 0-1
    const reach = 0.8 + normalizedValue * 1.4;

    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
