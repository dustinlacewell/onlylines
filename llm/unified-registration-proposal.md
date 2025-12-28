# Unified Registration System Proposal

## Terminology

| Old Term | New Term | Description |
|----------|----------|-------------|
| Distribution | **Placer** | Defines initial line layout (spatial + array ordering) |
| Position Evolver | **Mover** | Animates line endpoint positions over time |
| Draw Prop Evolver | **Evolver** | Animates draw properties (dash, alpha, color, lineWidth) |
| Mapper | **Mapper** | Pure function mapping t → 0-1 for evolvers |

## Problem Statement

The current architecture requires updating **4-6 separate files** when adding or modifying a placer/mover/evolver:

1. **Implementation file** (e.g., `evolvers/position.ts`) - the actual function
2. **Serialization catalog** (`catalogs.ts`) - param names + encoding types
3. **Evolver catalog** (`evolverCatalogs.ts`) - random generation ranges
4. **Index/exports** (`evolvers/index.ts`, `distributions/index.ts`)
5. **Factory function** (e.g., `createPositionEvolver` switch statement)
6. **Type re-exports** across multiple files

This leads to:
- **Silent failures**: Changing a param name in implementation but forgetting catalogs causes serialization to lose data
- **Desync bugs**: The hex format is position-sensitive; any mismatch corrupts all subsequent fields
- **Tests pass while app breaks**: Tests use current catalog definitions, so they can't catch mismatches between implementation and catalog
- **Cognitive overhead**: Developers must remember all the places to update

### The Four Entity Types

| Entity | What it controls | Current files involved |
|--------|------------------|----------------------|
| **Placer** | Initial line positions & array order | `distributions/*.ts`, `catalogs.ts`, `Distributions` object |
| **Mover** | Endpoint position animation | `evolvers/position.ts`, `catalogs.ts`, `evolverCatalogs.ts`, factory |
| **Mapper** | t → 0-1 curve shaping | `evolvers/mapperCatalog.ts`, `catalogs.ts` |
| **Evolver** | Draw props (dash/alpha/color/width) | Uses Mapper + Motion + Output config, serialized in slots |

**Evolvers are composite**: They combine a Mapper (the shape function) with MotionConfig (how t flows) and Output params (how mapper output becomes draw values). The Mapper is the key piece that needs registration.

## Current Architecture Analysis

### Three Separate "Catalogs" for Movers

```typescript
// 1. catalogs.ts - Serialization schema
export const positionEvolverCatalog = {
  pendulum: {
    params: [
      ['length', P.unit],
      ['gravity', P.speed],
      ['phaseSpread', P.unit],  // <-- Must match implementation
    ],
  },
};

// 2. evolverCatalogs.ts - Random generation
export const positionEvolvers = [
  { name: 'pendulum', create: () => Position.pendulum(
    rand(0.3, 0.8),   // length
    rand(0.2, 0.5),   // gravity
    rand(0.2, 0.8)    // phaseSpread  <-- Must match order
  )},
];

// 3. position.ts - Implementation + Factory
export const pendulum = (
  length = 0.5,
  gravity = 0.3,
  phaseSpread = 0.5  // <-- If renamed, others break silently
): PositionEvolver => { ... };

export function createPositionEvolver(state) {
  case 'pendulum':
    return pendulum(params.length, params.gravity, params.phaseSpread);
}
```

### Similar Pattern Across All Entity Types

| Entity Type | Implementation | Serialization | Random Gen | Factory |
|-------------|----------------|---------------|------------|---------|
| Position Evolvers | `evolvers/position.ts` | `catalogs.ts` | `evolverCatalogs.ts` | `createPositionEvolver` |
| Distributions | `distributions/*.ts` | `catalogs.ts` | `storeReact.ts` | `composeEvolvers.ts` |
| Mappers | `evolvers/mapperCatalog.ts` | `catalogs.ts` | `storeReact.ts` | `getMapper()` |

The mappers are closest to ideal - they use a single `MapperEntry` that includes both implementation and metadata:

```typescript
// mapperCatalog.ts - Single source of truth for mappers
export const sine: MapperEntry = {
  meta: {
    name: 'sine',
    options: [
      { name: 'frequency', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'phase', type: 'number', default: 0, min: 0, max: 1 },
    ],
  },
  factory: (opts) => (ctx) => (Math.sin(...) + 1) / 2,
};
```

But even mappers have a separate `catalogs.ts` entry for serialization encoding types.

## Proposed Solution: Single Registration API

### Core Idea

Each evolver/distributor is defined in **one place** with all metadata:

```typescript
// evolvers/position/pendulum.ts
export const pendulum = definePositionEvolver({
  name: 'pendulum',

  // Param schema - single source of truth
  params: {
    length: {
      type: 'unit',        // Encoding type (P.unit)
      default: 0.5,
      min: 0.1, max: 1.0,
      description: 'Pendulum length (affects period)',
    },
    gravity: {
      type: 'speed',
      default: 0.3,
      min: 0.01, max: 1.0,
    },
    phaseSpread: {
      type: 'unit',
      default: 0.5,
      min: 0, max: 1,
      description: 'How phases distribute across lines',
    },
  },

  // Random ranges for shuffle/randomize
  randomize: {
    length: [0.3, 0.8],
    gravity: [0.2, 0.5],
    phaseSpread: [0.2, 0.8],
  },

  // Implementation - receives typed params object
  create: ({ length, gravity, phaseSpread }) => {
    const angles: number[] = [];
    const angularVels: number[] = [];
    return {
      name: 'pendulum',
      getValue: (ctx) => {
        // ... implementation
      },
    };
  },
});
```

### The `define*` Functions

```typescript
// registry/positionEvolver.ts
interface ParamSchema {
  type: 'unit' | 'smallUnit' | 'speed' | 'smallInt' | 'angle' | 'bool' | 'frequency' | 'scale5' | 'ratio3' | 'sharpness8';
  default: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

interface PositionEvolverDefinition<P extends Record<string, ParamSchema>> {
  name: string;
  params: P;
  randomize?: { [K in keyof P]?: [number, number] | number[] };
  create: (params: { [K in keyof P]: number }) => PositionEvolver;
}

// Auto-registers into global catalog
export function definePositionEvolver<P extends Record<string, ParamSchema>>(
  def: PositionEvolverDefinition<P>
): RegisteredPositionEvolver<P> {
  positionEvolverRegistry.set(def.name, def);
  return {
    ...def,
    // Factory that validates and converts params
    fromParams: (params: Record<string, number>) => def.create(params as any),
    // Generate random instance
    randomize: () => {
      const params: Record<string, number> = {};
      for (const [key, schema] of Object.entries(def.params)) {
        const range = def.randomize?.[key];
        if (Array.isArray(range) && range.length === 2) {
          params[key] = rand(range[0], range[1]);
        } else if (Array.isArray(range)) {
          params[key] = pick(range);
        } else {
          params[key] = schema.default;
        }
      }
      return def.create(params as any);
    },
  };
}
```

### Auto-Generated Serialization

The registry provides serialization schema automatically:

```typescript
// registry/serialize.ts
export function getSerializationCatalog() {
  const result: Record<string, CatalogEntry> = {};

  for (const [name, def] of positionEvolverRegistry) {
    result[name] = {
      params: Object.entries(def.params).map(([paramName, schema]) =>
        [paramName, getParamType(schema.type)]
      ),
    };
  }

  return result;
}
```

### Benefits

1. **Single source of truth** - Change param in one place, everything updates
2. **Type safety** - TypeScript ensures param names match between definition and create function
3. **Auto-registration** - Just importing the file registers it; no manual catalog updates
4. **Introspection** - UI can enumerate all evolvers and their param schemas
5. **Validation** - Runtime checks that params are in valid ranges
6. **Self-documenting** - Descriptions live with the code

### Migration Path

1. Create the `define*` infrastructure in new `registry/` folder
2. Migrate one position evolver as proof of concept
3. Add build-time check that registry matches old catalogs
4. Gradually migrate all evolvers/distributors
5. Remove old catalog files once all migrated

## Implementation Plan

### Phase 1: Infrastructure (new files, no breaking changes)

```
src/registry/
  types.ts          - ParamSchema, Definition interfaces
  paramTypes.ts     - Map schema.type to P.* functions
  positionEvolver.ts - definePositionEvolver + registry
  distribution.ts   - defineDistribution + registry
  mapper.ts         - defineMapper + registry (extend existing)
  serialize.ts      - Auto-generate catalog from registry
  index.ts          - Export all registries
```

### Phase 2: Migrate Position Evolvers

Convert each evolver one at a time:

```
evolvers/position/
  pendulum.ts       - Uses definePositionEvolver
  billiards.ts      - Uses definePositionEvolver
  rotate.ts         - Uses definePositionEvolver
  ...
  index.ts          - Re-exports all, provides backward-compat
```

### Phase 3: Migrate Distributions

Similar pattern:

```
distributions/
  radial/star.ts    - Uses defineDistribution
  mathematical/lissajous.ts - Uses defineDistribution
  ...
```

### Phase 4: Update Serialization

- Replace hardcoded `catalogs.ts` with auto-generated from registries
- Add version byte to hex format for future compatibility
- Add schema hash for detecting catalog changes

### Phase 5: Cleanup

- Remove `catalogs.ts` (replaced by registry)
- Remove factory switch statements (use registry.get(name).create)
- Remove `evolverCatalogs.ts` random generation (use registry.randomize)

## Detailed Type Definitions

```typescript
// registry/types.ts

export type ParamEncoding =
  | 'unit'       // 0-1 linear
  | 'smallUnit'  // 0-1 quadratic (better resolution near 0)
  | 'speed'      // 0.01-1 log scale
  | 'smallInt'   // 1-16 integer
  | 'int'        // 1-256 integer
  | 'byte'       // 0-255 raw
  | 'bool'       // 0 or 1
  | 'signedUnit' // -1 to 1
  | 'angle'      // 0 to 2π
  | 'frequency'  // 0-10 linear
  | 'scale5'     // 0-5 linear
  | 'ratio3'     // 1-3 linear
  | 'sharpness8' // 1-8 linear

export interface ParamSchema {
  type: ParamEncoding;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface BaseDefinition<TParams extends Record<string, ParamSchema>, TResult> {
  name: string;
  category?: string;
  description?: string;
  params: TParams;
  randomize?: { [K in keyof TParams]?: [number, number] | number[] };
  create: (params: { [K in keyof TParams]: number }) => TResult;
}

// Type-safe param extraction
export type ParamValues<T extends Record<string, ParamSchema>> = {
  [K in keyof T]: number;
};
```

## Example: Full Pendulum Migration

### Before (4 files)

```typescript
// catalogs.ts
pendulum: {
  params: [['length', P.unit], ['gravity', P.speed], ['phaseSpread', P.unit]],
}

// evolverCatalogs.ts
{ name: 'pendulum', create: () => Position.pendulum(rand(0.3, 0.8), rand(0.2, 0.5), rand(0.2, 0.8)) }

// evolvers/position.ts
export const pendulum = (length = 0.5, gravity = 0.3, phaseSpread = 0.5): PositionEvolver => { ... }

export function createPositionEvolver(state) {
  case 'pendulum': return pendulum(params.length, params.gravity, params.phaseSpread);
}
```

### After (1 file)

```typescript
// evolvers/position/pendulum.ts
import { definePositionEvolver } from '../../registry';

export const pendulum = definePositionEvolver({
  name: 'pendulum',
  category: 'physics',
  description: 'Physical pendulum motion with gravity - perpetual swinging',

  params: {
    length: { type: 'unit', default: 0.5, min: 0.1, max: 1, description: 'Pendulum length' },
    gravity: { type: 'speed', default: 0.3, description: 'Gravity strength' },
    phaseSpread: { type: 'unit', default: 0.5, description: 'Phase distribution across lines' },
  },

  randomize: {
    length: [0.3, 0.8],
    gravity: [0.2, 0.5],
    phaseSpread: [0.2, 0.8],
  },

  create: ({ length, gravity, phaseSpread }) => {
    const angles: number[] = [];
    const angularVels: number[] = [];
    return {
      name: 'pendulum',
      getValue: (ctx) => {
        if (angles[ctx.index] === undefined) {
          const baseAngle = ((ctx.index / ctx.total) - 0.5) * Math.PI * 0.8;
          angles[ctx.index] = baseAngle * phaseSpread;
          angularVels[ctx.index] = Math.sqrt(gravity / length) * 0.5 * (1 - 2 * (ctx.index % 2));
        }
        const angularAccel = -gravity / length * Math.sin(angles[ctx.index]);
        angularVels[ctx.index] += angularAccel * ctx.dt;
        angles[ctx.index] += angularVels[ctx.index] * ctx.dt;
        const delta = angularVels[ctx.index] * length * ctx.dt * 0.3;
        return { delta0: delta, delta1: delta };
      },
    };
  },
});
```

## Questions to Resolve

1. **Backward compatibility**: Should we support reading old hex formats? (Probably yes, with version detection)

2. **Build vs runtime registration**: Import-time registration works but requires importing all files. Alternative is explicit `register()` calls in index files.

3. **Ordering**: Serialization relies on stable ordering. Use insertion order (Map) or explicit `order` field?

4. **Validation**: Should `create()` throw on out-of-range params, or clamp silently?

5. **Hot reload**: For dev, should registry support re-registration when file changes?

## Draw Prop Evolvers (Evolvers)

Evolvers are **composite**: they don't have their own logic like Movers do. Instead, they combine:
1. **Mapper** - A pure function that shapes t → 0-1 (sine, threshold, pulse, etc.)
2. **MotionConfig** - How t is computed (speed, edge behavior, phase spread, etc.)
3. **OutputConfig** - How mapper output becomes draw values (dash lengths, alpha ranges, etc.)

### Current Evolver Architecture

```typescript
// evolverFactory.ts - creates evolvers from config
export interface EvolverSlotConfig<TOutput> {
  mapper: string;           // Which mapper function
  mapperOptions?: Record<string, unknown>;  // Mapper params
  motion: Partial<MotionConfig>;            // How t flows
  output: TOutput;                          // Output params
}

// Example: dash evolver config
{
  mapper: 'sine',
  mapperOptions: { frequency: 2 },
  motion: { mode: 'field', speed: 0.2, edge: 'wrap' },
  output: { dashLen: 10, maxGap: 25 },
}
```

### What Needs Registration for Evolvers

Evolvers themselves don't need a `defineEvolver` API because they're composed from:
- **Mappers** (already have registration pattern in mapperCatalog.ts)
- **MotionConfig** (fixed schema, not extensible)
- **OutputConfig** (fixed per output type: dash, alpha, color, lineWidth)

**What we DO need:**
1. **Better Mapper registration** - Mappers are closest to ideal but still have a separate serialization entry
2. **Output type schemas** - Each output type (dash, alpha, color, lineWidth) has its own param schema

### Proposed: defineMapper with Full Schema

```typescript
// mappers/sine.ts
export const sine = defineMapper({
  name: 'sine',
  category: 'wave',
  description: 'Smooth sine wave oscillation',

  params: {
    frequency: { type: 'frequency', default: 1, min: 0.1, max: 10, description: 'Number of cycles' },
    phase: { type: 'unit', default: 0, min: 0, max: 1, description: 'Phase offset' },
  },

  randomize: {
    frequency: [0.5, 4],
    phase: [0, 1],
  },

  create: ({ frequency, phase }) => (ctx) =>
    (Math.sin((ctx.t + phase) * Math.PI * 2 * frequency) + 1) / 2,
});
```

### Output Config Schemas

Output configs don't need registration (they're not extensible), but we should define their schemas for serialization:

```typescript
// core/outputSchemas.ts
export const dashOutputSchema = {
  dashLen: { type: 'dashLen', default: 10, min: 1, max: 30 },
  maxGap: { type: 'dashLen', default: 20, min: 1, max: 50 },
  marching: { type: 'speed', default: 0, min: 0, max: 100 },
};

export const alphaOutputSchema = {
  min: { type: 'unit', default: 0.2, min: 0, max: 1 },
  max: { type: 'unit', default: 1, min: 0, max: 1 },
};

export const lineWidthOutputSchema = {
  min: { type: 'scale5', default: 0.5, min: 0, max: 5 },
  max: { type: 'scale5', default: 2, min: 0, max: 5 },
  mode: { type: 'enum', values: ['absolute', 'multiplier'], default: 'multiplier' },
};

export const colorOutputSchema = {
  palette: { type: 'palette', default: 'sunset' },
};
```

### MotionConfig Schema

Motion config is also fixed but needs explicit schema for serialization:

```typescript
// core/motionSchema.ts
export const motionConfigSchema = {
  mode: { type: 'enum', values: ['field', 'focal', 'spread'], default: 'field' },
  speed: { type: 'speed', default: 0.2 },
  edge: { type: 'enum', values: ['wrap', 'bounce'], default: 'wrap' },
  reversed: { type: 'bool', default: false },
  phaseSpread: { type: 'unit', default: 0 },
  phaseOffset: { type: 'unit', default: 0 },
  waves: { type: 'smallInt', default: 1 },
  alternate: { type: 'bool', default: false },
};
```

---

## Proposed Repository Organization

The new structure emphasizes **one file per entity**, with folders to group related items:

```
src/
├── core/                           # All infrastructure and shared systems
│   ├── index.ts                    # Main exports
│   │
│   │── # Types
│   ├── types.ts                    # Core types (Line, LineConfig, LineContext, etc.)
│   ├── paramSchema.ts              # ParamSchema interface, ParamEncoding type
│   │
│   │── # Registry system
│   ├── registry.ts                 # definePlacer, defineMover, defineMapper, definePalette
│   ├── registries.ts               # Global registry Maps for each entity type
│   │
│   │── # Serialization
│   ├── paramTypes.ts               # Param encoding types (P.unit, P.speed, etc.)
│   ├── serialize.ts                # Hex serialization (auto-generated from registries)
│   ├── deserialize.ts              # Hex deserialization
│   │
│   │── # Evolver system (composition infrastructure)
│   ├── motion.ts                   # computeT(), MotionConfig, motionConfigSchema
│   ├── outputAdapters.ts           # toDash(), toColor(), toRange(), output schemas
│   ├── evolverFactory.ts           # createDashEvolver, createColorEvolver, etc.
│   ├── evolverTypes.ts             # DashEvolver, ColorEvolver, NumberEvolver interfaces
│   │
│   │── # State management
│   ├── store.ts                    # Zustand store definition
│   ├── worldState.ts               # WorldState type, initial state
│   ├── persist.ts                  # URL serialization/deserialization
│   │
│   │── # Rendering
│   ├── line.ts                     # Line class
│   ├── world.ts                    # World class (orchestrates lines + evolvers)
│   ├── canvas.ts                   # Canvas rendering utilities
│   │
│   │── # Utilities
│   ├── random.ts                   # rand(), pick(), shuffle()
│   └── utils.ts                    # TAU, mod(), clamp(), lerp()
│
├── placers/                        # One file per placer, grouped by category
│   ├── index.ts                    # Registry exports + backward compat
│   │
│   ├── radial/
│   │   ├── star.ts                 # definePlacer({ name: 'star', ... })
│   │   ├── starBurst.ts
│   │   └── symmetricSpokes.ts
│   │
│   ├── spiral/
│   │   ├── spiral.ts
│   │   ├── goldenSpiral.ts
│   │   ├── doubleSpiral.ts
│   │   └── sunflower.ts
│   │
│   ├── wave/
│   │   ├── sineWave.ts
│   │   ├── standingWave.ts
│   │   └── interference.ts
│   │
│   ├── concentric/
│   │   ├── concentricRings.ts
│   │   └── nestedPolygons.ts
│   │
│   ├── symmetry/
│   │   ├── bilateral.ts
│   │   ├── rotationalSymmetry.ts
│   │   └── kaleidoscope.ts
│   │
│   ├── grid/
│   │   ├── grid.ts
│   │   ├── woven.ts
│   │   ├── horizontal.ts
│   │   ├── vertical.ts
│   │   ├── diagonal.ts
│   │   └── parallel.ts
│   │
│   ├── special/
│   │   ├── opposing.ts
│   │   ├── vortex.ts
│   │   └── web.ts
│   │
│   └── mathematical/
│       ├── lissajous.ts
│       ├── roseCurve.ts
│       ├── modularPattern.ts
│       ├── epicycloid.ts
│       ├── hypocycloid.ts
│       ├── harmonograph.ts
│       ├── chladni.ts
│       ├── flowerOfLife.ts
│       ├── spirograph.ts
│       ├── guilloche.ts
│       └── fermatSpiral.ts
│
├── movers/                         # One file per mover, grouped by behavior type
│   ├── index.ts                    # Registry exports + backward compat
│   │
│   ├── oscillation/
│   │   ├── breathe.ts              # defineMover({ name: 'breathe', ... })
│   │   ├── oscillate.ts
│   │   └── pulse.ts
│   │
│   ├── physics/
│   │   ├── pendulum.ts
│   │   └── billiards.ts
│   │
│   ├── wave/
│   │   ├── waveInterference.ts
│   │   └── lissajous.ts
│   │
│   └── transform/
│       └── rotate.ts
│
├── mappers/                        # One file per mapper, grouped by category
│   ├── index.ts                    # Registry exports + getMapper()
│   │
│   ├── wave/
│   │   ├── identity.ts             # defineMapper({ name: 'identity', ... })
│   │   ├── sine.ts
│   │   └── triangle.ts
│   │
│   ├── pulse/
│   │   ├── threshold.ts
│   │   ├── pulse.ts
│   │   ├── spot.ts
│   │   └── spotLinear.ts
│   │
│   ├── easing/
│   │   ├── easeIn.ts
│   │   ├── easeOut.ts
│   │   └── easeInOut.ts
│   │
│   ├── noise/
│   │   ├── noise.ts
│   │   ├── shimmer.ts
│   │   └── flicker.ts
│   │
│   ├── harmonic/
│   │   ├── harmonic.ts
│   │   ├── interference.ts
│   │   ├── pendulum.ts
│   │   ├── wavePacket.ts
│   │   ├── counterFlow.ts
│   │   └── collision.ts
│   │
│   └── step/
│       ├── steps.ts
│       ├── bands.ts
│       ├── softBands.ts
│       └── flowingBands.ts
│
├── palettes/                       # One file per palette, grouped by temperature
│   ├── index.ts                    # Registry + getPalette()
│   │
│   ├── warm/
│   │   ├── sunset.ts               # definePalette({ name: 'sunset', ... })
│   │   ├── fire.ts
│   │   └── warm.ts
│   │
│   ├── cool/
│   │   ├── ocean.ts
│   │   ├── forest.ts
│   │   └── cool.ts
│   │
│   ├── vibrant/
│   │   ├── rainbow.ts
│   │   ├── neon.ts
│   │   └── cyberpunk.ts
│   │
│   └── neutral/
│       ├── pastel.ts
│       ├── monochrome.ts
│       └── earth.ts
│
├── dash/                           # Standalone dash evolvers (legacy, may deprecate)
│   ├── index.ts
│   │
│   ├── static/
│   │   ├── solid.ts
│   │   ├── dashed.ts
│   │   ├── dotted.ts
│   │   └── morse.ts
│   │
│   └── animated/
│       ├── marching.ts
│       ├── marchingReverse.ts
│       └── ...
│
└── ui/                             # React components (if separate from core)
    ├── index.ts
    ├── Canvas.tsx
    ├── Controls.tsx
    └── ...
```

### Key Organization Principles

1. **One entity per file** - No `position.ts` with 8 functions; each mover gets its own file
2. **Folders for grouping** - Related entities grouped by category (e.g., `mappers/wave/`, `placers/mathematical/`)
3. **Registry in root index** - Each category's `index.ts` imports all subfolders, building the registry
4. **Category is metadata** - Folder structure matches the `category` field in definitions
5. **Backward compat** - Index files re-export with old names during migration
6. **Core separate** - Types, utilities, and infrastructure in `core/`

### Example: Placer File Structure

```typescript
// placers/star.ts
import { definePlacer } from '../core/registry';

export const star = definePlacer({
  name: 'star',
  category: 'radial',
  description: 'Perfect star burst radiating from center',

  params: {
    // No params for star - uses only options
  },

  randomize: {},

  create: (count, options, _params) => {
    const speed = options.speed ?? rand(0.08, 0.2);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 4 + offset;
      return makeLine(angle, angle + 2, speed, dir, width);
    });
  },
});
```

```typescript
// placers/lissajous.ts
import { definePlacer } from '../core/registry';

export const lissajous = definePlacer({
  name: 'lissajous',
  category: 'mathematical',
  description: 'Lissajous curves from perpendicular sine waves',

  params: {
    a: { type: 'smallInt', default: 3, min: 1, max: 5, description: 'X frequency' },
    b: { type: 'smallInt', default: 4, min: 1, max: 5, description: 'Y frequency' },
    delta: { type: 'angle', default: Math.PI / 4, description: 'Phase difference' },
  },

  randomize: {
    a: [1, 2, 3, 4, 5],
    b: [1, 2, 3, 4, 5],
    delta: [0, Math.PI],
  },

  create: (count, options, { a, b, delta }) => {
    const speed = options.speed ?? rand(0.08, 0.15);
    const width = options.lineWidth ?? 1;
    // ... implementation
  },
});
```

### Example: Mover File Structure

```typescript
// movers/pendulum.ts
import { defineMover } from '../core/registry';

export const pendulum = defineMover({
  name: 'pendulum',
  category: 'physics',
  description: 'Physical pendulum motion with perpetual swinging',

  params: {
    length: { type: 'unit', default: 0.5, min: 0.1, max: 1, description: 'Pendulum length' },
    gravity: { type: 'speed', default: 0.3, min: 0.01, max: 1, description: 'Gravity strength' },
    phaseSpread: { type: 'unit', default: 0.5, min: 0, max: 1, description: 'Phase distribution' },
  },

  randomize: {
    length: [0.3, 0.8],
    gravity: [0.2, 0.5],
    phaseSpread: [0.2, 0.8],
  },

  create: ({ length, gravity, phaseSpread }) => {
    const angles: number[] = [];
    const angularVels: number[] = [];

    return {
      name: 'pendulum',
      getValue: (ctx) => {
        // ... physics implementation
        return { delta0: delta, delta1: delta };
      },
    };
  },
});
```

### Example: Mapper File Structure

```typescript
// mappers/sine.ts
import { defineMapper } from '../core/registry';

export const sine = defineMapper({
  name: 'sine',
  category: 'wave',
  description: 'Smooth sine wave oscillation',

  params: {
    frequency: { type: 'frequency', default: 1, min: 0.1, max: 10, description: 'Number of cycles' },
    phase: { type: 'unit', default: 0, min: 0, max: 1, description: 'Phase offset' },
  },

  randomize: {
    frequency: [0.5, 4],
    phase: [0, 1],
  },

  create: ({ frequency, phase }) => (ctx) =>
    (Math.sin((ctx.t + phase) * Math.PI * 2 * frequency) + 1) / 2,
});
```

---

## Success Criteria

- [ ] Adding a new placer requires editing exactly 1 file
- [ ] Adding a new mover requires editing exactly 1 file
- [ ] Adding a new mapper requires editing exactly 1 file
- [ ] Renaming a param automatically updates serialization
- [ ] TypeScript catches param name mismatches at compile time
- [ ] All existing URLs continue to work (backward compat)
- [ ] Tests verify round-trip serialization for all registered entities
- [ ] UI can enumerate all entities and their param schemas from registry
