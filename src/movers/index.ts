// Movers - animate line endpoint positions over time
// Import this file to register all movers

// Oscillation
export * from './oscillation';

// Transform
export * from './transform';

// Wave
export * from './wave';

// Physics
export * from './physics';

// Re-export registry functions for convenience
export {
  getMover,
  getMoverById,
  getAllMovers,
  getMoversByCategory,
  createMover,
  randomizeMover,
} from '../core/registry';
