// Color evolvers - animate colors using wave functions and palettes
import type { ColorEvolver } from './types';
import type { Palette } from './palettes';
import {
  randomPalette,
  samplePalette,
  samplePaletteWrap,
  hslToString,
} from './palettes';
import { mod, lerp, rand } from '../utils';

// === STATIC COLOR EVOLVERS (color based on line index/position, not time) ===

// Sample palette by line index
export const staticPalette = (palette?: Palette): ColorEvolver => {
  const pal = palette ?? randomPalette();
  return {
    name: `static:${pal.name}`,
    getValue: (ctx) => {
      const t = ctx.index / Math.max(1, ctx.total - 1);
      const color = samplePalette(pal, t);
      return hslToString(color, ctx.line.alpha);
    },
  };
};

// Monochrome with luminance variation
export const mono = (hue?: number): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'mono',
    getValue: (ctx) => {
      const t = ctx.index / Math.max(1, ctx.total - 1);
      const l = 30 + t * 40;
      const s = 60 - t * 20;
      return hslToString({ h, s, l }, ctx.line.alpha);
    },
  };
};

// Triadic harmony
export const triadic = (hue?: number): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'triadic',
    getValue: (ctx) => {
      const t = ctx.index / Math.max(1, ctx.total - 1);
      const hue = h + Math.floor(t * 3) * 120;
      const l = 50 + Math.sin(t * Math.PI) * 15;
      return hslToString({ h: mod(hue, 360), s: 70, l }, ctx.line.alpha);
    },
  };
};

// Duotone - two colors alternating
export const duotone = (hue1?: number, hue2?: number): ColorEvolver => {
  const h1 = hue1 ?? rand(0, 360);
  const h2 = hue2 ?? h1 + 90 + rand(0, 90);
  return {
    name: 'duotone',
    getValue: (ctx) => {
      const h = ctx.index % 2 === 0 ? h1 : h2;
      const l = 45 + ctx.line.brightness * 20;
      return hslToString({ h: mod(h, 360), s: 75, l }, ctx.line.alpha);
    },
  };
};

// Temperature gradient (warm to cool)
export const temperature = (): ColorEvolver => ({
  name: 'temperature',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const h = lerp(10, 220, t);
    const s = 75 - Math.abs(t - 0.5) * 20;
    return hslToString({ h, s, l: 55 }, ctx.line.alpha);
  },
});

// Depth-based coloring
export const depth = (hue?: number): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'depth',
    getValue: (ctx) => {
      const pos = (ctx.line.perim0 + ctx.line.perim1) / 8;
      const l = 30 + pos * 40;
      const s = 80 - pos * 30;
      return hslToString({ h: h + pos * 20, s, l }, ctx.line.alpha);
    },
  };
};

// Ink / high contrast grayscale
export const ink = (): ColorEvolver => ({
  name: 'ink',
  getValue: (ctx) => {
    const l = 75 + ctx.line.brightness * 20;
    return hslToString({ h: 0, s: 0, l }, ctx.line.alpha);
  },
});

// Noir - elegant grayscale with blue tint
export const noir = (): ColorEvolver => ({
  name: 'noir',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const l = 20 + t * 55;
    return hslToString({ h: 220, s: 8, l }, ctx.line.alpha);
  },
});

// === CYCLING COLOR EVOLVERS (color changes over time) ===

// Cycle through full rainbow
export const cyclingRainbow = (speed = 0.3, phaseSpread = 1): ColorEvolver => ({
  name: 'cyclingRainbow',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const h = mod((phase + ctx.time * speed) * 360, 360);
    return hslToString({ h, s: 80, l: 55 }, ctx.line.alpha);
  },
});

// Cycle through a palette
export const cyclingPalette = (palette?: Palette, speed = 0.15, phaseSpread = 1): ColorEvolver => {
  const pal = palette ?? randomPalette();
  return {
    name: `cycling:${pal.name}`,
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const t = mod(phase + ctx.time * speed, 1);
      const color = samplePaletteWrap(pal, t);
      return hslToString(color, ctx.line.alpha);
    },
  };
};

// Cycle between two hues
export const cyclingDual = (hue1?: number, hue2?: number, phaseSpread = 0.5): ColorEvolver => {
  const h1 = hue1 ?? rand(0, 360);
  const h2 = hue2 ?? h1 + 180;
  return {
    name: 'cyclingDual',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const t = (Math.sin((phase + ctx.time * 0.2) * Math.PI * 2) + 1) / 2;
      const h = lerp(h1, h2, t);
      return hslToString({ h: mod(h, 360), s: 75, l: 55 }, ctx.line.alpha);
    },
  };
};

// Wave of color across lines
export const colorWave = (hue?: number, spread = 60, phaseSpread = 1): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'colorWave',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const wave = Math.sin((phase + ctx.time * 0.3) * Math.PI * 2);
      const hue = h + wave * spread;
      const l = 50 + wave * 15;
      return hslToString({ h: mod(hue, 360), s: 70, l }, ctx.line.alpha);
    },
  };
};

// Breathing color intensity
export const breathingColor = (hue?: number, phaseSpread = 0.3): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'breathingColor',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const breath = (Math.sin((phase + ctx.time * 0.4) * Math.PI * 2) + 1) / 2;
      const l = 30 + breath * 40;
      const s = 50 + breath * 30;
      return hslToString({ h, s, l }, ctx.line.alpha);
    },
  };
};

// Color chase effect
export const colorChase = (phaseSpread = 1): ColorEvolver => {
  const h = rand(0, 360);
  return {
    name: 'colorChase',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const t = mod(phase + ctx.time * 0.5, 1);
      const pulse = Math.exp(-Math.pow((t - 0.5) * 4, 2));
      const hue = h + pulse * 60;
      const l = 35 + pulse * 35;
      return hslToString({ h: mod(hue, 360), s: 80, l }, ctx.line.alpha);
    },
  };
};

// Strobe groups
export const strobeGroups = (numGroups = 3, phaseSpread = 1): ColorEvolver => {
  const hues = Array.from({ length: numGroups }, () => rand(0, 360));
  return {
    name: 'strobeGroups',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      const t = phase + ctx.time * 0.6;
      const group = Math.floor(mod(t * numGroups, numGroups));
      const h = hues[group];
      const flash = Math.pow((Math.sin(t * Math.PI * 2 * numGroups) + 1) / 2, 2);
      return hslToString({ h, s: 85, l: 40 + flash * 30 }, ctx.line.alpha);
    },
  };
};

// === DYNAMIC THEMED EVOLVERS ===

// Fire with flicker
export const fire = (): ColorEvolver => ({
  name: 'fire',
  getValue: (ctx) => {
    const t = ctx.index / ctx.total;
    const flicker = Math.sin(ctx.time * 5 + ctx.index * 0.5) * 0.15;
    const h = lerp(-5, 55, t + flicker);
    const s = 100 - t * 15;
    const l = lerp(35, 65, t);
    return hslToString({ h: mod(h, 360), s, l }, ctx.line.alpha);
  },
});

// Ocean with subtle wave motion
export const ocean = (): ColorEvolver => ({
  name: 'ocean',
  getValue: (ctx) => {
    const t = ctx.index / ctx.total;
    const wave = Math.sin(ctx.time * 0.5 + ctx.index * 0.1) * 0.1;
    const h = lerp(200, 240, t + wave);
    const l = lerp(25, 60, t);
    return hslToString({ h, s: 70, l }, ctx.line.alpha);
  },
});

// Forest with rustling
export const forest = (): ColorEvolver => ({
  name: 'forest',
  getValue: (ctx) => {
    const t = ctx.index / ctx.total;
    const rustle = Math.sin(ctx.time * 0.8 + ctx.index * 0.2) * 0.05;
    const h = lerp(80, 150, t + rustle);
    const s = 55 + t * 15;
    const l = 35 + t * 20;
    return hslToString({ h, s, l }, ctx.line.alpha);
  },
});

// Aurora with shifting colors
export const aurora = (): ColorEvolver => ({
  name: 'aurora',
  getValue: (ctx) => {
    const t = ctx.index / ctx.total;
    const shift = Math.sin(ctx.time * 0.4 + t * 3) * 30;
    const h = lerp(120, 280, t) + shift;
    const s = 60 + Math.sin(t * Math.PI) * 20;
    const l = 45 + Math.sin(ctx.time * 0.7 + ctx.index * 0.2) * 15;
    return hslToString({ h: mod(h, 360), s, l }, ctx.line.alpha);
  },
});

// Neon with flicker
export const neon = (hue?: number): ColorEvolver => {
  const h = hue ?? rand(0, 360);
  return {
    name: 'neon',
    getValue: (ctx) => {
      const flicker = Math.sin(ctx.time * 8 + ctx.index) * 0.1 + 0.9;
      const t = ctx.index / ctx.total;
      const hue = h + t * 40;
      return hslToString({ h: mod(hue, 360), s: 100, l: 60 * flicker }, ctx.line.alpha);
    },
  };
};

// Metallic shimmer
export const metallic = (metal: 'gold' | 'silver' | 'copper' = 'gold'): ColorEvolver => {
  const metals = {
    gold: { h: 45, s: 70, lBase: 45 },
    silver: { h: 220, s: 10, lBase: 60 },
    copper: { h: 20, s: 65, lBase: 40 },
  };
  const m = metals[metal];
  return {
    name: `metallic:${metal}`,
    getValue: (ctx) => {
      const shimmer = Math.sin(ctx.time * 2 + ctx.index * 0.3) * 0.5 + 0.5;
      const l = m.lBase + shimmer * 25;
      return hslToString({ h: m.h, s: m.s, l }, ctx.line.alpha);
    },
  };
};

// Vaporwave aesthetic
export const vaporwave = (): ColorEvolver => ({
  name: 'vaporwave',
  getValue: (ctx) => {
    const t = ctx.index / ctx.total;
    const h = lerp(280, 200, t) + Math.sin(ctx.time * 0.3) * 20;
    const l = 55 + Math.sin(t * Math.PI) * 15;
    return hslToString({ h: mod(h, 360), s: 75, l }, ctx.line.alpha);
  },
});

// Candy/pastel
export const candy = (): ColorEvolver => {
  const baseHue = rand(0, 360);
  return {
    name: 'candy',
    getValue: (ctx) => {
      const t = ctx.index / ctx.total;
      const h = baseHue + t * 120;
      const l = 65 + Math.sin(ctx.time + t * Math.PI * 2) * 10;
      return hslToString({ h: mod(h, 360), s: 60, l }, ctx.line.alpha);
    },
  };
};
