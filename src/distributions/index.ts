export type { DistributionOptions, Distribution, DistributionParams } from './types';
export { makeLine } from './utils';

// Radial distributions
export { star, starBurst, symmetricSpokes } from './radial';

// Concentric distributions
export { concentricRings, nestedPolygons } from './concentric';

// Spiral distributions
export { spiral, doubleSpiral, goldenSpiral, sunflower } from './spiral';

// Wave distributions
export { sineWave, standingWave, interference } from './wave';

// Symmetry distributions
export { bilateral, rotationalSymmetry, kaleidoscope } from './symmetry';

// Grid distributions
export { horizontal, vertical, diagonal, parallel, grid, woven } from './grid';

// Mathematical distributions
export {
  lissajous,
  roseCurve,
  modularPattern,
  epicycloid,
  hypocycloid,
  spirograph,
  fermatSpiral,
  harmonograph,
  chladni,
  guilloche,
  flowerOfLife,
} from './mathematical';

// Special distributions
export { opposing, vortex, web } from './special';

// Grouped export for backwards compatibility
import { star, starBurst, symmetricSpokes } from './radial';
import { concentricRings, nestedPolygons } from './concentric';
import { spiral, doubleSpiral, goldenSpiral, sunflower } from './spiral';
import { sineWave, standingWave, interference } from './wave';
import { bilateral, rotationalSymmetry, kaleidoscope } from './symmetry';
import { horizontal, vertical, diagonal, parallel, grid, woven } from './grid';
import {
  lissajous,
  roseCurve,
  modularPattern,
  epicycloid,
  hypocycloid,
  spirograph,
  fermatSpiral,
  harmonograph,
  chladni,
  guilloche,
  flowerOfLife,
} from './mathematical';
import { opposing, vortex, web } from './special';

export const Distributions = {
  // Radial
  star,
  starBurst,
  symmetricSpokes,
  // Concentric
  concentricRings,
  nestedPolygons,
  // Spiral
  spiral,
  doubleSpiral,
  goldenSpiral,
  sunflower,
  // Wave
  sineWave,
  standingWave,
  interference,
  // Symmetry
  bilateral,
  rotationalSymmetry,
  kaleidoscope,
  // Grid
  horizontal,
  vertical,
  diagonal,
  parallel,
  grid,
  woven,
  // Mathematical
  lissajous,
  roseCurve,
  modularPattern,
  epicycloid,
  hypocycloid,
  spirograph,
  fermatSpiral,
  harmonograph,
  chladni,
  guilloche,
  flowerOfLife,
  // Special
  opposing,
  vortex,
  web,
};
