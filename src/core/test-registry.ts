// Test script to verify registry system works
// Run with: npx tsx src/core/test-registry.ts

// Import registrations (side effects register them)
import '../placers';
import '../movers';
import '../mappers';
import '../palettes';

// Import registry functions
import {
  getAllPlacers,
  getAllMovers,
  getAllMappers,
  getAllPalettes,
  getPlacer,
  getMover,
  getMapper,
  getPalette,
  getPlacerById,
  getMoverById,
  getMapperById,
  getPaletteById,
  createPlacer,
  createMover,
  createMapper,
  validateRegistries,
} from './index';

console.log('=== Registry Test ===\n');

// List all registered entities
console.log('Registered Placers:');
for (const p of getAllPlacers()) {
  console.log(`  [${p.id}] ${p.name} (${p.category})`);
}

console.log('\nRegistered Movers:');
for (const m of getAllMovers()) {
  console.log(`  [${m.id}] ${m.name} (${m.category})`);
}

console.log('\nRegistered Mappers:');
for (const m of getAllMappers()) {
  console.log(`  [${m.id}] ${m.name} (${m.category})`);
}

console.log('\nRegistered Palettes:');
for (const p of getAllPalettes()) {
  console.log(`  [${p.id}] ${p.name} (${p.category})`);
}

// Test lookup by name
console.log('\n=== Lookup Tests ===');
console.log('getPlacer("star"):', getPlacer('star')?.name);
console.log('getMover("rotate"):', getMover('rotate')?.name);
console.log('getMapper("sine"):', getMapper('sine')?.name);
console.log('getPalette("sunset"):', getPalette('sunset')?.name);

// Test lookup by ID
console.log('\ngetPlacerById(0):', getPlacerById(0)?.name);
console.log('getMoverById(0):', getMoverById(0)?.name);
console.log('getMapperById(1):', getMapperById(1)?.name);
console.log('getPaletteById(5):', getPaletteById(5)?.name);

// Test factory functions
console.log('\n=== Factory Tests ===');

const lines = createPlacer('star', 5);
console.log('createPlacer("star", 5):', lines.length, 'lines');

const mover = createMover('rotate', { speed: 0.2 });
console.log('createMover("rotate"):', mover?.name);

const mapper = createMapper('sine', { frequency: 2, phase: 0.25 });
console.log('createMapper("sine"):', mapper({ t: 0.5, index: 0, total: 1, time: 0, line: {} as never }));

// Validate registries
console.log('\n=== Validation ===');
const { valid, errors } = validateRegistries();
console.log('Valid:', valid);
if (errors.length > 0) {
  console.log('Errors:', errors);
}

console.log('\n=== Summary ===');
console.log(`Placers: ${getAllPlacers().length}`);
console.log(`Movers: ${getAllMovers().length}`);
console.log(`Mappers: ${getAllMappers().length}`);
console.log(`Palettes: ${getAllPalettes().length}`);

console.log('\n=== Done ===');
