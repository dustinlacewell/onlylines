import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Lissajous - Lissajous curves (parametric curves from 2 sine waves)
 *
 * Creates complex knot-like patterns based on the ratio of
 * two perpendicular sine wave frequencies.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.08-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.a - X frequency (default: 1-5)
 * @param params.b - Y frequency (default: 1-5, different from a)
 * @param params.delta - Phase difference (default: 0-π)
 */
export const lissajous = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const a = params.a !== undefined ? Math.round(params.a) : pick([1, 2, 3, 4, 5]);
  let b = params.b !== undefined ? Math.round(params.b) : pick([1, 2, 3, 4, 5].filter(x => x !== a));
  if (b === a) b = a === 5 ? 1 : a + 1;
  const delta = params.delta !== undefined ? params.delta : rand(0, Math.PI);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU;
    const x = Math.sin(a * t + delta);
    const y = Math.sin(b * t);
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const magnitude = Math.sqrt(x * x + y * y);
    const reach = 1 + magnitude * 0.8;
    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};
