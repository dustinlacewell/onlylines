// Palette infrastructure - types, utilities, and registry
// Individual palettes are in src/palettes/

// === TYPES ===

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Runtime palette with parsed HSL colors
export interface Palette {
  name: string;
  colors: HSL[];
}

// Palette definition for registration (colors as CSS strings)
export interface PaletteDefinition {
  id: number;
  name: string;
  category?: string;
  description?: string;
  colors: string[];
}

// === REGISTRY ===

const paletteRegistry = new Map<string, PaletteDefinition>();
const paletteById = new Map<number, PaletteDefinition>();

function validateIdUnique(def: PaletteDefinition): void {
  const existingById = paletteById.get(def.id);
  if (existingById && existingById.name !== def.name) {
    throw new Error(
      `Palette ID ${def.id} collision: "${def.name}" vs "${existingById.name}"`
    );
  }
  const existingByName = paletteRegistry.get(def.name);
  if (existingByName && existingByName.id !== def.id) {
    console.warn(
      `Palette "${def.name}" re-registered with different ID: ${existingByName.id} → ${def.id}`
    );
  }
}

export function registerPalette(def: PaletteDefinition): PaletteDefinition {
  validateIdUnique(def);
  paletteRegistry.set(def.name, def);
  paletteById.set(def.id, def);
  return def;
}

export function getPalette(name: string): PaletteDefinition | undefined {
  return paletteRegistry.get(name);
}

export function getPaletteById(id: number): PaletteDefinition | undefined {
  return paletteById.get(id);
}

export function getAllPalettes(): PaletteDefinition[] {
  return [...paletteRegistry.values()];
}

// === HSL PARSING ===

// Parse CSS HSL string to HSL object
// Supports: "hsl(h, s%, l%)" and "hsla(h, s%, l%, a)"
export function parseHSL(css: string): HSL {
  const match = css.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?/);
  if (!match) {
    console.warn(`Failed to parse HSL: ${css}, using white`);
    return { h: 0, s: 0, l: 100 };
  }
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

// === PALETTE UTILITIES ===

// Linearly interpolate between two HSL colors
export function lerpHSL(a: HSL, b: HSL, t: number): HSL {
  return {
    h: a.h + (b.h - a.h) * t,
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  };
}

// Sample a palette at position t (0-1), with smooth interpolation
export function samplePalette(palette: Palette, t: number): HSL {
  const colors = palette.colors;
  if (!colors || colors.length === 0) {
    console.warn('Empty palette, using white');
    return { h: 0, s: 0, l: 100 };
  }
  if (colors.length === 1) {
    return colors[0] ?? { h: 0, s: 0, l: 100 };
  }
  // Clamp t to valid range
  const clampedT = Math.max(0, Math.min(1, t));
  const idx = clampedT * (colors.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, colors.length - 1);
  const frac = idx - i0;
  const c0 = colors[i0];
  const c1 = colors[i1];
  if (!c0 || !c1) {
    console.warn(`Palette "${palette.name}" has undefined colors at indices ${i0}/${i1}, using white`);
    return { h: 0, s: 0, l: 100 };
  }
  return lerpHSL(c0, c1, frac);
}

// Sample with wrapping (for cycling)
export function samplePaletteWrap(palette: Palette, t: number): HSL {
  const colors = palette.colors;
  if (!colors || colors.length === 0) {
    console.warn('Empty palette, using white');
    return { h: 0, s: 0, l: 100 };
  }
  if (colors.length === 1) {
    return colors[0] ?? { h: 0, s: 0, l: 100 };
  }
  const normalizedT = ((t % 1) + 1) % 1; // Handle negative t
  const idx = normalizedT * colors.length;
  const i0 = Math.floor(idx) % colors.length;
  const i1 = (i0 + 1) % colors.length;
  const frac = idx - Math.floor(idx);
  const c0 = colors[i0];
  const c1 = colors[i1];
  if (!c0 || !c1) {
    console.warn(`Palette "${palette.name}" has undefined colors at indices ${i0}/${i1}, using white`);
    return { h: 0, s: 0, l: 100 };
  }
  return lerpHSL(c0, c1, frac);
}

// Convert HSL to CSS string
export function hslToString(color: HSL, alpha = 1): string {
  if (alpha >= 1) {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
}

// === CONVENIENCE ===

// Convert a PaletteDefinition to a runtime Palette
export function toPalette(def: PaletteDefinition): Palette {
  return {
    name: def.name,
    colors: def.colors.map(parseHSL),
  };
}

// Get a palette by name and convert to runtime format
export function getRuntimePalette(name: string): Palette | undefined {
  const def = getPalette(name);
  return def ? toPalette(def) : undefined;
}
