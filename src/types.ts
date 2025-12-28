import type { Line } from './line';
import type { EvolverSet } from './evolvers/types';

// Re-export evolver types
export type {
  EvolverSet,
  PositionEvolver,
  ColorEvolver,
  NumberEvolver,
} from './evolvers/types';

export interface WorldConfig {
  bg: string;
  fade: number;
  info: {
    count: number;
    distro: string;
    behavior: string;
    colorScheme: string;
  };
}

export interface LineConfig {
  perim0: number;
  perim1: number;
  speed0?: number;
  speed1?: number;
  dir0?: number;
  dir1?: number;
  lineWidth?: number;
  alpha?: number;
  brightness?: number;
}

export interface World {
  time: number;
  evolvers: EvolverSet;
  lines: Line[];
  config: Partial<WorldConfig>;
  update(dt: number): void;
  getLineColor(line: Line, index: number): string;
  getLineAlpha(line: Line, index: number): number;
  getLineWidth(line: Line, index: number): number;
}
