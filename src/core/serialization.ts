// Auto-generated serialization catalogs from registry
// This bridges the new unified registration to the existing serialize.ts

import type { ParamType } from '../paramTypes';
import {
  getAllPlacers,
  getAllMovers,
  getAllMappers,
  getAllPalettes,
  getPlacerById,
  getMoverById,
  getMapperById,
  getPaletteById,
  type ParamSchema,
} from './registry';
import { schemaToParamDefs } from './paramTypes';

// === LOCAL TYPES ===

type ParamDef = [string, ParamType];

interface CatalogEntry {
  params: ParamDef[];
}

// === CATALOG GENERATION ===

interface GeneratedCatalogEntry extends CatalogEntry {
  id: number;
}

function definitionToCatalogEntry<T extends { id: number; name: string; params: Record<string, ParamSchema> }>(
  def: T
): GeneratedCatalogEntry {
  return {
    id: def.id,
    params: schemaToParamDefs(def.params),
  };
}

// Generate catalog from registry (sorted by ID for stable serialization)
export function generatePlacerCatalog(): Map<string, GeneratedCatalogEntry> {
  const result = new Map<string, GeneratedCatalogEntry>();
  const sorted = getAllPlacers().sort((a, b) => a.id - b.id);
  for (const def of sorted) {
    result.set(def.name, definitionToCatalogEntry(def));
  }
  return result;
}

export function generateMoverCatalog(): Map<string, GeneratedCatalogEntry> {
  const result = new Map<string, GeneratedCatalogEntry>();
  const sorted = getAllMovers().sort((a, b) => a.id - b.id);
  for (const def of sorted) {
    result.set(def.name, definitionToCatalogEntry(def));
  }
  return result;
}

export function generateMapperCatalog(): Map<string, GeneratedCatalogEntry> {
  const result = new Map<string, GeneratedCatalogEntry>();
  const sorted = getAllMappers().sort((a, b) => a.id - b.id);
  for (const def of sorted) {
    result.set(def.name, definitionToCatalogEntry(def));
  }
  return result;
}

export function generatePaletteCatalog(): Map<string, GeneratedCatalogEntry> {
  const result = new Map<string, GeneratedCatalogEntry>();
  const sorted = getAllPalettes().sort((a, b) => a.id - b.id);
  for (const def of sorted) {
    result.set(def.name, { id: def.id, params: [] });
  }
  return result;
}

// === ENCODING/DECODING HELPERS ===

// Encode a registered entity by ID
export function encodeRegisteredPlacer(name: string, params: Record<string, number>): string {
  const catalog = generatePlacerCatalog();
  const entry = catalog.get(name);
  if (!entry) {
    console.warn(`Unknown placer: ${name}, encoding as id 0`);
    return '00';
  }
  return encodeById(entry.id, entry.params, params);
}

export function encodeRegisteredMover(name: string, params: Record<string, number>): string {
  const catalog = generateMoverCatalog();
  const entry = catalog.get(name);
  if (!entry) {
    console.warn(`Unknown mover: ${name}, encoding as id 0`);
    return '00';
  }
  return encodeById(entry.id, entry.params, params);
}

export function encodeRegisteredMapper(name: string, params: Record<string, number>): string {
  const catalog = generateMapperCatalog();
  const entry = catalog.get(name);
  if (!entry) {
    console.warn(`Unknown mapper: ${name}, encoding as id 0`);
    return '00';
  }
  return encodeById(entry.id, entry.params, params);
}

export function encodeRegisteredPalette(name: string): string {
  const catalog = generatePaletteCatalog();
  const entry = catalog.get(name);
  if (!entry) {
    console.warn(`Unknown palette: ${name}, encoding as id 0`);
    return '00';
  }
  return entry.id.toString(16).padStart(2, '0');
}

// Decode by ID and return name + params
export function decodeRegisteredPlacer(
  hex: string,
  offset: number
): { name: string; params: Record<string, number>; nextOffset: number } {
  const id = parseInt(hex.slice(offset, offset + 2), 16);
  const def = getPlacerById(id);
  if (!def) {
    console.warn(`Unknown placer id: ${id}`);
    return { name: 'star', params: {}, nextOffset: offset + 2 };
  }
  const paramDefs = schemaToParamDefs(def.params);
  const { values, nextOffset } = decodeParams(paramDefs, hex, offset + 2);
  return { name: def.name, params: values, nextOffset };
}

export function decodeRegisteredMover(
  hex: string,
  offset: number
): { name: string; params: Record<string, number>; nextOffset: number } {
  const id = parseInt(hex.slice(offset, offset + 2), 16);
  const def = getMoverById(id);
  if (!def) {
    console.warn(`Unknown mover id: ${id}`);
    return { name: 'rotate', params: {}, nextOffset: offset + 2 };
  }
  const paramDefs = schemaToParamDefs(def.params);
  const { values, nextOffset } = decodeParams(paramDefs, hex, offset + 2);
  return { name: def.name, params: values, nextOffset };
}

export function decodeRegisteredMapper(
  hex: string,
  offset: number
): { name: string; params: Record<string, number>; nextOffset: number } {
  const id = parseInt(hex.slice(offset, offset + 2), 16);
  const def = getMapperById(id);
  if (!def) {
    console.warn(`Unknown mapper id: ${id}`);
    return { name: 'identity', params: {}, nextOffset: offset + 2 };
  }
  const paramDefs = schemaToParamDefs(def.params);
  const { values, nextOffset } = decodeParams(paramDefs, hex, offset + 2);
  return { name: def.name, params: values, nextOffset };
}

export function decodeRegisteredPalette(
  hex: string,
  offset: number
): { name: string; nextOffset: number } {
  const id = parseInt(hex.slice(offset, offset + 2), 16);
  const def = getPaletteById(id);
  if (!def) {
    console.warn(`Unknown palette id: ${id}`);
    return { name: 'sunset', nextOffset: offset + 2 };
  }
  return { name: def.name, nextOffset: offset + 2 };
}

// === INTERNAL HELPERS ===

function encodeById(id: number, paramDefs: ParamDef[], values: Record<string, number>): string {
  let hex = id.toString(16).padStart(2, '0');
  for (const [name, type] of paramDefs) {
    const v = values[name] ?? 0;
    const byte = Math.max(0, Math.min(255, Math.floor(type.encode(v))));
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

function decodeParams(
  paramDefs: ParamDef[],
  hex: string,
  offset: number
): { values: Record<string, number>; nextOffset: number } {
  const values: Record<string, number> = {};
  let pos = offset;
  for (const [name, type] of paramDefs) {
    const byte = parseInt(hex.slice(pos, pos + 2), 16);
    values[name] = type.decode(byte);
    pos += 2;
  }
  return { values, nextOffset: pos };
}

// === VALIDATION ===

// Check that all registered entities have unique IDs
export function validateRegistries(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for ID gaps (warning, not error)
  const checkIdGaps = (
    items: Array<{ id: number; name: string }>,
    entityType: string
  ) => {
    const ids = items.map(i => i.id).sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== i) {
        errors.push(
          `${entityType}: ID gap detected. Expected ${i}, got ${ids[i]}. ` +
          `IDs should be sequential starting from 0 for efficient serialization.`
        );
        break;
      }
    }
  };

  checkIdGaps(getAllPlacers(), 'Placers');
  checkIdGaps(getAllMovers(), 'Movers');
  checkIdGaps(getAllMappers(), 'Mappers');
  checkIdGaps(getAllPalettes(), 'Palettes');

  return { valid: errors.length === 0, errors };
}
