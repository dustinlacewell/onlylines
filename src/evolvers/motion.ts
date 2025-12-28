// Motion functions - compute normalized t (0-1) from context
// Used as the first stage of composable evolvers

import type { LineContext } from './types';
import { mod } from '../utils';

// A motion function computes t (0-1) from line context
export type Motion = (ctx: LineContext) => number;

// === STATIC MOTIONS ===
// No time component - pattern fixed in place

// Linear across indices (0 at first line, 1 at last)
export const staticIndex = (): Motion =>
  (ctx) => ctx.index / Math.max(1, ctx.total - 1);

// Symmetric from center (0 at center, 1 at edges)
export const staticCentered = (): Motion =>
  (ctx) => Math.abs(ctx.index / Math.max(1, ctx.total - 1) - 0.5) * 2;


// === FIELD MOTIONS ===
// Pattern/wave moves through indices over time
// t represents position in a spatial pattern

// Rolling field - pattern scrolls through indices (wraps)
export const fieldRoll = (speed: number): Motion =>
  (ctx) => mod(ctx.index / Math.max(1, ctx.total - 1) + ctx.time * speed, 1);

// Rolling field with absolute speed (lines per second, consistent regardless of line count)
export const fieldRollAbsolute = (linesPerSec: number): Motion =>
  (ctx) => {
    const base = ctx.index / Math.max(1, ctx.total - 1);
    return mod(base + (ctx.time * linesPerSec) / ctx.total, 1);
  };

// Bouncing field - pattern bounces at ends instead of wrapping
export const fieldBounce = (speed: number): Motion =>
  (ctx) => {
    const base = ctx.index / Math.max(1, ctx.total - 1);
    const phase = mod(base + ctx.time * speed, 2);
    return phase <= 1 ? phase : 2 - phase;
  };

// Bouncing field with absolute speed
export const fieldBounceAbsolute = (linesPerSec: number): Motion =>
  (ctx) => {
    const base = ctx.index / Math.max(1, ctx.total - 1);
    const phase = mod(base + (ctx.time * linesPerSec) / ctx.total, 2);
    return phase <= 1 ? phase : 2 - phase;
  };


// === FOCAL MOTIONS ===
// A point moves through indices, t = distance from that point
// Used for cascade, chase, rollingSolid effects

// Focal roll - point wraps around, t = distance from point
export const focalRoll = (speed: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    const focusPos = mod(ctx.time * speed, 1);
    // Distance from focus (with wrapping)
    let dist = Math.abs(pos - focusPos);
    if (dist > 0.5) dist = 1 - dist;
    return dist;
  };

// Focal roll with absolute speed (consistent visual speed regardless of line count)
export const focalRollAbsolute = (linesPerSec: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    const focusPos = mod((ctx.time * linesPerSec) / ctx.total, 1);
    let dist = Math.abs(pos - focusPos);
    if (dist > 0.5) dist = 1 - dist;
    return dist;
  };

// Focal bounce - point bounces at ends instead of wrapping
export const focalBounce = (speed: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    const phase = mod(ctx.time * speed, 2);
    const focusPos = phase <= 1 ? phase : 2 - phase;
    return Math.abs(pos - focusPos);
  };

// Focal bounce with absolute speed
export const focalBounceAbsolute = (linesPerSec: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    const phase = mod((ctx.time * linesPerSec) / ctx.total, 2);
    const focusPos = phase <= 1 ? phase : 2 - phase;
    return Math.abs(pos - focusPos);
  };

// Focal spread - ring expands from center outward
export const focalSpread = (speed: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    // Distance from center
    const distFromCenter = Math.abs(pos - 0.5) * 2;
    // Expanding ring position
    const ringPos = mod(ctx.time * speed, 1);
    // Distance from the ring
    return Math.abs(distFromCenter - ringPos);
  };

// Focal spread with absolute speed
export const focalSpreadAbsolute = (linesPerSec: number): Motion =>
  (ctx) => {
    const pos = ctx.index / Math.max(1, ctx.total - 1);
    const distFromCenter = Math.abs(pos - 0.5) * 2;
    const ringPos = mod((ctx.time * linesPerSec) / ctx.total, 1);
    return Math.abs(distFromCenter - ringPos);
  };


// === MOTION MODIFIERS ===

// Invert motion (1 - t)
export const invert = (motion: Motion): Motion =>
  (ctx) => 1 - motion(ctx);

// Scale motion output
export const scale = (motion: Motion, factor: number): Motion =>
  (ctx) => motion(ctx) * factor;

// Offset motion output
export const offset = (motion: Motion, amount: number): Motion =>
  (ctx) => mod(motion(ctx) + amount, 1);
