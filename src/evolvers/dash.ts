// Dash evolvers - for animating line dash patterns
import type { DashEvolver } from './types';

// === STATIC DASH PATTERNS (no animation) ===

// No dashes - solid line
export const solid = (): DashEvolver => ({
  name: 'solid',
  getValue: () => ({ pattern: [], offset: 0 }),
});

// Simple dashed line
export const dashed = (dashLen = 10, gapLen = 10): DashEvolver => ({
  name: 'dashed',
  getValue: () => ({ pattern: [dashLen, gapLen], offset: 0 }),
});

// Dotted line
export const dotted = (dotSize = 2, gapLen = 8): DashEvolver => ({
  name: 'dotted',
  getValue: () => ({ pattern: [dotSize, gapLen], offset: 0 }),
});

// Morse code style (dash-dot)
export const morse = (dashLen = 15, dotLen = 3, gapLen = 5): DashEvolver => ({
  name: 'morse',
  getValue: () => ({ pattern: [dashLen, gapLen, dotLen, gapLen], offset: 0 }),
});

// === ANIMATED DASH PATTERNS (marching) ===

// Marching dashes - dashes flow along the line
export const marching = (dashLen = 10, gapLen = 10, speed = 50): DashEvolver => ({
  name: 'marching',
  getValue: (ctx) => ({
    pattern: [dashLen, gapLen],
    offset: ctx.time * speed,
  }),
});

// Reverse marching - dashes flow opposite direction
export const marchingReverse = (dashLen = 10, gapLen = 10, speed = 50): DashEvolver => ({
  name: 'marchingReverse',
  getValue: (ctx) => ({
    pattern: [dashLen, gapLen],
    offset: -ctx.time * speed,
  }),
});

// Marching with phase offset per line (wave effect)
export const marchingWave = (dashLen = 10, gapLen = 10, speed = 50, phaseSpread = 0.5): DashEvolver => ({
  name: 'marchingWave',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * phaseSpread * (dashLen + gapLen);
    return {
      pattern: [dashLen, gapLen],
      offset: ctx.time * speed + phase,
    };
  },
});

// Alternating direction per line
export const marchingAlternate = (dashLen = 10, gapLen = 10, speed = 50): DashEvolver => ({
  name: 'marchingAlternate',
  getValue: (ctx) => {
    const dir = ctx.index % 2 === 0 ? 1 : -1;
    return {
      pattern: [dashLen, gapLen],
      offset: ctx.time * speed * dir,
    };
  },
});

// Breathing dash length - dashes grow and shrink
export const breathingDash = (minDash = 5, maxDash = 20, gapLen = 10, speed = 0.5): DashEvolver => ({
  name: 'breathingDash',
  getValue: (ctx) => {
    const t = (Math.sin(ctx.time * speed * Math.PI * 2) + 1) / 2;
    const dashLen = minDash + t * (maxDash - minDash);
    return {
      pattern: [dashLen, gapLen],
      offset: 0,
    };
  },
});

// Pulsing gap - gaps grow and shrink
export const pulsingGap = (dashLen = 10, minGap = 2, maxGap = 20, speed = 0.5): DashEvolver => ({
  name: 'pulsingGap',
  getValue: (ctx) => {
    const t = (Math.sin(ctx.time * speed * Math.PI * 2) + 1) / 2;
    const gapLen = minGap + t * (maxGap - minGap);
    return {
      pattern: [dashLen, gapLen],
      offset: 0,
    };
  },
});

// Index-based dash length (depth effect)
export const depthDash = (nearDash = 20, farDash = 5, gapLen = 10): DashEvolver => ({
  name: 'depthDash',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const dashLen = nearDash + t * (farDash - nearDash);
    return {
      pattern: [dashLen, gapLen],
      offset: 0,
    };
  },
});

// Strobe effect - rapidly switching between dashed and solid
export const strobeDash = (dashLen = 10, gapLen = 10, strobeSpeed = 4): DashEvolver => ({
  name: 'strobeDash',
  getValue: (ctx) => {
    const on = Math.sin(ctx.time * strobeSpeed * Math.PI * 2) > 0;
    return {
      pattern: on ? [dashLen, gapLen] : [],
      offset: 0,
    };
  },
});

// === ROLLING/WAVE PATTERNS ===
// These create spatial patterns across indices that animate over time

// Rolling solid - a band of solid lines moves through the indices (wrapping)
// Lines go from solid -> dashed -> dotted based on distance from the "wave front"
export const rollingSolid = (speed = 0.3, bandWidth = 0.3, maxGap = 20): DashEvolver => ({
  name: 'rollingSolid',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Wave position moves through 0-1 over time
    const wavePos = (ctx.time * speed) % 1;
    // Distance from wave front (wrapping)
    let dist = Math.abs(t - wavePos);
    if (dist > 0.5) dist = 1 - dist; // Wrap around
    // Normalize to 0-1 where 0 = at wave front, 1 = far from it
    const normalized = Math.min(1, dist / bandWidth);
    // Gap grows with distance from wave
    const gap = normalized * maxGap;
    if (gap < 1) {
      return { pattern: [], offset: 0 }; // Solid
    }
    return { pattern: [10, gap], offset: 0 };
  },
});

// Rolling solid bounce - like rollingSolid but bounces at ends instead of wrapping
export const rollingSolidBounce = (speed = 0.3, bandWidth = 0.3, maxGap = 20): DashEvolver => ({
  name: 'rollingSolidBounce',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Triangle wave: goes 0->1->0->1... (bounces at ends)
    const phase = (ctx.time * speed) % 2;
    const wavePos = phase <= 1 ? phase : 2 - phase;
    // Distance from wave front (no wrapping)
    const dist = Math.abs(t - wavePos);
    const normalized = Math.min(1, dist / bandWidth);
    const gap = normalized * maxGap;
    if (gap < 1) {
      return { pattern: [], offset: 0 };
    }
    return { pattern: [10, gap], offset: 0 };
  },
});

// Rolling dashes - the dash/gap ratio rolls through the lines
export const rollingDashes = (speed = 0.2, dashLen = 10): DashEvolver => ({
  name: 'rollingDashes',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Phase offset based on position + time
    const phase = (t + ctx.time * speed) % 1;
    // Gap varies from 0 to 2x dash length based on phase
    const gap = phase * dashLen * 2;
    if (gap < 1) {
      return { pattern: [], offset: 0 };
    }
    return { pattern: [dashLen, gap], offset: 0 };
  },
});

// Cascade - solid band travels through indices (wrapping)
export const cascade = (speed = 0.4, solidWidth = 0.15): DashEvolver => ({
  name: 'cascade',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const wavePos = (ctx.time * speed) % 1;
    // Check if this line is in the "solid" zone (with wrap-around)
    const inSolid = Math.abs(t - wavePos) < solidWidth ||
                    Math.abs(t - wavePos + 1) < solidWidth ||
                    Math.abs(t - wavePos - 1) < solidWidth;
    if (inSolid) {
      return { pattern: [], offset: 0 };
    }
    return { pattern: [5, 15], offset: 0 };
  },
});

// Cascade bounce - solid band travels through indices, bouncing at ends
export const cascadeBounce = (speed = 0.4, solidWidth = 0.15): DashEvolver => ({
  name: 'cascadeBounce',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Triangle wave: goes 0->1->0->1... (bounces at ends)
    const phase = (ctx.time * speed) % 2;
    const wavePos = phase <= 1 ? phase : 2 - phase;
    const inSolid = Math.abs(t - wavePos) < solidWidth;
    if (inSolid) {
      return { pattern: [], offset: 0 };
    }
    return { pattern: [5, 15], offset: 0 };
  },
});

// Sine wave gap - gap size follows a sine wave across indices, rolling over time
export const sineWaveGap = (speed = 0.2, minGap = 2, maxGap = 25, waves = 2): DashEvolver => ({
  name: 'sineWaveGap',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const phase = (t * waves + ctx.time * speed) * Math.PI * 2;
    const intensity = (Math.sin(phase) + 1) / 2;
    const gap = minGap + intensity * (maxGap - minGap);
    return { pattern: [10, gap], offset: 0 };
  },
});

// Double helix - two out-of-phase sine waves creating interference pattern
export const doubleHelix = (speed = 0.15, maxGap = 20): DashEvolver => ({
  name: 'doubleHelix',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const phase1 = (t + ctx.time * speed) * Math.PI * 2;
    const phase2 = (t + ctx.time * speed + 0.5) * Math.PI * 2;
    const wave1 = (Math.sin(phase1) + 1) / 2;
    const wave2 = (Math.sin(phase2 * 1.5) + 1) / 2;
    const combined = (wave1 + wave2) / 2;
    const gap = combined * maxGap;
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [8, gap], offset: 0 };
  },
});

// Gradient roll - smooth transition from solid to heavily dashed
export const gradientRoll = (speed = 0.15, maxGap = 25): DashEvolver => ({
  name: 'gradientRoll',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Create a smooth gradient that rolls
    const phase = (t + ctx.time * speed) % 1;
    // Use sine for smooth transition
    const intensity = (Math.sin(phase * Math.PI * 2) + 1) / 2;
    const gap = intensity * maxGap;
    if (gap < 1) {
      return { pattern: [], offset: 0 };
    }
    return { pattern: [10, gap], offset: 0 };
  },
});

// Ripple - concentric ripples emanating from center, gap varies smoothly
export const ripple = (speed = 0.3, rippleCount = 3, maxGap = 20): DashEvolver => ({
  name: 'ripple',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Distance from center (0 at center, 1 at edges)
    const centered = Math.abs(t - 0.5) * 2;
    // Ripples expand outward over time
    const phase = (centered * rippleCount - ctx.time * speed) * Math.PI * 2;
    const intensity = (Math.sin(phase) + 1) / 2;
    const gap = intensity * maxGap;
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [10, gap], offset: 0 };
  },
});

// Breathing wave - dash AND gap both oscillate with phase offset per line
export const breathingWave = (speed = 0.2, minDash = 3, maxDash = 15, minGap = 3, maxGap = 20): DashEvolver => ({
  name: 'breathingWave',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const phase = (t + ctx.time * speed) * Math.PI * 2;
    const intensity = (Math.sin(phase) + 1) / 2;
    const dashLen = minDash + intensity * (maxDash - minDash);
    // Gap is inverse of dash for interesting effect
    const gapIntensity = (Math.sin(phase + Math.PI / 2) + 1) / 2;
    const gap = minGap + gapIntensity * (maxGap - minGap);
    return { pattern: [dashLen, gap], offset: 0 };
  },
});

// Harmonic - multiple frequency sine waves added together
export const harmonic = (speed = 0.15, maxGap = 25): DashEvolver => ({
  name: 'harmonic',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const time = ctx.time * speed;
    // Fundamental + harmonics
    const f1 = Math.sin((t + time) * Math.PI * 2);
    const f2 = Math.sin((t * 2 + time * 1.5) * Math.PI * 2) * 0.5;
    const f3 = Math.sin((t * 3 + time * 0.7) * Math.PI * 2) * 0.25;
    const combined = (f1 + f2 + f3 + 1.75) / 3.5; // Normalize to 0-1
    const gap = combined * maxGap;
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [10, gap], offset: 0 };
  },
});

// Interference - two waves traveling in opposite directions
export const interference = (speed = 0.2, maxGap = 22): DashEvolver => ({
  name: 'interference',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Wave going forward
    const wave1 = Math.sin((t + ctx.time * speed) * Math.PI * 4);
    // Wave going backward
    const wave2 = Math.sin((t - ctx.time * speed * 0.7) * Math.PI * 4);
    // Interference pattern
    const combined = ((wave1 + wave2) / 2 + 1) / 2;
    const gap = combined * maxGap;
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [8, gap], offset: 0 };
  },
});

// Pendulum - oscillation that slows at extremes (like a pendulum)
export const pendulum = (speed = 0.15, maxGap = 25): DashEvolver => ({
  name: 'pendulum',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    const phase = (t + ctx.time * speed) * Math.PI * 2;
    // Use cosine of sine for pendulum-like motion (slower at extremes)
    const swing = Math.sin(phase);
    const intensity = (Math.cos(swing * Math.PI / 2) + 1) / 2;
    const gap = (1 - intensity) * maxGap; // Invert so solid at rest positions
    if (gap < 1) return { pattern: [], offset: 0 };
    return { pattern: [10, gap], offset: 0 };
  },
});

// Dissolve - random-ish pattern that shifts which lines are solid
export const dissolve = (speed = 0.2, threshold = 0.3): DashEvolver => ({
  name: 'dissolve',
  getValue: (ctx) => {
    const t = ctx.index / Math.max(1, ctx.total - 1);
    // Use a pseudo-random function based on index and time
    const phase = ctx.time * speed;
    const noise = Math.sin(t * 47.3 + phase) * Math.cos(t * 31.7 - phase * 0.7);
    const normalized = (noise + 1) / 2;
    if (normalized < threshold) {
      return { pattern: [], offset: 0 };
    }
    // Gap size based on how far from threshold
    const gap = (normalized - threshold) / (1 - threshold) * 20;
    return { pattern: [8, Math.max(2, gap)], offset: 0 };
  },
});
