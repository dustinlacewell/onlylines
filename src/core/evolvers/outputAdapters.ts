// Output adapters - convert mapper output (0-1) to specific draw prop formats
// These are the final stage of the Motion -> Mapper -> Output pipeline

import type { DashValue } from './types';
import type { Palette } from '../palette';
import { samplePalette, hslToString } from '../palette';

// === OUTPUT CONFIG TYPES ===

export interface DashOutputConfig {
  /** Length of each dash segment */
  dashLen: number;
  /** Maximum gap size (gap = value * maxGap) */
  maxGap: number;
  /** Optional marching speed (offset = time * marching) */
  marching?: number;
}

export interface ColorOutputConfig {
  /** Palette to sample from */
  palette: Palette;
}

export interface RangeOutputConfig {
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
}

// Default configs
export const defaultDashOutput: DashOutputConfig = {
  dashLen: 10,
  maxGap: 20,
  marching: 0,
};

export const defaultAlphaOutput: RangeOutputConfig = {
  min: 0.2,
  max: 1,
};

export const defaultLineWidthOutput: RangeOutputConfig = {
  min: 0.5,
  max: 2,
};

// === DASH OUTPUT ===

export function toDash(
  value: number,
  config: DashOutputConfig,
  time: number
): DashValue {
  const gap = value * config.maxGap;
  const offset = config.marching ? time * config.marching : 0;

  if (gap < 1) {
    // Solid line
    return { pattern: [], offset };
  }

  return {
    pattern: [config.dashLen, gap],
    offset,
  };
}

// Binary dash - solid vs dashed based on threshold
export function toBinaryDash(
  value: number,
  threshold: number,
  solidPattern: number[] = [],
  dashedPattern: number[] = [5, 15],
  time: number = 0,
  marching: number = 0
): DashValue {
  return {
    pattern: value < threshold ? solidPattern : dashedPattern,
    offset: marching ? time * marching : 0,
  };
}

// Variable dash and gap
export function toVariableDash(
  value: number,
  minDash: number,
  maxDash: number,
  minGap: number,
  maxGap: number
): DashValue {
  const dashLen = minDash + value * (maxDash - minDash);
  // Use inverse for gap to create interesting effect
  const gap = minGap + (1 - value) * (maxGap - minGap);

  if (gap < 1 && dashLen < 1) {
    return { pattern: [], offset: 0 };
  }

  return {
    pattern: [Math.max(1, dashLen), Math.max(1, gap)],
    offset: 0,
  };
}

// === COLOR OUTPUT ===

export function toColor(
  value: number,
  palette: Palette,
  alpha: number = 1
): string {
  const color = samplePalette(palette, value);
  return hslToString(color, alpha);
}

// === RANGE OUTPUT (for alpha, lineWidth, etc.) ===

export function toRange(
  value: number,
  min: number,
  max: number
): number {
  return min + value * (max - min);
}

// LineWidth with base multiplier
export function toLineWidth(
  value: number,
  baseWidth: number,
  minMult: number,
  maxMult: number
): number {
  const mult = minMult + value * (maxMult - minMult);
  return baseWidth * mult;
}
