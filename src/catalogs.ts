// Catalog definitions for serialization
// Each catalog entry defines params for hex encoding
// Adding a new type: just add an entry with params array

import { P, type ParamType } from './paramTypes';

export type ParamDef = [string, ParamType];

export interface CatalogEntry {
  params: ParamDef[];
}

// === DISTRIBUTIONS ===

export const distributionCatalog: Record<string, CatalogEntry> = {
  // Radial
  star: { params: [] },
  starBurst: { params: [] },
  symmetricSpokes: {
    params: [['symmetry', P.smallInt]], // 3-8 fold symmetry
  },

  // Concentric
  concentricRings: {
    params: [['rings', P.smallInt]], // 3-6 rings
  },
  nestedPolygons: {
    params: [['layers', P.smallInt]], // 3-8 layers
  },

  // Spiral
  spiral: {
    params: [['turns', P.smallInt]], // 2-5 turns
  },
  doubleSpiral: {
    params: [['turns', P.smallInt]], // 1.5-3 turns (stored as 2-5, scaled)
  },
  goldenSpiral: { params: [] },
  sunflower: { params: [] },

  // Wave
  sineWave: {
    params: [
      ['waves', P.smallInt],     // 1-4 waves
      ['amplitude', P.unit],     // 0.3-0.8
    ],
  },
  standingWave: {
    params: [['nodes', P.smallInt]], // 2-5 nodes
  },
  interference: {
    params: [
      ['freq1', P.smallInt], // 2-4
      ['freq2', P.smallInt], // freq1 + 1-2
    ],
  },

  // Symmetry
  bilateral: {
    params: [['axis', P.unit]], // 0-2 (position around perimeter)
  },
  rotationalSymmetry: {
    params: [['folds', P.smallInt]], // 2-8 fold symmetry
  },
  kaleidoscope: {
    params: [['segments', P.smallInt]], // 4, 6, or 8
  },

  // Grid
  grid: { params: [] },
  woven: { params: [] },

  // Mathematical
  lissajous: {
    params: [
      ['a', P.smallInt],     // frequency A (1-5)
      ['b', P.smallInt],     // frequency B (1-5)
      ['delta', P.angle],    // phase offset (0-π)
    ],
  },
  roseCurve: {
    params: [['k', P.smallInt]], // 2-7 petals
  },
  modularPattern: {
    params: [['multiplier', P.smallInt]], // 2-13
  },

  // Special
  opposing: { params: [] },
  vortex: {
    params: [['tightness', P.smallInt]], // 1-3
  },
  web: {
    params: [['spokes', P.smallInt]], // 6-12 spokes
  },
};

// === POSITION EVOLVERS ===

export const positionEvolverCatalog: Record<string, CatalogEntry> = {
  // Basic rotation
  rotate: {
    params: [['speed', P.speed]],
  },
  rotateBreathing: {
    params: [
      ['baseSpeed', P.speed],
      ['speedVariation', P.smallUnit],
      ['breatheSpeed', P.speed],
    ],
  },
  rotateReversing: {
    params: [
      ['speed', P.speed],
      ['reversePeriod', P.smallInt],
    ],
  },

  // Breathing (line length changes)
  breathe: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
    ],
  },
  breatheWavePattern: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['phaseSpread', P.unit],
    ],
  },

  // Oscillation (line slides)
  oscillate: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
    ],
  },
  oscillateWave: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['waves', P.smallInt],
    ],
  },

  // Drift
  drift: {
    params: [['speed', P.speed]],
  },
  driftWander: {
    params: [
      ['speed', P.speed],
      ['wanderSpeed', P.speed],
    ],
  },

  // Pulse
  pulse: {
    params: [
      ['strength', P.smallUnit],
      ['speed', P.speed],
      ['phaseSpread', P.unit],
    ],
  },

  // Spiral/Vortex
  spiral: {
    params: [
      ['rotationSpeed', P.speed],
      ['contractionSpeed', P.speed],
    ],
  },
  vortex: {
    params: [
      ['orbitSpeed', P.speed],
      ['wobble', P.smallUnit],
    ],
  },

  // Complex patterns
  waveInterference: {
    params: [
      ['freq1', P.speed],
      ['freq2', P.speed],
      ['amplitude', P.unit],
    ],
  },

  // === NEW FANCY EVOLVERS ===

  lissajous: {
    params: [
      ['freqX', P.smallInt],
      ['freqY', P.smallInt],
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['phase', P.angle],
    ],
  },
  coupled: {
    params: [
      ['coupling', P.smallUnit],
      ['naturalFreq', P.speed],
      ['damping', P.smallUnit],
    ],
  },
  elastic: {
    params: [
      ['stiffness', P.unit],
      ['damping', P.smallUnit],
      ['radius', P.smallInt],
    ],
  },
  rose: {
    params: [
      ['n', P.smallInt],
      ['d', P.smallInt],
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
    ],
  },
  pendulum: {
    params: [
      ['length', P.unit],
      ['gravity', P.speed],
      ['damping', P.smallUnit],
    ],
  },
  flocking: {
    params: [
      ['separation', P.unit],
      ['alignment', P.unit],
      ['cohesion', P.unit],
      ['maxSpeed', P.speed],
    ],
  },
  attractor: {
    params: [
      ['strength', P.signedUnit],
      ['falloff', P.unit],
      ['orbitSpeed', P.speed],
    ],
  },
  chaotic: {
    params: [
      ['sigma', P.speed],
      ['rho', P.speed],
      ['beta', P.smallUnit],
      ['scale', P.unit],
    ],
  },
};

// === MAPPERS ===
// Note: The store uses generic 'frequency' for all mappers, so we encode that uniformly.
// The actual mapper implementation interprets it as needed.

export const mapperCatalog: Record<string, CatalogEntry> = {
  // Wave
  identity: { params: [] },
  sine: { params: [['frequency', P.speed]] },
  cosine: { params: [['frequency', P.speed]] },
  triangle: { params: [] },
  sawtooth: { params: [] },

  // Pulse
  step: { params: [['frequency', P.unit]] },
  pulse: { params: [['frequency', P.smallUnit]] },
  square: { params: [['frequency', P.unit]] },
  spot: { params: [['frequency', P.smallUnit]] },
  spotLinear: { params: [['frequency', P.smallUnit]] },
  spotBinary: { params: [['frequency', P.smallUnit]] },

  // Easing
  easeIn: { params: [['frequency', P.smallInt]] },
  easeOut: { params: [['frequency', P.smallInt]] },
  easeInOut: { params: [['frequency', P.smallInt]] },

  // Noise
  noise: { params: [['frequency', P.unit]] },
  shimmer: { params: [['frequency', P.smallInt]] },
  flicker: { params: [['frequency', P.smallInt]] },

  // Harmonic
  harmonic: { params: [['frequency', P.smallInt]] },
  interference: { params: [['frequency', P.unit]] },
  doubleHelix: { params: [['frequency', P.unit]] },
  pendulum: { params: [] },

  // Step
  steps: { params: [['frequency', P.smallInt]] },
  bands: { params: [['frequency', P.smallInt]] },
};

// === PALETTES ===

export const paletteCatalog: Record<string, CatalogEntry> = {
  sunset: { params: [] },
  aurora: { params: [] },
  ember: { params: [] },
  arctic: { params: [] },
  jungle: { params: [] },
  cosmic: { params: [] },
  earth: { params: [] },
  neonCity: { params: [] },
  bloodMoon: { params: [] },
  mint: { params: [] },
  ocean: { params: [] },
  fire: { params: [] },
  forest: { params: [] },
  candy: { params: [] },
  monochrome: { params: [] },
  noir: { params: [] },
  vaporwave: { params: [] },
};

// === MOTION CONFIG ===
// Fixed structure, not a catalog

export const motionParamDefs: ParamDef[] = [
  ['mode', P.enum(3)],      // field=0, focal=1, spread=2
  ['speed', P.speed],
  ['edge', P.enum(2)],      // wrap=0, bounce=1
  ['phaseSpread', P.unit],
  ['waves', P.smallInt],
  ['reversed', P.bool],
  ['alternate', P.bool],
];

// === HELPERS ===

export function getCatalogNames<T extends Record<string, CatalogEntry>>(catalog: T): string[] {
  return Object.keys(catalog);
}

export function getCatalogArray<T extends Record<string, CatalogEntry>>(
  catalog: T
): Array<{ name: string } & CatalogEntry> {
  return Object.entries(catalog).map(([name, entry]) => ({ name, ...entry }));
}
