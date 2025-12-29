// Web placer - Spider web pattern with radial spokes and concentric rings

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../utils';

export const web = registerPlacer({
  id: 34,
  name: 'web',
  category: 'special',
  description: 'Spider web pattern (radial spokes with concentric rings)',

  params: {
    spokes: {
      type: 'smallInt',
      default: 8,
      min: 6,
      max: 12,
      description: 'Number of radial spokes',
    },
  },

  randomize: {
    spokes: [6, 8, 10, 12] as const,
  },

  create: (count, options, { spokes }) => {
    const speed = options.speed ?? rand(0.03, 0.08);
    const width = options.lineWidth ?? 1;
    const lines: ReturnType<typeof makeLine>[] = [];

    const spokeCount = Math.max(spokes, Math.floor(count * 0.3));
    const ringLineCount = count - spokeCount;
    const rings = Math.max(3, Math.ceil(ringLineCount / spokes));

    // Spokes
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * 4;
      lines.push(makeLine(angle, angle + 2, speed, 1, width));
    }

    // Rings
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
  },
});
