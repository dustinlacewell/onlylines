import { rand } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Opposing - Two streams flowing in opposite directions
 *
 * Half the lines flow one way, half flow the opposite way,
 * creating a collision/meeting effect.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.1-0.2)
 * @param options.lineWidth - Line thickness (default: 1)
 */
export const opposing = (
  count: number,
  options: DistributionOptions = {},
  _params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.1, 0.2);
  const width = options.lineWidth ?? 1;
  const halfCount = Math.floor(count / 2);
  const lines: LineConfig[] = [];

  for (let i = 0; i < halfCount; i++) {
    const t = (i + 0.5) / halfCount;
    lines.push(makeLine(t * 2, t * 2 + 2, speed, 1, width));
  }
  for (let i = 0; i < count - halfCount; i++) {
    const t = (i + 0.5) / (count - halfCount);
    lines.push(makeLine(2 + t * 2, t * 2, speed, -1, width));
  }
  return lines;
};
