// Unified registration system for placers, movers, mappers, and palettes
// Each entity self-registers on import with a stable numeric ID for serialization

import type { LineConfig } from '../types';
import type { Line } from '../line';

// === PARAM SCHEMA ===

export type ParamEncoding =
  | 'unit'        // 0-1 linear
  | 'smallUnit'   // 0-1 quadratic (better resolution near 0)
  | 'speed'       // 0.01-1 log scale
  | 'smallInt'    // 1-16 integer
  | 'int'         // 1-256 integer
  | 'byte'        // 0-255 raw
  | 'bool'        // 0 or 1
  | 'signedUnit'  // -1 to 1
  | 'angle'       // 0 to 2π
  | 'frequency'   // 0-10 linear
  | 'scale5'      // 0-5 linear
  | 'ratio3'      // 1-3 linear
  | 'sharpness8'; // 1-8 linear

export interface ParamSchema {
  type: ParamEncoding;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

// === CONTEXT TYPES ===

export interface WaveContext {
  index: number;
  total: number;
  time: number;
  dt: number;
}

export interface EvolverWorld {
  time: number;
  lines: Line[];
  config: Record<string, unknown>;
}

export interface LineContext extends WaveContext {
  line: Line;
  world: EvolverWorld;
}

export interface MapperContext {
  t: number;
  index: number;
  total: number;
  time: number;
  line: Line;
}

// === RESULT TYPES ===

export interface PositionDelta {
  delta0: number;
  delta1: number;
}

export interface DistributionOptions {
  speed?: number;
  lineWidth?: number;
}

// === BASE DEFINITION ===

export interface BaseDefinition<TParams extends Record<string, ParamSchema>> {
  id: number;
  name: string;
  category?: string;
  description?: string;
  params: TParams;
  randomize?: { [K in keyof TParams]?: [number, number] | readonly number[] };
}

// Type-safe param values extraction
export type ParamValues<T extends Record<string, ParamSchema>> = {
  [K in keyof T]: number;
};

// === PLACER DEFINITION ===

export interface PlacerDefinition<TParams extends Record<string, ParamSchema> = Record<string, ParamSchema>>
  extends BaseDefinition<TParams> {
  create: (
    count: number,
    options: DistributionOptions,
    params: ParamValues<TParams>
  ) => LineConfig[];
}

// === MOVER DEFINITION ===

export interface MoverDefinition<TParams extends Record<string, ParamSchema> = Record<string, ParamSchema>>
  extends BaseDefinition<TParams> {
  create: (params: ParamValues<TParams>) => {
    name: string;
    getValue: (ctx: LineContext) => PositionDelta;
  };
}

// === MAPPER DEFINITION ===

export type Mapper = (ctx: MapperContext) => number;

export interface MapperDefinition<TParams extends Record<string, ParamSchema> = Record<string, ParamSchema>>
  extends BaseDefinition<TParams> {
  create: (params: ParamValues<TParams>) => Mapper;
}

// === PALETTE DEFINITION ===

export interface PaletteDefinition {
  id: number;
  name: string;
  category?: string;
  description?: string;
  colors: string[];
}

// === REGISTRIES ===

const placerRegistry = new Map<string, PlacerDefinition>();
const placerById = new Map<number, PlacerDefinition>();

const moverRegistry = new Map<string, MoverDefinition>();
const moverById = new Map<number, MoverDefinition>();

const mapperRegistry = new Map<string, MapperDefinition>();
const mapperById = new Map<number, MapperDefinition>();

const paletteRegistry = new Map<string, PaletteDefinition>();
const paletteById = new Map<number, PaletteDefinition>();

// === VALIDATION ===

function validateIdUnique<T extends { id: number; name: string }>(
  byId: Map<number, T>,
  byName: Map<string, T>,
  def: T,
  entityType: string
): void {
  const existingById = byId.get(def.id);
  if (existingById && existingById.name !== def.name) {
    throw new Error(
      `${entityType} ID ${def.id} collision: "${def.name}" vs "${existingById.name}"`
    );
  }
  const existingByName = byName.get(def.name);
  if (existingByName && existingByName.id !== def.id) {
    console.warn(
      `${entityType} "${def.name}" re-registered with different ID: ${existingByName.id} → ${def.id}`
    );
  }
}

function clampParam(value: number, schema: ParamSchema, paramName: string, entityName: string): number {
  const min = schema.min ?? -Infinity;
  const max = schema.max ?? Infinity;
  if (value < min || value > max) {
    console.warn(
      `${entityName}.${paramName}: value ${value} out of range [${min}, ${max}], clamping`
    );
    return Math.max(min, Math.min(max, value));
  }
  return value;
}

// === REGISTER FUNCTIONS ===

export function registerPlacer<TParams extends Record<string, ParamSchema>>(
  def: PlacerDefinition<TParams>
): PlacerDefinition<TParams> {
  validateIdUnique(
    placerById as Map<number, { id: number; name: string }>,
    placerRegistry as Map<string, { id: number; name: string }>,
    def,
    'Placer'
  );
  placerRegistry.set(def.name, def as unknown as PlacerDefinition);
  placerById.set(def.id, def as unknown as PlacerDefinition);
  return def;
}

export function registerMover<TParams extends Record<string, ParamSchema>>(
  def: MoverDefinition<TParams>
): MoverDefinition<TParams> {
  validateIdUnique(
    moverById as Map<number, { id: number; name: string }>,
    moverRegistry as Map<string, { id: number; name: string }>,
    def,
    'Mover'
  );
  moverRegistry.set(def.name, def as unknown as MoverDefinition);
  moverById.set(def.id, def as unknown as MoverDefinition);
  return def;
}

export function registerMapper<TParams extends Record<string, ParamSchema>>(
  def: MapperDefinition<TParams>
): MapperDefinition<TParams> {
  validateIdUnique(
    mapperById as Map<number, { id: number; name: string }>,
    mapperRegistry as Map<string, { id: number; name: string }>,
    def,
    'Mapper'
  );
  mapperRegistry.set(def.name, def as unknown as MapperDefinition);
  mapperById.set(def.id, def as unknown as MapperDefinition);
  return def;
}

export function registerPalette(def: PaletteDefinition): PaletteDefinition {
  validateIdUnique(paletteById, paletteRegistry, def, 'Palette');
  paletteRegistry.set(def.name, def);
  paletteById.set(def.id, def);
  return def;
}

// === LOOKUP FUNCTIONS ===

export function getPlacer(name: string): PlacerDefinition | undefined {
  return placerRegistry.get(name);
}

export function getPlacerById(id: number): PlacerDefinition | undefined {
  return placerById.get(id);
}

export function getMover(name: string): MoverDefinition | undefined {
  return moverRegistry.get(name);
}

export function getMoverById(id: number): MoverDefinition | undefined {
  return moverById.get(id);
}

export function getMapper(name: string): MapperDefinition | undefined {
  return mapperRegistry.get(name);
}

export function getMapperById(id: number): MapperDefinition | undefined {
  return mapperById.get(id);
}

export function getPalette(name: string): PaletteDefinition | undefined {
  return paletteRegistry.get(name);
}

export function getPaletteById(id: number): PaletteDefinition | undefined {
  return paletteById.get(id);
}

// === ENUMERATION ===

export function getAllPlacers(): PlacerDefinition[] {
  return [...placerRegistry.values()];
}

export function getAllMovers(): MoverDefinition[] {
  return [...moverRegistry.values()];
}

export function getAllMappers(): MapperDefinition[] {
  return [...mapperRegistry.values()];
}

export function getAllPalettes(): PaletteDefinition[] {
  return [...paletteRegistry.values()];
}

// Group by category
export function getPlacersByCategory(): Record<string, PlacerDefinition[]> {
  const result: Record<string, PlacerDefinition[]> = {};
  for (const def of placerRegistry.values()) {
    const cat = def.category ?? 'other';
    if (!result[cat]) result[cat] = [];
    result[cat].push(def);
  }
  return result;
}

export function getMoversByCategory(): Record<string, MoverDefinition[]> {
  const result: Record<string, MoverDefinition[]> = {};
  for (const def of moverRegistry.values()) {
    const cat = def.category ?? 'other';
    if (!result[cat]) result[cat] = [];
    result[cat].push(def);
  }
  return result;
}

export function getMappersByCategory(): Record<string, MapperDefinition[]> {
  const result: Record<string, MapperDefinition[]> = {};
  for (const def of mapperRegistry.values()) {
    const cat = def.category ?? 'other';
    if (!result[cat]) result[cat] = [];
    result[cat].push(def);
  }
  return result;
}

// === FACTORY HELPERS ===

// Create a placer instance with validation
export function createPlacer(
  name: string,
  count: number,
  options: DistributionOptions = {},
  params: Record<string, number> = {}
): LineConfig[] {
  const def = placerRegistry.get(name);
  if (!def) {
    console.warn(`Unknown placer: ${name}`);
    return [];
  }

  // Apply defaults and clamp
  const resolvedParams: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const value = params[paramName] ?? schema.default;
    resolvedParams[paramName] = clampParam(value, schema, paramName, name);
  }

  return def.create(count, options, resolvedParams as ParamValues<typeof def.params>);
}

// Create a mover instance with validation
export function createMover(
  name: string,
  params: Record<string, number> = {}
): { name: string; getValue: (ctx: LineContext) => PositionDelta } | null {
  const def = moverRegistry.get(name);
  if (!def) {
    console.warn(`Unknown mover: ${name}`);
    return null;
  }

  // Apply defaults and clamp
  const resolvedParams: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const value = params[paramName] ?? schema.default;
    resolvedParams[paramName] = clampParam(value, schema, paramName, name);
  }

  return def.create(resolvedParams as ParamValues<typeof def.params>);
}

// Create a mapper instance with validation
export function createMapper(
  name: string,
  params: Record<string, number> = {}
): Mapper {
  const def = mapperRegistry.get(name);
  if (!def) {
    console.warn(`Unknown mapper: ${name}, using identity`);
    return (ctx) => ctx.t;
  }

  // Apply defaults and clamp
  const resolvedParams: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const value = params[paramName] ?? schema.default;
    resolvedParams[paramName] = clampParam(value, schema, paramName, name);
  }

  return def.create(resolvedParams as ParamValues<typeof def.params>);
}

// === RANDOMIZATION ===

function randomInRange(range: [number, number] | readonly number[]): number {
  if (range.length === 2 && typeof range[0] === 'number' && typeof range[1] === 'number') {
    // Continuous range
    const [min, max] = range as [number, number];
    return min + Math.random() * (max - min);
  }
  // Discrete choices
  return range[Math.floor(Math.random() * range.length)];
}

export function randomizePlacer(name: string): Record<string, number> {
  const def = placerRegistry.get(name);
  if (!def) return {};

  const params: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const range = def.randomize?.[paramName];
    if (range) {
      params[paramName] = randomInRange(range);
    } else {
      params[paramName] = schema.default;
    }
  }
  return params;
}

export function randomizeMover(name: string): Record<string, number> {
  const def = moverRegistry.get(name);
  if (!def) return {};

  const params: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const range = def.randomize?.[paramName];
    if (range) {
      params[paramName] = randomInRange(range);
    } else {
      params[paramName] = schema.default;
    }
  }
  return params;
}

export function randomizeMapper(name: string): Record<string, number> {
  const def = mapperRegistry.get(name);
  if (!def) return {};

  const params: Record<string, number> = {};
  for (const [paramName, schema] of Object.entries(def.params)) {
    const range = def.randomize?.[paramName];
    if (range) {
      params[paramName] = randomInRange(range);
    } else {
      params[paramName] = schema.default;
    }
  }
  return params;
}
