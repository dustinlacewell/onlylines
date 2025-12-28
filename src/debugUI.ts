// Debug UI for testing evolvers
import {
  positionEvolvers,
  alphaEvolvers,
  lineWidthEvolvers,
  dashEvolvers,
  distributionNames,
  paletteNames,
  colorAnimationNames,
  setSelection,
  getSelection,
  type EvolverSelection,
} from './composeEvolvers';
import { getStateFromURL } from './serialize';
import type { WorldConfig } from './types';

const STORAGE_KEY = 'edge-art-debug-selection';

let container: HTMLElement | null = null;
let statusEl: HTMLElement | null = null;
let onRegenerate: (() => void) | null = null;

// Track selected position evolvers (can have multiple)
let selectedPositions: string[] = [];

function saveToStorage(selection: EvolverSelection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Ignore storage errors
  }
}

function loadFromStorage(): EvolverSelection | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

// Wrapper that saves to storage after updating selection
function updateAndSave(partial: Partial<EvolverSelection>): void {
  const updated = { ...getSelection(), ...partial };
  setSelection(updated);
  saveToStorage(updated);
}

const styles = `
  #debug-ui {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 340px;
    background: rgba(0, 0, 0, 0.95);
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    padding: 12px;
    box-sizing: border-box;
    z-index: 1000;
    border: 1px solid #333;
    border-radius: 4px;
  }
  #debug-ui.collapsed {
    width: auto;
    padding: 8px 12px;
  }
  #debug-ui.collapsed .debug-body {
    display: none;
  }
  #debug-ui .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #444;
  }
  #debug-ui.collapsed .debug-header {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  #debug-ui .debug-title {
    font-size: 13px;
    font-weight: bold;
    color: #0ff;
  }
  #debug-ui .debug-close {
    background: none;
    border: none;
    color: #888;
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
  }
  #debug-ui .debug-close:hover {
    color: #fff;
  }
  #debug-ui .debug-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 6px;
  }
  #debug-ui .debug-label {
    width: 80px;
    color: #888;
    flex-shrink: 0;
  }
  #debug-ui .debug-select {
    flex: 1;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    padding: 4px 6px;
    font-family: monospace;
    font-size: 11px;
    border-radius: 2px;
    min-width: 0;
  }
  #debug-ui .debug-select:focus {
    outline: none;
    border-color: #0ff;
  }
  #debug-ui .debug-step {
    background: #333;
    border: 1px solid #555;
    color: #fff;
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  #debug-ui .debug-step:hover {
    background: #444;
    border-color: #666;
  }
  #debug-ui .debug-step:active {
    background: #555;
  }
  #debug-ui .debug-add {
    background: #254;
    border-color: #4a7;
    color: #4a7;
    font-size: 14px;
    font-weight: bold;
  }
  #debug-ui .debug-add:hover {
    background: #365;
  }
  #debug-ui .debug-remove {
    background: #422;
    border-color: #a55;
    color: #a55;
  }
  #debug-ui .debug-remove:hover {
    background: #533;
  }
  #debug-ui .position-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  #debug-ui .position-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  #debug-ui .debug-slider-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
  }
  #debug-ui .debug-slider-label {
    width: 50px;
    color: #888;
    flex-shrink: 0;
  }
  #debug-ui .debug-slider {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #333;
    border-radius: 2px;
    outline: none;
  }
  #debug-ui .debug-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #0ff;
    border-radius: 50%;
    cursor: pointer;
  }
  #debug-ui .debug-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #0ff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  #debug-ui .debug-slider-value {
    width: 50px;
    text-align: right;
    color: #fff;
    font-size: 11px;
  }
  #debug-ui .debug-buttons {
    display: flex;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #333;
  }
  #debug-ui .debug-btn {
    flex: 1;
    background: #333;
    border: 1px solid #555;
    color: #fff;
    padding: 6px 8px;
    font-family: monospace;
    font-size: 11px;
    cursor: pointer;
    border-radius: 2px;
  }
  #debug-ui .debug-btn:hover {
    background: #444;
  }
  #debug-ui .debug-btn-primary {
    background: #146;
    border-color: #28a;
  }
  #debug-ui .debug-btn-primary:hover {
    background: #258;
  }
  #debug-ui .debug-status {
    margin-top: 12px;
    padding: 8px;
    background: #111;
    border: 1px solid #333;
    border-radius: 2px;
    font-size: 11px;
    line-height: 1.4;
  }
  #debug-ui .debug-status-label {
    color: #888;
  }
  #debug-ui .debug-status-value {
    color: #0ff;
  }
  #debug-ui .debug-shortcuts {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #222;
    color: #555;
    font-size: 10px;
  }
`;

function createDropdown(
  options: string[],
  selected: string | undefined,
  onChange: (value: string | undefined) => void,
  includeRandom = true
): { select: HTMLSelectElement; step: (dir: number) => void } {
  const select = document.createElement('select');
  select.className = 'debug-select';

  if (includeRandom) {
    const randomOpt = document.createElement('option');
    randomOpt.value = '';
    randomOpt.textContent = '(random)';
    select.appendChild(randomOpt);
  }

  for (const opt of options) {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    if (opt === selected) option.selected = true;
    select.appendChild(option);
  }

  if (!selected && includeRandom) {
    select.value = '';
  }

  select.addEventListener('change', () => {
    onChange(select.value || undefined);
  });

  const step = (dir: number) => {
    const currentIdx = select.selectedIndex;
    const newIdx = Math.max(0, Math.min(select.options.length - 1, currentIdx + dir));
    if (newIdx !== currentIdx) {
      select.selectedIndex = newIdx;
      select.dispatchEvent(new Event('change'));
    }
  };

  return { select, step };
}

function createStepButtons(step: (dir: number) => void): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.gap = '2px';

  const prev = document.createElement('button');
  prev.className = 'debug-step';
  prev.textContent = '◀';
  prev.title = 'Previous';
  prev.addEventListener('click', () => step(-1));

  const next = document.createElement('button');
  next.className = 'debug-step';
  next.textContent = '▶';
  next.title = 'Next';
  next.addEventListener('click', () => step(1));

  wrapper.appendChild(prev);
  wrapper.appendChild(next);
  return wrapper;
}

function createRow(label: string, ...elements: HTMLElement[]): HTMLElement {
  const row = document.createElement('div');
  row.className = 'debug-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'debug-label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  for (const el of elements) {
    row.appendChild(el);
  }

  return row;
}

function createSlider(
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  format: (v: number) => string,
  onChange: (value: number) => void
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'debug-slider-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'debug-slider-label';
  labelEl.textContent = label;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'debug-slider';
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(value);

  const valueEl = document.createElement('span');
  valueEl.className = 'debug-slider-value';
  valueEl.textContent = format(value);

  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    valueEl.textContent = format(v);
    onChange(v);
  });

  row.appendChild(labelEl);
  row.appendChild(slider);
  row.appendChild(valueEl);
  return row;
}

function updateStatus(info?: WorldConfig['info']): void {
  if (!statusEl) return;

  if (!info) {
    statusEl.innerHTML = '<span class="debug-status-label">Click canvas or press Space to generate</span>';
    return;
  }

  statusEl.innerHTML = `
    <div><span class="debug-status-label">Active:</span> <span class="debug-status-value">${info.distro} + ${info.behavior}</span></div>
    <div><span class="debug-status-label">Colors:</span> <span class="debug-status-value">${info.colorScheme}</span></div>
    <div><span class="debug-status-label">Lines:</span> <span class="debug-status-value">${info.count}</span></div>
  `;
}

export function updateActiveConfig(info: WorldConfig['info']): void {
  updateStatus(info);
}

function renderPositionEvolvers(
  container: HTMLElement,
  onChange: () => void
): void {
  container.innerHTML = '';

  const positionNames = positionEvolvers.map(e => e.name);

  // Show "(static - no motion)" when no evolvers
  if (selectedPositions.length === 0) {
    const staticLabel = document.createElement('div');
    staticLabel.style.color = '#888';
    staticLabel.style.fontStyle = 'italic';
    staticLabel.style.marginBottom = '4px';
    staticLabel.textContent = '(static - no motion)';
    container.appendChild(staticLabel);
  }

  for (let i = 0; i < selectedPositions.length; i++) {
    const row = document.createElement('div');
    row.className = 'position-row';

    const { select, step } = createDropdown(
      positionNames,
      selectedPositions[i] || undefined,
      (value) => {
        selectedPositions[i] = value || '';
        onChange();
      },
      true
    );
    select.style.flex = '1';

    row.appendChild(select);
    row.appendChild(createStepButtons(step));

    // Remove button - always show so user can delete all
    const removeBtn = document.createElement('button');
    removeBtn.className = 'debug-step debug-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      selectedPositions.splice(i, 1);
      renderPositionEvolvers(container, onChange);
      onChange();
    });
    row.appendChild(removeBtn);

    container.appendChild(row);
  }

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'debug-step debug-add';
  addBtn.textContent = '+';
  addBtn.title = 'Add position evolver';
  addBtn.style.marginTop = '4px';
  addBtn.addEventListener('click', () => {
    selectedPositions.push('');
    renderPositionEvolvers(container, onChange);
    onChange();
  });
  container.appendChild(addBtn);
}

export function createDebugUI(): HTMLElement {
  container = document.createElement('div');
  container.id = 'debug-ui';

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  container.appendChild(styleEl);

  // Header
  const header = document.createElement('div');
  header.className = 'debug-header';

  const title = document.createElement('span');
  title.className = 'debug-title';
  title.textContent = 'DEBUG';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'debug-close';
  closeBtn.textContent = '−';
  closeBtn.title = 'Collapse';
  closeBtn.addEventListener('click', () => {
    container?.classList.toggle('collapsed');
    closeBtn.textContent = container?.classList.contains('collapsed') ? '+' : '−';
  });

  header.appendChild(title);
  header.appendChild(closeBtn);
  container.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'debug-body';

  const sel = getSelection();

  // Initialize selectedPositions from current selection
  // undefined = random (show one empty dropdown)
  // [] = static (show no dropdowns)
  // [...] = specific evolvers
  if (sel.position === undefined) {
    selectedPositions = [''];  // Random mode - one empty dropdown
  } else if (sel.position.length === 0) {
    selectedPositions = [];    // Static mode - no dropdowns
  } else {
    selectedPositions = [...sel.position];
  }

  const updateSelectionFromUI = () => {
    const positions = selectedPositions.filter(p => p !== '');
    // If no rows at all -> static mode ([])
    // If rows exist but all are "(random)" -> random mode (undefined)
    // If rows with specific values -> those values
    if (selectedPositions.length === 0) {
      updateAndSave({ position: [] });  // Static
    } else if (positions.length === 0) {
      updateAndSave({ position: undefined });  // Random
    } else {
      updateAndSave({ position: positions });  // Specific
    }
  };

  // Distribution
  const { select: distroSelect, step: distroStep } = createDropdown(
    [...distributionNames],
    sel.distribution,
    (value) => updateAndSave({ distribution: value })
  );
  body.appendChild(createRow('Distribution', distroSelect, createStepButtons(distroStep)));

  // Position Evolvers
  const positionLabel = document.createElement('span');
  positionLabel.className = 'debug-label';
  positionLabel.textContent = 'Position';

  const positionList = document.createElement('div');
  positionList.className = 'position-list';
  renderPositionEvolvers(positionList, updateSelectionFromUI);

  const positionRow = document.createElement('div');
  positionRow.className = 'debug-row';
  positionRow.style.alignItems = 'flex-start';
  positionRow.appendChild(positionLabel);
  positionRow.appendChild(positionList);
  body.appendChild(positionRow);

  // Palette
  const { select: paletteSelect, step: paletteStep } = createDropdown(
    [...paletteNames],
    sel.palette,
    (value) => updateAndSave({ palette: value })
  );
  body.appendChild(createRow('Palette', paletteSelect, createStepButtons(paletteStep)));

  // Color Animation
  const { select: colorAnimSelect, step: colorAnimStep } = createDropdown(
    [...colorAnimationNames],
    sel.colorAnimation,
    (value) => updateAndSave({ colorAnimation: value })
  );
  body.appendChild(createRow('Color Anim', colorAnimSelect, createStepButtons(colorAnimStep)));

  // Alpha
  const alphaNames = alphaEvolvers.map(e => e.name);
  const { select: alphaSelect, step: alphaStep } = createDropdown(
    alphaNames,
    sel.alpha,
    (value) => updateAndSave({ alpha: value })
  );
  body.appendChild(createRow('Alpha', alphaSelect, createStepButtons(alphaStep)));

  // Line Width
  const widthNames = lineWidthEvolvers.map(e => e.name);
  const { select: widthSelect, step: widthStep } = createDropdown(
    widthNames,
    sel.lineWidth,
    (value) => updateAndSave({ lineWidth: value })
  );
  body.appendChild(createRow('Line Width', widthSelect, createStepButtons(widthStep)));

  // Dash
  const dashNames = dashEvolvers.map(e => e.name);
  const { select: dashSelect, step: dashStep } = createDropdown(
    dashNames,
    sel.dash,
    (value) => updateAndSave({ dash: value })
  );
  body.appendChild(createRow('Dash', dashSelect, createStepButtons(dashStep)));

  // Count slider
  body.appendChild(createSlider(
    'Count',
    50, 1500, sel.count ?? 200, 10,
    (v) => String(Math.round(v)),
    (v) => updateAndSave({ count: Math.round(v) })
  ));

  // Fade slider
  body.appendChild(createSlider(
    'Fade',
    0.01, 1, sel.fade ?? 0.05, 0.01,
    (v) => v.toFixed(2),
    (v) => updateAndSave({ fade: v })
  ));

  // Buttons
  const buttons = document.createElement('div');
  buttons.className = 'debug-buttons';

  const regenBtn = document.createElement('button');
  regenBtn.className = 'debug-btn debug-btn-primary';
  regenBtn.textContent = 'Regenerate';
  regenBtn.addEventListener('click', () => onRegenerate?.());

  const randomBtn = document.createElement('button');
  randomBtn.className = 'debug-btn';
  randomBtn.textContent = 'Randomize';
  randomBtn.addEventListener('click', () => {
    setSelection({});
    clearStorage();
    selectedPositions = [''];
    renderPositionEvolvers(positionList, updateSelectionFromUI);
    distroSelect.value = '';
    paletteSelect.value = '';
    colorAnimSelect.value = '';
    alphaSelect.value = '';
    widthSelect.value = '';
    dashSelect.value = '';
    onRegenerate?.();
  });

  const resetBtn = document.createElement('button');
  resetBtn.className = 'debug-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    setSelection({});
    clearStorage();
    selectedPositions = [''];
    renderPositionEvolvers(positionList, updateSelectionFromUI);
    distroSelect.value = '';
    paletteSelect.value = '';
    colorAnimSelect.value = '';
    alphaSelect.value = '';
    widthSelect.value = '';
    dashSelect.value = '';
  });

  const loadUrlBtn = document.createElement('button');
  loadUrlBtn.className = 'debug-btn';
  loadUrlBtn.textContent = 'Load URL';
  loadUrlBtn.title = 'Load current URL config into debug UI';
  loadUrlBtn.addEventListener('click', () => {
    const urlState = getStateFromURL();
    if (urlState) {
      // Update selection from URL
      setSelection({
        seed: urlState.seed,
        distribution: urlState.distribution,
        position: urlState.position,
        palette: urlState.palette,
        colorAnimation: urlState.colorAnimation,
        alpha: urlState.alpha,
        lineWidth: urlState.lineWidth,
        dash: urlState.dash,
        fade: urlState.fade,
        count: urlState.count,
      });
      saveToStorage(getSelection());

      // Update UI controls
      distroSelect.value = urlState.distribution || '';
      paletteSelect.value = urlState.palette || '';
      colorAnimSelect.value = urlState.colorAnimation || '';
      alphaSelect.value = urlState.alpha || '';
      widthSelect.value = urlState.lineWidth || '';
      dashSelect.value = urlState.dash || '';

      // Update position evolvers
      if (urlState.position === undefined) {
        selectedPositions = [''];
      } else if (urlState.position.length === 0) {
        selectedPositions = [];
      } else {
        selectedPositions = [...urlState.position];
      }
      renderPositionEvolvers(positionList, updateSelectionFromUI);

      // Note: sliders would need refs to update - they'll reflect on next regenerate
      console.log('Loaded config from URL:', urlState);
    } else {
      console.log('No URL config found');
    }
  });

  const logBtn = document.createElement('button');
  logBtn.className = 'debug-btn';
  logBtn.textContent = 'Log';
  logBtn.title = 'Log current UI selection to console';
  logBtn.addEventListener('click', () => {
    console.log('URL State:', JSON.stringify(getStateFromURL(), null, 2));
    console.log('UI Selection:', JSON.stringify(getSelection(), null, 2));
  });

  buttons.appendChild(regenBtn);
  buttons.appendChild(randomBtn);
  buttons.appendChild(resetBtn);
  buttons.appendChild(loadUrlBtn);
  buttons.appendChild(logBtn);
  body.appendChild(buttons);

  // Status
  statusEl = document.createElement('div');
  statusEl.className = 'debug-status';
  updateStatus();
  body.appendChild(statusEl);

  // Shortcuts hint
  const shortcuts = document.createElement('div');
  shortcuts.className = 'debug-shortcuts';
  shortcuts.textContent = 'Space: regenerate | R: randomize';
  body.appendChild(shortcuts);

  container.appendChild(body);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      onRegenerate?.();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      randomBtn.click();
    }
  });

  return container;
}

export function setRegenerateCallback(callback: () => void): void {
  onRegenerate = callback;
}


export function isDebugMode(): boolean {
  return window.location.search.includes('debug');
}

export function initDebugUI(): void {
  if (isDebugMode()) {
    // Always load from local storage for debug UI, ignoring URL state
    const stored = loadFromStorage();
    if (stored) {
      setSelection(stored);
    } else {
      // No stored selection - start with random (empty selection)
      setSelection({});
    }
    document.body.appendChild(createDebugUI());
  }
}
