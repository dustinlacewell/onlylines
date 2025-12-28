export const TAU = Math.PI * 2;

// Re-export seeded random functions from random module
export { rand, randInt, pick, pickW } from './random';

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

export const mod = (x: number, n: number): number => ((x % n) + n) % n;

export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

export const hsl = (h: number, s: number, l: number, a = 1): string =>
  `hsla(${mod(h, 360)}, ${s}%, ${l}%, ${a})`;
