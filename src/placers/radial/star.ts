// Star placer - Perfect star burst radiating from center
// All lines emanate from center, each spanning half the perimeter

import { registerPlacer } from '../../core/registry';
import { rand, pick } from '../../utils';
import { makeLine } from '../utils';

export const star = registerPlacer({
  id: 0,
  name: 'star',
  category: 'radial',
  description: 'Perfect star burst radiating from center',

  params: {},

  create: (count, options) => {
    const speed = options.speed ?? rand(0.08, 0.2);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 4 + offset;
      return makeLine(angle, angle + 2, speed, dir, width);
    });
  },
});
