// Compose a world - creates lines and position evolvers
// Draw evolvers (color, alpha, width, dash) come from the store via world.subscribeToStore()

import { setSeed, newSeed } from './random';
import { World } from './world';
import { Line } from './line';
import { createPlacer } from './placers';
import { createMover } from './movers';
import type { PositionEvolverState, DistributionState } from './serialize';

// === SELECTION STATE ===
// Set by main.ts before calling composeWorld()

export interface EvolverSelection {
  seed?: number;
  distribution?: DistributionState;
  position?: PositionEvolverState[];
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

  // Set seed for reproducibility
  const seed = sel.seed ?? newSeed();
  setSeed(seed);

  // Line count from selection
  const count = sel.count ?? 200;

  // Create lines using placer registry
  const distState = sel.distribution ?? { type: 'star', params: {} };
  const configs = createPlacer(distState.type, count, {}, distState.params ?? {});
  world.lines = configs.map((cfg, i) => new Line(cfg, i));

  // Create position evolvers from mover registry
  const positionStates = sel.position ?? [];
  for (const posState of positionStates) {
    const evolver = createMover(posState.type, posState.params ?? {});
    if (evolver) {
      world.evolvers.position.push(evolver);
    }
  }

  // Background and fade
  world.config.bg = '#000000';
  world.config.fade = sel.fade ?? 0.05;

  // Debug info
  const posNames = positionStates.map(p => p.type).join('+') || 'static';
  world.config.info = {
    count,
    distro: distState.type,
    behavior: posNames,
    colorScheme: '(from store)',
  };

  return world;
}
