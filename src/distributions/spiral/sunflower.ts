import { rand, pick, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Sunflower - Phyllotaxis pattern (sunflower seed arrangement)
 *
 * Uses the golden angle to create the dense packing pattern
 * seen in sunflower seeds and pine cones.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const sunflower = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const goldenAngle = TAU / (phi * phi); // ~137.5 degrees in radians
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const theta = i * goldenAngle;
    const r = Math.sqrt(i);
    const maxR = Math.sqrt(count);
    const normalizedR = r / maxR;

    const p0 = ((theta / TAU) * 4) % 4;
    const reach = 0.5 + normalizedR * 1.5;
    return makeLine(p0, p0 + reach, speed * (0.5 + normalizedR * 0.5), dir, width);
  });
};
