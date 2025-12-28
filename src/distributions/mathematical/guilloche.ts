import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Guilloche - Decorative engraving pattern used on currency
 *
 * Creates the intricate wave-interference patterns seen on
 * banknotes and security documents. Based on overlapping
 * sine waves with varying parameters.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.04-0.08)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.waves - Number of wave components (default: 2-4)
 * @param params.complexity - Pattern complexity (default: 3-8)
 */
export const guilloche = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.04, 0.08);
  const width = options.lineWidth ?? 1;
  const waves = params.waves !== undefined ? Math.round(params.waves) : pick([2, 3, 4]);
  const complexity = params.complexity !== undefined ? params.complexity : pick([3, 4, 5, 6, 7, 8]);
  const dir = pick([-1, 1]);

  // Generate wave parameters
  const waveParams = Array.from({ length: waves }, (_, w) => ({
    freq: (w + 1) * complexity,
    amp: 1 / (w + 1),
    phase: rand(0, TAU),
  }));

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const baseAngle = t * TAU;

    // Combine multiple sine waves
    let radiusOffset = 0;
    for (const wave of waveParams) {
      radiusOffset += wave.amp * Math.sin(wave.freq * baseAngle + wave.phase);
    }

    // Create the guilloche curve
    const radius = 0.7 + radiusOffset * 0.3;
    const x = radius * Math.cos(baseAngle);
    const y = radius * Math.sin(baseAngle);

    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const reach = 1.2 + radiusOffset * 0.6;

    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
