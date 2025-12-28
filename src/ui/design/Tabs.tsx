import React from 'react';

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
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
  } as React.CSSProperties,
  tab: {
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  } as React.CSSProperties,
  tabActive: {
    color: '#0aa',
    borderBottomColor: '#0aa',
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
              e.currentTarget.style.color = '#888';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = '#666';
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
