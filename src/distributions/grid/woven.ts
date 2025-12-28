import { rand } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Woven - Interlaced grid with alternating directions
 *
 * Alternates between horizontal and vertical lines with opposite
 * directions, creating a visual weaving illusion.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.03-0.08)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const woven = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.03, 0.08);
  const width = options.lineWidth ?? 1;
  const lines: LineConfig[] = [];

  for (let i = 0; i < count; i++) {
    const isHorizontal = i % 2 === 0;
    const idx = Math.floor(i / 2);
    const total = Math.ceil(count / 2);
    const t = (idx + 0.5) / total;

    if (isHorizontal) {
      // Horizontal: left edge to right edge
      lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
    } else {
      // Vertical: top edge to bottom edge (opposite direction for weave)
      lines.push(makeLine(0 + t, 2 + (1 - t), speed, -1, width));
    }
  }
  return lines;
};
