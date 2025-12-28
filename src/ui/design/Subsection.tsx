import React from 'react';

export interface SubsectionProps {
  title: string;
  children: React.ReactNode;
}

const styles = {
  container: {
    marginTop: '8px',
    padding: '6px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '3px',
  } as React.CSSProperties,
  title: {
    color: '#555',
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
