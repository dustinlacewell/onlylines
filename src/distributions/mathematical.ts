import { rand, pick, mod, TAU } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions } from './types';
import { makeLine } from './utils';

// Lissajous curve
export const lissajous = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const a = pick([1, 2, 3, 4, 5]);
  const b = pick([1, 2, 3, 4, 5].filter(x => x !== a));
  const delta = rand(0, Math.PI);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * TAU;
    const x = Math.sin(a * t + delta);
    const y = Math.sin(b * t);
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const magnitude = Math.sqrt(x * x + y * y);
    const reach = 1 + magnitude * 0.8;
    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};

// Rose curve (rhodonea)
export const roseCurve = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.15);
  const width = options.lineWidth ?? 1;
  const k = pick([2, 3, 4, 5, 6, 7]);
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const theta = (i / count) * TAU;
    const r = Math.cos(k * theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const p0 = mod((Math.atan2(y, x) / TAU + 0.5) * 4, 4);
    const reach = 0.8 + Math.abs(r) * 1.2;
    return makeLine(p0, p0 + reach, speed, dir, width);
  });
};

// Modular arithmetic pattern
export const modularPattern = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const modulus = count;
  const multiplier = pick([2, 3, 5, 7, 11, 13].filter(m => m < count));
  const dir = pick([-1, 1]);

  return Array.from({ length: count }, (_, i) => {
    const p0 = (i / count) * 4;
    const target = (i * multiplier) % modulus;
    const p1 = (target / count) * 4;
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
};
