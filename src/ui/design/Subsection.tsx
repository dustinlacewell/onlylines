import React from 'react';
import { colors } from './colors';

export interface SubsectionProps {
  title: string;
  children: React.ReactNode;
}

const styles = {
  container: {
    marginTop: '8px',
    padding: '6px',
    background: colors.bgSection,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '3px',
  } as React.CSSProperties,
  title: {
    color: colors.accent,
    fontSize: '9px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  } as React.CSSProperties,
};

export function Subsection({ title, children }: SubsectionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.title as React.CSSProperties}>{title}</div>
      {children}
    </div>
  );
}
