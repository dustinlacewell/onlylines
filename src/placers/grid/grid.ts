// Grid placer - Orthogonal grid of horizontal and vertical lines

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../utils';

export const grid = registerPlacer({
  id: 19,
  name: 'grid',
  category: 'grid',
  description: 'Orthogonal grid of horizontal and vertical lines',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.02, 0.08);
    const width = options.lineWidth ?? 1;
    const halfCount = Math.floor(count / 2);
    const lines: ReturnType<typeof makeLine>[] = [];

    // Horizontal lines
    for (let i = 0; i < halfCount; i++) {
      const t = (i + 0.5) / halfCount;
      lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
    }
    // Vertical lines
    for (let i = 0; i < count - halfCount; i++) {
      const t = (i + 0.5) / (count - halfCount);
      lines.push(makeLine(0 + t, 2 + (1 - t), speed, 1, width));
    }
    return lines;
  },
});
