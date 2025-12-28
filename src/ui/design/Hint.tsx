import React from 'react';

export interface HintProps {
  children: React.ReactNode;
}

const style: React.CSSProperties = {
  color: 'var(--debug-text-muted)',
  fontSize: '10px',
  fontStyle: 'italic',
  marginTop: '2px',
  marginBottom: '6px',
  lineHeight: 1.3,
};

export function Hint({ children }: HintProps) {
  return <div style={style}>{children}</div>;
}
