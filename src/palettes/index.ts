// Color palettes - registered with unified system
// Import this file to register all palettes

import { registerPalette } from '../core/registry';

// HSL color type
export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Convert HSL array to CSS string array
function hslToCSS(colors: HSL[]): string[] {
  return colors.map(c => `hsl(${c.h}, ${c.s}%, ${c.l}%)`);
}

// === PALETTE REGISTRATIONS ===

export const sunset = registerPalette({
  id: 0,
  name: 'sunset',
  category: 'warm',
  description: 'Warm sunset colors',
  colors: hslToCSS([
    { h: 350, s: 85, l: 55 },
    { h: 25, s: 95, l: 55 },
    { h: 45, s: 90, l: 60 },
    { h: 280, s: 60, l: 45 },
  ]),
});

export const aurora = registerPalette({
  id: 1,
  name: 'aurora',
  category: 'cool',
  description: 'Northern lights colors',
  colors: hslToCSS([
    { h: 160, s: 70, l: 50 },
    { h: 130, s: 65, l: 55 },
    { h: 280, s: 55, l: 60 },
    { h: 200, s: 80, l: 55 },
  ]),
});

export const ember = registerPalette({
  id: 2,
  name: 'ember',
  category: 'warm',
  description: 'Glowing embers',
  colors: hslToCSS([
    { h: 5, s: 90, l: 45 },
    { h: 25, s: 100, l: 50 },
    { h: 45, s: 100, l: 55 },
    { h: 0, s: 85, l: 35 },
  ]),
});

export const arctic = registerPalette({
  id: 3,
  name: 'arctic',
  category: 'cool',
  description: 'Icy blue tones',
  colors: hslToCSS([
    { h: 200, s: 50, l: 75 },
    { h: 210, s: 60, l: 60 },
    { h: 190, s: 40, l: 85 },
    { h: 220, s: 70, l: 50 },
  ]),
});

export const jungle = registerPalette({
  id: 4,
  name: 'jungle',
  category: 'nature',
  description: 'Lush green foliage',
  colors: hslToCSS([
    { h: 120, s: 55, l: 40 },
    { h: 85, s: 65, l: 50 },
    { h: 160, s: 50, l: 45 },
    { h: 50, s: 70, l: 55 },
  ]),
});

export const cosmic = registerPalette({
  id: 5,
  name: 'cosmic',
  category: 'vibrant',
  description: 'Space nebula colors',
  colors: hslToCSS([
    { h: 270, s: 80, l: 50 },
    { h: 320, s: 75, l: 55 },
    { h: 200, s: 90, l: 60 },
    { h: 180, s: 85, l: 50 },
  ]),
});

export const earth = registerPalette({
  id: 6,
  name: 'earth',
  category: 'nature',
  description: 'Earthy brown tones',
  colors: hslToCSS([
    { h: 25, s: 60, l: 40 },
    { h: 35, s: 50, l: 50 },
    { h: 15, s: 70, l: 35 },
    { h: 45, s: 45, l: 60 },
  ]),
});

export const neonCity = registerPalette({
  id: 7,
  name: 'neonCity',
  category: 'vibrant',
  description: 'Neon cyberpunk lights',
  colors: hslToCSS([
    { h: 320, s: 100, l: 55 },
    { h: 180, s: 100, l: 50 },
    { h: 60, s: 100, l: 50 },
    { h: 280, s: 100, l: 60 },
  ]),
});

export const bloodMoon = registerPalette({
  id: 8,
  name: 'bloodMoon',
  category: 'dark',
  description: 'Deep reds and crimsons',
  colors: hslToCSS([
    { h: 0, s: 80, l: 40 },
    { h: 350, s: 70, l: 30 },
    { h: 20, s: 90, l: 45 },
    { h: 340, s: 60, l: 25 },
  ]),
});

export const mint = registerPalette({
  id: 9,
  name: 'mint',
  category: 'cool',
  description: 'Fresh mint greens',
  colors: hslToCSS([
    { h: 160, s: 45, l: 70 },
    { h: 140, s: 40, l: 65 },
    { h: 170, s: 50, l: 60 },
    { h: 180, s: 35, l: 75 },
  ]),
});

export const ocean = registerPalette({
  id: 10,
  name: 'ocean',
  category: 'cool',
  description: 'Ocean depths to surface',
  colors: hslToCSS([
    { h: 200, s: 70, l: 25 },
    { h: 210, s: 65, l: 40 },
    { h: 195, s: 60, l: 55 },
    { h: 185, s: 50, l: 70 },
  ]),
});

export const fire = registerPalette({
  id: 11,
  name: 'fire',
  category: 'warm',
  description: 'Flame from core to edge',
  colors: hslToCSS([
    { h: 0, s: 100, l: 35 },
    { h: 15, s: 100, l: 45 },
    { h: 35, s: 100, l: 55 },
    { h: 50, s: 100, l: 65 },
  ]),
});

export const forest = registerPalette({
  id: 12,
  name: 'forest',
  category: 'nature',
  description: 'Forest shadow to sunlight',
  colors: hslToCSS([
    { h: 80, s: 40, l: 25 },
    { h: 100, s: 50, l: 35 },
    { h: 120, s: 55, l: 45 },
    { h: 90, s: 60, l: 55 },
  ]),
});

export const candy = registerPalette({
  id: 13,
  name: 'candy',
  category: 'vibrant',
  description: 'Sweet pastel colors',
  colors: hslToCSS([
    { h: 330, s: 80, l: 70 },
    { h: 280, s: 70, l: 75 },
    { h: 180, s: 60, l: 70 },
    { h: 50, s: 80, l: 75 },
  ]),
});

export const monochrome = registerPalette({
  id: 14,
  name: 'monochrome',
  category: 'neutral',
  description: 'Pure white',
  colors: ['hsl(0, 0%, 100%)'],
});

export const noir = registerPalette({
  id: 15,
  name: 'noir',
  category: 'neutral',
  description: 'Grayscale gradient',
  colors: hslToCSS([
    { h: 0, s: 0, l: 20 },
    { h: 0, s: 0, l: 40 },
    { h: 0, s: 0, l: 60 },
    { h: 0, s: 0, l: 80 },
  ]),
});

export const vaporwave = registerPalette({
  id: 16,
  name: 'vaporwave',
  category: 'vibrant',
  description: 'Retro synthwave aesthetic',
  colors: hslToCSS([
    { h: 300, s: 70, l: 60 },
    { h: 280, s: 60, l: 65 },
    { h: 200, s: 80, l: 55 },
    { h: 320, s: 65, l: 55 },
  ]),
});

// Re-export registry functions for convenience
export {
  getPalette,
  getPaletteById,
  getAllPalettes,
} from '../core/registry';
