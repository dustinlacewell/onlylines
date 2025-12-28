// Evolver Factory - creates typed evolvers from config
// This is the main entry point for the new architecture

import type { DashEvolver, ColorEvolver, NumberEvolver, LineContext } from './types';
import type { DashValue } from './types';
import type { Palette, HSL } from './palettes';
import { palettes } from './palettes';
import {
  type MotionConfig,
  defaultMotionConfig,
  computeT,
  makeMapperContext,
} from './system';
import { getMapper } from './mapperCatalog';
import {
  type DashOutputConfig,
  type RangeOutputConfig,
  defaultDashOutput,
  defaultAlphaOutput,
  defaultLineWidthOutput,
  toDash,
  toColor,
  toRange,
  toLineWidth,
} from './outputAdapters';

// === SLOT CONFIG TYPES ===

export interface EvolverSlotConfig<TOutput> {
  /** Which mapper function to use */
  mapper: string;
  /** Options for the mapper factory */
  mapperOptions?: Record<string, unknown>;
  /** Motion configuration */
  motion: Partial<MotionConfig>;
  /** Output adapter configuration */
  output: TOutput;
}

export interface DashSlotConfig extends EvolverSlotConfig<Partial<DashOutputConfig>> {}

export interface ColorSlotConfig extends EvolverSlotConfig<{ palette: string }> {}

export interface AlphaSlotConfig extends EvolverSlotConfig<Partial<RangeOutputConfig>> {}

export interface LineWidthSlotConfig extends EvolverSlotConfig<Partial<RangeOutputConfig> & { mode?: 'absolute' | 'multiplier' }> {}

// === WORLD EVOLVER CONFIG ===

export interface WorldEvolverConfig {
  dash?: DashSlotConfig;
  color?: ColorSlotConfig;
  alpha?: AlphaSlotConfig;
  lineWidth?: LineWidthSlotConfig;
}

// === EVOLVER FACTORIES ===

export function createDashEvolverFromConfig(config: DashSlotConfig): DashEvolver {
  const motion: MotionConfig = { ...defaultMotionConfig, ...config.motion };
  const output: DashOutputConfig = { ...defaultDashOutput, ...config.output };
  const mapper = getMapper(config.mapper, config.mapperOptions);

  return {
    name: `dash:${config.mapper}`,
    getValue: (ctx: LineContext): DashValue => {
      const t = computeT(motion, ctx.index, ctx.total, ctx.time);
      const mapperCtx = makeMapperContext(t, ctx.index, ctx.total, ctx.time, ctx.line);
      const value = mapper(mapperCtx);
      return toDash(value, output, ctx.time);
    },
  };
}

export function createColorEvolverFromConfig(config: ColorSlotConfig): ColorEvolver {
  const motion: MotionConfig = { ...defaultMotionConfig, ...config.motion };
  const rawPalette = palettes[config.output.palette as keyof typeof palettes] ?? palettes.sunset;
  // Convert readonly palette to mutable for Palette interface
  const palette: Palette = {
    name: rawPalette.name,
    colors: rawPalette.colors.map(c => ({ h: c.h, s: c.s, l: c.l })) as HSL[],
  };
  const mapper = getMapper(config.mapper, config.mapperOptions);

  return {
    name: `color:${config.mapper}`,
    getValue: (ctx: LineContext): string => {
      const t = computeT(motion, ctx.index, ctx.total, ctx.time);
      const mapperCtx = makeMapperContext(t, ctx.index, ctx.total, ctx.time, ctx.line);
      const value = mapper(mapperCtx);
      return toColor(value, palette, ctx.line.alpha);
    },
  };
}

export function createAlphaEvolverFromConfig(config: AlphaSlotConfig): NumberEvolver {
  const motion: MotionConfig = { ...defaultMotionConfig, ...config.motion };
  const output: RangeOutputConfig = { ...defaultAlphaOutput, ...config.output };
  const mapper = getMapper(config.mapper, config.mapperOptions);

  return {
    name: `alpha:${config.mapper}`,
    getValue: (ctx: LineContext): number => {
      const t = computeT(motion, ctx.index, ctx.total, ctx.time);
      const mapperCtx = makeMapperContext(t, ctx.index, ctx.total, ctx.time, ctx.line);
      const value = mapper(mapperCtx);
      return toRange(value, output.min, output.max);
    },
  };
}

export function createLineWidthEvolverFromConfig(config: LineWidthSlotConfig): NumberEvolver {
  const motion: MotionConfig = { ...defaultMotionConfig, ...config.motion };
  const output: RangeOutputConfig = { ...defaultLineWidthOutput, ...config.output };
  const mode = config.output.mode ?? 'multiplier';
  const mapper = getMapper(config.mapper, config.mapperOptions);

  return {
    name: `lineWidth:${config.mapper}`,
    getValue: (ctx: LineContext): number => {
      const t = computeT(motion, ctx.index, ctx.total, ctx.time);
      const mapperCtx = makeMapperContext(t, ctx.index, ctx.total, ctx.time, ctx.line);
      const value = mapper(mapperCtx);

      if (mode === 'absolute') {
        return toRange(value, output.min, output.max);
      } else {
        return toLineWidth(value, ctx.line.lineWidth, output.min, output.max);
      }
    },
  };
}

// === CONVENIENCE: Create all evolvers from world config ===

export interface CreatedEvolvers {
  dash: DashEvolver | null;
  color: ColorEvolver | null;
  alpha: NumberEvolver | null;
  lineWidth: NumberEvolver | null;
}

export function createEvolversFromConfig(config: WorldEvolverConfig): CreatedEvolvers {
  return {
    dash: config.dash ? createDashEvolverFromConfig(config.dash) : null,
    color: config.color ? createColorEvolverFromConfig(config.color) : null,
    alpha: config.alpha ? createAlphaEvolverFromConfig(config.alpha) : null,
    lineWidth: config.lineWidth ? createLineWidthEvolverFromConfig(config.lineWidth) : null,
  };
}

// === PRESETS ===

export const presets = {
  cascade: {
    dash: {
      mapper: 'threshold',
      mapperOptions: { cutoff: 0.15, invert: true },
      motion: { mode: 'focal', speed: 0.4, edge: 'wrap' },
      output: { dashLen: 5, maxGap: 15 },
    },
  } as WorldEvolverConfig,

  rollingSolid: {
    dash: {
      mapper: 'spotLinear',
      mapperOptions: { width: 0.3 },
      motion: { mode: 'focal', speed: 0.3, edge: 'wrap' },
      output: { dashLen: 10, maxGap: 20 },
    },
  } as WorldEvolverConfig,

  sineWave: {
    dash: {
      mapper: 'sine',
      mapperOptions: { frequency: 2 },
      motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
      output: { dashLen: 10, maxGap: 25 },
    },
  } as WorldEvolverConfig,

  ripple: {
    dash: {
      mapper: 'sine',
      mapperOptions: { frequency: 3 },
      motion: { mode: 'focal', speed: 0.3, edge: 'wrap' },
      output: { dashLen: 10, maxGap: 20 },
    },
  } as WorldEvolverConfig,

  breathing: {
    alpha: {
      mapper: 'sine',
      mapperOptions: { frequency: 1 },
      motion: { mode: 'field', speed: 0.3, edge: 'wrap', phaseSpread: 0.5 },
      output: { min: 0.3, max: 1 },
    },
  } as WorldEvolverConfig,

  rainbow: {
    color: {
      mapper: 'identity',
      motion: { mode: 'field', speed: 0.3, edge: 'wrap', phaseSpread: 1 },
      output: { palette: 'rainbow' },
    },
  } as WorldEvolverConfig,

  pulse: {
    dash: {
      mapper: 'pulse',
      mapperOptions: { width: 0.2, sharpness: 2 },
      motion: { mode: 'focal', speed: 0.5, edge: 'bounce' },
      output: { dashLen: 10, maxGap: 20 },
    },
  } as WorldEvolverConfig,

  harmonic: {
    dash: {
      mapper: 'harmonic',
      mapperOptions: { harmonics: 3 },
      motion: { mode: 'field', speed: 0.15, edge: 'wrap' },
      output: { dashLen: 10, maxGap: 25 },
    },
  } as WorldEvolverConfig,

  interference: {
    dash: {
      mapper: 'interference',
      mapperOptions: { ratio: 1.5 },
      motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
      output: { dashLen: 8, maxGap: 22 },
    },
  } as WorldEvolverConfig,

  noise: {
    dash: {
      mapper: 'noise',
      mapperOptions: { scale: 1 },
      motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
      output: { dashLen: 8, maxGap: 20 },
    },
  } as WorldEvolverConfig,
};

export type PresetName = keyof typeof presets;
