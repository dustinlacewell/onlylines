import React from 'react';

export interface RowProps {
  label: string;
  children: React.ReactNode;
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
};

export function Row({ label, children }: RowProps) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      {children}
    </div>
  );
}
