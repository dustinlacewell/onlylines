// Core module - unified registration system
// Import this module to ensure all registrations are complete

export {
  // Types
  type ParamEncoding,
  type ParamSchema,
  type ParamValues,
  type BaseDefinition,
  type PlacerDefinition,
  type MoverDefinition,
  type MapperDefinition,
  type PaletteDefinition,
  type Mapper,
  type MapperContext,
  type LineContext,
  type EvolverWorld,
  type WaveContext,
  type PositionDelta,
  type DistributionOptions,

  // Registration
  registerPlacer,
  registerMover,
  registerMapper,
  registerPalette,

  // Lookup by name
  getPlacer,
  getMover,
  getMapper,
  getPalette,

  // Lookup by ID (for deserialization)
  getPlacerById,
  getMoverById,
  getMapperById,
  getPaletteById,

  // Enumeration
  getAllPlacers,
  getAllMovers,
  getAllMappers,
  getAllPalettes,
  getPlacersByCategory,
  getMoversByCategory,
  getMappersByCategory,

  // Factories (with validation)
  createPlacer,
  createMover,
  createMapper,

  // Randomization
  randomizePlacer,
  randomizeMover,
  randomizeMapper,
} from './registry';

export {
  paramTypeMap,
  getParamType,
  schemaToParamDefs,
} from './paramTypes';

export {
  generatePlacerCatalog,
  generateMoverCatalog,
  generateMapperCatalog,
  generatePaletteCatalog,
  encodeRegisteredPlacer,
  encodeRegisteredMover,
  encodeRegisteredMapper,
  encodeRegisteredPalette,
  decodeRegisteredPlacer,
  decodeRegisteredMover,
  decodeRegisteredMapper,
  decodeRegisteredPalette,
  validateRegistries,
} from './serialization';
