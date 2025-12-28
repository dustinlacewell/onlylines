import './style.css';
import { composeWorld, getSelection, setSelection } from './composeEvolvers';
import { getStateFromURL } from './serialize';
import type { World } from './world';
import { initDebugUI, updateActiveConfig, setRegenerateCallback } from './debugUI';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const infoEl = document.querySelector('.info') as HTMLElement;

let W: number;
let H: number;
let world: World;
let lastTime = 0;
let animId: number;

function resize(): void {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}

function updateInfo(): void {
  const info = world.config.info!;
  infoEl.innerHTML = [
    `${info.count} lines`,
    info.distro,
    info.behavior,
    info.colorScheme,
  ].join('<br>');
  updateActiveConfig(info);
}

function newWorld(): void {
  // Keep debug UI selections but clear seed for fresh randomness
  const sel = getSelection();
  setSelection({ ...sel, seed: undefined });
  world = composeWorld();
  console.log('Config:', world.config.info);
  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);
  updateInfo();
}

function frame(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // Fade
  ctx.fillStyle = world.config.bg!;
  ctx.globalAlpha = world.config.fade!;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  world.update(dt);

  for (const line of world.lines) {
    line.draw(ctx, W, H, world);
  }

  animId = requestAnimationFrame(frame);
}

function init(): void {
  resize();

  // Check for saved state in URL hash BEFORE initializing debug UI
  // This way the debug UI will show the correct state from the URL
  const savedState = getStateFromURL();
  if (savedState && savedState.seed !== undefined) {
    // Apply URL state to selection so debug UI shows correct values
    setSelection({
      seed: savedState.seed,
      distribution: savedState.distribution,
      position: savedState.position,
      palette: savedState.palette,
      colorAnimation: savedState.colorAnimation,
      alpha: savedState.alpha,
      lineWidth: savedState.lineWidth,
      fade: savedState.fade,
      count: savedState.count,
    });
  }

  // Initialize debug UI AFTER selection is set from URL (or left as default)
  initDebugUI();
  setRegenerateCallback(() => newWorld());

  // Now compose the world
  if (savedState && savedState.seed !== undefined) {
    world = composeWorld(true);
    console.log('Loaded from URL:', world.config.info);
  } else {
    world = composeWorld();
    console.log('Config:', world.config.info);
  }

  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);
  updateInfo();

  lastTime = performance.now();
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
canvas.addEventListener('click', () => {
  ctx.fillStyle = world.config.bg!;
  ctx.fillRect(0, 0, W, H);
  newWorld();
});

init();
