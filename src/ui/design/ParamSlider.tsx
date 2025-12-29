import React from 'react';
import type { ParamType } from '../../paramTypes';
import * as P from '../../paramTypes';
import { colors } from './colors';

export interface ParamSliderProps {
  label: string;
  value: number;
  paramType: ParamType;
  onChange: (value: number) => void;
  // Schema overrides - if provided, these take precedence over type defaults
  schemaMin?: number;
  schemaMax?: number;
  schemaStep?: number;
}

// Determine slider config based on param type
interface SliderConfig {
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

function getSliderConfig(paramType: ParamType): SliderConfig {
  // Match by reference to known types
  if (paramType === P.unit) {
    return { min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) };
  }
  if (paramType === P.smallUnit) {
    return { min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) };
  }
  if (paramType === P.speed) {
    return { min: 0.01, max: 1, step: 0.01, format: (v) => v.toFixed(2) };
  }
  if (paramType === P.smallInt) {
    return { min: 1, max: 16, step: 1, format: (v) => String(Math.round(v)) };
  }
  if (paramType === P.int) {
    return { min: 1, max: 256, step: 1, format: (v) => String(Math.round(v)) };
  }
  if (paramType === P.byte) {
    return { min: 0, max: 255, step: 1, format: (v) => String(Math.round(v)) };
  }
  if (paramType === P.bool) {
    return { min: 0, max: 1, step: 1, format: (v) => v >= 0.5 ? 'on' : 'off' };
  }
  if (paramType === P.signedUnit) {
    return { min: -1, max: 1, step: 0.01, format: (v) => v.toFixed(2) };
  }
  if (paramType === P.angle) {
    return { min: 0, max: Math.PI * 2, step: 0.01, format: (v) => `${(v * 180 / Math.PI).toFixed(0)}°` };
  }
  if (paramType === P.frequency) {
    return { min: 0, max: 10, step: 0.1, format: (v) => v.toFixed(1) };
  }
  if (paramType === P.scale5) {
    return { min: 0, max: 5, step: 0.1, format: (v) => v.toFixed(1) };
  }
  if (paramType === P.ratio3) {
    return { min: 1, max: 3, step: 0.1, format: (v) => v.toFixed(1) };
  }
  if (paramType === P.sharpness8) {
    return { min: 1, max: 8, step: 0.5, format: (v) => v.toFixed(1) };
  }
  // Default fallback for unknown types or enum types
  return { min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) };
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '8px',
  } as React.CSSProperties,
  label: {
    width: '70px',
    color: colors.textSecondary,
    flexShrink: 0,
    fontSize: '10px',
  } as React.CSSProperties,
  slider: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: colors.bgInput,
    borderRadius: '2px',
    cursor: 'pointer',
  } as React.CSSProperties,
  value: {
    width: '40px',
    textAlign: 'right',
    color: colors.textValue,
    fontSize: '10px',
  } as React.CSSProperties,
};

// Inject slider thumb styles once
const thumbStyles = `
  .param-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: ${colors.accent};
    border-radius: 50%;
    cursor: pointer;
  }
  .param-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: ${colors.accent};
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = thumbStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

export function ParamSlider({
  label,
  value,
  paramType,
  onChange,
  schemaMin,
  schemaMax,
  schemaStep,
}: ParamSliderProps) {
  injectStyles();
  const typeConfig = getSliderConfig(paramType);

  // Schema overrides take precedence over type defaults
  const min = schemaMin ?? typeConfig.min;
  const max = schemaMax ?? typeConfig.max;
  const step = schemaStep ?? typeConfig.step;

  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <input
        className="param-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <span style={styles.value}>{typeConfig.format(value)}</span>
    </div>
  );
}
