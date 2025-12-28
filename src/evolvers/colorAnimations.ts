// Color animations - how to apply palettes over time
// These are separated from palettes for composability
import type { ColorEvolver, LineContext } from './types';
import type { Palette } from './palettes';
import { samplePalette, samplePaletteWrap, hslToString } from './palettes';
import { mod } from '../utils';

// Animation function type - takes context and palette, returns t (0-1) for sampling
type ColorAnimationFn = (ctx: LineContext) => number;

// Create a color evolver from a palette and an animation function
function createColorEvolver(
  name: string,
  palette: Palette,
  getT: ColorAnimationFn,
  wrap = false
): ColorEvolver {
  const sample = wrap ? samplePaletteWrap : samplePalette;
  return {
    name: `${name}:${palette.name}`,
    getValue: (ctx) => {
      const t = getT(ctx);
      const color = sample(palette, t);
      return hslToString(color, ctx.line.alpha);
    },
  };
}

// === STATIC ANIMATIONS (based on line index, not time) ===

// Linear gradient across all lines
export const staticGradient = (palette: Palette): ColorEvolver =>
  createColorEvolver('static', palette, (ctx) =>
    ctx.index / Math.max(1, ctx.total - 1)
  );

// Discrete bands - each line gets one color from palette
export const staticBands = (palette: Palette): ColorEvolver => ({
  name: `bands:${palette.name}`,
  getValue: (ctx) => {
    const numColors = palette.colors.length;
    const colorIdx = Math.floor((ctx.index / ctx.total) * numColors) % numColors;
    return hslToString(palette.colors[colorIdx], ctx.line.alpha);
  },
});

// Random assignment from palette (but stable per line)
export const staticRandom = (palette: Palette): ColorEvolver => ({
  name: `random:${palette.name}`,
  getValue: (ctx) => {
    // Use index as pseudo-random seed for stability
    const colorIdx = (ctx.index * 7919) % palette.colors.length;
    return hslToString(palette.colors[colorIdx], ctx.line.alpha);
  },
});

// === CYCLING ANIMATIONS (color changes over time) ===

// Continuous cycling through palette
export const cycling = (palette: Palette, speed = 0.15, phaseSpread = 1): ColorEvolver =>
  createColorEvolver('cycling', palette, (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    return mod(phase + ctx.time * speed, 1);
  }, true);

// Breathing - smooth oscillation between start and end of palette
export const breathing = (palette: Palette, speed = 0.3, phaseSpread = 0.5): ColorEvolver =>
  createColorEvolver('breathing', palette, (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const t = (Math.sin((phase + ctx.time * speed) * Math.PI * 2) + 1) / 2;
    return t;
  });

// Wave - ripple effect across lines
export const wave = (palette: Palette, speed = 0.4, waves = 2): ColorEvolver =>
  createColorEvolver('wave', palette, (ctx) => {
    const phase = (ctx.index / ctx.total) * waves;
    const t = (Math.sin((phase + ctx.time * speed) * Math.PI * 2) + 1) / 2;
    return t;
  }, true);

// Pulse - sharp transitions with hold
export const pulse = (palette: Palette, speed = 0.5, sharpness = 4): ColorEvolver =>
  createColorEvolver('pulse', palette, (ctx) => {
    const phase = (ctx.index / ctx.total);
    const t = mod(phase + ctx.time * speed, 1);
    // Create sharper transitions
    return Math.pow((Math.sin(t * Math.PI * 2) + 1) / 2, sharpness);
  }, true);

// Chase - a bright spot that moves through the lines
export const chase = (palette: Palette, speed = 0.5, width = 0.15): ColorEvolver => ({
  name: `chase:${palette.name}`,
  getValue: (ctx) => {
    const pos = ctx.index / ctx.total;
    const chasePos = mod(ctx.time * speed, 1);
    // Distance from chase position (wrapping)
    const dist = Math.min(
      Math.abs(pos - chasePos),
      Math.abs(pos - chasePos + 1),
      Math.abs(pos - chasePos - 1)
    );
    // Gaussian falloff
    const intensity = Math.exp(-Math.pow(dist / width, 2));
    // Sample bright color for chase, dark for background
    const t = intensity;
    const color = samplePalette(palette, t);
    return hslToString(color, ctx.line.alpha);
  },
});

// Strobe - alternating groups flash
export const strobe = (palette: Palette, speed = 0.8, groups = 2): ColorEvolver => ({
  name: `strobe:${palette.name}`,
  getValue: (ctx) => {
    const group = ctx.index % groups;
    const t = ctx.time * speed;
    const activeGroup = Math.floor(mod(t * groups, groups));
    const flash = group === activeGroup ? 1 : 0;
    // Use first color dim, last color bright
    const colorT = flash;
    const color = samplePalette(palette, colorT);
    return hslToString(color, ctx.line.alpha);
  },
});

// Shimmer - high frequency subtle variation
export const shimmer = (palette: Palette, intensity = 0.2): ColorEvolver =>
  createColorEvolver('shimmer', palette, (ctx) => {
    const base = ctx.index / Math.max(1, ctx.total - 1);
    const shimmer = Math.sin(ctx.time * 8 + ctx.index * 0.5) * intensity;
    return Math.max(0, Math.min(1, base + shimmer));
  });

// Flicker - random-ish brightness variation (like fire)
export const flicker = (palette: Palette, speed = 5, intensity = 0.2): ColorEvolver =>
  createColorEvolver('flicker', palette, (ctx) => {
    const base = ctx.index / Math.max(1, ctx.total - 1);
    // Use multiple frequencies for organic feel
    const f1 = Math.sin(ctx.time * speed + ctx.index * 0.3);
    const f2 = Math.sin(ctx.time * speed * 1.7 + ctx.index * 0.7);
    const flicker = (f1 * 0.6 + f2 * 0.4) * intensity;
    return Math.max(0, Math.min(1, base + flicker));
  });

// Depth - color based on line position on screen
export const depthBased = (palette: Palette): ColorEvolver => ({
  name: `depth:${palette.name}`,
  getValue: (ctx) => {
    // Use average perimeter position as depth
    const pos = (ctx.line.perim0 + ctx.line.perim1) / 8; // 0-1 range
    const color = samplePalette(palette, pos);
    return hslToString(color, ctx.line.alpha);
  },
});

// === SPECIAL ANIMATIONS (don't use palette directly) ===

// Rainbow cycle (ignores palette, full spectrum)
export const rainbow = (speed = 0.3, phaseSpread = 1): ColorEvolver => ({
  name: 'rainbow',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread;
    const h = mod((phase + ctx.time * speed) * 360, 360);
    return hslToString({ h, s: 80, l: 55 }, ctx.line.alpha);
  },
});

// Monochrome with luminance variation (uses palette's first color's hue)
export const mono = (palette: Palette): ColorEvolver => {
  const hue = palette.colors[0]?.h ?? 0;
  return {
    name: `mono:${palette.name}`,
    getValue: (ctx) => {
      const t = ctx.index / Math.max(1, ctx.total - 1);
      const l = 30 + t * 40;
      const s = 60 - t * 20;
      return hslToString({ h: hue, s, l }, ctx.line.alpha);
    },
  };
};
