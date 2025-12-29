// TetheredWalk placer - One endpoint walks, the other follows on a tether
//
// Endpoint A walks around the perimeter with variable step size (oscillator A).
// Endpoint B follows at a variable distance from A (oscillator B).
//
// This creates coupled density and reach patterns:
// - Where A's steps are small → high line density
// - Where B's tether is short → short chords, where long → long chords
//
// The two oscillators can be in sync, out of phase, or different frequencies.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod, TAU } from '../../utils';

export const tetheredWalk = registerPlacer({
  id: 41,
  name: 'tetheredWalk',
  category: 'mathematical',
  description: 'Walking endpoint with tethered follower',

  params: {
    densityFreq: {
      type: 'smallInt',
      default: 2,
      min: 1,
      max: 16,
      step: 1,
      description: 'Density oscillation cycles',
    },
    reachFreq: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      description: 'Reach oscillation cycles',
    },
    minReach: {
      type: 'unit',
      default: 0.15,
      min: 0.05,
      max: 0.5,
      step: 0.05,
      description: 'Minimum tether length',
    },
    maxReach: {
      type: 'unit',
      default: 0.5,
      min: 0.2,
      max: 4.0,
      step: 0.05,
      description: 'Maximum tether length',
    },
    densityContrast: {
      type: 'unit',
      default: 0.6,
      min: 0.0,
      max: 0.9,
      step: 0.05,
      description: 'Step size variation',
    },
  },

  randomize: {
    densityFreq: [1, 2, 3, 4] as const,
    reachFreq: [2, 3, 4, 5] as const,
    minReach: [0.1, 0.3],
    maxReach: [0.4, 0.8],
    densityContrast: [0.3, 0.8],
  },

  create: (count, options, { densityFreq, reachFreq, minReach, maxReach, densityContrast }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const phaseA = rand(0, TAU);
    const phaseB = rand(0, TAU);

    // A walks the full perimeter (4 units)
    const totalDistance = 4;
    const baseStep = totalDistance / count;

    // Pre-compute A's positions by accumulating variable steps
    const positionsA: number[] = [];
    let posA = rand(0, 4);

    for (let i = 0; i < count; i++) {
      positionsA.push(posA);

      // Oscillator A: modulates step size (density)
      const angleA = (TAU * densityFreq * i) / count + phaseA;
      const stepMod = 1 + densityContrast * Math.sin(angleA);
      const step = baseStep * stepMod;

      posA += step;
    }

    // Convert reach params from normalized (0-1) to perimeter units (0-2)
    const minReachPerim = minReach * 2;
    const maxReachPerim = maxReach * 2;
    const reachRange = maxReachPerim - minReachPerim;

    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      const p0 = positionsA[i];

      // Oscillator B: modulates tether length (reach)
      const angleB = t * reachFreq * TAU + phaseB;
      const reachMod = (Math.sin(angleB) + 1) / 2; // 0 to 1
      const reach = minReachPerim + reachMod * reachRange;

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
