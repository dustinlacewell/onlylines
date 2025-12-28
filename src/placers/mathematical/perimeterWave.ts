// PerimeterWave placer - Chord lengths modulated by a wave function
// The p0 progresses linearly, p1 oscillates creating wave-like patterns

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const perimeterWave = registerPlacer({
  id: 25,
  name: 'perimeterWave',
  category: 'mathematical',
  description: 'Wave-modulated chord lengths (creates envelope curves)',

  params: {
    frequency: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 8,
      description: 'Wave frequency (oscillations around perimeter)',
    },
    amplitude: {
      type: 'unit',
      default: 0.5,
      min: 0.2,
      max: 1,
      description: 'Wave amplitude (chord length variation)',
    },
  },

  randomize: {
    frequency: [1, 2, 3, 4, 5, 6, 7, 8] as const,
    amplitude: [0.2, 1],
  },

  create: (count, options, { frequency, amplitude }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);
    const phase = rand(0, Math.PI * 2);

    const baseChord = 1.5; // Base chord length
    const chordVariation = amplitude * 1.2; // How much the chord length varies

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const p0 = t * 4 + offset;

      // Modulate chord length with sine wave
      const waveValue = Math.sin(t * Math.PI * 2 * frequency + phase);
      const chordLength = baseChord + waveValue * chordVariation;

      const p1 = p0 + chordLength;

      return {
        perim0: mod(p0, 4),
        perim1: mod(p1, 4),
        speed0: speed,
        speed1: speed,
        dir0: dir,
        dir1: dir,
        lineWidth: width,
      };
    });
  },
});