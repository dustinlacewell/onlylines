// Test serialization round-trip using the actual serialize.ts module
import { serializeState, deserializeState } from '../src/serialize.ts';
import { mapperCatalog as serializationMapperCatalog } from '../src/catalogs.ts';
import { mapperCatalog as realMapperCatalog } from '../src/evolvers/mapperCatalog.ts';

// Deep comparison helper with configurable tolerance
function deepCompare(path, a, b, tolerance = 0.05) {
  const errors = [];

  // Handle boolean vs number comparison (serialization returns 0/1 for bools)
  if (typeof a === 'boolean' && typeof b === 'number') {
    const aBool = a;
    const bBool = Boolean(b);
    if (aBool !== bBool) {
      errors.push(`${path}: ${a} vs ${b}`);
    }
    return errors;
  }

  if (typeof a !== typeof b) {
    errors.push(`${path}: type mismatch ${typeof a} vs ${typeof b}`);
    return errors;
  }

  if (a === null || b === null) {
    if (a !== b) errors.push(`${path}: ${a} vs ${b}`);
    return errors;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    for (const k of keysA) {
      errors.push(...deepCompare(`${path}.${k}`, a[k], b[k], tolerance));
    }
    for (const k of keysB) {
      if (!keysA.includes(k)) {
        errors.push(`${path}.${k}: missing in original (got ${JSON.stringify(b[k])})`);
      }
    }
  } else if (typeof a === 'boolean') {
    // Compare booleans - also accept 0/1 as false/true
    const aBool = Boolean(a);
    const bBool = Boolean(b);
    if (aBool !== bBool) {
      errors.push(`${path}: ${a} vs ${b}`);
    }
  } else if (typeof a === 'number') {
    // If b is a boolean-like number (0 or 1) and a is boolean, compare as booleans
    const diff = Math.abs(a - b);
    const relDiff = a !== 0 ? diff / Math.abs(a) : diff;
    if (relDiff > tolerance && diff > 0.01) {
      errors.push(`${path}: ${a} vs ${b} (diff: ${diff.toFixed(4)})`);
    }
  } else if (a !== b) {
    errors.push(`${path}: ${a} vs ${b}`);
  }

  return errors;
}

// Get all mapper names from serialization catalog
const mapperNames = Object.keys(serializationMapperCatalog);
const realMapperNames = Object.keys(realMapperCatalog);

console.log('=== Catalog Sync Check ===');
// Check for mappers in real catalog that are missing from serialization catalog
const missingInSerialization = realMapperNames.filter(n => !serializationMapperCatalog[n]);
if (missingInSerialization.length > 0) {
  console.log('✗ Mappers missing from serialization catalog:', missingInSerialization);
}
// Check for mappers in serialization catalog that are missing from real catalog
const missingInReal = mapperNames.filter(n => !realMapperCatalog[n]);
if (missingInReal.length > 0) {
  console.log('✗ Mappers in serialization catalog but not in real catalog:', missingInReal);
}
if (missingInSerialization.length === 0 && missingInReal.length === 0) {
  console.log('✓ All mappers present in both catalogs');
}

// Check for parameter mismatches
console.log('\n=== Parameter Definition Check ===');
let paramMismatches = 0;
for (const name of mapperNames) {
  const serEntry = serializationMapperCatalog[name];
  const realEntry = realMapperCatalog[name];

  if (!realEntry) continue; // Already reported above

  const serParams = serEntry.params.map(p => p[0]);
  const realOptions = realEntry.meta.options.map(o => o.name);

  const missingInSer = realOptions.filter(p => !serParams.includes(p));
  const extraInSer = serParams.filter(p => !realOptions.includes(p));

  if (missingInSer.length > 0 || extraInSer.length > 0) {
    paramMismatches++;
    console.log(`✗ ${name}:`);
    if (missingInSer.length > 0) {
      console.log(`    Missing from serialization: ${missingInSer.join(', ')}`);
    }
    if (extraInSer.length > 0) {
      console.log(`    Extra in serialization: ${extraInSer.join(', ')}`);
    }
  }
}
if (paramMismatches === 0) {
  console.log('✓ All mapper parameters match');
}

// Create a default motion config
function defaultMotion() {
  return {
    mode: 'field',
    speed: 0.2,
    edge: 'wrap',
    phaseSpread: 0,
    waves: 1,
    reversed: false,
    alternate: false,
  };
}

// Create a slot with a specific mapper and options
function createSlot(mapper, mapperOptions, output) {
  return {
    enabled: true,
    mapper,
    mapperOptions,
    motion: defaultMotion(),
    output,
  };
}

// Test round-trip for a complete state
function testRoundTrip(name, state) {
  const serialized = serializeState(state);
  const deserialized = deserializeState(serialized);
  const errors = deepCompare('state', state, deserialized);

  if (errors.length === 0) {
    console.log(`✓ ${name}`);
    return true;
  } else {
    console.log(`✗ ${name}:`);
    errors.forEach(e => console.log(`    ${e}`));
    return false;
  }
}

console.log('\n=== Round-Trip Tests ===');

// Test 1: Basic state with all required fields
const basicState = {
  seed: 0x12345678,
  lineCount: 100,
  fade: 0.5,
  speed: 1.5,
  distribution: { type: 'star', params: {} },
  positionEvolvers: [
    { type: 'rotate', params: { speed: 0.1 } }
  ],
  dash: createSlot('identity', {}, { dashLen: 10, maxGap: 20, marching: 0 }),
  alpha: createSlot('identity', {}, { min: 0.3, max: 1 }),
  color: createSlot('identity', {}, { palette: 'sunset' }),
  lineWidth: createSlot('identity', {}, { min: 0.5, max: 2 }),
};
testRoundTrip('Basic state with identity mapper', basicState);

// Test 2: State with sine mapper and options
const sineState = {
  ...basicState,
  seed: 0xABCDEF00,
  dash: createSlot('sine', { frequency: 2, phase: 0.25 }, { dashLen: 15, maxGap: 30, marching: 5 }),
};
testRoundTrip('Sine mapper with frequency and phase', sineState);

// Test 3: State with threshold mapper and invert
const thresholdState = {
  ...basicState,
  seed: 0xDEADBEEF,
  dash: createSlot('threshold', { cutoff: 0.7, invert: true }, { dashLen: 8, maxGap: 25, marching: 0 }),
};
testRoundTrip('Threshold mapper with cutoff and invert', thresholdState);

// Test 4: State with pulse mapper and all options
const pulseState = {
  ...basicState,
  seed: 0xCAFEBABE,
  dash: createSlot('pulse', { center: 0.3, width: 0.15, sharpness: 4 }, { dashLen: 12, maxGap: 22, marching: 10 }),
};
testRoundTrip('Pulse mapper with center, width, and sharpness', pulseState);

// Test 5: Test all mappers individually
console.log('\n=== Individual Mapper Tests ===');
let passCount = 0;
let failCount = 0;

for (const mapperName of mapperNames) {
  const serEntry = serializationMapperCatalog[mapperName];
  const realEntry = realMapperCatalog[mapperName];

  if (!realEntry) {
    console.log(`⚠ Skipping ${mapperName} (not in real catalog)`);
    continue;
  }

  // Build mapperOptions from the real mapper's option defaults
  const mapperOptions = {};
  for (const opt of realEntry.meta.options) {
    // Use a non-default value to ensure it's being serialized
    if (opt.type === 'number') {
      // Use midpoint between min and max, or default if not specified
      let value = opt.min !== undefined && opt.max !== undefined
        ? (opt.min + opt.max) / 2
        : opt.default;
      // Round to integer if step is 1 (integer parameter like numBands, harmonics)
      if (opt.step === 1 || opt.step === undefined && Number.isInteger(opt.min) && Number.isInteger(opt.max)) {
        value = Math.round(value);
      }
      mapperOptions[opt.name] = value;
    } else if (opt.type === 'boolean') {
      mapperOptions[opt.name] = !opt.default; // Use opposite of default
    } else {
      mapperOptions[opt.name] = opt.default;
    }
  }

  const testState = {
    seed: 0x12345678,
    lineCount: 50,
    fade: 0.6,
    speed: 1.0,
    distribution: { type: 'star', params: {} },
    positionEvolvers: [],
    dash: createSlot(mapperName, mapperOptions, { dashLen: 10, maxGap: 20, marching: 0 }),
    alpha: createSlot('identity', {}, { min: 0.2, max: 0.9 }),
    color: createSlot('identity', {}, { palette: 'aurora' }),
    lineWidth: createSlot('identity', {}, { min: 1, max: 3 }),
  };

  const serialized = serializeState(testState);
  const deserialized = deserializeState(serialized);

  // Check specifically that mapper options round-trip correctly
  const originalOpts = testState.dash.mapperOptions;
  const deserializedOpts = deserialized.dash.mapperOptions;

  let optionErrors = [];
  for (const optName of Object.keys(originalOpts)) {
    const orig = originalOpts[optName];
    const deser = deserializedOpts[optName];

    if (typeof orig === 'boolean' || (typeof orig === 'number' && (orig === 0 || orig === 1))) {
      // Boolean comparison - accept 0/1 as equivalent to false/true
      const origBool = Boolean(orig);
      const deserBool = Boolean(deser);
      if (origBool !== deserBool) {
        optionErrors.push(`${optName}: ${orig} -> ${deser}`);
      }
    } else if (typeof orig === 'number') {
      // Numeric comparison with tolerance
      const diff = Math.abs(orig - deser);
      const relDiff = orig !== 0 ? diff / Math.abs(orig) : diff;
      if (relDiff > 0.1 && diff > 0.05) {
        optionErrors.push(`${optName}: ${orig} -> ${deser} (diff: ${diff.toFixed(4)})`);
      }
    }
  }

  // Check for options that appeared in deserialized but weren't in original
  for (const optName of Object.keys(deserializedOpts)) {
    if (!(optName in originalOpts)) {
      // This is expected for params with defaults - just note it
      // optionErrors.push(`${optName}: unexpected (got ${deserializedOpts[optName]})`);
    }
  }

  if (optionErrors.length === 0) {
    console.log(`✓ ${mapperName}`);
    passCount++;
  } else {
    console.log(`✗ ${mapperName}:`);
    optionErrors.forEach(e => console.log(`    ${e}`));
    failCount++;
  }
}

// Test distributions and position evolvers sync
import { distributionCatalog, positionEvolverCatalog } from '../src/catalogs.ts';
import { Distributions } from '../src/distributions/index.ts';

console.log('\n=== Distribution Catalog Sync ===');
const distNames = Object.keys(distributionCatalog);
const realDistNames = Object.keys(Distributions);
const missingDists = realDistNames.filter(n => !distributionCatalog[n]);
const extraDists = distNames.filter(n => !Distributions[n]);
if (missingDists.length > 0) {
  console.log('✗ Distributions missing from serialization catalog:', missingDists);
  failCount++;
} else if (extraDists.length > 0) {
  console.log('✗ Distributions in serialization but not in real:', extraDists);
  failCount++;
} else {
  console.log('✓ All distributions present in both catalogs');
}

// Test a complex state with multiple position evolvers
console.log('\n=== Complex State Test ===');
const complexState = {
  seed: 0x87654321,
  lineCount: 150,
  fade: 0.8,
  speed: 2.0,
  distribution: { type: 'lissajous', params: { a: 3, b: 5, delta: 1.5 } },
  positionEvolvers: [
    { type: 'rotate', params: { speed: 0.15 } },
    { type: 'breathe', params: { amplitude: 0.1, speed: 0.2, phaseSpread: 0.5 } },
  ],
  dash: createSlot('wavePacket', { frequency: 4, width: 0.5, center: 0.6 }, { dashLen: 12, maxGap: 25, marching: 3 }),
  alpha: createSlot('softBands', { numBands: 5, softness: 0.4 }, { min: 0.4, max: 0.95 }),
  color: createSlot('counterFlow', { speed: 0.2, frequency: 3 }, { palette: 'cosmic' }),
  lineWidth: createSlot('collision', { speed: 0.25, sharpness: 6 }, { min: 0.8, max: 2.5 }),
};

if (testRoundTrip('Complex state with multiple evolvers', complexState)) {
  passCount++;
} else {
  failCount++;
}

console.log(`\n=== Final Summary ===`);
console.log(`Passed: ${passCount}/${passCount + failCount}`);
console.log(`Failed: ${failCount}/${passCount + failCount}`);

if (failCount > 0 || paramMismatches > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All serialization tests passed!');
}
