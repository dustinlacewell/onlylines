// Option metadata for evolvers
// This allows the debug UI to dynamically show controls for each evolver's options

export type OptionType = 'select' | 'number' | 'boolean';

export interface SelectOption {
  type: 'select';
  label: string;
  values: readonly string[];
  default: string;
}

export interface NumberOption {
  type: 'number';
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface BooleanOption {
  type: 'boolean';
  label: string;
  default: boolean;
}

export type OptionDef = SelectOption | NumberOption | BooleanOption;

export interface EvolverOptionsMeta {
  [key: string]: OptionDef;
}

// Registry of evolver option metadata
export const dashEvolverOptions: Record<string, EvolverOptionsMeta> = {
  // Static patterns - no options
  none: {},
  dashed: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 30, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 30, step: 1, default: 10 },
  },
  dotted: {
    dotSize: { type: 'number', label: 'Dot', min: 1, max: 10, step: 1, default: 2 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 20, step: 1, default: 8 },
  },
  morse: {
    dashLen: { type: 'number', label: 'Dash', min: 5, max: 30, step: 1, default: 15 },
    dotLen: { type: 'number', label: 'Dot', min: 1, max: 10, step: 1, default: 3 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 15, step: 1, default: 5 },
  },

  // Marching patterns
  marching: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 30, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 30, step: 1, default: 10 },
    speed: { type: 'number', label: 'Speed', min: 10, max: 150, step: 5, default: 50 },
  },
  marchingReverse: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 30, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 30, step: 1, default: 10 },
    speed: { type: 'number', label: 'Speed', min: 10, max: 150, step: 5, default: 50 },
  },
  marchingWave: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 30, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 30, step: 1, default: 10 },
    speed: { type: 'number', label: 'Speed', min: 10, max: 150, step: 5, default: 50 },
    phaseSpread: { type: 'number', label: 'Phase', min: 0, max: 1, step: 0.1, default: 0.5 },
  },
  marchingAlternate: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 30, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 30, step: 1, default: 10 },
    speed: { type: 'number', label: 'Speed', min: 10, max: 150, step: 5, default: 50 },
  },

  // Breathing/pulsing
  breathingDash: {
    minDash: { type: 'number', label: 'Min', min: 1, max: 15, step: 1, default: 5 },
    maxDash: { type: 'number', label: 'Max', min: 10, max: 40, step: 1, default: 20 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 20, step: 1, default: 10 },
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 2, step: 0.1, default: 0.5 },
  },
  pulsingGap: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 20, step: 1, default: 10 },
    minGap: { type: 'number', label: 'Min Gap', min: 1, max: 10, step: 1, default: 2 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 40, step: 1, default: 20 },
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 2, step: 0.1, default: 0.5 },
  },
  depthDash: {
    nearDash: { type: 'number', label: 'Near', min: 5, max: 40, step: 1, default: 20 },
    farDash: { type: 'number', label: 'Far', min: 1, max: 20, step: 1, default: 5 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 20, step: 1, default: 10 },
  },
  strobeDash: {
    dashLen: { type: 'number', label: 'Dash', min: 2, max: 20, step: 1, default: 10 },
    gapLen: { type: 'number', label: 'Gap', min: 2, max: 20, step: 1, default: 10 },
    strobeSpeed: { type: 'number', label: 'Strobe', min: 1, max: 10, step: 0.5, default: 4 },
  },

  // Composed evolvers with options
  cascade: {
    edge: { type: 'select', label: 'Edge', values: ['wrap', 'bounce'] as const, default: 'wrap' },
    speedMode: { type: 'select', label: 'Speed Mode', values: ['relative', 'absolute'] as const, default: 'relative' },
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 100, step: 0.1, default: 0.4 },
    width: { type: 'number', label: 'Width', min: 0.05, max: 0.5, step: 0.01, default: 0.15 },
  },
  rollingSolid: {
    edge: { type: 'select', label: 'Edge', values: ['wrap', 'bounce'] as const, default: 'wrap' },
    speedMode: { type: 'select', label: 'Speed Mode', values: ['relative', 'absolute'] as const, default: 'relative' },
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 100, step: 0.1, default: 0.3 },
    bandWidth: { type: 'number', label: 'Band Width', min: 0.1, max: 0.6, step: 0.05, default: 0.3 },
    maxGap: { type: 'number', label: 'Max Gap', min: 5, max: 40, step: 1, default: 20 },
  },
  rollingDashes: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.5, step: 0.05, default: 0.2 },
    dashLen: { type: 'number', label: 'Dash', min: 5, max: 20, step: 1, default: 10 },
  },
  sineWaveGap: {
    edge: { type: 'select', label: 'Edge', values: ['wrap', 'bounce'] as const, default: 'wrap' },
    speedMode: { type: 'select', label: 'Speed Mode', values: ['relative', 'absolute'] as const, default: 'relative' },
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 100, step: 0.05, default: 0.2 },
    waves: { type: 'number', label: 'Waves', min: 1, max: 6, step: 1, default: 2 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 40, step: 1, default: 25 },
  },
  doubleHelix: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.5, step: 0.05, default: 0.15 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 40, step: 1, default: 20 },
  },
  gradientRoll: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.5, step: 0.05, default: 0.15 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 40, step: 1, default: 25 },
  },
  ripple: {
    speedMode: { type: 'select', label: 'Speed Mode', values: ['relative', 'absolute'] as const, default: 'relative' },
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 100, step: 0.1, default: 0.3 },
    rippleCount: { type: 'number', label: 'Rings', min: 1, max: 6, step: 1, default: 3 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 40, step: 1, default: 20 },
  },
  breathingWave: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.5, step: 0.05, default: 0.2 },
    minDash: { type: 'number', label: 'Min Dash', min: 1, max: 10, step: 1, default: 3 },
    maxDash: { type: 'number', label: 'Max Dash', min: 8, max: 25, step: 1, default: 15 },
    minGap: { type: 'number', label: 'Min Gap', min: 1, max: 10, step: 1, default: 3 },
    maxGap: { type: 'number', label: 'Max Gap', min: 10, max: 35, step: 1, default: 20 },
  },
  harmonic: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.4, step: 0.05, default: 0.15 },
    maxGap: { type: 'number', label: 'Max Gap', min: 15, max: 40, step: 1, default: 25 },
  },
  interference: {
    speed: { type: 'number', label: 'Speed', min: 0.1, max: 0.5, step: 0.05, default: 0.2 },
    maxGap: { type: 'number', label: 'Max Gap', min: 15, max: 35, step: 1, default: 22 },
  },
  pendulum: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.4, step: 0.05, default: 0.15 },
    maxGap: { type: 'number', label: 'Max Gap', min: 15, max: 40, step: 1, default: 25 },
  },
  dissolve: {
    speed: { type: 'number', label: 'Speed', min: 0.05, max: 0.5, step: 0.05, default: 0.2 },
    threshold: { type: 'number', label: 'Threshold', min: 0.1, max: 0.6, step: 0.05, default: 0.3 },
  },
};

// Helper to get default values for an evolver's options
export function getDefaultOptions(evolverName: string): Record<string, unknown> {
  const meta = dashEvolverOptions[evolverName];
  if (!meta) return {};

  const defaults: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(meta)) {
    defaults[key] = def.default;
  }
  return defaults;
}
