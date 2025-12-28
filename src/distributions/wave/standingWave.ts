import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * StandingWave - Standing wave with nodes pattern
 *
 * Creates a pattern like a vibrating string, with nodes (minimum reach)
 * and antinodes (maximum reach).
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.nodes - Number of nodes (default: 2-5)
 */
export const standingWave = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const nodes = params.nodes !== undefined ? Math.round(params.nodes) : pick([2, 3, 4, 5]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const envelope = Math.sin(t * nodes * Math.PI);
    const reach = 1.5 + Math.abs(envelope) * 0.8;
    return makeLine(angle, angle + reach, speed, dir, width);
  });
};
