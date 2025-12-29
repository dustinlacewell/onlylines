// SineWave placer - Lines modulated by sine wave envelope

import { registerPlacer } from '../../core/registry';
import { rand, pick, TAU } from '../../utils';
import { makeLine } from '../utils';

export const sineWave = registerPlacer({
  id: 9,
  name: 'sineWave',
  category: 'wave',
  description: 'Lines modulated by sine wave envelope',

  params: {
    waves: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 4,
      description: 'Number of wave cycles',
    },
    amplitude: {
      type: 'unit',
      default: 0.5,
      min: 0.3,
      max: 0.8,
      description: 'Wave amplitude',
    },
  },

  randomize: {
    waves: [1, 2, 3, 4] as const,
    amplitude: [0.3, 0.8],
  },

  create: (count, options, { waves, amplitude }) => {
    const speed = options.speed ?? rand(0.08, 0.15);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const angle = t * 4;
      const wave = Math.sin(t * waves * TAU) * amplitude;
      return makeLine(angle, angle + 2 + wave, speed, dir, width);
    });
  },
});
