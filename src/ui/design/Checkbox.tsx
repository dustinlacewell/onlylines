import React from 'react';
import { colors } from './colors';

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
    color: colors.textSecondary,
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
    background: colors.bgSection,
    borderColor: colors.borderDark,
  } as React.CSSProperties,
  boxChecked: {
    background: colors.accent,
    borderColor: colors.accent,
  } as React.CSSProperties,
  check: {
    color: colors.textBlack,
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
