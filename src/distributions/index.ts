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
export { grid, woven } from './grid';

// Mathematical distributions
export { lissajous, roseCurve, modularPattern } from './mathematical';

// Special distributions
export { opposing, vortex, web } from './special';

// Grouped export for backwards compatibility
import { star, starBurst, symmetricSpokes } from './radial';
import { concentricRings, nestedPolygons } from './concentric';
import { spiral, doubleSpiral, goldenSpiral, sunflower } from './spiral';
import { sineWave, standingWave, interference } from './wave';
import { bilateral, rotationalSymmetry, kaleidoscope } from './symmetry';
import { grid, woven } from './grid';
import { lissajous, roseCurve, modularPattern } from './mathematical';
import { opposing, vortex, web } from './special';

export const Distributions = {
  star,
  starBurst,
  symmetricSpokes,
  concentricRings,
  nestedPolygons,
  spiral,
  doubleSpiral,
  goldenSpiral,
  sunflower,
  sineWave,
  standingWave,
  interference,
  bilateral,
  rotationalSymmetry,
  kaleidoscope,
  grid,
  woven,
  lissajous,
  roseCurve,
  modularPattern,
  opposing,
  vortex,
  web,
};
