// Unified hex serialization for store state
// Format: continuous hex string, no delimiters
// Structure: {seed:8}{dist:2+params}{posCount:2}{pos1}{pos2}...{dash}{alpha}{color}{width}

import {
  distributionCatalog,
  positionEvolverCatalog,
  mapperCatalog,
  paletteCatalog,
  motionParamDefs,
  getCatalogArray,
  type ParamDef,
  type CatalogEntry,
} from './catalogs';
import type { EvolverState, SlotState, DashOutput, RangeOutput, ColorOutput } from './storeReact';

// Build arrays from catalogs (order matters for indices!)
const distArray = getCatalogArray(distributionCatalog);
const posArray = getCatalogArray(positionEvolverCatalog);
const mapperArray = getCatalogArray(mapperCatalog);
const paletteArray = getCatalogArray(paletteCatalog);

// === ENCODING HELPERS ===

function encodeParams(params: ParamDef[], values: Record<string, unknown>): string {
  let hex = '';
  for (const [name, type] of params) {
    const v = (values[name] as number) ?? 0;
    // Ensure byte is always an integer 0-255
    const byte = Math.max(0, Math.min(255, Math.floor(type.encode(v))));
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

function decodeParams(params: ParamDef[], hex: string, offset: number): { values: Record<string, number>; nextOffset: number } {
  const values: Record<string, number> = {};
  let pos = offset;
  for (const [name, type] of params) {
    const byte = parseInt(hex.slice(pos, pos + 2), 16);
    values[name] = type.decode(byte);
    pos += 2;
  }
  return { values, nextOffset: pos };
}

interface CatalogItem {
  type: string;
  params: Record<string, number>;
}

function encodeCatalogItem(
  array: Array<{ name: string } & CatalogEntry>,
  item: CatalogItem
): string {
  const idx = array.findIndex(e => e.name === item.type);
  if (idx === -1) {
    console.warn(`Unknown type: ${item.type}, using index 0`);
    return '00';
  }
  const def = array[idx];
  return idx.toString(16).padStart(2, '0') + encodeParams(def.params, item.params);
}

function decodeCatalogItem(
  array: Array<{ name: string } & CatalogEntry>,
  hex: string,
  offset: number
): { item: CatalogItem; nextOffset: number } {
  const idx = parseInt(hex.slice(offset, offset + 2), 16);
  const def = array[idx];
  if (!def) {
    console.warn(`Unknown type index: ${idx}, using index 0`);
    return { item: { type: array[0].name, params: {} }, nextOffset: offset + 2 };
  }
  const { values, nextOffset } = decodeParams(def.params, hex, offset + 2);
  return { item: { type: def.name, params: values }, nextOffset };
}

// === MOTION ENCODING ===

// Motion mode/edge use strings in the store but need numeric indices for encoding
const motionModes = ['field', 'focal', 'spread'] as const;
const edgeBehaviors = ['wrap', 'bounce'] as const;

function encodeMotion(m: Record<string, unknown>): string {
  // Convert string mode/edge to numeric indices
  const normalized: Record<string, unknown> = {
    ...m,
    mode: typeof m.mode === 'string' ? motionModes.indexOf(m.mode as typeof motionModes[number]) : (m.mode ?? 0),
    edge: typeof m.edge === 'string' ? edgeBehaviors.indexOf(m.edge as typeof edgeBehaviors[number]) : (m.edge ?? 0),
  };
  return encodeParams(motionParamDefs, normalized);
}

function decodeMotion(hex: string, offset: number): { values: Record<string, unknown>; nextOffset: number } {
  const { values: rawValues, nextOffset } = decodeParams(motionParamDefs, hex, offset);
  // Convert numeric indices back to strings, and numbers to booleans
  return {
    values: {
      ...rawValues,
      mode: motionModes[rawValues.mode] ?? 'field',
      edge: edgeBehaviors[rawValues.edge] ?? 'wrap',
      reversed: Boolean(rawValues.reversed),
      alternate: Boolean(rawValues.alternate),
    },
    nextOffset,
  };
}

// === OUTPUT ENCODING ===

function encodeDashOutput(o: DashOutput): string {
  return [o.dashLen, o.maxGap, o.marching]
    .map(v => (v & 0xff).toString(16).padStart(2, '0'))
    .join('');
}

function decodeDashOutput(hex: string, offset: number): { values: DashOutput; nextOffset: number } {
  return {
    values: {
      dashLen: parseInt(hex.slice(offset, offset + 2), 16),
      maxGap: parseInt(hex.slice(offset + 2, offset + 4), 16),
      marching: parseInt(hex.slice(offset + 4, offset + 6), 16),
    },
    nextOffset: offset + 6,
  };
}

// Alpha range: 0-1
function encodeAlphaOutput(o: RangeOutput): string {
  return [Math.round(o.min * 255), Math.round(o.max * 255)]
    .map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'))
    .join('');
}

function decodeAlphaOutput(hex: string, offset: number): { values: RangeOutput; nextOffset: number } {
  return {
    values: {
      min: parseInt(hex.slice(offset, offset + 2), 16) / 255,
      max: parseInt(hex.slice(offset + 2, offset + 4), 16) / 255,
    },
    nextOffset: offset + 4,
  };
}

// LineWidth range: 0-8 (typical values 0.3-4)
function encodeLineWidthOutput(o: RangeOutput): string {
  return [Math.round(o.min * 32), Math.round(o.max * 32)]
    .map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'))
    .join('');
}

function decodeLineWidthOutput(hex: string, offset: number): { values: RangeOutput; nextOffset: number } {
  return {
    values: {
      min: parseInt(hex.slice(offset, offset + 2), 16) / 32,
      max: parseInt(hex.slice(offset + 2, offset + 4), 16) / 32,
    },
    nextOffset: offset + 4,
  };
}

function encodeColorOutput(o: ColorOutput): string {
  const idx = paletteArray.findIndex(p => p.name === o.palette);
  return (idx >= 0 ? idx : 0).toString(16).padStart(2, '0');
}

function decodeColorOutput(hex: string, offset: number): { values: ColorOutput; nextOffset: number } {
  const idx = parseInt(hex.slice(offset, offset + 2), 16);
  return {
    values: { palette: paletteArray[idx]?.name || 'sunset' },
    nextOffset: offset + 2,
  };
}

// === SLOT ENCODING ===

type OutputEncoder<T> = (o: T) => string;
type OutputDecoder<T> = (hex: string, offset: number) => { values: T; nextOffset: number };

function encodeSlot<T>(slot: SlotState<T>, outputEncoder: OutputEncoder<T>): string {
  let hex = slot.enabled ? '1' : '0';
  hex += encodeCatalogItem(mapperArray, {
    type: slot.mapper,
    params: slot.mapperOptions as Record<string, number>,
  });
  hex += encodeMotion(slot.motion as Record<string, unknown>);
  hex += outputEncoder(slot.output);
  return hex;
}

function decodeSlot<T>(
  hex: string,
  offset: number,
  outputDecoder: OutputDecoder<T>
): { slot: SlotState<T>; nextOffset: number } {
  const enabled = hex[offset] === '1';
  const { item: mapper, nextOffset: o1 } = decodeCatalogItem(mapperArray, hex, offset + 1);
  const { values: motion, nextOffset: o2 } = decodeMotion(hex, o1);
  const { values: output, nextOffset: o3 } = outputDecoder(hex, o2);
  return {
    slot: {
      enabled,
      mapper: mapper.type,
      mapperOptions: mapper.params,
      motion,
      output,
    },
    nextOffset: o3,
  };
}

// === STATE TYPES ===

export interface PositionEvolverState {
  type: string;
  params: Record<string, number>;
}

export interface DistributionState {
  type: string;
  params: Record<string, number>;
}

// === MAIN SERIALIZE/DESERIALIZE ===

export function serializeState(state: EvolverState): string {
  let hex = '';

  // Seed: 8 hex chars (32 bits)
  hex += (state.seed >>> 0).toString(16).padStart(8, '0');

  // LineCount: 4 hex chars (16 bits, 0-65535)
  hex += (state.lineCount & 0xffff).toString(16).padStart(4, '0');

  // Fade: 2 hex chars (8 bits, 0-255 maps to 0-1)
  hex += Math.round(state.fade * 255).toString(16).padStart(2, '0');

  // Speed: 2 hex chars (8 bits, 0-255 maps to 0-3 range)
  hex += Math.round((state.speed / 3) * 255).toString(16).padStart(2, '0');

  // Distribution: index + params
  const dist = state.distribution as DistributionState;
  hex += encodeCatalogItem(distArray, { type: dist.type, params: dist.params });

  // Position evolvers: count (2 chars) + each evolver
  const posEvolvers = state.positionEvolvers as PositionEvolverState[];
  hex += posEvolvers.length.toString(16).padStart(2, '0');
  for (const pos of posEvolvers) {
    hex += encodeCatalogItem(posArray, pos);
  }

  // Draw slots
  hex += encodeSlot(state.dash, encodeDashOutput);
  hex += encodeSlot(state.alpha, encodeAlphaOutput);
  hex += encodeSlot(state.color, encodeColorOutput);
  hex += encodeSlot(state.lineWidth, encodeLineWidthOutput);

  return hex;
}

export function deserializeState(hex: string): Partial<EvolverState> {
  try {
    let offset = 0;

    // Seed
    const seed = parseInt(hex.slice(0, 8), 16);
    offset = 8;

    // LineCount: 4 hex chars (16 bits)
    const lineCount = parseInt(hex.slice(offset, offset + 4), 16);
    offset += 4;

    // Fade: 2 hex chars (8 bits, 0-255 maps to 0-1)
    const fade = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    offset += 2;

    // Speed: 2 hex chars (8 bits, 0-255 maps to 0-3 range)
    const speed = (parseInt(hex.slice(offset, offset + 2), 16) / 255) * 3;
    offset += 2;

    // Distribution (now with params)
    const { item: dist, nextOffset: o1 } = decodeCatalogItem(distArray, hex, offset);
    const distribution: DistributionState = { type: dist.type, params: dist.params };
    offset = o1;

    // Position evolvers
    const posCount = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;
    const positionEvolvers: PositionEvolverState[] = [];
    for (let i = 0; i < posCount; i++) {
      const { item, nextOffset } = decodeCatalogItem(posArray, hex, offset);
      positionEvolvers.push(item);
      offset = nextOffset;
    }

    // Draw slots
    const { slot: dash, nextOffset: o2 } = decodeSlot(hex, offset, decodeDashOutput);
    const { slot: alpha, nextOffset: o3 } = decodeSlot(hex, o2, decodeAlphaOutput);
    const { slot: color, nextOffset: o4 } = decodeSlot(hex, o3, decodeColorOutput);
    const { slot: lineWidth } = decodeSlot(hex, o4, decodeLineWidthOutput);

    return {
      seed,
      lineCount,
      fade,
      speed,
      distribution,
      positionEvolvers: positionEvolvers as unknown as EvolverState['positionEvolvers'],
      dash,
      alpha,
      color,
      lineWidth,
    };
  } catch (e) {
    console.error('Failed to deserialize state:', e);
    return {};
  }
}

// === URL HELPERS ===

export function getStateFromURL(): Partial<EvolverState> | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    return deserializeState(hash);
  } catch {
    return null;
  }
}

export function setURLFromState(state: EvolverState): void {
  const serialized = serializeState(state);
  window.history.replaceState(null, '', `#${serialized}`);
}

export function pushURLFromState(state: EvolverState): void {
  const serialized = serializeState(state);
  window.history.pushState(null, '', `#${serialized}`);
}
