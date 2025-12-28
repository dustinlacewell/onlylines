// Seeded random number generator using mulberry32
// This allows us to reproduce exact random sequences from a seed

let currentSeed = Date.now();
let rngState = currentSeed;

// mulberry32 - fast, good quality 32-bit PRNG
function mulberry32(): number {
  let t = (rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Set the seed and reset the RNG state
export function setSeed(seed: number): void {
  currentSeed = seed;
  rngState = seed;
}

// Get the current seed
export function getSeed(): number {
  return currentSeed;
}

// Generate a new random seed
export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

// Random float in range [a, b)
export function rand(a = 0, b = 1): number {
  return mulberry32() * (b - a) + a;
}

// Random integer in range [a, b] inclusive
export function randInt(a: number, b: number): number {
  return Math.floor(rand(a, b + 1));
}

// Pick a random element from an array
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(mulberry32() * arr.length)];
}

// Pick a random element with weights
export function pickW<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = mulberry32() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}
