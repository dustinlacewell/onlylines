// Mapper catalog - pure functions with metadata for UI generation
// Each mapper takes MapperContext and returns 0-1

import type { Mapper, MapperFactory } from './system';

// === METADATA TYPES ===

export interface OptionMeta {
  name: string;
  type: 'number' | 'boolean' | 'select';
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  choices?: string[];
  description?: string;
}

export interface MapperMeta {
  name: string;
  description: string;
  category: 'wave' | 'pulse' | 'easing' | 'noise' | 'harmonic' | 'step';
  options: OptionMeta[];
}

export interface MapperEntry {
  meta: MapperMeta;
  factory: MapperFactory;
}

// === WAVE MAPPERS (smooth oscillations) ===

export const identity: MapperEntry = {
  meta: {
    name: 'identity',
    description: 'Pass through t directly',
    category: 'wave',
    options: [],
  },
  factory: () => (ctx) => ctx.t,
};

export const sine: MapperEntry = {
  meta: {
    name: 'sine',
    description: 'Smooth sine wave oscillation',
    category: 'wave',
    options: [
      { name: 'frequency', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1, description: 'Number of cycles' },
    ],
  },
  factory: (opts?: { frequency?: number }) => {
    const frequency = opts?.frequency ?? 1;
    return (ctx) => (Math.sin(ctx.t * Math.PI * 2 * frequency) + 1) / 2;
  },
};

export const cosine: MapperEntry = {
  meta: {
    name: 'cosine',
    description: 'Cosine wave (sine offset by quarter phase)',
    category: 'wave',
    options: [
      { name: 'frequency', type: 'number', default: 1, min: 0.1, max: 10, step: 0.1, description: 'Number of cycles' },
    ],
  },
  factory: (opts?: { frequency?: number }) => {
    const frequency = opts?.frequency ?? 1;
    return (ctx) => (Math.cos(ctx.t * Math.PI * 2 * frequency) + 1) / 2;
  },
};

export const triangle: MapperEntry = {
  meta: {
    name: 'triangle',
    description: 'Linear ramp up and down',
    category: 'wave',
    options: [],
  },
  factory: () => (ctx) => ctx.t < 0.5 ? ctx.t * 2 : 2 - ctx.t * 2,
};

export const sawtooth: MapperEntry = {
  meta: {
    name: 'sawtooth',
    description: 'Linear ramp then drop',
    category: 'wave',
    options: [],
  },
  factory: () => (ctx) => ctx.t,
};

// === PULSE MAPPERS (sharp transitions) ===

export const step: MapperEntry = {
  meta: {
    name: 'step',
    description: 'Binary on/off at threshold',
    category: 'pulse',
    options: [
      { name: 'threshold', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, description: 'Switch point' },
    ],
  },
  factory: (opts?: { threshold?: number }) => {
    const threshold = opts?.threshold ?? 0.5;
    return (ctx) => ctx.t < threshold ? 0 : 1;
  },
};

export const pulse: MapperEntry = {
  meta: {
    name: 'pulse',
    description: 'Gaussian-like peak at center',
    category: 'pulse',
    options: [
      { name: 'width', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Peak width' },
      { name: 'sharpness', type: 'number', default: 2, min: 1, max: 8, step: 0.5, description: 'Falloff sharpness' },
    ],
  },
  factory: (opts?: { width?: number; sharpness?: number }) => {
    const width = opts?.width ?? 0.2;
    const sharpness = opts?.sharpness ?? 2;
    return (ctx) => Math.exp(-Math.pow((ctx.t - 0.5) / width, sharpness * 2));
  },
};

export const square: MapperEntry = {
  meta: {
    name: 'square',
    description: 'Square wave (on for duty cycle, off otherwise)',
    category: 'pulse',
    options: [
      { name: 'duty', type: 'number', default: 0.5, min: 0.1, max: 0.9, step: 0.1, description: 'Duty cycle' },
    ],
  },
  factory: (opts?: { duty?: number }) => {
    const duty = opts?.duty ?? 0.5;
    return (ctx) => ctx.t < duty ? 1 : 0;
  },
};

export const spot: MapperEntry = {
  meta: {
    name: 'spot',
    description: 'Gaussian falloff from focus point',
    category: 'pulse',
    options: [
      { name: 'width', type: 'number', default: 0.15, min: 0.05, max: 0.5, step: 0.05, description: 'Spot width' },
    ],
  },
  factory: (opts?: { width?: number }) => {
    const width = opts?.width ?? 0.15;
    // t here represents distance from focus (in focal motion mode)
    return (ctx) => Math.exp(-Math.pow(ctx.t / width, 2));
  },
};

export const spotLinear: MapperEntry = {
  meta: {
    name: 'spotLinear',
    description: 'Linear falloff from focus point',
    category: 'pulse',
    options: [
      { name: 'width', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Spot width' },
    ],
  },
  factory: (opts?: { width?: number }) => {
    const width = opts?.width ?? 0.2;
    return (ctx) => Math.max(0, 1 - ctx.t / width);
  },
};

export const spotBinary: MapperEntry = {
  meta: {
    name: 'spotBinary',
    description: 'Hard cutoff at width',
    category: 'pulse',
    options: [
      { name: 'width', type: 'number', default: 0.15, min: 0.05, max: 0.5, step: 0.05, description: 'Spot width' },
    ],
  },
  factory: (opts?: { width?: number }) => {
    const width = opts?.width ?? 0.15;
    return (ctx) => ctx.t < width ? 1 : 0;
  },
};

// === EASING MAPPERS (acceleration curves) ===

export const easeIn: MapperEntry = {
  meta: {
    name: 'easeIn',
    description: 'Slow start, fast end',
    category: 'easing',
    options: [
      { name: 'power', type: 'number', default: 2, min: 1, max: 5, step: 0.5, description: 'Curve power' },
    ],
  },
  factory: (opts?: { power?: number }) => {
    const power = opts?.power ?? 2;
    return (ctx) => Math.pow(ctx.t, power);
  },
};

export const easeOut: MapperEntry = {
  meta: {
    name: 'easeOut',
    description: 'Fast start, slow end',
    category: 'easing',
    options: [
      { name: 'power', type: 'number', default: 2, min: 1, max: 5, step: 0.5, description: 'Curve power' },
    ],
  },
  factory: (opts?: { power?: number }) => {
    const power = opts?.power ?? 2;
    return (ctx) => 1 - Math.pow(1 - ctx.t, power);
  },
};

export const easeInOut: MapperEntry = {
  meta: {
    name: 'easeInOut',
    description: 'Slow start and end',
    category: 'easing',
    options: [
      { name: 'power', type: 'number', default: 2, min: 1, max: 5, step: 0.5, description: 'Curve power' },
    ],
  },
  factory: (opts?: { power?: number }) => {
    const power = opts?.power ?? 2;
    return (ctx) =>
      ctx.t < 0.5
        ? Math.pow(ctx.t * 2, power) / 2
        : 1 - Math.pow((1 - ctx.t) * 2, power) / 2;
  },
};

// === NOISE MAPPERS (pseudo-random variation) ===

export const noise: MapperEntry = {
  meta: {
    name: 'noise',
    description: 'Deterministic noise based on t and index',
    category: 'noise',
    options: [
      { name: 'scale', type: 'number', default: 1, min: 0.1, max: 5, step: 0.1, description: 'Noise scale' },
    ],
  },
  factory: (opts?: { scale?: number }) => {
    const scale = opts?.scale ?? 1;
    return (ctx) => {
      const n = Math.sin(ctx.t * 47.3 * scale + ctx.index * 31.7) *
                Math.cos(ctx.t * 31.7 * scale - ctx.index * 47.3);
      return (n + 1) / 2;
    };
  },
};

export const shimmer: MapperEntry = {
  meta: {
    name: 'shimmer',
    description: 'High frequency subtle variation',
    category: 'noise',
    options: [
      { name: 'frequency', type: 'number', default: 8, min: 1, max: 20, step: 1, description: 'Shimmer frequency' },
      { name: 'intensity', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Variation amount' },
    ],
  },
  factory: (opts?: { frequency?: number; intensity?: number }) => {
    const frequency = opts?.frequency ?? 8;
    const intensity = opts?.intensity ?? 0.2;
    return (ctx) => {
      const base = ctx.t;
      const variation = Math.sin(ctx.time * frequency + ctx.index * 0.5) * intensity;
      return Math.max(0, Math.min(1, base + variation));
    };
  },
};

export const flicker: MapperEntry = {
  meta: {
    name: 'flicker',
    description: 'Organic random-ish variation (like fire)',
    category: 'noise',
    options: [
      { name: 'speed', type: 'number', default: 5, min: 1, max: 15, step: 1, description: 'Flicker speed' },
      { name: 'intensity', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Variation amount' },
    ],
  },
  factory: (opts?: { speed?: number; intensity?: number }) => {
    const speed = opts?.speed ?? 5;
    const intensity = opts?.intensity ?? 0.2;
    return (ctx) => {
      const base = ctx.t;
      const f1 = Math.sin(ctx.time * speed + ctx.index * 0.3);
      const f2 = Math.sin(ctx.time * speed * 1.7 + ctx.index * 0.7);
      const flicker = (f1 * 0.6 + f2 * 0.4) * intensity;
      return Math.max(0, Math.min(1, base + flicker));
    };
  },
};

// === HARMONIC MAPPERS (complex waveforms) ===

export const harmonic: MapperEntry = {
  meta: {
    name: 'harmonic',
    description: 'Multiple sine frequencies combined',
    category: 'harmonic',
    options: [
      { name: 'harmonics', type: 'number', default: 3, min: 2, max: 5, step: 1, description: 'Number of harmonics' },
    ],
  },
  factory: (opts?: { harmonics?: number }) => {
    const numHarmonics = opts?.harmonics ?? 3;
    return (ctx) => {
      let sum = 0;
      let weight = 0;
      for (let i = 0; i < numHarmonics; i++) {
        const amp = 1 / (i + 1);
        sum += Math.sin(ctx.t * Math.PI * 2 * (i + 1)) * amp;
        weight += amp;
      }
      return (sum / weight + 1) / 2;
    };
  },
};

export const interference: MapperEntry = {
  meta: {
    name: 'interference',
    description: 'Two waves at different frequencies',
    category: 'harmonic',
    options: [
      { name: 'ratio', type: 'number', default: 1.5, min: 1.1, max: 3, step: 0.1, description: 'Frequency ratio' },
    ],
  },
  factory: (opts?: { ratio?: number }) => {
    const ratio = opts?.ratio ?? 1.5;
    return (ctx) => {
      const w1 = Math.sin(ctx.t * Math.PI * 2);
      const w2 = Math.sin(ctx.t * Math.PI * 2 * ratio);
      return ((w1 + w2) / 2 + 1) / 2;
    };
  },
};

export const doubleHelix: MapperEntry = {
  meta: {
    name: 'doubleHelix',
    description: 'Two out-of-phase waves creating helix pattern',
    category: 'harmonic',
    options: [
      { name: 'phaseOffset', type: 'number', default: 0.5, min: 0.1, max: 1, step: 0.1, description: 'Phase offset between waves' },
    ],
  },
  factory: (opts?: { phaseOffset?: number }) => {
    const offset = opts?.phaseOffset ?? 0.5;
    return (ctx) => {
      const w1 = (Math.sin(ctx.t * Math.PI * 2) + 1) / 2;
      const w2 = (Math.sin((ctx.t + offset) * Math.PI * 2 * 1.5) + 1) / 2;
      return (w1 + w2) / 2;
    };
  },
};

export const pendulum: MapperEntry = {
  meta: {
    name: 'pendulum',
    description: 'Oscillation that slows at extremes',
    category: 'harmonic',
    options: [],
  },
  factory: () => (ctx) => {
    const swing = Math.sin(ctx.t * Math.PI * 2);
    return (Math.cos(swing * Math.PI / 2) + 1) / 2;
  },
};

// === STEP MAPPERS (discrete zones) ===

export const steps: MapperEntry = {
  meta: {
    name: 'steps',
    description: 'Discrete steps across t range',
    category: 'step',
    options: [
      { name: 'numSteps', type: 'number', default: 4, min: 2, max: 10, step: 1, description: 'Number of steps' },
    ],
  },
  factory: (opts?: { numSteps?: number }) => {
    const numSteps = opts?.numSteps ?? 4;
    return (ctx) => Math.floor(ctx.t * numSteps) / Math.max(1, numSteps - 1);
  },
};

export const bands: MapperEntry = {
  meta: {
    name: 'bands',
    description: 'Alternating high/low bands',
    category: 'step',
    options: [
      { name: 'numBands', type: 'number', default: 4, min: 2, max: 10, step: 1, description: 'Number of bands' },
    ],
  },
  factory: (opts?: { numBands?: number }) => {
    const numBands = opts?.numBands ?? 4;
    return (ctx) => Math.floor(ctx.t * numBands) % 2;
  },
};

// === CATALOG ===

export const mapperCatalog: Record<string, MapperEntry> = {
  // Wave
  identity,
  sine,
  cosine,
  triangle,
  sawtooth,
  // Pulse
  step,
  pulse,
  square,
  spot,
  spotLinear,
  spotBinary,
  // Easing
  easeIn,
  easeOut,
  easeInOut,
  // Noise
  noise,
  shimmer,
  flicker,
  // Harmonic
  harmonic,
  interference,
  doubleHelix,
  pendulum,
  // Step
  steps,
  bands,
};

// Helper to get a mapper by name
export function getMapper(name: string, options?: Record<string, unknown>): Mapper {
  const entry = mapperCatalog[name];
  if (!entry) {
    console.warn(`Unknown mapper: ${name}, using identity`);
    return identity.factory();
  }
  return entry.factory(options);
}

// Get all mapper names grouped by category
export function getMappersByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [name, entry] of Object.entries(mapperCatalog)) {
    const cat = entry.meta.category;
    if (!result[cat]) result[cat] = [];
    result[cat].push(name);
  }
  return result;
}

// Get mapper metadata for UI
export function getMapperMeta(name: string): MapperMeta | null {
  return mapperCatalog[name]?.meta ?? null;
}
