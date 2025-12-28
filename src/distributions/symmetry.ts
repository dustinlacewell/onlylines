import { rand, pick } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions } from './types';
import { makeLine } from './utils';

// Perfect bilateral symmetry
export const bilateral = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
  const axis = rand(0, 2);
  const halfCount = Math.ceil(count / 2);
  const lines: LineConfig[] = [];

  for (let i = 0; i < halfCount; i++) {
    const t = (i + 0.5) / halfCount;
    const offset = t * 1.8;
    const reach = 1.5 + t * 0.5;

    lines.push(makeLine(axis + offset, axis + offset + reach, speed, 1, width));
    if (lines.length < count) {
      lines.push(makeLine(axis - offset, axis - offset + reach, speed, 1, width));
    }
  }
  return lines;
};

// N-fold rotational symmetry
export const rotationalSymmetry = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
  const folds = pick([2, 3, 4, 5, 6, 8]);
  const linesPerFold = Math.floor(count / folds);
  const lines: LineConfig[] = [];
  const dir = pick([-1, 1]);

  const basePattern: Array<{ offset: number; reach: number }> = [];
  for (let i = 0; i < linesPerFold; i++) {
    const t = (i + 0.5) / linesPerFold;
    basePattern.push({
      offset: t * (4 / folds) * 0.9,
      reach: 1 + t * 0.8,
    });
  }

  for (let fold = 0; fold < folds; fold++) {
    const foldOffset = (fold / folds) * 4;
    for (const p of basePattern) {
      if (lines.length >= count) break;
      lines.push(makeLine(foldOffset + p.offset, foldOffset + p.offset + p.reach, speed, dir, width));
    }
  }
  return lines;
};

// Kaleidoscope effect (bilateral + rotational)
export const kaleidoscope = (count: number, options: DistributionOptions = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.12);
  const width = options.lineWidth ?? 1;
  const segments = pick([4, 6, 8]);
  const linesPerSegment = Math.floor(count / segments);
  const lines: LineConfig[] = [];

  for (let seg = 0; seg < segments; seg++) {
    const segStart = (seg / segments) * 4;
    const segWidth = 4 / segments;
    const mirror = seg % 2 === 1;

    for (let i = 0; i < linesPerSegment && lines.length < count; i++) {
      const t = (i + 0.5) / linesPerSegment;
      const localT = mirror ? 1 - t : t;
      const angle = segStart + localT * segWidth * 0.9;
      const reach = 1.2 + localT * 0.6;
      lines.push(makeLine(angle, angle + reach, speed, 1, width));
    }
  }
  return lines;
};
