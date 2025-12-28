// GoldenSpiral placer - Spiral using the golden ratio angle

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../../distributions/utils';

export const goldenSpiral = registerPlacer({
  id: 7,
  name: 'goldenSpiral',
  category: 'spiral',
  description: 'Spiral using the golden ratio angle (~137.5°)',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.08, 0.15);
    const width = options.lineWidth ?? 1;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
    const goldenAngle = 4 / (phi * phi); // In perimeter units
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const angle = i * goldenAngle;
      const r = Math.sqrt(i / count);
      const reach = 0.5 + r * 1.5;
      return makeLine(angle, angle + reach, speed * (0.3 + r * 0.7), dir, width);
    });
  },
});
