import { rand, pick, TAU } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions, DistributionParams } from './types';
import { makeLine } from './utils';

// Sine wave modulated positions
export const sineWave = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const waves = params.waves !== undefined ? Math.round(params.waves) : pick([1, 2, 3, 4]);
  const amplitude = params.amplitude !== undefined ? params.amplitude : rand(0.3, 0.8);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const wave = Math.sin(t * waves * TAU) * amplitude;
    return makeLine(angle, angle + 2 + wave, speed, dir, width);
  });
};

// Standing wave pattern
export const standingWave = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const nodes = params.nodes !== undefined ? Math.round(params.nodes) : pick([2, 3, 4, 5]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const envelope = Math.sin(t * nodes * Math.PI);
    const reach = 1.5 + Math.abs(envelope) * 0.8;
    return makeLine(angle, angle + reach, speed, dir, width);
  });
};

// Interference pattern (two waves)
export const interference = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const freq1 = params.freq1 !== undefined ? Math.round(params.freq1) : pick([2, 3, 4]);
  const freq2 = params.freq2 !== undefined ? Math.round(params.freq2) : freq1 + pick([1, 2]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * 4;
    const wave1 = Math.sin(t * freq1 * TAU) * 0.4;
    const wave2 = Math.sin(t * freq2 * TAU) * 0.3;
    const combined = wave1 + wave2;
    return makeLine(angle, angle + 2 + combined, speed, dir, width);
  });
};
