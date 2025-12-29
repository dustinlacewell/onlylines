// NestedPolygons placer - Nested squares/diamonds with shrinking layers

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const nestedPolygons = registerPlacer({
  id: 4,
  name: 'nestedPolygons',
  category: 'concentric',
  description: 'Nested squares/diamonds with shrinking layers',

  params: {
    layers: {
      type: 'smallInt',
      default: 5,
      min: 3,
      max: 8,
      description: 'Number of nested layers',
    },
  },

  randomize: {
    layers: [3, 4, 5, 6, 8] as const,
  },

  create: (count, options, { layers }) => {
    const speed = options.speed ?? rand(0.03, 0.1);
    const width = options.lineWidth ?? 1;
    const linesPerLayer = Math.floor(count / layers);
    const lines: ReturnType<typeof makeLine>[] = [];
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
  },
});
