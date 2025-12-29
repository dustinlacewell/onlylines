// BreathingRays placer - Radial lines with sinusoidally modulated reach
//
// Like a star/radial pattern, but the chord length "breathes" - oscillating
// between short and long as we sweep around the perimeter. This creates
// a pulsing, organic feel with density variation at the envelope.
//
// The key aesthetic: smooth p0 progression + oscillating reach = breathing envelope

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod, TAU } from '../../utils';

export const breathingRays = registerPlacer({
  id: 37,
  name: 'breathingRays',
  category: 'mathematical',
  description: 'Radial rays with breathing amplitude modulation',

  params: {
    breathCycles: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 8,
      description: 'Number of breath cycles around perimeter',
    },
    minReach: {
      type: 'unit',
      default: 0.3,
      min: 0.1,
      max: 0.8,
      description: 'Minimum chord length (contracted breath)',
    },
    maxReach: {
      type: 'unit',
      default: 0.8,
      min: 0.5,
      max: 1.0,
      description: 'Maximum chord length (expanded breath)',
    },
  },

  randomize: {
    breathCycles: [2, 3, 4, 5, 6] as const,
    minReach: [0.2, 0.4],
    maxReach: [0.7, 0.95],
  },

  create: (count, options, { breathCycles, minReach, maxReach }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const phase = rand(0, TAU);

    // Scale reach values to perimeter units (multiply by 2 for reasonable chord lengths)
    const minChord = minReach * 2;
    const maxChord = maxReach * 2;
    const chordRange = maxChord - minChord;

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const p0 = t * 4;

      // Sinusoidal breathing modulation
      const breathPhase = t * breathCycles * TAU + phase;
      const breathValue = (Math.sin(breathPhase) + 1) / 2; // 0 to 1
      const reach = minChord + breathValue * chordRange;

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
