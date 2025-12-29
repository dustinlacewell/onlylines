// CoupledOscillator placer - Two oscillators exchanging energy (beat patterns)
//
// Like coupled pendulums, two oscillators with slightly different frequencies
// exchange energy, creating beautiful beat patterns. When one is at maximum
// amplitude, the other is at minimum, and vice versa.
//
// We use this to modulate BOTH the p0 position AND the reach, creating
// complex interference patterns. The beat frequency = |freq1 - freq2|.
//
// This differs from dualOscillator which modulates step sizes. Here we
// directly modulate positions with amplitude-modulated sine waves.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod, TAU } from '../../utils';

export const coupledOscillator = registerPlacer({
  id: 39,
  name: 'coupledOscillator',
  category: 'mathematical',
  description: 'Beat patterns from coupled oscillators exchanging energy',

  params: {
    freq1: {
      type: 'smallInt',
      default: 5,
      min: 3,
      max: 12,
      description: 'First oscillator frequency',
    },
    freq2: {
      type: 'smallInt',
      default: 6,
      min: 3,
      max: 12,
      description: 'Second oscillator frequency',
    },
    coupling: {
      type: 'unit',
      default: 0.5,
      min: 0.1,
      max: 0.9,
      description: 'Coupling strength (energy exchange rate)',
    },
  },

  randomize: {
    freq1: [3, 4, 5, 6, 7, 8] as const,
    freq2: [4, 5, 6, 7, 8, 9] as const,
    coupling: [0.3, 0.7],
  },

  create: (count, options, { freq1, freq2, coupling }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    // Beat frequency determines the slow modulation envelope
    const beatFreq = Math.abs(freq1 - freq2);

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;

      // The beat pattern: amplitude modulation envelope
      // One oscillator's amplitude grows while the other shrinks
      const beatPhase = t * beatFreq * TAU;
      const amp1 = coupling + (1 - coupling) * Math.cos(beatPhase);
      const amp2 = coupling + (1 - coupling) * Math.cos(beatPhase + Math.PI);

      // First oscillator controls p0 deviation from linear progression
      const osc1 = amp1 * Math.sin(t * freq1 * TAU) * 0.3;

      // Second oscillator controls reach modulation
      const osc2 = amp2 * Math.sin(t * freq2 * TAU) * 0.5;

      // Base linear progression around perimeter
      const p0 = t * 4 + osc1 + offset;

      // Reach modulated by second oscillator
      const baseReach = 1.5;
      const reach = baseReach + osc2;

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
