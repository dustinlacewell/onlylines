import React, { useState } from 'react';
import { ParamEditor } from './ParamEditor';
import { colors } from './colors';
import type { ParamDef } from '../../serialize';
import type { RichParamDef } from '../../core';

export interface EvolverCardProps {
  /** Display name of the evolver */
  name: string;
  /** Optional tooltip description */
  tooltip?: string;
  /** Param definitions from catalog - supports both legacy and rich formats */
  paramDefs: ParamDef[] | RichParamDef[];
  /** Current param values */
  params: Record<string, number>;
  /** Called when params change */
  onParamsChange: (params: Record<string, number>) => void;
  /** Called when remove button clicked */
  onRemove: () => void;
}

const styles = {
  card: {
    background: colors.bgSection,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: colors.bgInput,
    cursor: 'pointer',
    userSelect: 'none',
  } as React.CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  chevron: {
    color: colors.textMuted,
    fontSize: '10px',
    transition: 'transform 0.15s',
  } as React.CSSProperties,
  name: {
    color: colors.textValue,
    fontSize: '11px',
    fontWeight: 500,
  } as React.CSSProperties,
  paramCount: {
    color: colors.textMuted,
    fontSize: '9px',
  } as React.CSSProperties,
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: colors.accent,
    cursor: 'pointer',
    padding: '2px 6px',
    fontSize: '14px',
    lineHeight: 1,
    borderRadius: '2px',
  } as React.CSSProperties,
  content: {
    padding: '8px',
    borderTop: `1px solid ${colors.borderSubtle}`,
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
