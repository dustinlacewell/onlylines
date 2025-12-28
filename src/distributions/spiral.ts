import { rand, pick, TAU } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions } from './types';
import { makeLine } from './utils';

// Classic spiral
export const spiral = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.1, 0.2);
  const width = options.lineWidth ?? 1;
  const turns = rand(2, 5);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = t * turns * 4;
    const reach = 0.3 + t * 1.5;
    return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
  });
};

// Double spiral (two interleaved)
export const doubleSpiral = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.1, 0.2);
  const width = options.lineWidth ?? 1;
  const turns = rand(1.5, 3);

  return Array.from({ length: count }, (_, i) => {
    const arm = i % 2;
    const idx = Math.floor(i / 2);
    const t = idx / (count / 2);
    const angle = t * turns * 4 + arm * 2;
    const reach = 0.3 + t * 1.2;
    const dir = arm === 0 ? 1 : -1;
    return makeLine(angle, angle + reach, speed * (0.5 + t), dir, width);
  });
};

// Golden spiral using fibonacci angle
export const goldenSpiral = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const phi = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = 4 / (phi * phi);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const angle = i * goldenAngle;
    const r = Math.sqrt(i / count);
    const reach = 0.5 + r * 1.5;
    return makeLine(angle, angle + reach, speed * (0.3 + r * 0.7), dir, width);
  });
};

// Sunflower/phyllotaxis
export const sunflower = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const phi = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = TAU / (phi * phi);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const theta = i * goldenAngle;
    const r = Math.sqrt(i);
    const maxR = Math.sqrt(count);
    const normalizedR = r / maxR;

    const p0 = ((theta / TAU) * 4) % 4;
    const reach = 0.5 + normalizedR * 1.5;
    return makeLine(p0, p0 + reach, speed * (0.5 + normalizedR * 0.5), dir, width);
  });
};
