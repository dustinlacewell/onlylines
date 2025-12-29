// Dual Oscillator placer - Two oscillators placing endpoints around the perimeter
//
// Each oscillator places N points around the perimeter, traveling half the perimeter.
// Step sizes vary sinusoidally, creating density variations, but the total
// distance always equals exactly 2 (half perimeter).
//
// Math: step[i] = baseStep * (1 + amplitude * sin(2π * frequency * i / N + phase))
// Since Σ sin(...) = 0 over complete cycles, Σ step[i] = N * baseStep = 2
//
// Parameters:
// - offset: where oscillator B starts relative to A (0=same, 0.5=opposite)
// - frequency: oscillation cycles per loop (1=one dense region, 2=two, etc.)
// - phase: phase offset between A and B oscillators (0=sync, 0.5=opposite)
// - amplitude: how much density varies (0=uniform, 1=max contrast)

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const dualOscillator = registerPlacer({
  id: 27,
  name: 'dualOscillator',
  category: 'mathematical',
  description: 'Two coupled oscillators with density variation',

  params: {
    offset: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      description: 'Starting offset of B from A (0=same, 0.5=opposite)',
    },
    frequency: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 8,
      description: 'Oscillation cycles per loop (density peaks)',
    },
    phase: {
      type: 'unit',
      default: 0,
      min: 0,
      max: 1,
      description: 'Phase offset between oscillators (0=sync, 0.5=opposite)',
    },
    amplitude: {
      type: 'unit',
      default: 0.5,
      min: 0,
      max: 1,
      description: 'Density contrast (0=uniform, 1=max variation)',
    },
  },

  randomize: {
    offset: [0, 1],
    frequency: [1, 2, 3, 4] as const,
    phase: [0, 1],
    amplitude: [0.2, 0.8],
  },

  create: (count, options, { offset, frequency, phase, amplitude }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    // Each oscillator travels half the perimeter (2 units) to avoid duplicate lines
    // A goes [0, 2), B goes [startB, startB + 2)
    const totalDistance = 2;
    const baseStep = totalDistance / count;
    const phaseRad = phase * Math.PI * 2;

    // Convert offset to perimeter units, snapping to clean values to avoid
    // serialization rounding issues (0.5 encodes to 128, decodes to 0.50196)
    const rawStartB = offset * 4;
    const startB = Math.abs(rawStartB - Math.round(rawStartB)) < 0.05
      ? Math.round(rawStartB)
      : rawStartB;

    // Amplitude must be < 1 to keep all steps positive
    const amp = amplitude * 0.9;

    // Pre-compute positions by accumulating variable steps
    const positionsA: number[] = [];
    const positionsB: number[] = [];

    let posA = 0;
    let posB = startB;

    for (let i = 0; i < count; i++) {
      positionsA.push(posA);
      positionsB.push(posB);

      // Oscillator angle for this step
      const angleA = (2 * Math.PI * frequency * i) / count;
      const angleB = angleA + phaseRad;

      // Variable step sizes
      const stepA = baseStep * (1 + amp * Math.sin(angleA));
      const stepB = baseStep * (1 + amp * Math.sin(angleB));

      posA += stepA;
      posB += stepB;
    }

    return Array.from({ length: count }, (_, i) => {
      return {
        perim0: mod(positionsA[i], 4),
        perim1: mod(positionsB[i], 4),
        speed0: speed,
        speed1: speed,
        dir0: dir,
        dir1: dir,
        lineWidth: width,
      };
    });
  },
});
