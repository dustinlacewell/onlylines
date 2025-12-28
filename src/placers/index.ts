// Placers - define initial line positions and array ordering
// Import this file to register all placers

// Radial
export * from './radial';

// Concentric
export * from './concentric';

// Spiral
export * from './spiral';

// Wave
export * from './wave';

// Symmetry
export * from './symmetry';

// Grid
export * from './grid';

// Mathematical
export * from './mathematical';

// Special
export * from './special';

// Re-export registry functions for convenience
export {
  getPlacer,
  getPlacerById,
  getAllPlacers,
  getPlacersByCategory,
  createPlacer,
  randomizePlacer,
} from '../core/registry';
