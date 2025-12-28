import React from 'react';
import type { ParamType } from '../../paramTypes';
import * as P from '../../paramTypes';

export interface ParamSliderProps {
  label: string;
  value: number;
  paramType: ParamType;
  onChange: (value: number) => void;
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
    color: '#888',
    flexShrink: 0,
    fontSize: '10px',
  } as React.CSSProperties,
  slider: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: '#333',
    borderRadius: '2px',
    cursor: 'pointer',
  } as React.CSSProperties,
  value: {
    width: '40px',
    textAlign: 'right',
    color: '#aaa',
    fontSize: '10px',
  } as React.CSSProperties,
};

// Inject slider thumb styles once
const thumbStyles = `
  .param-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #0aa;
    border-radius: 50%;
    cursor: pointer;
  }
  .param-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #0aa;
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

export function ParamSlider({ label, value, paramType, onChange }: ParamSliderProps) {
  injectInjected();
  const config = getSliderConfig(paramType);

  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <input
        className="param-slider"
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <span style={styles.value}>{config.format(value)}</span>
    </div>
  );
}

function injectInjected() {
  injectStyles();
}
