import { rand, pick } from '../../utils';
import type { LineConfig } from '../../types';
import type { DistributionOptions, DistributionParams } from '../types';
import { makeLine } from '../utils';

/**
 * SymmetricSpokes - Spokes with n-fold rotational symmetry
 *
 * Divides the canvas into N symmetric sections and fills each
 * with evenly-spaced radial lines.
 *
 * @param count - Number of lines
 * @param options.speed - Animation speed (default: 0.05-0.15)
 * @param options.lineWidth - Line thickness (default: 1)
 * @param params.symmetry - Number of symmetric sections (default: random from 3,4,5,6,8)
 */
export const symmetricSpokes = (
  count: number,
  options: DistributionOptions = {},
  params: DistributionParams = {}
): LineConfig[] => {
  const speed = options.speed ?? rand(0.05, 0.15);
  const width = options.lineWidth ?? 1;
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
