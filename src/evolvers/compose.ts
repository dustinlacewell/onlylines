// Composition utilities for building evolvers from Motion + Mapper
// This is the glue that connects the two-tier composable architecture

import type { LineContext, DashValue, DashEvolver, NumberEvolver } from './types';
import type { Motion } from './motion';
import type { Mapper } from './mappers';

// === CORE COMPOSITION ===

// Compose a motion and mapper into an evolver-like object
export function compose<T>(
  motion: Motion,
  mapper: Mapper<T>,
  name: string
): { name: string; getValue: (ctx: LineContext) => T } {
  return {
    name,
    getValue: (ctx) => mapper(motion(ctx), ctx),
  };
}


// === DASH OUTPUT ADAPTERS ===

// Convert a number mapper (0-1) to a dash mapper with variable gap
export const toDashGap = (
  mapper: Mapper<number>,
  maxGap: number = 20,
  dashLen: number = 10
): Mapper<DashValue> =>
  (t, ctx) => {
    const v = mapper(t, ctx);
    const gap = v * maxGap;
    if (gap < 1) {
      return { pattern: [], offset: 0 }; // Solid
    }
    return { pattern: [dashLen, gap], offset: 0 };
  };

// Convert a number mapper (0-1) to binary dash (solid vs dashed)
export const toBinaryDash = (
  mapper: Mapper<number>,
  threshold: number = 0.5,
  solidPattern: number[] = [],
  dashedPattern: number[] = [5, 15]
): Mapper<DashValue> =>
  (t, ctx) => ({
    pattern: mapper(t, ctx) > threshold ? solidPattern : dashedPattern,
    offset: 0,
  });

// Direct dash value - for when mapper already produces dash-like values
export const toDashDirect = (
  mapper: Mapper<number>,
  minDash: number = 3,
  maxDash: number = 15,
  minGap: number = 3,
  maxGap: number = 20
): Mapper<DashValue> =>
  (t, ctx) => {
    const v = mapper(t, ctx);
    const dashLen = minDash + v * (maxDash - minDash);
    // Gap is inverse for interesting effect
    const gapV = mapper(t + 0.25, ctx); // Phase offset for gap
    const gap = minGap + gapV * (maxGap - minGap);
    return { pattern: [dashLen, gap], offset: 0 };
  };


// === ALPHA OUTPUT ADAPTERS ===

// Alpha is already 0-1, so minimal transformation needed
export const toAlpha = (
  mapper: Mapper<number>,
  min: number = 0,
  max: number = 1
): Mapper<number> =>
  (t, ctx) => min + mapper(t, ctx) * (max - min);


// === LINEWIDTH OUTPUT ADAPTERS ===

// LineWidth as multiplier on base width
export const toWidthMultiplier = (
  mapper: Mapper<number>,
  minMult: number = 0.5,
  maxMult: number = 2
): Mapper<number> =>
  (t, ctx) => {
    const mult = minMult + mapper(t, ctx) * (maxMult - minMult);
    return ctx.line.lineWidth * mult;
  };


// === EVOLVER FACTORIES ===
// Create typed evolvers from composed motion + mapper

export function createDashEvolver(
  motion: Motion,
  mapper: Mapper<DashValue>,
  name: string
): DashEvolver {
  return {
    name,
    getValue: (ctx) => mapper(motion(ctx), ctx),
  };
}

export function createNumberEvolver(
  motion: Motion,
  mapper: Mapper<number>,
  name: string
): NumberEvolver {
  return {
    name,
    getValue: (ctx) => mapper(motion(ctx), ctx),
  };
}


