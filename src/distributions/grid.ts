import { rand } from '../utils';
import type { LineConfig } from '../types';
import type { DistributionOptions, DistributionParams } from './types';
import { makeLine } from './utils';

// Orthogonal grid
export const grid = (count: number, options: DistributionOptions = {}, _params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.02, 0.08);
  const width = options.lineWidth ?? 1;
  const halfCount = Math.floor(count / 2);
  const lines: LineConfig[] = [];

  // Horizontal lines (left edge to right edge)
  for (let i = 0; i < halfCount; i++) {
    const t = (i + 0.5) / halfCount;
    lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
  }
  // Vertical lines (top edge to bottom edge)
  for (let i = 0; i < count - halfCount; i++) {
    const t = (i + 0.5) / (count - halfCount);
    lines.push(makeLine(0 + t, 2 + (1 - t), speed, 1, width));
  }
  return lines;
};

// Woven/interlaced pattern - alternating directions create weave effect
export const woven = (count: number, options: DistributionOptions = {}, _params: DistributionParams = {}): LineConfig[] => {
  const speed = options.speed ?? rand(0.03, 0.08);
  const width = options.lineWidth ?? 1;
  const lines: LineConfig[] = [];

  // Interleave horizontal and vertical lines for weave effect
  for (let i = 0; i < count; i++) {
    const isHorizontal = i % 2 === 0;
    const idx = Math.floor(i / 2);
    const total = Math.ceil(count / 2);
    const t = (idx + 0.5) / total;

    if (isHorizontal) {
      // Horizontal: left edge to right edge
      lines.push(makeLine(3 + t, 1 + (1 - t), speed, 1, width));
    } else {
      // Vertical: top edge to bottom edge
      lines.push(makeLine(0 + t, 2 + (1 - t), speed, -1, width));
    }
  }
  return lines;
};
