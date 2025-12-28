import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * GoldenSpiral - Spiral using the golden ratio angle
 *
 * Each line is placed at the golden angle (137.5°) from the previous,
 * creating the naturally-occurring spiral pattern seen in shells and galaxies.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const goldenSpiral = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
  const goldenAngle = 4 / (phi * phi); // In perimeter units
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const angle = i * goldenAngle;
    const r = Math.sqrt(i / count);
    const reach = 0.5 + r * 1.5;
    return makeLine(angle, angle + reach, speed * (0.3 + r * 0.7), dir, width);
  });
};
