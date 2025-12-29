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

  // Lookup by name
  getPlacer,
  getMover,
  getMapper,

  // Lookup by ID (for deserialization)
  getPlacerById,
  getMoverById,
  getMapperById,

  // Enumeration
  getAllPlacers,
  getAllMovers,
  getAllMappers,
  getPlacersByCategory,
  getMoversByCategory,
  getMappersByCategory,
  getMapperNamesByCategory,

  // Factories (with validation)
  createPlacer,
  createMover,
  createMapper,

  // Randomization
  randomizePlacer,
  randomizeMover,
  randomizeMapper,
} from './registry';

// Palette types and utilities
export {
  type HSL,
  type Palette,
  type PaletteDefinition,
  registerPalette,
  getPalette,
  getPaletteById,
  getAllPalettes,
  parseHSL,
  lerpHSL,
  samplePalette,
  samplePaletteWrap,
  hslToString,
  toPalette,
  getRuntimePalette,
} from './palette';

export {
  paramTypeMap,
  getParamType,
  schemaToParamDefs,
  schemaToRichParamDefs,
  type RichParamDef,
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
