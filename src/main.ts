import './style.css';
import { composeWorld, setSelection } from './composeEvolvers';
import type { World } from './world';
import { mountDebugPanel } from './ui/mountDebugPanel';
import { evolverStoreApi } from './storeReact';
import { getStateFromURL, setURLFromState, pushURLFromState } from './serialize';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let W: number;
let H: number;
let world: World;
let lastTime = 0;
let animId: number;

// Track previous values to detect changes that require world regeneration
let prevDistributionJson: string;
let prevPositionEvolversJson: string;
let prevLineCount: number;

// Flag to prevent URL updates during popstate restoration
let isRestoringFromHistory = false;

function resize(): void {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}


function newWorld(): void {
  // Unsubscribe old world from store
  if (world) {
    world.unsubscribeFromStore();
  }

  // Use store values for distribution/position/seed/count/fade
  const storeState = evolverStoreApi.getState();
  setSelection({
    seed: storeState.seed,
    distribution: storeState.distribution,
    position: storeState.positionEvolvers,
    count: storeState.lineCount,
    fade: storeState.fade,
  });

  world = composeWorld();
  console.log('Config:', world.config.info);

  // Subscribe world to store for live updates
  world.subscribeToStore();

  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);
}

function frame(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // Fade
  ctx.fillStyle = world.config.bg!;
  ctx.globalAlpha = world.config.fade!;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Apply speed multiplier
  const speed = evolverStoreApi.getState().speed;
  world.update(dt * speed);

  for (const line of world.lines) {
    line.draw(ctx, W, H, world);
  }

  animId = requestAnimationFrame(frame);
}

function init(): void {
  resize();

  // Check for state in URL first
  const urlState = getStateFromURL();
  if (urlState) {
    // Apply URL state to store
    evolverStoreApi.applyState(urlState);
  } else {
    // No URL state, randomize
    evolverStoreApi.randomize();
  }

  // Compose world from store state
  const storeState = evolverStoreApi.getState();
  prevDistributionJson = JSON.stringify(storeState.distribution);
  prevPositionEvolversJson = JSON.stringify(storeState.positionEvolvers);
  prevLineCount = storeState.lineCount;

  setSelection({
    seed: storeState.seed,
    distribution: storeState.distribution,
    position: storeState.positionEvolvers,
    count: storeState.lineCount,
    fade: storeState.fade,
  });

  world = composeWorld();
  console.log('Config:', world.config.info);

  // Subscribe world to store for live updates (evolvers only)
  world.subscribeToStore();

  // Subscribe to ALL store changes for URL sync and world regeneration
  evolverStoreApi.subscribe((state) => {
    // Update URL on any state change (unless restoring from history)
    if (!isRestoringFromHistory) {
      setURLFromState(state);
    }

    // Check if distribution/position/lineCount changed (requires world regeneration)
    const distJson = JSON.stringify(state.distribution);
    const distChanged = distJson !== prevDistributionJson;
    const posJson = JSON.stringify(state.positionEvolvers);
    const posChanged = posJson !== prevPositionEvolversJson;
    const lineCountChanged = state.lineCount !== prevLineCount;

    if (distChanged || posChanged || lineCountChanged) {
      prevDistributionJson = distJson;
      prevPositionEvolversJson = posJson;
      prevLineCount = state.lineCount;
      newWorld();
    }

    // Fade updates live without world regeneration
    world.config.fade = state.fade;
  });

  // Set initial URL
  setURLFromState(storeState);

  // Show UI panel
  mountDebugPanel();

  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);

  lastTime = performance.now();
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
canvas.addEventListener('click', () => {
  // Push current state to history before randomizing (so back button returns here)
  pushURLFromState(evolverStoreApi.getState());

  // Randomize the store, then create new world
  evolverStoreApi.randomize();

  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);
  newWorld();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const urlState = getStateFromURL();
  if (urlState) {
    // Prevent the store subscription from updating URL during restoration
    isRestoringFromHistory = true;
    evolverStoreApi.applyState(urlState);
    isRestoringFromHistory = false;

    ctx.fillStyle = world.config.bg!;
    ctx.fillRect(0, 0, W, H);
    newWorld();
  }
});

init();
