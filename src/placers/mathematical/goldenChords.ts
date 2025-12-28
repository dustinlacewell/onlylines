// GoldenChords placer - Chord placement based on the golden ratio
// Points are placed using golden angle, creating non-repeating but structured patterns

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

// Golden ratio and golden angle
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 4 / (PHI * PHI); // In perimeter units (0-4)

export const goldenChords = registerPlacer({
  id: 26,
  name: 'goldenChords',
  category: 'mathematical',
  description: 'Golden ratio spacing (Fibonacci-like non-repeating patterns)',

  params: {
    chordType: {
      type: 'smallInt',
      default: 1,
      min: 0,
      max: 2,
      description: 'Chord connection type (0=successive, 1=golden span, 2=diameter)',
    },
    density: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 3,
      description: 'Point density multiplier',
    },
  },

  randomize: {
    chordType: [0, 1, 2] as const,
    density: [1, 2, 3] as const,
  },

  create: (count, options, { chordType, density }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    // Generate golden-angle spaced points on perimeter
    const points: number[] = [];
    for (let i = 0; i < count * density; i++) {
      const p = (i * GOLDEN_ANGLE + offset);
      points.push(mod(p, 4));
    }

    return Array.from({ length: count }, (_, i) => {
      const p0 = points[i % points.length];
      let p1: number;

      switch (chordType) {
        case 0:
          // Connect successive golden-angle points
          p1 = points[(i + 1) % points.length];
          break;
        case 1:
          // Span by golden ratio of perimeter
          p1 = mod(p0 + 4 / PHI, 4);
          break;
        case 2:
          // Connect through center (diameter)
          p1 = mod(p0 + 2, 4);
          break;
        default:
          p1 = points[(i + 1) % points.length];
      }

      return {
        perim0: p0,
        perim1: p1,
        speed0: speed,
        speed1: speed,
        dir0: dir,
        dir1: dir,
        lineWidth: width,
      };
    });
  },
});