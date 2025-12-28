import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * FermatSpiral - Fermat's spiral (parabolic spiral)
 *
 * A spiral where r² = a²θ, creating a pattern that expands
 * more slowly than Archimedean spiral. Creates two symmetric
 * arms that interweave.
 *
 * Seen in nature in sunflower seed heads and daisy florets.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.arms - Number of spiral arms (default: 2)
 * @param params.tightness - Spiral tightness (default: 1-3)
 */
export const fermatSpiral = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const arms = params.arms !== undefined ? Math.round(params.arms) : 2;
  const tightness = params.tightness !== undefined ? params.tightness : rand(1, 3);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const arm = i % arms;
    const idx = Math.floor(i / arms);
    const t = idx / (count / arms);

    // Fermat spiral: r = ±a√θ
    const theta = t * TAU * tightness * 3;
    const r = Math.sqrt(theta) * 0.3;

    // Offset each arm
    const armOffset = (arm / arms) * TAU;
    const x = r * Math.cos(theta + armOffset);
    const y = r * Math.sin(theta + armOffset);

    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const normalizedR = Math.min(1, r / 2);
    const reach = 0.5 + normalizedR * 1.5;

    // Alternate direction for each arm
    const lineDir = arm % 2 === 0 ? dir : -dir;

    return makeLine(p0, p0 + reach, speed * (0.5 + normalizedR * 0.5), lineDir, width);
  });
};
