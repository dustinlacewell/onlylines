// Kaleidoscope placer - Bilateral + rotational symmetry combined

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../utils';

export const kaleidoscope = registerPlacer({
  id: 14,
  name: 'kaleidoscope',
  category: 'symmetry',
  description: 'Bilateral + rotational symmetry combined (classic kaleidoscope effect)',

  params: {
    segments: {
      type: 'smallInt',
      default: 6,
      min: 4,
      max: 8,
      description: 'Number of kaleidoscope segments',
    },
  },

  randomize: {
    segments: [4, 6, 8] as const,
  },

  create: (count, options, { segments }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const linesPerSegment = Math.floor(count / segments);
    const lines: ReturnType<typeof makeLine>[] = [];

    for (let seg = 0; seg < segments; seg++) {
      const segStart = (seg / segments) * 4;
      const segWidth = 4 / segments;
      const mirror = seg % 2 === 1;

      for (let i = 0; i < linesPerSegment && lines.length < count; i++) {
        const t = (i + 0.5) / linesPerSegment;
        const localT = mirror ? 1 - t : t;
        const angle = segStart + localT * segWidth * 0.9;
        const reach = 1.2 + localT * 0.6;
        lines.push(makeLine(angle, angle + reach, speed, 1, width));
      }
    }
    return lines;
  },
});
