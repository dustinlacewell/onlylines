// Test serialization round-trip using the actual serialize.ts module
import { serializeState, deserializeState } from '../src/serialize.ts';

// Deep comparison helper
function deepCompare(path, a, b, tolerance = 0.05) {
  const errors = [];

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
        errors.push(`${path}.${k}: missing in original`);
      }
    }
  } else if (typeof a === 'number') {
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

// Mock state similar to what the store produces
const testState = {
  seed: 0x8a53a27b,
  distribution: { type: 'star', params: {} },
  positionEvolvers: [
    { type: 'rotate', params: { speed: 0.1 } }
  ],
  dash: {
    enabled: true,
    mapper: 'sine',
    mapperOptions: { frequency: 1 },
    motion: { mode: 'field', speed: 0.2, edge: 'wrap', phaseSpread: 0, waves: 1, reversed: false, alternate: false },
    output: { dashLen: 10, maxGap: 20, marching: 0 },
  },
  alpha: {
    enabled: false,
    mapper: 'sine',
    mapperOptions: { frequency: 1 },
    motion: { mode: 'field', speed: 0.3, edge: 'wrap', phaseSpread: 0.5, waves: 1, reversed: false, alternate: false },
    output: { min: 0.3, max: 1 },
  },
  color: {
    enabled: true,
    mapper: 'identity',
    mapperOptions: {},
    motion: { mode: 'field', speed: 0.2, edge: 'wrap', phaseSpread: 0, waves: 1, reversed: false, alternate: false },
    output: { palette: 'sunset' },
  },
  lineWidth: {
    enabled: false,
    mapper: 'sine',
    mapperOptions: { frequency: 1 },
    motion: { mode: 'field', speed: 0.2, edge: 'wrap', phaseSpread: 0, waves: 1, reversed: false, alternate: false },
    output: { min: 0.5, max: 2 },
  },
};

console.log('Original state:');
console.log(JSON.stringify(testState, null, 2));

const serialized = serializeState(testState);
console.log('\nSerialized:', serialized);
console.log('Length:', serialized.length);

const deserialized = deserializeState(serialized);
console.log('\nDeserialized:');
console.log(JSON.stringify(deserialized, null, 2));

// Check specific values
console.log('\n=== Comparison ===');
console.log('seed:', testState.seed, '->', deserialized.seed);
console.log('distribution.type:', testState.distribution.type, '->', deserialized.distribution?.type);
console.log('dash.enabled:', testState.dash.enabled, '->', deserialized.dash?.enabled);
console.log('alpha.enabled:', testState.alpha.enabled, '->', deserialized.alpha?.enabled);
console.log('color.enabled:', testState.color.enabled, '->', deserialized.color?.enabled);
console.log('color.output.palette:', testState.color.output.palette, '->', deserialized.color?.output?.palette);

// Test with problematic state from user
console.log('\n\n=== Testing Problematic State ===');
const problemState = {
  seed: 254231892,
  distribution: { type: 'interference', params: { freq1: 3, freq2: 5 } },
  positionEvolvers: [
    {
      type: 'waveInterference',
      params: {
        freq1: 0.015168902290140656,
        freq2: 0.039168547179552385,
        amplitude: 0.45098039215686275
      }
    }
  ],
  dash: {
    enabled: true,
    mapper: 'noise',
    mapperOptions: { frequency: 0.5 }, // store always uses 'frequency'
    motion: {
      mode: 'focal',
      speed: 0.22775740709621461,
      edge: 'wrap',
      phaseSpread: 0.3599030994810164,
      waves: 3,
      reversed: true,
      alternate: false
    },
    output: { dashLen: 7, maxGap: 34, marching: 0 }
  },
  alpha: {
    enabled: true,
    mapper: 'identity',
    mapperOptions: {},
    motion: {
      mode: 'focal',
      speed: 0.3291934489272535,
      edge: 'bounce',
      phaseSpread: 0,
      waves: 1,
      reversed: false,
      alternate: false
    },
    output: { min: 0.387, max: 0.922 }
  },
  color: {
    enabled: true,
    mapper: 'easeInOut',
    mapperOptions: { frequency: 2 }, // store always uses 'frequency'
    motion: {
      mode: 'focal',
      speed: 0.3715256250812672,
      edge: 'wrap',
      phaseSpread: 0.38822624855674803,
      waves: 1,
      reversed: false,
      alternate: false
    },
    output: { palette: 'aurora' }
  },
  lineWidth: {
    enabled: false,
    mapper: 'sawtooth',
    mapperOptions: {},
    motion: {
      mode: 'spread',
      speed: 0.3387331363162957,
      edge: 'wrap',
      phaseSpread: 0,
      waves: 1,
      reversed: false,
      alternate: false
    },
    output: { min: 0.52, max: 2.14 }
  }
};

const probSerialized = serializeState(problemState);
console.log('Serialized:', probSerialized);
console.log('Has decimal?', probSerialized.includes('.'));

const probDeserialized = deserializeState(probSerialized);
console.log('\nComparison:');
console.log('dash.mapper:', problemState.dash.mapper, '->', probDeserialized.dash?.mapper);
console.log('dash.output.dashLen:', problemState.dash.output.dashLen, '->', probDeserialized.dash?.output?.dashLen);
console.log('dash.output.maxGap:', problemState.dash.output.maxGap, '->', probDeserialized.dash?.output?.maxGap);
console.log('alpha.enabled:', problemState.alpha.enabled, '->', probDeserialized.alpha?.enabled);
console.log('color.mapper:', problemState.color.mapper, '->', probDeserialized.color?.mapper);
console.log('color.output.palette:', problemState.color.output.palette, '->', probDeserialized.color?.output?.palette);
console.log('lineWidth.output.min:', problemState.lineWidth.output.min, '->', probDeserialized.lineWidth?.output?.min);
console.log('lineWidth.output.max:', problemState.lineWidth.output.max, '->', probDeserialized.lineWidth?.output?.max);

// Full deep comparison
console.log('\n=== Deep Comparison ===');
const errors = deepCompare('state', testState, deserialized);
if (errors.length === 0) {
  console.log('✓ Basic test passed!');
} else {
  console.log('✗ Basic test FAILED:');
  errors.forEach(e => console.log('  ' + e));
}

const errors2 = deepCompare('state', problemState, probDeserialized);
if (errors2.length === 0) {
  console.log('✓ Problem state test passed!');
} else {
  console.log('✗ Problem state test FAILED:');
  errors2.forEach(e => console.log('  ' + e))
}
