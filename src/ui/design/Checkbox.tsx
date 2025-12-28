import React from 'react';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  } as React.CSSProperties,
  label: {
    color: '#888',
    fontSize: '10px',
    userSelect: 'none',
  } as React.CSSProperties,
  box: {
    width: '12px',
    height: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  boxUnchecked: {
    background: '#1a1a1a',
    borderColor: '#333',
  } as React.CSSProperties,
  boxChecked: {
    background: '#0aa',
    borderColor: '#0aa',
  } as React.CSSProperties,
  check: {
    color: '#000',
    fontSize: '10px',
    fontWeight: 'bold',
    lineHeight: 1,
  } as React.CSSProperties,
};

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label style={styles.container}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <div style={{ ...styles.box, ...(checked ? styles.boxChecked : styles.boxUnchecked) }}>
        {checked && <span style={styles.check}>✓</span>}
      </div>
      <span style={styles.label}>{label}</span>
    </label>
  );
}
