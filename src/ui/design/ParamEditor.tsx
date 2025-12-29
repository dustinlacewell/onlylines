import React from 'react';
import { ParamSlider } from './ParamSlider';
import type { ParamDef } from '../../serialize';
import type { RichParamDef } from '../../core';

// Support both legacy ParamDef tuples and new RichParamDef objects
export interface ParamEditorProps {
  /** Param definitions - supports both legacy [name, ParamType] and rich {name, paramType, min, max, step} */
  paramDefs: ParamDef[] | RichParamDef[];
  /** Current param values */
  values: Record<string, number>;
  /** Called when any param value changes */
  onChange: (values: Record<string, number>) => void;
}

const styles = {
  empty: {
    color: '#444',
    fontStyle: 'italic',
    fontSize: '10px',
    padding: '4px 0',
  } as React.CSSProperties,
};

// Type guard to check if we have rich param defs
function isRichParamDef(def: ParamDef | RichParamDef): def is RichParamDef {
  return typeof def === 'object' && 'name' in def && 'paramType' in def;
}

/**
 * Renders sliders for all params defined in a catalog entry.
 * Each slider is configured based on the ParamType (unit, speed, angle, etc.)
 * with optional overrides from schema min/max/step.
 */
export function ParamEditor({ paramDefs, values, onChange }: ParamEditorProps) {
  if (paramDefs.length === 0) {
    return <div style={styles.empty}>(no parameters)</div>;
  }

  const handleChange = (paramName: string, newValue: number) => {
    onChange({ ...values, [paramName]: newValue });
  };

  return (
    <>
      {paramDefs.map((def) => {
        if (isRichParamDef(def)) {
          // Rich param def with schema metadata
          return (
            <ParamSlider
              key={def.name}
              label={def.name}
              value={values[def.name] ?? def.paramType.decode(128)}
              paramType={def.paramType}
              schemaMin={def.min}
              schemaMax={def.max}
              schemaStep={def.step}
              onChange={(v) => handleChange(def.name, v)}
            />
          );
        } else {
          // Legacy [name, paramType] tuple
          const [name, paramType] = def;
          return (
            <ParamSlider
              key={name}
              label={name}
              value={values[name] ?? paramType.decode(128)}
              paramType={paramType}
              onChange={(v) => handleChange(name, v)}
            />
          );
        }
      })}
    </>
  );
}
