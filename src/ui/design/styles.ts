// Shared styles and CSS variables for the debug UI
import { colors } from './colors';

export const cssVariables = `
  --debug-bg: ${colors.bgPanelOuter};
  --debug-bg-section: #111;
  --debug-bg-subsection: #1a1a1a;
  --debug-border: #333;
  --debug-border-light: #444;
  --debug-border-subsection: #2a2a2a;

  --debug-text: #fff;
  --debug-text-muted: #888;
  --debug-text-dim: #555;
  --debug-text-accent: #0ff;
  --debug-text-section: #0aa;

  --debug-btn-bg: #333;
  --debug-btn-border: #555;
  --debug-btn-hover: #444;

  --debug-toggle-on-bg: #254;
  --debug-toggle-on-border: #4a7;
  --debug-toggle-on-text: #4a7;

  --debug-input-bg: #222;
  --debug-input-border: #444;
  --debug-input-focus: #0ff;

  --debug-slider-track: #333;
  --debug-slider-thumb: #0aa;

  --debug-tab-active: #0aa;
  --debug-tab-inactive: #444;
`;

export const baseStyles = `
  .debug-panel {
    ${cssVariables}
    width: 380px;
    max-height: calc(100vh - 20px);
    overflow-y: auto;
    background: var(--debug-bg);
    color: var(--debug-text);
    font-family: monospace;
    font-size: 11px;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid var(--debug-border);
    border-radius: 4px;
  }

  .debug-panel::-webkit-scrollbar {
    width: 6px;
  }
  .debug-panel::-webkit-scrollbar-track {
    background: #111;
  }
  .debug-panel::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .debug-panel.collapsed {
    width: auto;
    max-height: none;
    overflow: visible;
  }
  .debug-panel.collapsed .debug-body {
    display: none;
  }
`;
