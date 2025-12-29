import React from 'react';
import { colors } from './colors';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const styles = {
  container: {
    display: 'flex',
    gap: '2px',
    marginBottom: '12px',
    borderBottom: `1px solid ${colors.borderDark}`,
    paddingBottom: '8px',
  } as React.CSSProperties,
  tab: {
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  } as React.CSSProperties,
  tabActive: {
    color: colors.accent,
    borderBottomColor: colors.accent,
  } as React.CSSProperties,
};

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div style={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : {}),
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = colors.textMuted;
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
