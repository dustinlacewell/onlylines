import React, { useState } from 'react';
import { ParamEditor } from './ParamEditor';
import type { ParamDef } from '../../catalogs';

export interface EvolverCardProps {
  /** Display name of the evolver */
  name: string;
  /** Optional tooltip description */
  tooltip?: string;
  /** Param definitions from catalog */
  paramDefs: ParamDef[];
  /** Current param values */
  params: Record<string, number>;
  /** Called when params change */
  onParamsChange: (params: Record<string, number>) => void;
  /** Called when remove button clicked */
  onRemove: () => void;
}

const styles = {
  card: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: '#222',
    cursor: 'pointer',
    userSelect: 'none',
  } as React.CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  chevron: {
    color: '#666',
    fontSize: '10px',
    transition: 'transform 0.15s',
  } as React.CSSProperties,
  name: {
    color: '#ccc',
    fontSize: '11px',
    fontWeight: 500,
  } as React.CSSProperties,
  paramCount: {
    color: '#555',
    fontSize: '9px',
  } as React.CSSProperties,
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '2px 6px',
    fontSize: '14px',
    lineHeight: 1,
    borderRadius: '2px',
  } as React.CSSProperties,
  content: {
    padding: '8px',
    borderTop: '1px solid #2a2a2a',
  } as React.CSSProperties,
};

export function EvolverCard({
  name,
  tooltip,
  paramDefs,
  params,
  onParamsChange,
  onRemove,
}: EvolverCardProps) {
  const [expanded, setExpanded] = useState(true);
  const hasParams = paramDefs.length > 0;

  return (
    <div style={styles.card} title={tooltip}>
      <div
        style={styles.header}
        onClick={() => hasParams && setExpanded(!expanded)}
      >
        <div style={styles.headerLeft}>
          {hasParams && (
            <span
              style={{
                ...styles.chevron,
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              ▶
            </span>
          )}
          <span style={styles.name}>{name}</span>
          {hasParams && (
            <span style={styles.paramCount}>
              ({paramDefs.length} param{paramDefs.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <button
          style={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove evolver"
        >
          ×
        </button>
      </div>
      {hasParams && expanded && (
        <div style={styles.content}>
          <ParamEditor
            paramDefs={paramDefs}
            values={params}
            onChange={onParamsChange}
          />
        </div>
      )}
    </div>
  );
}
