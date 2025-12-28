// Opposing placer - Two streams flowing in opposite directions

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const opposing = registerPlacer({
  id: 32,
  name: 'opposing',
  category: 'special',
  description: 'Two streams flowing in opposite directions (collision effect)',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.1, 0.2);
    const width = options.lineWidth ?? 1;
    const halfCount = Math.floor(count / 2);
    const lines: ReturnType<typeof makeLine>[] = [];

    for (let i = 0; i < halfCount; i++) {
      const t = (i + 0.5) / halfCount;
      lines.push(makeLine(t * 2, t * 2 + 2, speed, 1, width));
    }
    for (let i = 0; i < count - halfCount; i++) {
      const t = (i + 0.5) / (count - halfCount);
      lines.push(makeLine(2 + t * 2, t * 2, speed, -1, width));
    }
    return lines;
  },
});
