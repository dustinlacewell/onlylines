// Color palettes - pure data, no animation logic
import { pick } from '../utils';

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface Palette {
  name: string;
  colors: HSL[];
}

// === CURATED PALETTES ===

export const palettes = {
  sunset: {
    name: 'sunset',
    colors: [
      { h: 350, s: 85, l: 55 },  // rose
      { h: 25, s: 95, l: 55 },   // orange
      { h: 45, s: 90, l: 60 },   // gold
      { h: 280, s: 60, l: 45 },  // purple
    ],
  },
  aurora: {
    name: 'aurora',
    colors: [
      { h: 160, s: 70, l: 50 },  // teal
      { h: 130, s: 65, l: 55 },  // green
      { h: 280, s: 55, l: 60 },  // violet
      { h: 200, s: 80, l: 55 },  // cyan
    ],
  },
  ember: {
    name: 'ember',
    colors: [
      { h: 5, s: 90, l: 45 },    // crimson
      { h: 25, s: 100, l: 50 },  // orange
      { h: 45, s: 100, l: 55 },  // amber
      { h: 0, s: 85, l: 35 },    // dark red
    ],
  },
  arctic: {
    name: 'arctic',
    colors: [
      { h: 200, s: 50, l: 75 },  // ice blue
      { h: 210, s: 60, l: 60 },  // steel blue
      { h: 190, s: 40, l: 85 },  // frost
      { h: 220, s: 70, l: 50 },  // deep blue
    ],
  },
  jungle: {
    name: 'jungle',
    colors: [
      { h: 120, s: 55, l: 40 },  // forest
      { h: 85, s: 65, l: 50 },   // lime
      { h: 160, s: 50, l: 45 },  // teal
      { h: 50, s: 70, l: 55 },   // chartreuse
    ],
  },
  cosmic: {
    name: 'cosmic',
    colors: [
      { h: 270, s: 80, l: 50 },  // violet
      { h: 320, s: 75, l: 55 },  // magenta
      { h: 200, s: 90, l: 60 },  // electric blue
      { h: 180, s: 85, l: 50 },  // cyan
    ],
  },
  earth: {
    name: 'earth',
    colors: [
      { h: 25, s: 60, l: 40 },   // sienna
      { h: 35, s: 50, l: 50 },   // tan
      { h: 15, s: 70, l: 35 },   // rust
      { h: 45, s: 45, l: 60 },   // sand
    ],
  },
  neonCity: {
    name: 'neonCity',
    colors: [
      { h: 320, s: 100, l: 55 }, // hot pink
      { h: 180, s: 100, l: 50 }, // cyan
      { h: 60, s: 100, l: 50 },  // yellow
      { h: 280, s: 100, l: 60 }, // purple
    ],
  },
  bloodMoon: {
    name: 'bloodMoon',
    colors: [
      { h: 0, s: 80, l: 40 },    // blood red
      { h: 350, s: 70, l: 30 },  // dark crimson
      { h: 20, s: 90, l: 45 },   // rust orange
      { h: 340, s: 60, l: 25 },  // maroon
    ],
  },
  mint: {
    name: 'mint',
    colors: [
      { h: 160, s: 45, l: 70 },  // mint
      { h: 140, s: 40, l: 65 },  // sage
      { h: 170, s: 50, l: 60 },  // seafoam
      { h: 180, s: 35, l: 75 },  // pale teal
    ],
  },
  ocean: {
    name: 'ocean',
    colors: [
      { h: 200, s: 70, l: 25 },  // deep
      { h: 210, s: 65, l: 40 },  // mid
      { h: 195, s: 60, l: 55 },  // surface
      { h: 185, s: 50, l: 70 },  // foam
    ],
  },
  fire: {
    name: 'fire',
    colors: [
      { h: 0, s: 100, l: 35 },   // core
      { h: 15, s: 100, l: 45 },  // inner
      { h: 35, s: 100, l: 55 },  // mid
      { h: 50, s: 100, l: 65 },  // outer
    ],
  },
  forest: {
    name: 'forest',
    colors: [
      { h: 80, s: 40, l: 25 },   // shadow
      { h: 100, s: 50, l: 35 },  // undergrowth
      { h: 120, s: 55, l: 45 },  // canopy
      { h: 90, s: 60, l: 55 },   // sunlit
    ],
  },
  candy: {
    name: 'candy',
    colors: [
      { h: 330, s: 80, l: 70 },  // pink
      { h: 280, s: 70, l: 75 },  // lavender
      { h: 180, s: 60, l: 70 },  // mint
      { h: 50, s: 80, l: 75 },   // lemon
    ],
  },
  monochrome: {
    name: 'monochrome',
    colors: [
      { h: 0, s: 0, l: 100 },  // white
    ],
  },
  noir: {
    name: 'noir',
    colors: [
      { h: 0, s: 0, l: 20 },
      { h: 0, s: 0, l: 40 },
      { h: 0, s: 0, l: 60 },
      { h: 0, s: 0, l: 80 },
    ],
  },
  vaporwave: {
    name: 'vaporwave',
    colors: [
      { h: 300, s: 70, l: 60 },  // magenta
      { h: 280, s: 60, l: 65 },  // violet
      { h: 200, s: 80, l: 55 },  // cyan
      { h: 320, s: 65, l: 55 },  // pink
    ],
  },
} as const;

export type PaletteName = keyof typeof palettes;

// Get a random palette (makes a mutable copy)
export function randomPalette(): Palette {
  const names = Object.keys(palettes) as PaletteName[];
  const name = pick(names);
  const pal = palettes[name];
  // Return a mutable copy
  return {
    name: pal.name,
    colors: pal.colors.map(c => ({ ...c })),
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
  const idx = t * (colors.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, colors.length - 1);
  const frac = idx - i0;
  return lerpHSL(colors[i0], colors[i1], frac);
}

// Sample with wrapping (for cycling)
export function samplePaletteWrap(palette: Palette, t: number): HSL {
  const colors = palette.colors;
  const normalizedT = ((t % 1) + 1) % 1; // Handle negative t
  const idx = normalizedT * colors.length;
  const i0 = Math.floor(idx) % colors.length;
  const i1 = (i0 + 1) % colors.length;
  const frac = idx - Math.floor(idx);
  return lerpHSL(colors[i0], colors[i1], frac);
}

// Convert HSL to CSS string
export function hslToString(color: HSL, alpha = 1): string {
  if (alpha >= 1) {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
}
