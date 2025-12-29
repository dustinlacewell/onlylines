// System-level evolver architecture
// Separates motion computation from mapping functions
// See /llm/evolver-architecture.md for full design

import type { Line } from '../../line';

// === MOTION CONFIG ===
// System-level configuration that determines how t is computed for each line

export type MotionMode = 'field' | 'focal' | 'spread';
export type EdgeBehavior = 'wrap' | 'bounce';

export interface MotionConfig {
  /** How line index maps to base t value */
  mode: MotionMode;

  /** Animation speed (cycles per second, roughly) */
  speed: number;

  /** What happens at t boundaries */
  edge: EdgeBehavior;

  /** Flip direction */
  reversed: boolean;

  /** Per-line phase stagger (0 = all in sync, 1 = full spread) */
  phaseSpread: number;

  /** Global phase offset (shifts entire animation) */
  phaseOffset: number;

  /** Spatial frequency multiplier (how many waves across all lines) */
  waves: number;

  /** Flip direction for every other line */
  alternate: boolean;
}

/** Default motion config */
export const defaultMotionConfig: MotionConfig = {
  mode: 'field',
  speed: 0.2,
  edge: 'wrap',
  reversed: false,
  phaseSpread: 0,
  phaseOffset: 0,
  waves: 1,
  alternate: false,
};

// === MAPPER CONTEXT ===
// What each mapper function receives

export interface MapperContext {
  /** Primary input: 0-1 value computed by system from MotionConfig */
  t: number;

  /** Raw values available for special cases */
  index: number;
  total: number;
  time: number;

  /** Line data for line-specific effects */
  line: Line;
}

// === MAPPER TYPE ===
// Pure function that transforms t into an output value

export type Mapper = (ctx: MapperContext) => number;

export type MapperFactory<TOptions = Record<string, unknown>> = (options?: TOptions) => Mapper;

// === COMPUTE T ===
// Core system function that produces t for each line based on MotionConfig

export function computeT(
  config: MotionConfig,
  index: number,
  total: number,
  time: number
): number {
  const { mode, speed, edge, reversed, phaseSpread, phaseOffset, waves, alternate } = config;

  // 1. Compute base spatial component
  let spatial: number;
  const normalizedIndex = index / Math.max(1, total - 1);

  switch (mode) {
    case 'field':
      // Linear across indices (0 at first line, 1 at last)
      spatial = normalizedIndex;
      break;
    case 'focal':
      // Distance from center (0 at center, 1 at edges)
      spatial = Math.abs(normalizedIndex - 0.5) * 2;
      break;
    case 'spread':
      // Pure time-based, no spatial component
      spatial = 0;
      break;
  }

  // 2. Apply waves multiplier
  spatial *= waves;

  // 3. Combine with time (reversed flips direction)
  const timeDirection = reversed ? -1 : 1;
  let t = spatial + time * speed * timeDirection;

  // 4. Add phase offsets
  t += (index / Math.max(1, total)) * phaseSpread;
  t += phaseOffset;

  // 5. Apply edge behavior
  switch (edge) {
    case 'wrap':
      t = ((t % 1) + 1) % 1; // Handle negative values
      break;
    case 'bounce':
      t = Math.abs(t) % 2;
      t = t > 1 ? 2 - t : t;
      break;
  }

  // 6. Apply alternation (odd lines go opposite direction)
  if (alternate && index % 2 === 1) {
    t = 1 - t;
  }

  return t;
}

// === MAPPER CONTEXT FACTORY ===

export function makeMapperContext(
  t: number,
  index: number,
  total: number,
  time: number,
  line: Line
): MapperContext {
  return { t, index, total, time, line };
}

// === CONVENIENCE: Apply motion config to get context ===

export function applyMotion(
  config: MotionConfig,
  index: number,
  total: number,
  time: number,
  line: Line
): MapperContext {
  const t = computeT(config, index, total, time);
  return makeMapperContext(t, index, total, time, line);
}
