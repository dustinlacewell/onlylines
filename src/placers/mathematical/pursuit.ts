// Pursuit placer - Agents chasing each other around the perimeter
//
// Inspired by pursuit curves: multiple agents on the perimeter where each agent
// moves toward the next. Lines connect each agent to its target.
//
// The pursuit dynamics create beautiful spiraling patterns. With N agents evenly
// spaced initially, the pursuit converges toward the center as a logarithmic spiral.
// We capture snapshots of this pursuit over time.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const pursuit = registerPlacer({
  id: 36,
  name: 'pursuit',
  category: 'mathematical',
  description: 'Agents chasing each other around the perimeter',

  params: {
    agents: {
      type: 'smallInt',
      default: 4,
      min: 3,
      max: 8,
      description: 'Number of chasing agents',
    },
    chaseRate: {
      type: 'unit',
      default: 0.3,
      min: 0.1,
      max: 0.5,
      description: 'How fast agents close the gap per step',
    },
  },

  randomize: {
    agents: [3, 4, 5, 6] as const,
    chaseRate: [0.15, 0.4],
  },

  create: (count, options, { agents, chaseRate }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    // Initialize agents evenly spaced around perimeter
    let positions = Array.from({ length: agents }, (_, i) => (i / agents) * 4);

    const lines: Array<{
      perim0: number;
      perim1: number;
      speed0: number;
      speed1: number;
      dir0: number;
      dir1: number;
      lineWidth: number;
    }> = [];

    const stepsPerIteration = Math.floor(count / agents);

    for (let step = 0; step < stepsPerIteration; step++) {
      // Record current configuration - each agent connects to its target
      for (let a = 0; a < agents; a++) {
        const target = (a + 1) % agents;
        lines.push({
          perim0: mod(positions[a], 4),
          perim1: mod(positions[target], 4),
          speed0: speed,
          speed1: speed,
          dir0: dir,
          dir1: dir,
          lineWidth: width,
        });
      }

      // Update positions - each agent moves toward its target
      const newPositions = positions.map((pos, a) => {
        const target = (a + 1) % agents;
        const targetPos = positions[target];

        // Calculate shortest path around perimeter (handles wraparound)
        let delta = targetPos - pos;
        if (delta > 2) delta -= 4;
        if (delta < -2) delta += 4;

        return pos + delta * chaseRate;
      });

      positions = newPositions;
    }

    return lines.slice(0, count);
  },
});
