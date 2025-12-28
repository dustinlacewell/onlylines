import React from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '8px',
  } as React.CSSProperties,
  label: {
    width: '65px',
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
  .debug-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #0aa;
    border-radius: 50%;
    cursor: pointer;
  }
  .debug-slider::-moz-range-thumb {
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

export function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  injectStyles();

  const format = (v: number) => step < 1 ? v.toFixed(2) : String(Math.round(v));

  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <input
        className="debug-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <span style={styles.value}>{format(value)}</span>
    </div>
  );
}
