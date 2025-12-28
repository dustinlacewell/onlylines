import { rand } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Grid - Orthogonal grid of horizontal and vertical lines
 *
 * Half the lines go horizontally, half go vertically,
 * creating a classic grid pattern.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.02-0.08)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const grid = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.02, 0.08);
  const width = options.lineWidth ?? 1;
  const halfCount = Math.floor(count / 2);
  const lines: LineConfig[] = [];

  // Horizontal lines (left edge to right edge)
  for (let i = 0; i < halfCount; i++) {
    const t = (i + 0.5) / halfCount;
    lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
  }
  // Vertical lines (top edge to bottom edge)
  for (let i = 0; i < count - halfCount; i++) {
    const t = (i + 0.5) / (count - halfCount);
    lines.push(makeLine(0 + t, 2 + (1 - t), speed, 1, width));
  }
  return lines;
};
