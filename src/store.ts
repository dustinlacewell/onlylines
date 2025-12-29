// Reactive store for evolver configuration
// This is the single source of truth for all evolver settings

import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { type MotionConfig } from './core/evolvers/system';
import {
  type WorldEvolverConfig,
  presets,
  type PresetName,
} from './core/evolvers/evolverFactory';

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
  // Evolver slot configurations
  dash: SlotState<DashOutput>;
  alpha: SlotState<RangeOutput>;
  color: SlotState<ColorOutput>;
  lineWidth: SlotState<RangeOutput>;
}

interface EvolverActions {
  // Slot-level actions
  setSlotEnabled: (slot: keyof EvolverState, enabled: boolean) => void;
  setSlotMapper: (slot: keyof EvolverState, mapper: string) => void;
  setSlotMapperOptions: (slot: keyof EvolverState, options: Record<string, unknown>) => void;
  setSlotMotion: (slot: keyof EvolverState, motion: Partial<MotionConfig>) => void;
  updateSlotMotion: (slot: keyof EvolverState, updates: Partial<MotionConfig>) => void;

  // Output-specific actions
  setDashOutput: (output: Partial<DashOutput>) => void;
  setAlphaOutput: (output: Partial<RangeOutput>) => void;
  setColorOutput: (output: Partial<ColorOutput>) => void;
  setLineWidthOutput: (output: Partial<RangeOutput>) => void;

  // Presets
  applyPreset: (name: PresetName) => void;

  // Reset
  reset: () => void;

  // Build config for World
  buildConfig: () => WorldEvolverConfig;
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
  dash: defaultDash,
  alpha: defaultAlpha,
  color: defaultColor,
  lineWidth: defaultLineWidth,
};

// === CREATE STORE ===

const store = createStore<EvolverStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultState,

      // Slot-level actions
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

      // Output-specific actions
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

      // Apply preset
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

      // Reset to defaults
      reset: () => set(defaultState),

      // Build WorldEvolverConfig from current state
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
    }),
    {
      name: 'evolver-store',
      // Only persist the state, not the actions
      partialize: (state) => ({
        dash: state.dash,
        alpha: state.alpha,
        color: state.color,
        lineWidth: state.lineWidth,
      }),
    }
  )
);

// === VANILLA JS API ===
// For use outside of React components

export const evolverStore = {
  getState: () => store.getState(),
  subscribe: store.subscribe,

  // Convenience methods
  buildConfig: () => store.getState().buildConfig(),
  applyPreset: (name: PresetName) => store.getState().applyPreset(name),
  reset: () => store.getState().reset(),

  // Slot actions
  setSlotEnabled: (slot: keyof EvolverState, enabled: boolean) =>
    store.getState().setSlotEnabled(slot, enabled),
  setSlotMapper: (slot: keyof EvolverState, mapper: string) =>
    store.getState().setSlotMapper(slot, mapper),
  updateSlotMotion: (slot: keyof EvolverState, updates: Partial<MotionConfig>) =>
    store.getState().updateSlotMotion(slot, updates),

  // Output actions
  setDashOutput: (output: Partial<DashOutput>) =>
    store.getState().setDashOutput(output),
  setAlphaOutput: (output: Partial<RangeOutput>) =>
    store.getState().setAlphaOutput(output),
  setColorOutput: (output: Partial<ColorOutput>) =>
    store.getState().setColorOutput(output),
  setLineWidthOutput: (output: Partial<RangeOutput>) =>
    store.getState().setLineWidthOutput(output),
};

// Type exports for external use
export type { EvolverState, EvolverStore, SlotState, DashOutput, RangeOutput, ColorOutput };
