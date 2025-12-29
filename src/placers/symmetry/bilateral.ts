// Bilateral placer - Perfect bilateral (mirror) symmetry about an axis

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../utils';

export const bilateral = registerPlacer({
  id: 12,
  name: 'bilateral',
  category: 'symmetry',
  description: 'Perfect bilateral (mirror) symmetry about an axis',

  params: {
    axis: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      description: 'Mirror axis position (0-1, scaled to 0-2 perimeter)',
    },
  },

  randomize: {
    axis: [0, 1],
  },

  create: (count, options, { axis }) => {
    const speed = options.speed ?? rand(0.05, 0.15);
    const width = options.lineWidth ?? 1;
    const axisPos = axis * 2;
    const halfCount = Math.ceil(count / 2);
    const lines: ReturnType<typeof makeLine>[] = [];

    for (let i = 0; i < halfCount; i++) {
      const t = (i + 0.5) / halfCount;
      const offset = t * 1.8;
      const reach = 1.5 + t * 0.5;

      lines.push(makeLine(axisPos + offset, axisPos + offset + reach, speed, 1, width));
      if (lines.length < count) {
        lines.push(makeLine(axisPos - offset, axisPos - offset + reach, speed, 1, width));
      }
    }
    return lines;
  },
});
