// Sunflower placer - Phyllotaxis pattern (sunflower seed arrangement)

import { registerPlacer } from '../../core/registry';
import { rand, pick, TAU } from '../../utils';
import { makeLine } from '../utils';

export const sunflower = registerPlacer({
  id: 8,
  name: 'sunflower',
  category: 'spiral',
  description: 'Phyllotaxis pattern (sunflower seed arrangement)',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.08, 0.15);
    const width = options.lineWidth ?? 1;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const goldenAngle = TAU / (phi * phi); // ~137.5 degrees in radians
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const theta = i * goldenAngle;
      const r = Math.sqrt(i);
      const maxR = Math.sqrt(count);
      const normalizedR = r / maxR;

      const p0 = ((theta / TAU) * 4) % 4;
      const reach = 0.5 + normalizedR * 1.5;
      return makeLine(p0, p0 + reach, speed * (0.5 + normalizedR * 0.5), dir, width);
    });
  },
});
