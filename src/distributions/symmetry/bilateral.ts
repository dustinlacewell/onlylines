import { rand } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Bilateral - Perfect bilateral (mirror) symmetry about an axis
 *
 * Creates mirrored pairs of lines on either side of a central axis.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.axis - Mirror axis position (0-1, scaled to 0-2 perimeter)
 */
export const bilateral = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
  const axis = params.axis !== undefined ? params.axis * 2 : rand(0, 2);
  const halfCount = Math.ceil(count / 2);
  const lines: LineConfig[] = [];

  for (let i = 0; i < halfCount; i++) {
    const t = (i + 0.5) / halfCount;
    const offset = t * 1.8;
    const reach = 1.5 + t * 0.5;

    lines.push(makeLine(axis + offset, axis + offset + reach, speed, 1, width));
    if (lines.length < count) {
      lines.push(makeLine(axis - offset, axis - offset + reach, speed, 1, width));
    }
  }
  return lines;
};
