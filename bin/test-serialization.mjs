// Test serialization round-trip using the actual serialize.ts module
import { serializeState, deserializeState, motionParamDefs } from '../src/serialize.ts';

// Import all registrations to populate registries
import '../src/placers/index.ts';
import '../src/movers/index.ts';
import '../src/mappers/index.ts';
import '../src/palettes/index.ts';

// Import registry functions
import {
  getAllMappers,
  getAllPlacers,
  getAllMovers,
  getAllPalettes,
} from '../src/core/registry.ts';

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

// Get all registered entities
const mappers = getAllMappers();
const placers = getAllPlacers();
const movers = getAllMovers();
const palettes = getAllPalettes();

console.log('=== Registry Check ===');
console.log(`Mappers registered: ${mappers.length}`);
console.log(`Placers registered: ${placers.length}`);
console.log(`Movers registered: ${movers.length}`);
console.log(`Palettes registered: ${palettes.length}`);

if (mappers.length === 0) {
  console.log('✗ No mappers registered! Registry imports may have failed.');
  process.exit(1);
}

// Check motion parameter definitions match MotionConfig
console.log('\n=== Motion Parameter Check ===');
const expectedMotionParams = ['mode', 'edge', 'speed', 'reversed', 'phaseSpread', 'phaseOffset', 'waves', 'alternate'];
const actualMotionParams = motionParamDefs.map(p => p[0]);
const missingMotion = expectedMotionParams.filter(p => !actualMotionParams.includes(p));
const extraMotion = actualMotionParams.filter(p => !expectedMotionParams.includes(p));

if (missingMotion.length > 0) {
  console.log(`✗ Missing motion params in serialization: ${missingMotion.join(', ')}`);
}
if (extraMotion.length > 0) {
  console.log(`✗ Extra motion params in serialization: ${extraMotion.join(', ')}`);
}
if (missingMotion.length === 0 && extraMotion.length === 0) {
  console.log('✓ Motion parameters match MotionConfig');
}

// Create a default motion config
function defaultMotion() {
  return {
    mode: 'field',
    speed: 0.2,
    edge: 'wrap',
    phaseSpread: 0.5,
    phaseOffset: 0.1,
    waves: 1.5,
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

let passCount = 0;
let failCount = 0;

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

if (testRoundTrip('Basic state with identity mapper', basicState)) {
  passCount++;
} else {
  failCount++;
}

// Test 2: State with sine mapper and options
const sineState = {
  ...basicState,
  seed: 0xABCDEF00,
  dash: createSlot('sine', { frequency: 2, phase: 0.25 }, { dashLen: 15, maxGap: 30, marching: 5 }),
};

if (testRoundTrip('Sine mapper with frequency and phase', sineState)) {
  passCount++;
} else {
  failCount++;
}

// Test 3: State with threshold mapper and invert
const thresholdState = {
  ...basicState,
  seed: 0xDEADBEEF,
  dash: createSlot('threshold', { cutoff: 0.7, invert: true }, { dashLen: 8, maxGap: 25, marching: 0 }),
};

if (testRoundTrip('Threshold mapper with cutoff and invert', thresholdState)) {
  passCount++;
} else {
  failCount++;
}

// Test 4: Motion parameters round-trip
console.log('\n=== Motion Parameter Round-Trip ===');
const motionTestState = {
  ...basicState,
  seed: 0x11223344,
  dash: {
    ...basicState.dash,
    motion: {
      mode: 'focal',
      speed: 0.35,
      edge: 'bounce',
      phaseSpread: 0.7,
      phaseOffset: 0.3,
      waves: 2.5,
      reversed: true,
      alternate: true,
    },
  },
};

if (testRoundTrip('Motion parameters (all fields)', motionTestState)) {
  passCount++;
} else {
  failCount++;
}

// Test 5: Test all mappers individually
console.log('\n=== Individual Mapper Tests ===');

for (const mapper of mappers) {
  // Build mapperOptions from the mapper's param defaults
  const mapperOptions = {};
  for (const [paramName, schema] of Object.entries(mapper.params)) {
    // Use a non-default value to ensure it's being serialized
    if (schema.min !== undefined && schema.max !== undefined) {
      let value = (schema.min + schema.max) / 2;
      // Round to integer if step is 1
      if (schema.step === 1) {
        value = Math.round(value);
      }
      mapperOptions[paramName] = value;
    } else {
      mapperOptions[paramName] = schema.default;
    }
  }

  const testState = {
    seed: 0x12345678,
    lineCount: 50,
    fade: 0.6,
    speed: 1.0,
    distribution: { type: 'star', params: {} },
    positionEvolvers: [],
    dash: createSlot(mapper.name, mapperOptions, { dashLen: 10, maxGap: 20, marching: 0 }),
    alpha: createSlot('identity', {}, { min: 0.2, max: 0.9 }),
    color: createSlot('identity', {}, { palette: 'sunset' }),
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

  if (optionErrors.length === 0) {
    console.log(`✓ ${mapper.name}`);
    passCount++;
  } else {
    console.log(`✗ ${mapper.name}:`);
    optionErrors.forEach(e => console.log(`    ${e}`));
    failCount++;
  }
}

// Test distributions
console.log('\n=== Distribution Tests ===');
for (const placer of placers) {
  const params = {};
  for (const [paramName, schema] of Object.entries(placer.params)) {
    params[paramName] = schema.default;
  }

  const testState = {
    ...basicState,
    distribution: { type: placer.name, params },
  };

  if (testRoundTrip(`Distribution: ${placer.name}`, testState)) {
    passCount++;
  } else {
    failCount++;
  }
}

// Test movers
console.log('\n=== Mover Tests ===');
for (const mover of movers) {
  const params = {};
  for (const [paramName, schema] of Object.entries(mover.params)) {
    params[paramName] = schema.default;
  }

  const testState = {
    ...basicState,
    positionEvolvers: [{ type: mover.name, params }],
  };

  if (testRoundTrip(`Mover: ${mover.name}`, testState)) {
    passCount++;
  } else {
    failCount++;
  }
}

// Test complex state with multiple position evolvers
console.log('\n=== Complex State Test ===');
const complexState = {
  seed: 0x87654321,
  lineCount: 150,
  fade: 0.8,
  speed: 2.0,
  distribution: { type: placers[0]?.name || 'star', params: {} },
  positionEvolvers: movers.slice(0, 2).map(m => ({
    type: m.name,
    params: Object.fromEntries(
      Object.entries(m.params).map(([k, v]) => [k, v.default])
    ),
  })),
  dash: createSlot('sine', { frequency: 2, phase: 0.5 }, { dashLen: 12, maxGap: 25, marching: 3 }),
  alpha: createSlot('threshold', { cutoff: 0.6, invert: false }, { min: 0.4, max: 0.95 }),
  color: createSlot('identity', {}, { palette: palettes[0]?.name || 'sunset' }),
  lineWidth: createSlot('pulse', { center: 0.5, width: 0.3, sharpness: 3 }, { min: 0.8, max: 2.5 }),
};

if (testRoundTrip('Complex state with multiple evolvers', complexState)) {
  passCount++;
} else {
  failCount++;
}

console.log(`\n=== Final Summary ===`);
console.log(`Passed: ${passCount}/${passCount + failCount}`);
console.log(`Failed: ${failCount}/${passCount + failCount}`);

if (failCount > 0 || missingMotion.length > 0 || extraMotion.length > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All serialization tests passed!');
}
