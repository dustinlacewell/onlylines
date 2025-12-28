// Extensible serialization for world state
// Format: seed.d{distro}.p{pos1,pos2}.l{palette}.m{colorAnim}.a{alpha}.w{width}.f{fade}.n{count}...
// Uses indices into catalogs for terseness, base36 encoding for numbers

import {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  distributionNames,
  paletteNames,
  colorAnimationNames,
} from './evolverCatalogs';

// World state that can be serialized
export interface WorldState {
  seed: number;
  distribution: string;
  position: string[];
  palette: string;
  colorAnimation: string;
  alpha: string;
  lineWidth: string;
  dash: string;
  fade: number;
  count: number;
  // Extensible: add new properties here as needed
  [key: string]: unknown;
}

// Catalog mapping for compact encoding
const catalogs = {
  d: distributionNames,
  p: positionEvolvers.map(e => e.name),
  l: paletteNames,       // 'l' for palette (color list)
  m: colorAnimationNames, // 'm' for motion/animation
  a: alphaEvolvers.map(e => e.name),
  w: lineWidthEvolvers.map(e => e.name),
  h: dashEvolvers.map(e => e.name), // 'h' for hatching/dash
} as const;

type CatalogKey = keyof typeof catalogs;

// Encode a number to base36 (0-9, a-z)
function toB36(n: number): string {
  return Math.round(n).toString(36);
}

// Decode base36 to number
function fromB36(s: string): number {
  return parseInt(s, 36);
}

// Encode a float with 2 decimal precision as integer
function encodeFloat(n: number, precision = 100): string {
  return toB36(Math.round(n * precision));
}

// Decode float
function decodeFloat(s: string, precision = 100): number {
  return fromB36(s) / precision;
}

// Get index of item in catalog, or -1
function catalogIndex(catalog: CatalogKey, name: string): number {
  return (catalogs[catalog] as readonly string[]).indexOf(name);
}

// Get name from catalog by index
function catalogName(catalog: CatalogKey, index: number): string | undefined {
  return catalogs[catalog][index];
}

// Encode array of names as comma-separated indices
function encodeNames(catalog: CatalogKey, names: string[]): string {
  return names
    .map(n => catalogIndex(catalog, n))
    .filter(i => i >= 0)
    .map(i => toB36(i))
    .join(',');
}

// Decode comma-separated indices to names
function decodeNames(catalog: CatalogKey, encoded: string): string[] {
  if (!encoded) return [];
  return encoded
    .split(',')
    .map(s => catalogName(catalog, fromB36(s)))
    .filter((n): n is string => n !== undefined);
}

// Serialize world state to URL-safe string
export function serialize(state: WorldState): string {
  const parts: string[] = [];

  // Seed (always first, no prefix needed)
  parts.push(toB36(state.seed));

  // Distribution
  const dIdx = catalogIndex('d', state.distribution);
  if (dIdx >= 0) parts.push(`d${toB36(dIdx)}`);

  // Position evolvers (always include, empty means static/no motion)
  parts.push(`p${encodeNames('p', state.position)}`);

  // Palette
  const lIdx = catalogIndex('l', state.palette);
  if (lIdx >= 0) parts.push(`l${toB36(lIdx)}`);

  // Color animation
  const mIdx = catalogIndex('m', state.colorAnimation);
  if (mIdx >= 0) parts.push(`m${toB36(mIdx)}`);

  // Alpha evolver
  const aIdx = catalogIndex('a', state.alpha);
  if (aIdx >= 0) parts.push(`a${toB36(aIdx)}`);

  // LineWidth evolver
  const wIdx = catalogIndex('w', state.lineWidth);
  if (wIdx >= 0) parts.push(`w${toB36(wIdx)}`);

  // Dash evolver
  const hIdx = catalogIndex('h', state.dash);
  if (hIdx >= 0) parts.push(`h${toB36(hIdx)}`);

  // Fade (0-1 float)
  parts.push(`f${encodeFloat(state.fade)}`);

  // Count
  parts.push(`n${toB36(state.count)}`);

  return parts.join('.');
}

// Deserialize URL string to world state
export function deserialize(str: string): Partial<WorldState> {
  const state: Partial<WorldState> = {};
  const parts = str.split('.');

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // First part is always seed (no prefix)
    if (i === 0 && !part.match(/^[a-z]/)) {
      state.seed = fromB36(part);
      continue;
    }

    const prefix = part[0];
    const value = part.slice(1);

    switch (prefix) {
      case 'd': {
        const name = catalogName('d', fromB36(value));
        if (name) state.distribution = name;
        break;
      }
      case 'p': {
        state.position = decodeNames('p', value);
        break;
      }
      case 'l': {
        const name = catalogName('l', fromB36(value));
        if (name) state.palette = name;
        break;
      }
      case 'm': {
        const name = catalogName('m', fromB36(value));
        if (name) state.colorAnimation = name;
        break;
      }
      case 'a': {
        const name = catalogName('a', fromB36(value));
        if (name) state.alpha = name;
        break;
      }
      case 'w': {
        const name = catalogName('w', fromB36(value));
        if (name) state.lineWidth = name;
        break;
      }
      case 'h': {
        const name = catalogName('h', fromB36(value));
        if (name) state.dash = name;
        break;
      }
      case 'f': {
        state.fade = decodeFloat(value);
        break;
      }
      case 'n': {
        state.count = fromB36(value);
        break;
      }
      // Unknown prefixes are ignored for forward compatibility
    }
  }

  return state;
}

// Get state from URL hash
export function getStateFromURL(): Partial<WorldState> | null {
  const hash = window.location.hash.slice(1); // Remove #
  if (!hash) return null;
  try {
    return deserialize(hash);
  } catch {
    return null;
  }
}

// Set URL hash from state
export function setURLFromState(state: WorldState): void {
  const serialized = serialize(state);
  // Use replaceState to avoid polluting history on every generation
  window.history.replaceState(null, '', `#${serialized}`);
}
