// Caustic placer - Light reflection envelope curves (nephroid/cardioid family)
//
// Caustics are the envelope curves formed by light rays reflecting off a curved surface.
// A classic example: light hitting the inside of a coffee cup creates a cardioid caustic.
//
// We simulate this by treating one edge as a "light source" and another as a "mirror".
// Rays emanate from points on the source edge, hit the mirror edge, and reflect.
// The reflected rays form beautiful caustic envelopes.
//
// For a circular mirror, the caustic is a nephroid (kidney shape). On our square
// perimeter, we get interesting angular caustics with smooth envelope curves.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const caustic = registerPlacer({
  id: 38,
  name: 'caustic',
  category: 'mathematical',
  description: 'Light reflection caustic envelope curves',

  params: {
    sourceEdge: {
      type: 'byte',
      default: 0,
      min: 0,
      max: 3,
      description: 'Edge where light originates (0=top, 1=right, 2=bottom, 3=left)',
    },
    focalPoint: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      description: 'Position of focal point along opposite edge',
    },
    spread: {
      type: 'unit',
      default: 0.8,
      min: 0.3,
      max: 1.0,
      description: 'Angular spread of light rays',
    },
  },

  randomize: {
    sourceEdge: [0, 1, 2, 3] as const,
    focalPoint: [0.3, 0.7],
    spread: [0.5, 1.0],
  },

  create: (count, options, { sourceEdge, focalPoint, spread }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;

      // Source point sweeps along the source edge
      const sourceT = 0.5 - spread / 2 + t * spread;
      const p0 = sourceEdge + sourceT;

      // Calculate reflection: rays appear to come from focal point,
      // hit source edge, and reflect toward adjacent edges
      // The reflection formula creates the caustic envelope

      // Reflection creates a chord that varies smoothly
      // The focal point shifts the asymmetry of the caustic curve
      const reflectionAngle = (t - focalPoint) * spread * Math.PI;
      const baseReach = 1.0 + 0.8 * Math.cos(reflectionAngle * 2);

      // Add variation based on position for more interesting envelope
      const reachMod = 0.3 * Math.sin(t * Math.PI * 2);
      const reach = baseReach + reachMod;

      return {
        perim0: mod(p0, 4),
        perim1: mod(p0 + reach, 4),
        speed0: speed,
        speed1: speed,
        dir0: dir,
        dir1: dir,
        lineWidth: width,
      };
    });
  },
});
