import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * RotationalSymmetry - N-fold rotational symmetry
 *
 * Creates a base pattern then rotates it N times around the center.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.folds - Number of symmetry folds (default: 2,3,4,5,6,8)
 */
export const rotationalSymmetry = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
  const folds = params.folds !== undefined ? Math.round(params.folds) : pick([2, 3, 4, 5, 6, 8]);
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
