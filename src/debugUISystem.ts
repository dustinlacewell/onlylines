// Debug UI for the new system-based evolver architecture
// Uses Zustand store for reactive state management

import {
  type MotionConfig,
  type MotionMode,
  type EdgeBehavior,
} from './evolvers/system';
import {
  mapperCatalog,
  getMapperMeta,
  getMappersByCategory,
} from './evolvers/mapperCatalog';
import { presets, type PresetName } from './evolvers/evolverFactory';
import { palettes } from './evolvers/palettes';
import {
  evolverStore,
  type EvolverState,
  type SlotState,
  type DashOutput,
  type RangeOutput,
  type ColorOutput,
} from './store';

// === STYLES ===

const styles = `
  #system-debug-ui {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 380px;
    max-height: calc(100vh - 20px);
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.95);
    color: #fff;
    font-family: monospace;
    font-size: 11px;
    padding: 12px;
    box-sizing: border-box;
    z-index: 1000;
    border: 1px solid #333;
    border-radius: 4px;
  }
  #system-debug-ui::-webkit-scrollbar {
    width: 6px;
  }
  #system-debug-ui::-webkit-scrollbar-track {
    background: #111;
  }
  #system-debug-ui::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
  #system-debug-ui.collapsed {
    width: auto;
    max-height: none;
    overflow: visible;
  }
  #system-debug-ui.collapsed .debug-body { display: none; }

  #system-debug-ui .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #444;
  }
  #system-debug-ui.collapsed .debug-header {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  #system-debug-ui .debug-title {
    font-size: 13px;
    font-weight: bold;
    color: #0ff;
  }
  #system-debug-ui .debug-close {
    background: none;
    border: none;
    color: #888;
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
  }
  #system-debug-ui .debug-close:hover { color: #fff; }

  #system-debug-ui .section {
    margin-bottom: 12px;
    padding: 10px;
    background: #111;
    border: 1px solid #333;
    border-radius: 4px;
  }
  #system-debug-ui .section.disabled {
    opacity: 0.4;
  }
  #system-debug-ui .section.disabled .section-content {
    pointer-events: none;
  }
  #system-debug-ui .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
  }
  #system-debug-ui .section-title {
    font-weight: bold;
    color: #0aa;
    text-transform: uppercase;
    font-size: 10px;
  }
  #system-debug-ui .section-toggle {
    background: #333;
    border: 1px solid #555;
    color: #888;
    padding: 2px 8px;
    font-size: 10px;
    cursor: pointer;
    border-radius: 2px;
  }
  #system-debug-ui .section-toggle.enabled {
    background: #254;
    border-color: #4a7;
    color: #4a7;
  }

  #system-debug-ui .row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    gap: 8px;
  }
  #system-debug-ui .label {
    width: 65px;
    color: #888;
    flex-shrink: 0;
    font-size: 10px;
  }
  #system-debug-ui select {
    flex: 1;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    padding: 3px 5px;
    font-family: monospace;
    font-size: 10px;
    border-radius: 2px;
    min-width: 0;
  }
  #system-debug-ui select:focus {
    outline: none;
    border-color: #0ff;
  }

  #system-debug-ui input[type="range"] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #333;
    border-radius: 2px;
  }
  #system-debug-ui input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #0aa;
    border-radius: 50%;
    cursor: pointer;
  }
  #system-debug-ui .slider-value {
    width: 40px;
    text-align: right;
    color: #aaa;
    font-size: 10px;
  }

  #system-debug-ui input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }

  #system-debug-ui .subsection {
    margin-top: 8px;
    padding: 6px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 3px;
  }
  #system-debug-ui .subsection-title {
    color: #555;
    font-size: 9px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  #system-debug-ui .buttons {
    display: flex;
    gap: 6px;
    margin-top: 12px;
  }
  #system-debug-ui .btn {
    flex: 1;
    background: #333;
    border: 1px solid #555;
    color: #fff;
    padding: 6px;
    font-family: monospace;
    font-size: 10px;
    cursor: pointer;
    border-radius: 3px;
  }
  #system-debug-ui .btn:hover { background: #444; }

  #system-debug-ui .presets {
    margin-bottom: 12px;
  }
  #system-debug-ui .presets select {
    width: 100%;
  }
`;

// === UI BUILDERS ===

function createSelect(
  options: string[],
  selected: string,
  onChange: (value: string) => void,
  groupedOptions?: Record<string, string[]>
): HTMLSelectElement {
  const select = document.createElement('select');

  if (groupedOptions) {
    for (const [group, opts] of Object.entries(groupedOptions)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      for (const opt of opts) {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === selected) option.selected = true;
        optgroup.appendChild(option);
      }
      select.appendChild(optgroup);
    }
  } else {
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (opt === selected) option.selected = true;
      select.appendChild(option);
    }
  }

  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function createSlider(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  onChange: (value: number) => void
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'row';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.textContent = label;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(value);

  const valueEl = document.createElement('span');
  valueEl.className = 'slider-value';
  const format = (v: number) => step < 1 ? v.toFixed(2) : String(Math.round(v));
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

function createRow(label: string, ...elements: HTMLElement[]): HTMLElement {
  const row = document.createElement('div');
  row.className = 'row';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  for (const el of elements) {
    row.appendChild(el);
  }
  return row;
}

// === MOTION CONFIG UI ===

function createMotionUI(
  slot: keyof EvolverState,
  motion: Partial<MotionConfig>
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'subsection';

  const title = document.createElement('div');
  title.className = 'subsection-title';
  title.textContent = 'Motion';
  container.appendChild(title);

  // Mode
  const modeSelect = createSelect(
    ['field', 'focal', 'spread'],
    motion.mode ?? 'field',
    (v) => evolverStore.updateSlotMotion(slot, { mode: v as MotionMode })
  );
  container.appendChild(createRow('Mode', modeSelect));

  // Speed
  container.appendChild(createSlider('Speed', 0, 1, 0.02, motion.speed ?? 0.2, (v) => {
    evolverStore.updateSlotMotion(slot, { speed: v });
  }));

  // Edge
  const edgeSelect = createSelect(
    ['wrap', 'bounce', 'clamp'],
    motion.edge ?? 'wrap',
    (v) => evolverStore.updateSlotMotion(slot, { edge: v as EdgeBehavior })
  );
  container.appendChild(createRow('Edge', edgeSelect));

  // Phase spread
  container.appendChild(createSlider('Phase', 0, 2, 0.1, motion.phaseSpread ?? 0, (v) => {
    evolverStore.updateSlotMotion(slot, { phaseSpread: v });
  }));

  // Waves
  container.appendChild(createSlider('Waves', 0.5, 5, 0.25, motion.waves ?? 1, (v) => {
    evolverStore.updateSlotMotion(slot, { waves: v });
  }));

  // Checkboxes row
  const checkRow = document.createElement('div');
  checkRow.className = 'row';
  checkRow.style.gap = '16px';

  const revLabel = document.createElement('span');
  revLabel.className = 'label';
  revLabel.textContent = 'Reversed';
  const revCheck = document.createElement('input');
  revCheck.type = 'checkbox';
  revCheck.checked = motion.reversed ?? false;
  revCheck.addEventListener('change', () => {
    evolverStore.updateSlotMotion(slot, { reversed: revCheck.checked });
  });

  const altLabel = document.createElement('span');
  altLabel.className = 'label';
  altLabel.textContent = 'Alternate';
  const altCheck = document.createElement('input');
  altCheck.type = 'checkbox';
  altCheck.checked = motion.alternate ?? false;
  altCheck.addEventListener('change', () => {
    evolverStore.updateSlotMotion(slot, { alternate: altCheck.checked });
  });

  checkRow.appendChild(revLabel);
  checkRow.appendChild(revCheck);
  checkRow.appendChild(altLabel);
  checkRow.appendChild(altCheck);
  container.appendChild(checkRow);

  return container;
}

// === MAPPER OPTIONS UI ===

function createMapperOptionsUI(
  slot: keyof EvolverState,
  mapperName: string,
  options: Record<string, unknown>
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'subsection';

  const title = document.createElement('div');
  title.className = 'subsection-title';
  title.textContent = 'Mapper Options';
  container.appendChild(title);

  const meta = getMapperMeta(mapperName);
  if (!meta || meta.options.length === 0) {
    const note = document.createElement('div');
    note.style.color = '#444';
    note.style.fontStyle = 'italic';
    note.textContent = '(no options)';
    container.appendChild(note);
    return container;
  }

  for (const opt of meta.options) {
    const currentValue = options[opt.name] ?? opt.default;

    if (opt.type === 'number') {
      container.appendChild(createSlider(
        opt.name,
        opt.min ?? 0,
        opt.max ?? 1,
        opt.step ?? 0.1,
        currentValue as number,
        (v) => {
          const state = evolverStore.getState();
          const newOptions = { ...state[slot].mapperOptions, [opt.name]: v };
          evolverStore.getState().setSlotMapperOptions(slot, newOptions);
        }
      ));
    }
  }

  return container;
}

// === SECTION UI ===

type SlotKey = 'dash' | 'alpha' | 'color' | 'lineWidth';

function createSection(
  slot: SlotKey,
  title: string,
  slotState: SlotState<DashOutput> | SlotState<RangeOutput> | SlotState<ColorOutput>,
  createOutputUI: () => HTMLElement
): HTMLElement {
  const section = document.createElement('div');
  section.className = 'section' + (slotState.enabled ? '' : ' disabled');

  // Header (clickable to toggle)
  const header = document.createElement('div');
  header.className = 'section-header';

  const titleEl = document.createElement('span');
  titleEl.className = 'section-title';
  titleEl.textContent = title;

  const toggle = document.createElement('button');
  toggle.className = 'section-toggle' + (slotState.enabled ? ' enabled' : '');
  toggle.textContent = slotState.enabled ? 'ON' : 'OFF';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    evolverStore.setSlotEnabled(slot, !slotState.enabled);
  });

  header.appendChild(titleEl);
  header.appendChild(toggle);
  section.appendChild(header);

  // Content
  const content = document.createElement('div');
  content.className = 'section-content';

  // Mapper selection
  const mappersByCategory = getMappersByCategory();
  const mapperSelect = createSelect(
    Object.keys(mapperCatalog),
    slotState.mapper,
    (v) => evolverStore.setSlotMapper(slot, v),
    mappersByCategory
  );
  content.appendChild(createRow('Mapper', mapperSelect));

  // Mapper options
  content.appendChild(createMapperOptionsUI(slot, slotState.mapper, slotState.mapperOptions));

  // Motion config
  content.appendChild(createMotionUI(slot, slotState.motion));

  // Output config (custom per slot)
  content.appendChild(createOutputUI());

  section.appendChild(content);
  return section;
}

// === MAIN UI ===

let container: HTMLElement | null = null;

function buildUI(): HTMLElement {
  const state = evolverStore.getState();

  const el = document.createElement('div');
  el.id = 'system-debug-ui';

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  el.appendChild(styleEl);

  // Header
  const header = document.createElement('div');
  header.className = 'debug-header';

  const title = document.createElement('span');
  title.className = 'debug-title';
  title.textContent = 'EVOLVERS';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'debug-close';
  closeBtn.textContent = '−';
  closeBtn.addEventListener('click', () => {
    el.classList.toggle('collapsed');
    closeBtn.textContent = el.classList.contains('collapsed') ? '+' : '−';
  });

  header.appendChild(title);
  header.appendChild(closeBtn);
  el.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'debug-body';

  // Presets
  const presetsDiv = document.createElement('div');
  presetsDiv.className = 'presets';
  const presetNames = Object.keys(presets) as PresetName[];
  const presetSelect = createSelect(
    ['(preset)', ...presetNames],
    '',
    (v) => {
      if (v && v !== '(preset)') {
        evolverStore.applyPreset(v as PresetName);
      }
    }
  );
  presetsDiv.appendChild(presetSelect);
  body.appendChild(presetsDiv);

  // Dash section
  body.appendChild(createSection('dash', 'Dash', state.dash, () => {
    const output = document.createElement('div');
    output.className = 'subsection';
    const outputTitle = document.createElement('div');
    outputTitle.className = 'subsection-title';
    outputTitle.textContent = 'Output';
    output.appendChild(outputTitle);

    output.appendChild(createSlider('Max Gap', 5, 50, 1, state.dash.output.maxGap, (v) => {
      evolverStore.setDashOutput({ maxGap: v });
    }));
    output.appendChild(createSlider('Dash Len', 2, 30, 1, state.dash.output.dashLen, (v) => {
      evolverStore.setDashOutput({ dashLen: v });
    }));
    output.appendChild(createSlider('March', 0, 100, 5, state.dash.output.marching, (v) => {
      evolverStore.setDashOutput({ marching: v });
    }));
    return output;
  }));

  // Alpha section
  body.appendChild(createSection('alpha', 'Alpha', state.alpha, () => {
    const output = document.createElement('div');
    output.className = 'subsection';
    const outputTitle = document.createElement('div');
    outputTitle.className = 'subsection-title';
    outputTitle.textContent = 'Output';
    output.appendChild(outputTitle);

    output.appendChild(createSlider('Min', 0, 1, 0.05, state.alpha.output.min, (v) => {
      evolverStore.setAlphaOutput({ min: v });
    }));
    output.appendChild(createSlider('Max', 0, 1, 0.05, state.alpha.output.max, (v) => {
      evolverStore.setAlphaOutput({ max: v });
    }));
    return output;
  }));

  // Color section
  body.appendChild(createSection('color', 'Color', state.color, () => {
    const output = document.createElement('div');
    output.className = 'subsection';
    const outputTitle = document.createElement('div');
    outputTitle.className = 'subsection-title';
    outputTitle.textContent = 'Output';
    output.appendChild(outputTitle);

    const paletteNames = Object.keys(palettes);
    const paletteSelect = createSelect(
      paletteNames,
      state.color.output.palette,
      (v) => evolverStore.setColorOutput({ palette: v })
    );
    output.appendChild(createRow('Palette', paletteSelect));
    return output;
  }));

  // LineWidth section
  body.appendChild(createSection('lineWidth', 'Width', state.lineWidth, () => {
    const output = document.createElement('div');
    output.className = 'subsection';
    const outputTitle = document.createElement('div');
    outputTitle.className = 'subsection-title';
    outputTitle.textContent = 'Output';
    output.appendChild(outputTitle);

    output.appendChild(createSlider('Min', 0.1, 3, 0.1, state.lineWidth.output.min, (v) => {
      evolverStore.setLineWidthOutput({ min: v });
    }));
    output.appendChild(createSlider('Max', 0.1, 5, 0.1, state.lineWidth.output.max, (v) => {
      evolverStore.setLineWidthOutput({ max: v });
    }));
    return output;
  }));

  // Buttons
  const buttons = document.createElement('div');
  buttons.className = 'buttons';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => evolverStore.reset());

  const logBtn = document.createElement('button');
  logBtn.className = 'btn';
  logBtn.textContent = 'Log';
  logBtn.addEventListener('click', () => {
    console.log('Store State:', evolverStore.getState());
    console.log('Built Config:', evolverStore.buildConfig());
  });

  buttons.appendChild(resetBtn);
  buttons.appendChild(logBtn);
  body.appendChild(buttons);

  el.appendChild(body);
  return el;
}

function rebuildUI(): void {
  if (!container) return;
  const parent = container.parentElement;
  if (!parent) return;

  const wasCollapsed = container.classList.contains('collapsed');
  parent.removeChild(container);
  container = buildUI();
  if (wasCollapsed) container.classList.add('collapsed');
  parent.appendChild(container);
}

export function createSystemDebugUI(): HTMLElement {
  container = buildUI();

  // Subscribe to store changes to rebuild UI
  evolverStore.subscribe(() => {
    rebuildUI();
  });

  return container;
}

export function isSystemDebugMode(): boolean {
  return window.location.search.includes('system');
}

export function initSystemDebugUI(): void {
  if (isSystemDebugMode()) {
    document.body.appendChild(createSystemDebugUI());
  }
}
