import { rand, pick } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions, DistributionParams } from './types';
import { makeLine } from './utils';

// Opposing flows
export const opposing = (count: number, options: DistributionOptions = {}, _params: DistributionParams = {}): LineConfig[] => {
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

// Vortex/whirlpool
export const vortex = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.15, 0.3);
  const width = options.lineWidth ?? 1;
  const tightness = params.tightness !== undefined ? params.tightness : rand(1, 3);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * tightness * 4;
    const reach = 0.2 + t * 1.5;
    return makeLine(angle, angle + reach, speed * (1 - t * 0.5), dir, width);
  });
};

// Web/spider pattern
export const web = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.03, 0.08);
  const width = options.lineWidth ?? 1;
  const spokes = params.spokes !== undefined ? Math.round(params.spokes) : pick([6, 8, 10, 12]);
  const lines: LineConfig[] = [];

  // Reserve ~30% for spokes, rest for rings
  const spokeCount = Math.max(spokes, Math.floor(count * 0.3));
  const ringLineCount = count - spokeCount;
  // Calculate rings needed to use all remaining lines
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
