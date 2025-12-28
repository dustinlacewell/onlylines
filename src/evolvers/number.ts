// Number evolvers - for animating alpha, lineWidth, brightness, etc.
import type { NumberEvolver } from './types';
import { sineNorm, pulse as pulseWave } from './waves';
import { mod } from '../utils';

// === ALPHA EVOLVERS ===

// Constant alpha (default)
export const constantAlpha = (value = 1): NumberEvolver => ({
  name: 'constantAlpha',
  getValue: () => value,
});

// Breathing alpha
export const breathingAlpha = (min = 0.3, max = 1, speed = 0.3, phaseSpread = 0.5): NumberEvolver => {
  const wave = sineNorm(speed, phaseSpread);
  return {
    name: 'breathingAlpha',
    getValue: (ctx) => {
      const t = wave(ctx);
      return min + t * (max - min);
    },
  };
};

// Pulsing alpha
export const pulsingAlpha = (min = 0.2, max = 1, speed = 0.5, phaseSpread = 0.3): NumberEvolver => {
  const wave = pulseWave(speed, 4, phaseSpread);
  return {
    name: 'pulsingAlpha',
    getValue: (ctx) => {
      const t = wave(ctx);
      return min + t * (max - min);
    },
  };
};

// Wave pattern alpha
export const waveAlpha = (min = 0.3, max = 1, speed = 0.2, waves = 2): NumberEvolver => ({
  name: 'waveAlpha',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * waves;
    const t = (Math.sin((ctx.time * speed + phase) * Math.PI * 2) + 1) / 2;
    return min + t * (max - min);
  },
});

// Fade based on index (creates depth)
export const depthAlpha = (nearAlpha = 1, farAlpha = 0.3): NumberEvolver => ({
  name: 'depthAlpha',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    return nearAlpha + t * (farAlpha - nearAlpha);
  },
});

// Random flickering
export const flickerAlpha = (min = 0.5, max = 1, flickerSpeed = 2): NumberEvolver => ({
  name: 'flickerAlpha',
  getValue: (ctx) => {
    const noise = Math.sin(ctx.time * flickerSpeed * 10 + ctx.index * 7.3) *
                  Math.sin(ctx.time * flickerSpeed * 13 + ctx.index * 11.7);
    const t = (noise + 1) / 2;
    return min + t * (max - min);
  },
});

// Strobe effect
export const strobeAlpha = (onAlpha = 1, offAlpha = 0.1, speed = 2, duty = 0.5): NumberEvolver => ({
  name: 'strobeAlpha',
  getValue: (ctx) => {
    const phase = ctx.index / ctx.total * 0.5;
    const t = mod(ctx.time * speed + phase, 1);
    return t < duty ? onAlpha : offAlpha;
  },
});

// === LINEWIDTH EVOLVERS ===

// Constant lineWidth (uses line's base value)
export const constantWidth = (): NumberEvolver => ({
  name: 'constantWidth',
  getValue: (ctx) => ctx.line.lineWidth,
});

// Breathing lineWidth
export const breathingWidth = (min = 0.5, max = 2, speed = 0.3, phaseSpread = 0.5): NumberEvolver => {
  const wave = sineNorm(speed, phaseSpread);
  return {
    name: 'breathingWidth',
    getValue: (ctx) => {
      const t = wave(ctx);
      const base = ctx.line.lineWidth;
      return base * (min + t * (max - min));
    },
  };
};

// Pulsing lineWidth
export const pulsingWidth = (min = 0.5, max = 3, speed = 0.5, phaseSpread = 0.3): NumberEvolver => {
  const wave = pulseWave(speed, 4, phaseSpread);
  return {
    name: 'pulsingWidth',
    getValue: (ctx) => {
      const t = wave(ctx);
      const base = ctx.line.lineWidth;
      return base * (min + t * (max - min));
    },
  };
};

// Wave pattern width
export const waveWidth = (min = 0.5, max = 2, speed = 0.2, waves = 2): NumberEvolver => ({
  name: 'waveWidth',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * waves;
    const t = (Math.sin((ctx.time * speed + phase) * Math.PI * 2) + 1) / 2;
    const base = ctx.line.lineWidth;
    return base * (min + t * (max - min));
  },
});

// Depth-based width (thicker = closer)
export const depthWidth = (nearMult = 2, farMult = 0.5): NumberEvolver => ({
  name: 'depthWidth',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const base = ctx.line.lineWidth;
    return base * (nearMult + t * (farMult - nearMult));
  },
});

// Tapered - width based on line length
export const taperedWidth = (shortMult = 0.5, longMult = 2): NumberEvolver => ({
  name: 'taperedWidth',
  getValue: (ctx) => {
    const len = Math.abs(ctx.line.perim1 - ctx.line.perim0);
    const normalizedLen = Math.min(len, 2) / 2; // 0-1 based on length up to 2
    const base = ctx.line.lineWidth;
    return base * (shortMult + normalizedLen * (longMult - shortMult));
  },
});

// === BRIGHTNESS EVOLVERS ===

// Constant brightness
export const constantBrightness = (value = 0.5): NumberEvolver => ({
  name: 'constantBrightness',
  getValue: () => value,
});

// Oscillating brightness
export const oscillatingBrightness = (min = 0.3, max = 0.8, speed = 0.4, phaseSpread = 0.5): NumberEvolver => {
  const wave = sineNorm(speed, phaseSpread);
  return {
    name: 'oscillatingBrightness',
    getValue: (ctx) => {
      const t = wave(ctx);
      return min + t * (max - min);
    },
  };
};

// Index-based brightness gradient
export const gradientBrightness = (start = 0.3, end = 0.8): NumberEvolver => ({
  name: 'gradientBrightness',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    return start + t * (end - start);
  },
});
