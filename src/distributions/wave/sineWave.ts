import { rand, pick, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * SineWave - Lines modulated by sine wave envelope
 *
 * Line reach varies sinusoidally across the distribution,
 * creating an undulating pattern.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.waves - Number of wave cycles (default: 1-4)
 * @param params.amplitude - Wave amplitude (default: 0.3-0.8)
 */
export const sineWave = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const waves = params.waves !== undefined ? Math.round(params.waves) : pick([1, 2, 3, 4]);
  const amplitude = params.amplitude !== undefined ? params.amplitude : rand(0.3, 0.8);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const wave = Math.sin(t * waves * TAU) * amplitude;
    return makeLine(angle, angle + 2 + wave, speed, dir, width);
  });
};
