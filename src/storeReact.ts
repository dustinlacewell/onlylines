// React bindings for the evolver store
// Uses zustand's React integration

import { create } from 'zustand';
import { type MotionConfig, type MotionMode, type EdgeBehavior } from './evolvers/system';
import {
  type WorldEvolverConfig,
  presets,
  type PresetName,
} from './evolvers/evolverFactory';
import { mapperCatalog as mapperCatalogReal } from './evolvers/mapperCatalog';
import { palettes } from './evolvers/palettes';
import { Distributions } from './distributions/index';
import { rand, randInt, pick, pickW, newSeed, setSeed } from './random';
import { positionEvolverCatalog, distributionCatalog, getCatalogNames } from './catalogs';
import type { PositionEvolverState, DistributionState } from './serialize';

const mapperNames = Object.keys(mapperCatalogReal);
const paletteNames = Object.keys(palettes);
const distributionNames = Object.keys(Distributions);
const positionEvolverNames = getCatalogNames(positionEvolverCatalog);
const motionModes: MotionMode[] = ['field', 'focal', 'spread'];
const edgeBehaviors: EdgeBehavior[] = ['wrap', 'bounce'];

function randomMotion(): Partial<MotionConfig> {
  return {
    mode: pick(motionModes),
    speed: rand(0.05, 0.5),
    edge: pick(edgeBehaviors),
    phaseSpread: rand(0, 1),
    waves: rand(1, 3),
    reversed: pick([true, false]),
    alternate: pick([true, false]),
  };
}

function randomDashSlot(): SlotState<DashOutput> {
  return {
    enabled: pick([true, false]),
    mapper: pick(mapperNames),
    mapperOptions: { frequency: rand(0.5, 3) },
    motion: randomMotion(),
    output: {
      dashLen: Math.round(rand(5, 25)),
      maxGap: Math.round(rand(10, 40)),
      marching: Math.round(rand(0, 80)),
    },
  };
}

function randomAlphaSlot(): SlotState<RangeOutput> {
  return {
    enabled: pick([true, false]),
    mapper: pick(mapperNames),
    mapperOptions: { frequency: rand(0.5, 2) },
    motion: randomMotion(),
    output: {
      min: rand(0.1, 0.4),
      max: rand(0.7, 1),
    },
  };
}

function randomColorSlot(): SlotState<ColorOutput> {
  return {
    enabled: true, // Color always enabled
    mapper: pick(mapperNames),
    mapperOptions: {},
    motion: randomMotion(),
    output: {
      palette: pick(paletteNames),
    },
  };
}

function randomLineWidthSlot(): SlotState<RangeOutput> {
  return {
    enabled: pick([true, false]),
    mapper: pick(mapperNames),
    mapperOptions: { frequency: rand(0.5, 2) },
    motion: randomMotion(),
    output: {
      min: rand(0.3, 1),
      max: rand(1.5, 4),
    },
  };
}

// Generate random params for a position evolver based on its catalog entry
function randomPositionEvolver(): PositionEvolverState {
  const type = pick(positionEvolverNames);
  const entry = positionEvolverCatalog[type];
  const params: Record<string, number> = {};

  for (const [paramName, paramType] of entry.params) {
    // Generate a random value in the valid range for this param type
    // Most params are 0-1 range, decode from random byte
    const randomByte = Math.floor(rand(0, 256));
    params[paramName] = paramType.decode(randomByte);
  }

  return { type, params };
}

// Generate random params for a distribution based on its catalog entry
function randomDistributionState(type: string): DistributionState {
  const entry = distributionCatalog[type];
  const params: Record<string, number> = {};

  if (entry) {
    for (const [paramName, paramType] of entry.params) {
      const randomByte = Math.floor(rand(0, 256));
      params[paramName] = paramType.decode(randomByte);
    }
  }

  return { type, params };
}

// Re-export types from store
export type {
  SlotState,
  DashOutput,
  RangeOutput,
  ColorOutput,
} from './store';

// === SLOT STATE ===

interface SlotState<TOutput> {
  enabled: boolean;
  mapper: string;
  mapperOptions: Record<string, unknown>;
  motion: Partial<MotionConfig>;
  output: TOutput;
}

interface DashOutput {
  dashLen: number;
  maxGap: number;
  marching: number;
}

interface RangeOutput {
  min: number;
  max: number;
}

interface ColorOutput {
  palette: string;
}

// === STORE STATE ===

interface EvolverState {
  // Seed for reproducibility
  seed: number;

  // Global settings
  lineCount: number;
  fade: number;
  speed: number;

  // World setup
  distribution: DistributionState;
  positionEvolvers: PositionEvolverState[];

  // Draw evolvers
  dash: SlotState<DashOutput>;
  alpha: SlotState<RangeOutput>;
  color: SlotState<ColorOutput>;
  lineWidth: SlotState<RangeOutput>;
}

type SlotKey = 'dash' | 'alpha' | 'color' | 'lineWidth';

interface EvolverActions {
  // Global settings
  setLineCount: (count: number) => void;
  setFade: (fade: number) => void;
  setSpeed: (speed: number) => void;

  // World setup
  setDistribution: (distribution: DistributionState) => void;
  setDistributionParams: (params: Record<string, number>) => void;
  setPositionEvolvers: (evolvers: PositionEvolverState[]) => void;

  // Slot actions
  setSlotEnabled: (slot: SlotKey, enabled: boolean) => void;
  setSlotMapper: (slot: SlotKey, mapper: string) => void;
  setSlotMapperOptions: (slot: SlotKey, options: Record<string, unknown>) => void;
  setSlotMotion: (slot: SlotKey, motion: Partial<MotionConfig>) => void;
  updateSlotMotion: (slot: SlotKey, updates: Partial<MotionConfig>) => void;

  setDashOutput: (output: Partial<DashOutput>) => void;
  setAlphaOutput: (output: Partial<RangeOutput>) => void;
  setColorOutput: (output: Partial<ColorOutput>) => void;
  setLineWidthOutput: (output: Partial<RangeOutput>) => void;

  applyPreset: (name: PresetName) => void;
  randomize: () => void;
  buildConfig: () => WorldEvolverConfig;
  applyState: (partial: Partial<EvolverState>) => void;
}

type EvolverStore = EvolverState & EvolverActions;

// === DEFAULT STATE ===

const defaultDash: SlotState<DashOutput> = {
  enabled: true,
  mapper: 'sine',
  mapperOptions: { frequency: 1 },
  motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
  output: { dashLen: 10, maxGap: 20, marching: 0 },
};

const defaultAlpha: SlotState<RangeOutput> = {
  enabled: false,
  mapper: 'sine',
  mapperOptions: { frequency: 1 },
  motion: { mode: 'field', speed: 0.3, edge: 'wrap', phaseSpread: 0.5 },
  output: { min: 0.3, max: 1 },
};

const defaultColor: SlotState<ColorOutput> = {
  enabled: false,
  mapper: 'identity',
  mapperOptions: {},
  motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
  output: { palette: 'sunset' },
};

const defaultLineWidth: SlotState<RangeOutput> = {
  enabled: false,
  mapper: 'sine',
  mapperOptions: { frequency: 1 },
  motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
  output: { min: 0.5, max: 2 },
};

const defaultState: EvolverState = {
  seed: 0, // Will be set on randomize
  lineCount: 200,
  fade: 0.05,
  speed: 1,
  distribution: { type: 'star', params: {} },
  positionEvolvers: [{ type: 'rotate', params: { speed: 0.1 } }],
  dash: defaultDash,
  alpha: defaultAlpha,
  color: defaultColor,
  lineWidth: defaultLineWidth,
};

// === CREATE REACT STORE ===

export const useEvolverStore = create<EvolverStore>()((set, get) => ({
  ...defaultState,

  setLineCount: (lineCount) => set({ lineCount }),

  setFade: (fade) => set({ fade }),

  setSpeed: (speed) => set({ speed }),

  setDistribution: (distribution) => set({ distribution }),

  setDistributionParams: (params) =>
    set((state) => ({
      distribution: { ...state.distribution, params },
    })),

  setPositionEvolvers: (positionEvolvers) => set({ positionEvolvers }),

  setSlotEnabled: (slot, enabled) =>
    set((state) => ({
      [slot]: { ...state[slot], enabled },
    })),

  setSlotMapper: (slot, mapper) =>
    set((state) => ({
      [slot]: { ...state[slot], mapper, mapperOptions: {} },
    })),

  setSlotMapperOptions: (slot, options) =>
    set((state) => ({
      [slot]: { ...state[slot], mapperOptions: options },
    })),

  setSlotMotion: (slot, motion) =>
    set((state) => ({
      [slot]: { ...state[slot], motion },
    })),

  updateSlotMotion: (slot, updates) =>
    set((state) => ({
      [slot]: {
        ...state[slot],
        motion: { ...state[slot].motion, ...updates },
      },
    })),

  setDashOutput: (output) =>
    set((state) => ({
      dash: { ...state.dash, output: { ...state.dash.output, ...output } },
    })),

  setAlphaOutput: (output) =>
    set((state) => ({
      alpha: { ...state.alpha, output: { ...state.alpha.output, ...output } },
    })),

  setColorOutput: (output) =>
    set((state) => ({
      color: { ...state.color, output: { ...state.color.output, ...output } },
    })),

  setLineWidthOutput: (output) =>
    set((state) => ({
      lineWidth: { ...state.lineWidth, output: { ...state.lineWidth.output, ...output } },
    })),

  applyPreset: (name) => {
    const preset = presets[name];
    if (!preset) return;

    set(() => {
      const updates: Partial<EvolverState> = {};

      if (preset.dash) {
        updates.dash = {
          enabled: true,
          mapper: preset.dash.mapper,
          mapperOptions: preset.dash.mapperOptions ?? {},
          motion: preset.dash.motion,
          output: {
            dashLen: preset.dash.output.dashLen ?? 10,
            maxGap: preset.dash.output.maxGap ?? 20,
            marching: preset.dash.output.marching ?? 0,
          },
        };
      }

      if (preset.alpha) {
        updates.alpha = {
          enabled: true,
          mapper: preset.alpha.mapper,
          mapperOptions: preset.alpha.mapperOptions ?? {},
          motion: preset.alpha.motion,
          output: {
            min: preset.alpha.output.min ?? 0.2,
            max: preset.alpha.output.max ?? 1,
          },
        };
      }

      if (preset.color) {
        updates.color = {
          enabled: true,
          mapper: preset.color.mapper,
          mapperOptions: preset.color.mapperOptions ?? {},
          motion: preset.color.motion,
          output: {
            palette: preset.color.output.palette ?? 'sunset',
          },
        };
      }

      if (preset.lineWidth) {
        updates.lineWidth = {
          enabled: true,
          mapper: preset.lineWidth.mapper,
          mapperOptions: preset.lineWidth.mapperOptions ?? {},
          motion: preset.lineWidth.motion,
          output: {
            min: preset.lineWidth.output.min ?? 0.5,
            max: preset.lineWidth.output.max ?? 2,
          },
        };
      }

      return updates;
    });
  },

  randomize: () => {
    // Generate new seed and set it for reproducibility
    const seed = newSeed();
    setSeed(seed);

    // Random line count with weighted distribution
    const countWeights: [number, number][] = [
      [randInt(120, 200), 0.3],
      [randInt(250, 400), 0.2],
      [randInt(500, 800), 0.1],
      [randInt(1000, 1500), 0.05],
    ];
    const lineCount = pickW(
      countWeights.map((c) => c[0]),
      countWeights.map((c) => c[1])
    );

    // Random fade with weighted distribution
    const fade = pickW(
      [rand(0.01, 0.02), rand(0.03, 0.06), rand(0.08, 0.15), rand(0.2, 0.4), 1],
      [0.2, 0.35, 0.25, 0.15, 0.05]
    );

    // Pick 1-2 unique position evolvers with random params
    const numPos = pick([1, 2]);
    const posEvolvers: PositionEvolverState[] = [];
    const usedTypes = new Set<string>();
    for (let i = 0; i < numPos; i++) {
      let evolver = randomPositionEvolver();
      // Avoid duplicates - try up to 5 times to get a unique type
      let attempts = 0;
      while (usedTypes.has(evolver.type) && attempts < 5) {
        evolver = randomPositionEvolver();
        attempts++;
      }
      if (!usedTypes.has(evolver.type)) {
        usedTypes.add(evolver.type);
        posEvolvers.push(evolver);
      }
    }

    // Pick a random distribution with random params
    const distType = pick(distributionNames);
    const distribution = randomDistributionState(distType);

    set({
      seed,
      lineCount,
      fade,
      distribution,
      positionEvolvers: posEvolvers,
      dash: randomDashSlot(),
      alpha: randomAlphaSlot(),
      color: randomColorSlot(),
      lineWidth: randomLineWidthSlot(),
    });
  },

  buildConfig: () => {
    const state = get();
    const config: WorldEvolverConfig = {};

    if (state.dash.enabled) {
      config.dash = {
        mapper: state.dash.mapper,
        mapperOptions: state.dash.mapperOptions,
        motion: state.dash.motion,
        output: state.dash.output,
      };
    }

    if (state.alpha.enabled) {
      config.alpha = {
        mapper: state.alpha.mapper,
        mapperOptions: state.alpha.mapperOptions,
        motion: state.alpha.motion,
        output: state.alpha.output,
      };
    }

    if (state.color.enabled) {
      config.color = {
        mapper: state.color.mapper,
        mapperOptions: state.color.mapperOptions,
        motion: state.color.motion,
        output: state.color.output,
      };
    }

    if (state.lineWidth.enabled) {
      config.lineWidth = {
        mapper: state.lineWidth.mapper,
        mapperOptions: state.lineWidth.mapperOptions,
        motion: state.lineWidth.motion,
        output: state.lineWidth.output,
      };
    }

    return config;
  },

  applyState: (partial) => {
    set(partial);
  },
}));

// === VANILLA API FOR WORLD ===
// World still needs to subscribe without React

export const evolverStoreApi = {
  getState: () => useEvolverStore.getState(),
  subscribe: useEvolverStore.subscribe,
  buildConfig: () => useEvolverStore.getState().buildConfig(),
  randomize: () => useEvolverStore.getState().randomize(),
  applyState: (partial: Partial<EvolverState>) => useEvolverStore.getState().applyState(partial),
};

export type { EvolverState, EvolverStore, PresetName };
export type { PositionEvolverState, DistributionState } from './serialize';
