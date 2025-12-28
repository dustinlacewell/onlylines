import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * ConcentricRings - Concentric rings of short line segments
 *
 * Multiple rings at increasing radii, each filled with perpendicular lines.
 * Direction alternates per ring.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.rings - Number of rings (default: 3-6)
 */
export const concentricRings = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const numRings = params.rings !== undefined ? Math.round(params.rings) : pick([3, 4, 5, 6]);
  const linesPerRing = Math.floor(count / numRings);
  const lines: LineConfig[] = [];

  for (let ring = 0; ring < numRings; ring++) {
    const ringSize = 0.2 + (ring / numRings) * 1.3;
    const ringDir = ring % 2 === 0 ? 1 : -1;
    const ringSpeed = speed * (1 + ring * 0.1);

    for (let i = 0; i < linesPerRing && lines.length < count; i++) {
      const angle = (i / linesPerRing) * 4;
      lines.push(makeLine(angle, angle + ringSize, ringSpeed, ringDir, width));
    }
  }
  return lines;
};
