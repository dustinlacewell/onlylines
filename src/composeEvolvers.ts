// Compose a world using the new evolver system
import { rand, randInt, pick, pickW, setSeed, newSeed } from './random';
import { World } from './world';
import { Line } from './line';
import { Distributions } from './distributions/index';
import { setURLFromState, type WorldState } from './serialize';

// Import catalogs
import {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  distributionNames,
  paletteNames,
  colorAnimationNames,
  createColorEvolver,
} from './evolverCatalogs';

// Re-export catalogs for other modules
export {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  distributionNames,
  paletteNames,
  colorAnimationNames,
  paletteCatalog,
  colorAnimations,
} from './evolverCatalogs';

export type { EvolverEntry, PaletteEntry, ColorAnimationEntry } from './evolverCatalogs';

// === SELECTION STATE ===
// This can be set by the debug UI or deserialization to override random selection

export interface EvolverSelection {
  seed?: number;
  distribution?: string;
  position?: string[];
  palette?: string;
  colorAnimation?: string;
  alpha?: string;
  lineWidth?: string;
  dash?: string;
  fade?: number;
  count?: number;
}

let currentSelection: EvolverSelection = {};

export function setSelection(selection: EvolverSelection): void {
  currentSelection = selection;
}

export function getSelection(): EvolverSelection {
  return currentSelection;
}

export function clearSelection(): void {
  currentSelection = {};
}

// === COMPOSE WORLD ===

export function composeWorld(updateURL = true): World {
  const world = new World();
  const sel = currentSelection;

  // Set seed - use provided or generate new
  const seed = sel.seed ?? newSeed();
  setSeed(seed);

  // IMPORTANT: Always make random calls in the same order to ensure reproducibility.
  // Even when a selection is provided, we still call rand() to keep PRNG state consistent.

  // Pick line count - always generate random options, then use selection if provided
  const countWeights: [number, number][] = [
    [randInt(120, 200), 0.3],
    [randInt(250, 400), 0.2],
    [randInt(500, 800), 0.1],
    [randInt(1000, 1500), 0.05],
  ];
  const randomCount = pickW(
    countWeights.map((c) => c[0]),
    countWeights.map((c) => c[1])
  );
  const count = sel.count ?? randomCount;

  // Pick distribution - always call pick(), then use selection if provided
  const randomDistro = pick(distributionNames);
  const distroName = (sel.distribution && distributionNames.includes(sel.distribution as keyof typeof Distributions)
    ? sel.distribution
    : randomDistro) as keyof typeof Distributions;
  const distro = Distributions[distroName];

  // Create lines - let distribution handle its own random calls for PRNG consistency
  const configs = distro(count, {});
  world.lines = configs.map((cfg, i) => new Line(cfg, i));

  // Track what we picked for serialization
  const pickedPosition: string[] = [];

  // === COMPOSE POSITION EVOLVERS ===
  // Create ALL evolvers upfront in fixed order to ensure consistent PRNG consumption
  const allPositionEvolvers = new Map<string, ReturnType<typeof positionEvolvers[0]['create']>>();
  for (const entry of positionEvolvers) {
    allPositionEvolvers.set(entry.name, entry.create());
  }

  // Now make random selection (only consumes PRNG for pick/pickW, not create)
  const numPosEvolvers = pickW([1, 2], [0.7, 0.3]);
  const randomPositionNames: string[] = [];
  for (let i = 0; i < numPosEvolvers; i++) {
    randomPositionNames.push(pick(positionEvolvers).name);
  }

  // Determine which evolvers to use
  const positionNamesToUse = sel.position !== undefined ? sel.position : randomPositionNames;

  // Add the selected evolvers (using pre-created instances)
  for (const name of positionNamesToUse) {
    const evolver = allPositionEvolvers.get(name);
    if (evolver) {
      world.evolvers.position.push(evolver);
      pickedPosition.push(name);
    }
  }

  // === COMPOSE COLOR EVOLVER (palette + animation) ===
  // Always make random selections to keep PRNG consistent
  const randomPalette = pick(paletteNames);
  const randomColorAnimation = pick(colorAnimationNames);

  const pickedPalette = sel.palette && paletteNames.includes(sel.palette as any)
    ? sel.palette
    : randomPalette;
  const pickedColorAnimation = sel.colorAnimation && colorAnimationNames.includes(sel.colorAnimation)
    ? sel.colorAnimation
    : randomColorAnimation;

  world.evolvers.color = createColorEvolver(pickedPalette, pickedColorAnimation);

  // === COMPOSE ALPHA EVOLVER ===
  // Always make random selections to keep PRNG consistent
  const randomAlphaEntry = pick(alphaEvolvers);

  let pickedAlpha = 'none';
  if (sel.alpha !== undefined) {
    // User specified alpha - use it if valid
    if (sel.alpha !== 'none') {
      const entry = alphaEvolvers.find(e => e.name === sel.alpha);
      if (entry) {
        world.evolvers.alpha = entry.create();
        pickedAlpha = entry.name;
      }
    }
  } else {
    // Equal probability for all options including 'none'
    world.evolvers.alpha = randomAlphaEntry.name !== 'none' ? randomAlphaEntry.create() : null;
    pickedAlpha = randomAlphaEntry.name;
  }

  // === COMPOSE LINEWIDTH EVOLVER ===
  // Always make random selections to keep PRNG consistent
  const randomWidthEntry = pick(lineWidthEvolvers);

  let pickedWidth = 'none';
  if (sel.lineWidth !== undefined) {
    // User specified lineWidth - use it if valid
    if (sel.lineWidth !== 'none') {
      const entry = lineWidthEvolvers.find(e => e.name === sel.lineWidth);
      if (entry) {
        world.evolvers.lineWidth = entry.create();
        pickedWidth = entry.name;
      }
    }
  } else {
    // Equal probability for all options including 'none'
    world.evolvers.lineWidth = randomWidthEntry.name !== 'none' ? randomWidthEntry.create() : null;
    pickedWidth = randomWidthEntry.name;
  }

  // === COMPOSE DASH EVOLVER ===
  // Always make random selections to keep PRNG consistent
  const randomDashEntry = pick(dashEvolvers);

  let pickedDash = 'none';
  if (sel.dash !== undefined) {
    // User specified dash - use it if valid
    if (sel.dash !== 'none') {
      const entry = dashEvolvers.find(e => e.name === sel.dash);
      if (entry) {
        world.evolvers.dash = entry.create();
        pickedDash = entry.name;
      }
    }
  } else {
    // Equal probability for all options including 'none'
    world.evolvers.dash = randomDashEntry.name !== 'none' ? randomDashEntry.create() : null;
    pickedDash = randomDashEntry.name;
  }

  // === BACKGROUND ===
  world.config.bg = '#000000';

  // === FADE/TRAIL ===
  // Always make random selections to keep PRNG consistent
  const randomFade = pickW(
    [rand(0.01, 0.02), rand(0.03, 0.06), rand(0.08, 0.15), rand(0.2, 0.4), 1],
    [0.2, 0.35, 0.25, 0.15, 0.05]
  );
  const fade = sel.fade !== undefined ? sel.fade : randomFade;
  world.config.fade = fade;

  // === DEBUG INFO ===
  const posNames = pickedPosition.length > 0 ? pickedPosition.join('+') : 'static';

  world.config.info = {
    count,
    distro: distroName,
    behavior: posNames,
    colorScheme: `${pickedPalette}/${pickedColorAnimation} alpha:${pickedAlpha} width:${pickedWidth} dash:${pickedDash}`,
  };

  // === SERIALIZE TO URL ===
  if (updateURL) {
    const state: WorldState = {
      seed,
      distribution: distroName,
      position: pickedPosition,
      palette: pickedPalette,
      colorAnimation: pickedColorAnimation,
      alpha: pickedAlpha,
      lineWidth: pickedWidth,
      dash: pickedDash,
      fade,
      count,
    };
    setURLFromState(state);
  }

  return world;
}

// Compose from a saved state (e.g., from URL)
export function composeFromState(state: Partial<WorldState>): World {
  setSelection({
    seed: state.seed,
    distribution: state.distribution,
    position: state.position,
    palette: state.palette,
    colorAnimation: state.colorAnimation,
    alpha: state.alpha,
    lineWidth: state.lineWidth,
    dash: state.dash,
    fade: state.fade,
    count: state.count,
  });
  return composeWorld(true);
}
