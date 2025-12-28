import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * FlowerOfLife - Sacred geometry pattern of overlapping circles
 *
 * Creates lines that trace the intersections of the classic
 * Flower of Life pattern - overlapping circles arranged in
 * a hexagonal pattern.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.1)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.rings - Number of concentric rings (default: 2-4)
 */
export const flowerOfLife = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.1);
  const width = options.lineWidth ?? 1;
  const rings = params.rings !== undefined ? Math.round(params.rings) : pick([2, 3, 4]);
  const dir = pick([-1, 1]);

  const lines: LineConfig[] = [];

  // Generate circle centers in hexagonal pattern
  const centers: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  const circleRadius = 0.3;

  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < 6 * ring; i++) {
      // Position along the hexagonal ring
      const side = Math.floor(i / ring);
      const posOnSide = i % ring;

      // Hexagon vertices
      const angle1 = (side / 6) * TAU;
      const angle2 = ((side + 1) / 6) * TAU;

      const x1 = ring * circleRadius * 2 * Math.cos(angle1);
      const y1 = ring * circleRadius * 2 * Math.sin(angle1);
      const x2 = ring * circleRadius * 2 * Math.cos(angle2);
      const y2 = ring * circleRadius * 2 * Math.sin(angle2);

      // Interpolate along edge
      const t = posOnSide / ring;
      centers.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
  }

  // Create lines sampling the circle arcs
  const linesPerCenter = Math.max(1, Math.floor(count / centers.length));

  for (const center of centers) {
    for (let i = 0; i < linesPerCenter && lines.length < count; i++) {
      const arcT = i / linesPerCenter;
      const arcAngle = arcT * TAU;

      const px = center.x + circleRadius * Math.cos(arcAngle);
      const py = center.y + circleRadius * Math.sin(arcAngle);

      const p0 = mod((Math.atan2(py, px) / TAU + 0.5) * 4, 4);
      const dist = Math.sqrt(px * px + py * py);
      const reach = 0.8 + dist * 0.6;

      lines.push(makeLine(p0, p0 + reach, speed, dir, width));
    }
  }

  return lines.slice(0, count);
};
