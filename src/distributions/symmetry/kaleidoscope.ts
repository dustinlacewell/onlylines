import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Kaleidoscope - Bilateral + rotational symmetry combined
 *
 * Segments alternate between mirrored and non-mirrored,
 * creating the classic kaleidoscope effect.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.segments - Number of kaleidoscope segments (default: 4,6,8)
 */
export const kaleidoscope = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const segments = params.segments !== undefined ? Math.round(params.segments) : pick([4, 6, 8]);
  const linesPerSegment = Math.floor(count / segments);
  const lines: LineConfig[] = [];

  for (let seg = 0; seg < segments; seg++) {
    const segStart = (seg / segments) * 4;
    const segWidth = 4 / segments;
    const mirror = seg % 2 === 1;

    for (let i = 0; i < linesPerSegment && lines.length < count; i++) {
      const t = (i + 0.5) / linesPerSegment;
      const localT = mirror ? 1 - t : t;
      const angle = segStart + localT * segWidth * 0.9;
      const reach = 1.2 + localT * 0.6;
      lines.push(makeLine(angle, angle + reach, speed, 1, width));
    }
  }
  return lines;
};
