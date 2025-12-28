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
      { name: 'phase', type: 'number', default: 0, min: 0, max: 1, step: 0.05, description: 'Phase offset (0.25 = cosine)' },
    ],
  },
  factory: (opts?: { frequency?: number; phase?: number }) => {
    const frequency = opts?.frequency ?? 1;
    const phase = opts?.phase ?? 0;
    return (ctx) => (Math.sin((ctx.t + phase) * Math.PI * 2 * frequency) + 1) / 2;
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


// === PULSE MAPPERS (sharp transitions) ===

export const threshold: MapperEntry = {
  meta: {
    name: 'threshold',
    description: 'Binary on/off at cutoff point',
    category: 'pulse',
    options: [
      { name: 'cutoff', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, description: 'Switch point' },
      { name: 'invert', type: 'boolean', default: false, description: 'Flip output (1 below cutoff, 0 above)' },
    ],
  },
  factory: (opts?: { cutoff?: number; invert?: boolean }) => {
    const cutoff = opts?.cutoff ?? 0.5;
    const invert = opts?.invert ?? false;
    return (ctx) => {
      const above = ctx.t >= cutoff ? 1 : 0;
      return invert ? 1 - above : above;
    };
  },
};

// Alias for backward compatibility
export const step = threshold;

export const pulse: MapperEntry = {
  meta: {
    name: 'pulse',
    description: 'Gaussian-like peak at adjustable center',
    category: 'pulse',
    options: [
      { name: 'center', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, description: 'Peak position' },
      { name: 'width', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Peak width' },
      { name: 'sharpness', type: 'number', default: 2, min: 1, max: 8, step: 0.5, description: 'Falloff sharpness' },
    ],
  },
  factory: (opts?: { center?: number; width?: number; sharpness?: number }) => {
    const center = opts?.center ?? 0.5;
    const width = opts?.width ?? 0.2;
    const sharpness = opts?.sharpness ?? 2;
    return (ctx) => Math.exp(-Math.pow((ctx.t - center) / width, sharpness * 2));
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
    description: 'Two waves at different frequencies (use ratio=1.5, phase=0.5 for helix)',
    category: 'harmonic',
    options: [
      { name: 'ratio', type: 'number', default: 1.5, min: 1.0, max: 3, step: 0.1, description: 'Frequency ratio of second wave' },
      { name: 'phase', type: 'number', default: 0, min: 0, max: 1, step: 0.05, description: 'Phase offset of second wave' },
    ],
  },
  factory: (opts?: { ratio?: number; phase?: number }) => {
    const ratio = opts?.ratio ?? 1.5;
    const phase = opts?.phase ?? 0;
    return (ctx) => {
      const w1 = Math.sin(ctx.t * Math.PI * 2);
      const w2 = Math.sin((ctx.t + phase) * Math.PI * 2 * ratio);
      return ((w1 + w2) / 2 + 1) / 2;
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

export const softBands: MapperEntry = {
  meta: {
    name: 'softBands',
    description: 'Smooth undulating bands with soft transitions',
    category: 'step',
    options: [
      { name: 'numBands', type: 'number', default: 4, min: 2, max: 10, step: 1, description: 'Number of bands' },
      { name: 'softness', type: 'number', default: 0.3, min: 0.1, max: 0.9, step: 0.1, description: 'Transition smoothness' },
    ],
  },
  factory: (opts?: { numBands?: number; softness?: number }) => {
    const numBands = opts?.numBands ?? 4;
    const softness = opts?.softness ?? 0.3;
    return (ctx) => {
      // Create smooth sine-based bands instead of hard steps
      const bandPhase = ctx.t * numBands * Math.PI;
      const raw = (Math.sin(bandPhase) + 1) / 2;
      // Softness controls how much we flatten the peaks/troughs
      // At softness=0, it's a pure sine; at softness=1, it's nearly square
      const shaped = Math.pow(raw, 1 - softness * 0.8);
      return shaped;
    };
  },
};

// === DYNAMIC MAPPERS (time-dependent flowing effects) ===

export const wavePacket: MapperEntry = {
  meta: {
    name: 'wavePacket',
    description: 'Localized oscillation that fades at edges',
    category: 'harmonic',
    options: [
      { name: 'frequency', type: 'number', default: 3, min: 1, max: 8, step: 1, description: 'Oscillation frequency' },
      { name: 'width', type: 'number', default: 0.4, min: 0.1, max: 0.8, step: 0.1, description: 'Packet width' },
      { name: 'center', type: 'number', default: 0.5, min: 0, max: 1, step: 0.1, description: 'Packet center' },
    ],
  },
  factory: (opts?: { frequency?: number; width?: number; center?: number }) => {
    const frequency = opts?.frequency ?? 3;
    const width = opts?.width ?? 0.4;
    const center = opts?.center ?? 0.5;
    return (ctx) => {
      // Gaussian envelope
      const envelope = Math.exp(-Math.pow((ctx.t - center) / width, 2));
      // Oscillation within the envelope
      const oscillation = (Math.sin(ctx.t * Math.PI * 2 * frequency) + 1) / 2;
      // Combine: oscillation fades to 0.5 (neutral) outside the packet
      return 0.5 + (oscillation - 0.5) * envelope;
    };
  },
};

export const counterFlow: MapperEntry = {
  meta: {
    name: 'counterFlow',
    description: 'Two waves flowing in opposite directions',
    category: 'harmonic',
    options: [
      { name: 'speed', type: 'number', default: 0.3, min: 0.05, max: 1, step: 0.05, description: 'Flow speed' },
      { name: 'frequency', type: 'number', default: 2, min: 1, max: 6, step: 1, description: 'Wave frequency' },
    ],
  },
  factory: (opts?: { speed?: number; frequency?: number }) => {
    const speed = opts?.speed ?? 0.3;
    const frequency = opts?.frequency ?? 2;
    return (ctx) => {
      const phase = ctx.time * speed;
      // Two waves traveling in opposite directions
      const wave1 = Math.sin((ctx.t + phase) * Math.PI * 2 * frequency);
      const wave2 = Math.sin((ctx.t - phase) * Math.PI * 2 * frequency);
      // Interference pattern
      return ((wave1 + wave2) / 2 + 1) / 2;
    };
  },
};

export const flowingBands: MapperEntry = {
  meta: {
    name: 'flowingBands',
    description: 'Discrete bands that flow and morph',
    category: 'step',
    options: [
      { name: 'numBands', type: 'number', default: 4, min: 2, max: 8, step: 1, description: 'Number of bands' },
      { name: 'speed', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Flow speed' },
      { name: 'waveAmount', type: 'number', default: 0.3, min: 0, max: 0.5, step: 0.1, description: 'Wave distortion amount' },
    ],
  },
  factory: (opts?: { numBands?: number; speed?: number; waveAmount?: number }) => {
    const numBands = opts?.numBands ?? 4;
    const speed = opts?.speed ?? 0.2;
    const waveAmount = opts?.waveAmount ?? 0.3;
    return (ctx) => {
      // Add time-based wave distortion to the t value before banding
      const waveOffset = Math.sin(ctx.time * speed * Math.PI * 2) * waveAmount;
      const distortedT = ctx.t + waveOffset * Math.sin(ctx.t * Math.PI * 2);
      // Soft banding on the distorted value
      const bandPhase = distortedT * numBands * Math.PI;
      return (Math.sin(bandPhase) + 1) / 2;
    };
  },
};

export const collision: MapperEntry = {
  meta: {
    name: 'collision',
    description: 'Bands that push against each other from edges',
    category: 'harmonic',
    options: [
      { name: 'speed', type: 'number', default: 0.3, min: 0.05, max: 0.8, step: 0.05, description: 'Collision speed' },
      { name: 'sharpness', type: 'number', default: 4, min: 1, max: 10, step: 1, description: 'Edge sharpness' },
    ],
  },
  factory: (opts?: { speed?: number; sharpness?: number }) => {
    const speed = opts?.speed ?? 0.3;
    const sharpness = opts?.sharpness ?? 4;
    return (ctx) => {
      // Two fronts approaching from edges, meeting in middle
      const phase = (Math.sin(ctx.time * speed * Math.PI * 2) + 1) / 2; // 0 to 1 oscillation
      const meetPoint = 0.5;

      // Left front coming from 0, right front coming from 1
      const leftFront = phase * meetPoint; // 0 to 0.5
      const rightFront = 1 - phase * meetPoint; // 1 to 0.5

      // Smooth step function for each front
      const leftValue = 1 / (1 + Math.exp(-sharpness * (ctx.t - leftFront) * 10));
      const rightValue = 1 / (1 + Math.exp(-sharpness * (rightFront - ctx.t) * 10));

      // Combine: high where both fronts have passed
      return leftValue * rightValue;
    };
  },
};

// === CATALOG ===

export const mapperCatalog: Record<string, MapperEntry> = {
  // Wave
  identity,
  sine,
  triangle,
  // Pulse
  threshold,
  step, // alias for threshold (backward compatibility)
  pulse,
  spot,
  spotLinear,
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
  pendulum,
  wavePacket,
  counterFlow,
  collision,
  // Step/Bands
  steps,
  bands,
  softBands,
  flowingBands,
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
