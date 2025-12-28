import { rand, pick } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions, DistributionParams } from './types';
import { makeLine } from './utils';

// Perfect star burst from center
export const star = (count: number, options: DistributionOptions = {}, _params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.2);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);
  const offset = rand(0, 4);

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 4 + offset;
    return makeLine(angle, angle + 2, speed, dir, width);
  });
};

// Star with alternating lengths
export const starBurst = (count: number, options: DistributionOptions = {}, _params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.08, 0.2);
  const width = options.lineWidth ?? 1;
  const dir = pick([-1, 1]);
  const offset = rand(0, 4);
  const lengths = [2, 1.8, 1.5, 1.2];

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 4 + offset;
    const len = lengths[i % lengths.length];
    return makeLine(angle, angle + len, speed, dir, width);
  });
};

// Spokes with n-fold symmetry
export const symmetricSpokes = (count: number, options: DistributionOptions = {}, params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
  // Use param if provided, otherwise pick random
  const symmetry = params.symmetry !== undefined ? Math.round(params.symmetry) : pick([3, 4, 5, 6, 8]);
  const spokesPerSection = Math.max(1, Math.floor(count / symmetry));
  const lines: LineConfig[] = [];
  const dir = pick([-1, 1]);

  for (let s = 0; s < symmetry; s++) {
    const sectionStart = (s / symmetry) * 4;
    const sectionWidth = 4 / symmetry;

    for (let i = 0; i < spokesPerSection && lines.length < count; i++) {
      const t = (i + 0.5) / spokesPerSection;
      const angle = sectionStart + t * sectionWidth * 0.8;
      lines.push(makeLine(angle, angle + 2, speed, dir, width));
    }
  }
  return lines;
};
