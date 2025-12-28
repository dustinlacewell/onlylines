// Woven placer - Interlaced grid with alternating directions

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const woven = registerPlacer({
  id: 20,
  name: 'woven',
  category: 'grid',
  description: 'Interlaced grid with alternating directions (weaving illusion)',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.03, 0.08);
    const width = options.lineWidth ?? 1;
    const lines: ReturnType<typeof makeLine>[] = [];

    for (let i = 0; i < count; i++) {
      const isHorizontal = i % 2 === 0;
      const idx = Math.floor(i / 2);
      const total = Math.ceil(count / 2);
      const t = (idx + 0.5) / total;

      if (isHorizontal) {
        lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
      } else {
        lines.push(makeLine(0 + t, 2 + (1 - t), speed, -1, width));
      }
    }
    return lines;
  },
});
