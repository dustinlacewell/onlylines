import { rand, pick } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions, DistributionParams } from './types';
import { makeLine } from './utils';

// Concentric rings of short line segments
export const concentricRings = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
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

// Nested squares/diamonds
export const nestedPolygons = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.03, 0.1);
  const width = options.lineWidth ?? 1;
  const layers = params.layers !== undefined ? Math.round(params.layers) : pick([3, 4, 5, 6, 8]);
  const linesPerLayer = Math.floor(count / layers);
  const lines: LineConfig[] = [];
  const baseDir = pick([-1, 1]);

  for (let layer = 0; layer < layers; layer++) {
    const shrink = layer * 0.12;
    const layerDir = layer % 2 === 0 ? baseDir : -baseDir;

    for (let i = 0; i < linesPerLayer && lines.length < count; i++) {
      const t = i / linesPerLayer;
      const p0 = t * 4 + shrink;
      const p1 = (t + 1 / linesPerLayer) * 4 - shrink;
      lines.push(makeLine(p0, p1, speed, layerDir, width));
    }
  }
  return lines;
};
