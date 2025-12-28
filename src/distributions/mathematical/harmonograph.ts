import { rand, pick, mod, TAU } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * Harmonograph - Simulates a harmonograph drawing machine
 *
 * Combines multiple decaying sinusoidal motions to create
 * complex, organic-looking patterns like those drawn by
 * physical pendulum-based drawing machines.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.06-0.12)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.freqRatio - Frequency ratio between oscillators (default: 2-5)
 * @param params.decay - Decay rate (default: 0.5-2)
 */
export const harmonograph = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.06, 0.12);
  const width = options.lineWidth ?? 1;
  const freqRatio = params.freqRatio !== undefined ? params.freqRatio : pick([2, 2.5, 3, 3.5, 4, 5]);
  const decay = params.decay !== undefined ? params.decay : rand(0.5, 2);
  const dir = pick([-1, 1]);

  // Random phase offsets for variety
  const phase1 = rand(0, TAU);
  const phase2 = rand(0, TAU);
  const phase3 = rand(0, TAU);

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU * 4; // Multiple rotations for complexity
    const damping = Math.exp(-t * decay * 0.1);

    // Two perpendicular damped oscillators
    const x = damping * (
      Math.sin(t + phase1) +
      0.5 * Math.sin(freqRatio * t + phase2)
    );
    const y = damping * (
      Math.sin(t * 1.01 + phase3) + // Slight detuning for organic feel
      0.5 * Math.cos(freqRatio * t + phase1)
    );

    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const magnitude = Math.sqrt(x * x + y * y);
    const reach = 0.5 + magnitude * 1.3;

    return makeLine(p0, p0 + reach, speed * (0.5 + damping * 0.5), dir, width);
  });
};
