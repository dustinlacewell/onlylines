// Palette registrations - import this file to register all palettes
// Each palette is in its own file for easy management

// Import all palettes (side-effect: registers them)
import './sunset';
import './aurora';
import './ember';
import './arctic';
import './jungle';
import './cosmic';
import './earth';
import './neonCity';
import './bloodMoon';
import './mint';
import './ocean';
import './fire';
import './forest';
import './candy';
import './monochrome';
import './noir';
import './vaporwave';

// Re-export everything from core/palette for convenience
export {
  type HSL,
  type Palette,
  type PaletteDefinition,
  registerPalette,
  getPalette,
  getPaletteById,
  getAllPalettes,
  parseHSL,
  lerpHSL,
  samplePalette,
  samplePaletteWrap,
  hslToString,
  toPalette,
  getRuntimePalette,
} from '../core/palette';
