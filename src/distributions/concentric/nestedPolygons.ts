import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * NestedPolygons - Nested squares/diamonds with shrinking layers
 *
 * Each layer is a smaller square, alternating direction between layers.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.03-0.1)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.layers - Number of nested layers (default: 3-8)
 */
export const nestedPolygons = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
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
