import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'toggle';
  active?: boolean;
  style?: React.CSSProperties;
}

const baseStyle: React.CSSProperties = {
  background: '#333',
  border: '1px solid #555',
  color: '#fff',
  padding: '6px',
  fontFamily: 'monospace',
  fontSize: '10px',
  cursor: 'pointer',
  borderRadius: '3px',
};

const toggleStyle: React.CSSProperties = {
  background: '#333',
  border: '1px solid #555',
  color: '#888',
  padding: '2px 8px',
  fontSize: '10px',
  cursor: 'pointer',
  borderRadius: '2px',
};

const toggleActiveStyle: React.CSSProperties = {
  ...toggleStyle,
  background: '#254',
  borderColor: '#4a7',
  color: '#4a7',
};

export function Button({ children, onClick, variant = 'default', active, style }: ButtonProps) {
  let computedStyle: React.CSSProperties;

  if (variant === 'toggle') {
    computedStyle = active ? toggleActiveStyle : toggleStyle;
  } else {
    computedStyle = baseStyle;
  }

  return (
    <button
      onClick={onClick}
      style={{ ...computedStyle, ...style }}
      onMouseEnter={(e) => {
        if (variant === 'default') {
          e.currentTarget.style.background = '#444';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'default') {
          e.currentTarget.style.background = '#333';
        }
      }}
    >
      {children}
    </button>
  );
}
