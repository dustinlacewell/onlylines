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
  horizontal: { params: [] },
  vertical: { params: [] },
  diagonal: { params: [['direction', P.signedUnit]] }, // -1 or 1
  parallel: { params: [['angle', P.byte]] }, // 0-255 maps to 0-180 degrees
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
  epicycloid: {
    params: [['cusps', P.smallInt]], // 3-7 cusps
  },
  hypocycloid: {
    params: [['points', P.smallInt]], // 3-8 points
  },
  spirograph: {
    params: [
      ['R', P.smallInt],     // outer circle radius (3-8)
      ['r', P.smallInt],     // inner circle radius (1-3)
      ['d', P.unit],         // pen distance (0.5-1.5 scaled to 0-1)
    ],
  },
  fermatSpiral: {
    params: [
      ['arms', P.smallInt],      // number of arms (1-4)
      ['tightness', P.smallInt], // tightness (1-3)
    ],
  },
  harmonograph: {
    params: [
      ['freqRatio', P.smallInt], // frequency ratio (2-5)
      ['decay', P.unit],         // decay rate (0.5-2 scaled)
    ],
  },
  chladni: {
    params: [
      ['n', P.smallInt], // first mode (1-5)
      ['m', P.smallInt], // second mode (1-5)
    ],
  },
  guilloche: {
    params: [
      ['waves', P.smallInt],      // wave components (2-4)
      ['complexity', P.smallInt], // pattern complexity (3-8)
    ],
  },
  flowerOfLife: {
    params: [['rings', P.smallInt]], // concentric rings (2-4)
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
  // Rotation - endpoints travel around perimeter
  rotate: {
    params: [['speed', P.speed]],
  },

  // Breathing - line length changes (endpoints move toward/away from each other)
  breathe: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['phaseSpread', P.unit],
    ],
  },

  // Oscillation - whole line slides back and forth
  oscillate: {
    params: [
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['waves', P.smallInt],
    ],
  },

  // Pulse - periodic bursts that create rolling wave effects
  pulse: {
    params: [
      ['strength', P.smallUnit],
      ['speed', P.speed],
      ['phaseSpread', P.unit],
    ],
  },

  // Wave interference - two frequencies create beating patterns
  waveInterference: {
    params: [
      ['freq1', P.speed],
      ['freq2', P.speed],
      ['amplitude', P.unit],
    ],
  },

  // Lissajous - complex orbital patterns from frequency ratios
  lissajous: {
    params: [
      ['freqX', P.smallInt],
      ['freqY', P.smallInt],
      ['amplitude', P.smallUnit],
      ['speed', P.speed],
      ['phase', P.angle],
    ],
  },

  // Pendulum - physical pendulum motion with gravity (perpetual, no damping)
  pendulum: {
    params: [
      ['length', P.unit],
      ['gravity', P.speed],
      ['phaseSpread', P.unit],
    ],
  },

  // Billiards - elastic collision simulation between endpoints
  billiards: {
    params: [
      ['speed', P.speed],
      ['speedVariation', P.unit],
    ],
  },
};

// === MAPPERS ===
// Note: The store uses generic 'frequency' for all mappers, so we encode that uniformly.
// The actual mapper implementation interprets it as needed.

export const mapperCatalog: Record<string, CatalogEntry> = {
  // Wave
  identity: { params: [] },
  sine: { params: [['frequency', P.frequency], ['phase', P.unit]] },
  triangle: { params: [] },

  // Pulse
  threshold: { params: [['cutoff', P.unit], ['invert', P.bool]] },
  step: { params: [['cutoff', P.unit], ['invert', P.bool]] }, // alias for threshold
  pulse: { params: [['center', P.unit], ['width', P.smallUnit], ['sharpness', P.sharpness8]] },
  spot: { params: [['width', P.smallUnit]] },
  spotLinear: { params: [['width', P.smallUnit]] },

  // Easing
  easeIn: { params: [['power', P.smallInt]] },
  easeOut: { params: [['power', P.smallInt]] },
  easeInOut: { params: [['power', P.smallInt]] },

  // Noise
  noise: { params: [['scale', P.scale5]] },
  shimmer: { params: [['frequency', P.smallInt], ['intensity', P.smallUnit]] },
  flicker: { params: [['speed', P.smallInt], ['intensity', P.smallUnit]] },

  // Harmonic
  harmonic: { params: [['harmonics', P.smallInt]] },
  interference: { params: [['ratio', P.ratio3], ['phase', P.unit]] },
  pendulum: { params: [] },
  wavePacket: { params: [['frequency', P.smallInt], ['width', P.unit], ['center', P.unit]] },
  counterFlow: { params: [['speed', P.smallUnit], ['frequency', P.smallInt]] },
  collision: { params: [['speed', P.smallUnit], ['sharpness', P.smallInt]] },

  // Step/Bands
  steps: { params: [['numSteps', P.smallInt]] },
  bands: { params: [['numBands', P.smallInt]] },
  softBands: { params: [['numBands', P.smallInt], ['softness', P.unit]] },
  flowingBands: { params: [['numBands', P.smallInt], ['speed', P.smallUnit], ['waveAmount', P.smallUnit]] },
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
