import React from 'react';
import { colors } from './colors';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'toggle';
  active?: boolean;
  style?: React.CSSProperties;
}

const baseStyle: React.CSSProperties = {
  background: colors.bgInput,
  border: `1px solid ${colors.borderLight}`,
  color: colors.textWhite,
  padding: '6px',
  fontFamily: 'monospace',
  fontSize: '10px',
  cursor: 'pointer',
  borderRadius: '3px',
};

const toggleStyle: React.CSSProperties = {
  background: colors.bgInput,
  border: `1px solid ${colors.borderLight}`,
  color: colors.textSecondary,
  padding: '2px 8px',
  fontSize: '10px',
  cursor: 'pointer',
  borderRadius: '2px',
};

const toggleActiveStyle: React.CSSProperties = {
  ...toggleStyle,
  background: colors.toggleOn,
  borderColor: colors.toggleOnBorder,
  color: colors.toggleOnText,
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
          e.currentTarget.style.background = colors.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'default') {
          e.currentTarget.style.background = colors.bgInput;
        }
      }}
    >
      {children}
    </button>
  );
}
