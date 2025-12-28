// Compose a world using the new evolver system
import { rand, randInt, pick, pickW, setSeed, newSeed } from './random';
import { World } from './world';
import { Line } from './line';
import { createPlacer, getAllPlacers } from './placers';
// URL serialization now handled in main.ts

// Import catalogs
import {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  paletteNames,
  colorAnimationNames,
  createColorEvolver,
} from './evolverCatalogs';

// Import composed dash evolvers for options-based creation
import * as DashComposed from './evolvers/dashComposed';
import * as Dash from './evolvers/dash';
import type { DashEvolver } from './evolvers/types';
import { createPositionEvolver } from './evolvers/position';

// Create a dash evolver from name and options
function createDashEvolverFromOptions(name: string, options: Record<string, unknown> = {}): DashEvolver | null {
  switch (name) {
    case 'none': return Dash.solid();
    case 'dashed': return Dash.dashed(options.dashLen as number ?? 10, options.gapLen as number ?? 10);
    case 'dotted': return Dash.dotted(options.dotSize as number ?? 2, options.gapLen as number ?? 8);
    case 'morse': return Dash.morse(options.dashLen as number ?? 15, options.dotLen as number ?? 3, options.gapLen as number ?? 5);
    case 'marching': return Dash.marching(options.dashLen as number ?? 10, options.gapLen as number ?? 10, options.speed as number ?? 50);
    case 'marchingReverse': return Dash.marchingReverse(options.dashLen as number ?? 10, options.gapLen as number ?? 10, options.speed as number ?? 50);
    case 'marchingWave': return Dash.marchingWave(options.dashLen as number ?? 10, options.gapLen as number ?? 10, options.speed as number ?? 50, options.phaseSpread as number ?? 0.5);
    case 'marchingAlternate': return Dash.marchingAlternate(options.dashLen as number ?? 10, options.gapLen as number ?? 10, options.speed as number ?? 50);
    case 'breathingDash': return Dash.breathingDash(options.minDash as number ?? 5, options.maxDash as number ?? 20, options.gapLen as number ?? 10, options.speed as number ?? 0.5);
    case 'pulsingGap': return Dash.pulsingGap(options.dashLen as number ?? 10, options.minGap as number ?? 2, options.maxGap as number ?? 20, options.speed as number ?? 0.5);
    case 'depthDash': return Dash.depthDash(options.nearDash as number ?? 20, options.farDash as number ?? 5, options.gapLen as number ?? 10);
    case 'strobeDash': return Dash.strobeDash(options.dashLen as number ?? 10, options.gapLen as number ?? 10, options.strobeSpeed as number ?? 4);
    // Composed evolvers with full options support
    case 'cascade': return DashComposed.cascade(options as DashComposed.CascadeOptions);
    case 'rollingSolid': return DashComposed.rollingSolid(options as DashComposed.RollingSolidOptions);
    case 'rollingDashes': return DashComposed.rollingDashes(options as DashComposed.RollingDashesOptions);
    case 'sineWaveGap': return DashComposed.sineWaveGap(options as DashComposed.SineWaveOptions);
    case 'doubleHelix': return DashComposed.doubleHelix(options as DashComposed.DoubleHelixOptions);
    case 'gradientRoll': return DashComposed.gradientRoll(options as DashComposed.GradientRollOptions);
    case 'ripple': return DashComposed.ripple(options as DashComposed.RippleOptions);
    case 'breathingWave': return DashComposed.breathingWave(options as DashComposed.BreathingWaveOptions);
    case 'harmonic': return DashComposed.harmonic(options as DashComposed.HarmonicOptions);
    case 'interference': return DashComposed.interference(options as DashComposed.InterferenceOptions);
    case 'pendulum': return DashComposed.pendulum(options as DashComposed.PendulumOptions);
    case 'dissolve': return DashComposed.dissolve(options as DashComposed.DissolveOptions);
    default: return null;
  }
}

// Re-export catalogs for other modules
export {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  paletteNames,
  colorAnimationNames,
  paletteCatalog,
  colorAnimations,
} from './evolverCatalogs';

export type { EvolverEntry, PaletteEntry, ColorAnimationEntry } from './evolverCatalogs';

// === SELECTION STATE ===
// This can be set by the debug UI or deserialization to override random selection

import type { PositionEvolverState, DistributionState } from './serialize';

export interface EvolverSelection {
  seed?: number;
  distribution?: DistributionState;
  position?: PositionEvolverState[];  // Now includes params
  palette?: string;
  colorAnimation?: string;
  alpha?: string;
  lineWidth?: string;
  dash?: string;
  dashOptions?: Record<string, unknown>;
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

export function composeWorld(): World {
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

  // Pick distribution - use placer registry
  const allPlacers = getAllPlacers();
  const placerNames = allPlacers.map(p => p.name);
  const randomDistro = pick(placerNames);
  const distState = sel.distribution;
  const distroName = distState && placerNames.includes(distState.type)
    ? distState.type
    : randomDistro;
  const distroParams = distState?.type === distroName ? (distState.params ?? {}) : {};

  // Create lines using the placer registry
  const configs = createPlacer(distroName, count, {}, distroParams);
  world.lines = configs.map((cfg, i) => new Line(cfg, i));

  // Track what we picked for serialization
  const pickedPosition: string[] = [];

  // === COMPOSE POSITION EVOLVERS ===
  // Consume PRNG in consistent order for reproducibility
  const numPosEvolvers = pickW([1, 2], [0.7, 0.3]);
  const randomPositionStates: PositionEvolverState[] = [];

  // Generate random position evolver states (for when no selection provided)
  for (let i = 0; i < numPosEvolvers; i++) {
    const entry = pick(positionEvolvers);
    // Use catalog's create() to generate random params via PRNG
    // Then extract the name - the actual params come from the selection or are regenerated
    randomPositionStates.push({ type: entry.name, params: {} });
  }

  // Consume additional PRNG for all evolvers to keep state consistent
  // (old code created all evolvers upfront)
  for (const entry of positionEvolvers) {
    entry.create(); // Consume PRNG
  }

  // Determine which evolvers to use
  const positionStatesToUse = sel.position !== undefined ? sel.position : randomPositionStates;

  // Create evolvers from state using the factory (with actual params)
  for (const posState of positionStatesToUse) {
    const evolver = createPositionEvolver(posState);
    if (evolver) {
      world.evolvers.position.push(evolver);
      pickedPosition.push(posState.type);
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
      // If dashOptions provided, create from options; otherwise use catalog's random create
      if (sel.dashOptions && Object.keys(sel.dashOptions).length > 0) {
        const evolver = createDashEvolverFromOptions(sel.dash, sel.dashOptions);
        if (evolver) {
          world.evolvers.dash = evolver;
          pickedDash = sel.dash;
        }
      } else {
        const entry = dashEvolvers.find(e => e.name === sel.dash);
        if (entry) {
          world.evolvers.dash = entry.create();
          pickedDash = entry.name;
        }
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

  return world;
}
