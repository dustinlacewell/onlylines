// Shared styles and CSS variables for the debug UI
import { colors } from './colors';

export const cssVariables = `
  --debug-bg: ${colors.bgPanelOuter};
  --debug-bg-section: ${colors.bgPanel};
  --debug-bg-subsection: ${colors.bgSection};
  --debug-border: ${colors.borderDark};
  --debug-border-light: ${colors.borderMedium};
  --debug-border-subsection: ${colors.borderSubtle};

  --debug-text: ${colors.textWhite};
  --debug-text-muted: ${colors.textSecondary};
  --debug-text-dim: ${colors.textMuted};
  --debug-text-accent: ${colors.textPrimary};
  --debug-text-section: ${colors.accent};

  --debug-btn-bg: ${colors.bgInput};
  --debug-btn-border: ${colors.borderLight};
  --debug-btn-hover: ${colors.bgHover};

  --debug-toggle-on-bg: ${colors.toggleOn};
  --debug-toggle-on-border: ${colors.toggleOnBorder};
  --debug-toggle-on-text: ${colors.toggleOnText};

  --debug-input-bg: ${colors.bgInput};
  --debug-input-border: ${colors.borderMedium};
  --debug-input-focus: ${colors.textPrimary};

  --debug-slider-track: ${colors.bgInput};
  --debug-slider-thumb: ${colors.accent};

  --debug-tab-active: ${colors.accent};
  --debug-tab-inactive: ${colors.borderMedium};
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
    background: ${colors.bgPanel};
  }
  .debug-panel::-webkit-scrollbar-thumb {
    background: ${colors.borderMedium};
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
