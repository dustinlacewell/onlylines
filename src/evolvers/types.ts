import type { Line } from '../line';
import type { WaveContext } from './waves';

// Forward reference to avoid circular dependency
export interface EvolverWorld {
  time: number;
  lines: Line[];
  config: Record<string, unknown>;
}

// Context for per-line evolvers
export interface LineContext extends WaveContext {
  line: Line;
  world: EvolverWorld;
}

// === EVOLVER TYPES ===

// Per-line evolver - operates on one line at a time
// Most evolvers are this type - coordination happens via phase offset from index
export interface Evolver<T> {
  name: string;
  // Compute value for a single line
  getValue: (ctx: LineContext) => T;
}

// === SPECIFIC EVOLVER TYPES ===

// Position evolver - returns delta to apply to perim0/perim1
export type PositionEvolver = Evolver<{ delta0: number; delta1: number }>;

// Color evolver - returns color string
export type ColorEvolver = Evolver<string>;

// Number evolver - for alpha, lineWidth, brightness
export type NumberEvolver = Evolver<number>;

// Dash evolver - returns dash pattern and offset
export interface DashValue {
  pattern: number[];  // e.g., [10, 5] for 10px dash, 5px gap
  offset: number;     // lineDashOffset for animation
}
export type DashEvolver = Evolver<DashValue>;

// === EVOLVER SET ===

// A complete set of evolvers for a world
export interface EvolverSet {
  // Position evolvers (applied in order, deltas summed)
  position: PositionEvolver[];

  // Color evolver (only one active - last one wins)
  color: ColorEvolver | null;

  // Alpha evolver (multiplied with line's base alpha)
  alpha: NumberEvolver | null;

  // LineWidth evolver (multiplied with line's base lineWidth)
  lineWidth: NumberEvolver | null;

  // Dash evolver (pattern and animated offset)
  dash: DashEvolver | null;
}

// === HELPER TO CREATE LINE CONTEXT ===

export function makeLineContext(
  line: Line,
  index: number,
  world: EvolverWorld,
  dt: number
): LineContext {
  return {
    line,
    index,
    total: world.lines.length,
    time: world.time,
    dt,
    world,
  };
}
