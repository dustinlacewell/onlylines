import React from 'react';
import { colors } from '../../design';

export interface HeaderProps {
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: `1px solid ${colors.borderMedium}`,
    cursor: 'pointer',
  } as React.CSSProperties,
  headerCollapsed: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottom: 'none',
  } as React.CSSProperties,
  title: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: colors.textPrimary,
  } as React.CSSProperties,
  link: {
    color: colors.textSecondary,
    textDecoration: 'none',
  } as React.CSSProperties,
  toggleIcon: {
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
    marginLeft: '8px',
  } as React.CSSProperties,
};

export function Header({ title, collapsed, onToggleCollapse }: HeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on the link
    if ((e.target as HTMLElement).tagName === 'A') return;
    onToggleCollapse();
  };

  return (
    <div
      style={{ ...styles.header, ...(collapsed ? styles.headerCollapsed : {}) }}
      onClick={handleClick}
    >
      <span style={styles.title}>
        {title === 'SYSTEM DEBUG' ? (
          <>OnlyLines by <a
            href="https://ldlework.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary; }}
          >ldlework</a></>
        ) : (
          title
        )}
      </span>
      <span style={styles.toggleIcon}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          {collapsed ? (
            <polyline points="2,4 5,7 8,4" />
          ) : (
            <polyline points="2,6 5,3 8,6" />
          )}
        </svg>
      </span>
    </div>
  );
}
