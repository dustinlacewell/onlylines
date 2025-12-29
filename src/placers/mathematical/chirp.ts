// Chirp placer - Frequency sweep (accelerating oscillation)
//
// Reach oscillates with frequency that increases over the progression.
// Early lines have slow, wide oscillations. Later lines have fast, tight ones.
// Creates an asymmetric envelope that compresses toward one end.
//
// Named after the "chirp" signal in radar/sonar - a frequency sweep.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod, TAU } from '../../utils';

export const chirp = registerPlacer({
  id: 40,
  name: 'chirp',
  category: 'mathematical',
  description: 'Frequency sweep - oscillations that accelerate',

  params: {
    startFreq: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 4,
      description: 'Starting oscillation frequency',
    },
    endFreq: {
      type: 'smallInt',
      default: 8,
      min: 4,
      max: 16,
      description: 'Ending oscillation frequency',
    },
    amplitude: {
      type: 'unit',
      default: 0.6,
      min: 0.2,
      max: 1.0,
      description: 'Oscillation amplitude',
    },
  },

  randomize: {
    startFreq: [1, 2] as const,
    endFreq: [6, 8, 10, 12] as const,
    amplitude: [0.4, 0.8],
  },

  create: (count, options, { startFreq, endFreq, amplitude }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    const baseReach = 1.5;

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const p0 = t * 4 + offset;

      // For a linear chirp, phase is integral of frequency: f0*t + (f1-f0)*t²/2
      const phase = startFreq * t + (endFreq - startFreq) * t * t / 2;

      // Oscillating reach with accelerating frequency
      const oscillation = Math.sin(phase * TAU) * amplitude;
      const reach = baseReach + oscillation;

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
