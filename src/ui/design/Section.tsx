import React from 'react';
import { colors } from './colors';

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const styles = {
  section: {
    marginBottom: '12px',
    padding: '10px',
    background: colors.bgPanel,
    border: `1px solid ${colors.borderDark}`,
    borderRadius: '4px',
  } as React.CSSProperties,
  sectionDisabled: {
    opacity: 0.4,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  } as React.CSSProperties,
  title: {
    fontWeight: 'bold',
    color: colors.accent,
    textTransform: 'uppercase',
    fontSize: '10px',
  } as React.CSSProperties,
  toggle: {
    background: colors.bgInput,
    border: `1px solid ${colors.borderLight}`,
    color: colors.textSecondary,
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    borderRadius: '2px',
  } as React.CSSProperties,
  toggleEnabled: {
    background: colors.toggleOn,
    borderColor: colors.toggleOnBorder,
    color: colors.toggleOnText,
  } as React.CSSProperties,
  content: {
    pointerEvents: 'auto',
  } as React.CSSProperties,
  contentDisabled: {
    pointerEvents: 'none',
  } as React.CSSProperties,
};

export function Section({ title, children, enabled = true, onToggle }: SectionProps) {
  const showToggle = onToggle !== undefined;

  return (
    <div style={{ ...styles.section, ...(enabled ? {} : styles.sectionDisabled) }}>
      <div style={styles.header}>
        <span style={styles.title as React.CSSProperties}>{title}</span>
        {showToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(!enabled);
            }}
            style={{
              ...styles.toggle,
              ...(enabled ? styles.toggleEnabled : {}),
            }}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        )}
      </div>
      <div style={enabled ? styles.content : (styles.contentDisabled as React.CSSProperties)}>
        {children}
      </div>
    </div>
  );
}
