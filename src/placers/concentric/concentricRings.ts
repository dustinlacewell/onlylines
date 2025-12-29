// ConcentricRings placer - Concentric rings of short line segments

import { registerPlacer } from '../../core/registry';
import { rand } from '../../utils';
import { makeLine } from '../utils';

export const concentricRings = registerPlacer({
  id: 3,
  name: 'concentricRings',
  category: 'concentric',
  description: 'Concentric rings of short line segments',

  params: {
    rings: {
      type: 'smallInt',
      default: 4,
      min: 3,
      max: 6,
      description: 'Number of rings',
    },
  },

  randomize: {
    rings: [3, 4, 5, 6] as const,
  },

  create: (count, options, { rings }) => {
    const speed = options.speed ?? rand(0.05, 0.12);
    const width = options.lineWidth ?? 1;
    const linesPerRing = Math.floor(count / rings);
    const lines: ReturnType<typeof makeLine>[] = [];

    for (let ring = 0; ring < rings; ring++) {
      const ringSize = 0.2 + (ring / rings) * 1.3;
      const ringDir = ring % 2 === 0 ? 1 : -1;
      const ringSpeed = speed * (1 + ring * 0.1);

      for (let i = 0; i < linesPerRing && lines.length < count; i++) {
        const angle = (i / linesPerRing) * 4;
        lines.push(makeLine(angle, angle + ringSize, ringSpeed, ringDir, width));
      }
    }
    return lines;
  },
});
