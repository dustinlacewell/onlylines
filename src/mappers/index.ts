// Mappers - pure functions that transform t (0-1) into output values
// Import this file to register all mappers

// Wave
export * from './wave';

// Pulse
export * from './pulse';

// Easing
export * from './easing';

// Noise
export * from './noise';

// Harmonic
export * from './harmonic';

// Step
export * from './step';

// Re-export registry functions for convenience
export {
  getMapper,
  getMapperById,
  getAllMappers,
  getMappersByCategory,
  createMapper,
  randomizeMapper,
} from '../core/registry';
