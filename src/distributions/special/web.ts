import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Web - Spider web pattern with radial spokes and concentric rings
 *
 * Combines radial spokes through center with arc segments
 * connecting them at various radii.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.03-0.08)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.spokes - Number of radial spokes (default: 6,8,10,12)
 */
export const web = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.03, 0.08);
  const width = options.lineWidth ?? 1;
  const spokes = params.spokes !== undefined ? Math.round(params.spokes) : pick([6, 8, 10, 12]);
  const lines: LineConfig[] = [];

  // Reserve ~30% for spokes, rest for rings
  const spokeCount = Math.max(spokes, Math.floor(count * 0.3));
  const ringLineCount = count - spokeCount;
  const rings = Math.max(3, Math.ceil(ringLineCount / spokes));

  // Spokes (radial lines through center)
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * 4;
    lines.push(makeLine(angle, angle + 2, speed, 1, width));
  }

  // Rings (arcs connecting between spoke positions)
  for (let r = 0; r < rings && lines.length < count; r++) {
    const ringRadius = (r + 1) / (rings + 1);
    const ringOffset = ringRadius * 0.8;
    const segmentsInRing = Math.min(spokes, count - lines.length);

    for (let i = 0; i < segmentsInRing && lines.length < count; i++) {
      const a1 = (i / spokes) * 4 + ringOffset;
      const a2 = ((i + 1) / spokes) * 4 - ringOffset;
      lines.push(makeLine(a1, a2, speed * 0.7, r % 2 === 0 ? 1 : -1, width));
    }
  }
  return lines;
};
