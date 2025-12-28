import React from 'react';
import { ParamSlider } from './ParamSlider';
import type { ParamDef } from '../../serialize';

export interface ParamEditorProps {
  /** Param definitions from catalog entry */
  paramDefs: ParamDef[];
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

/**
 * Renders sliders for all params defined in a catalog entry.
 * Each slider is configured based on the ParamType (unit, speed, angle, etc.)
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
      {paramDefs.map(([name, paramType]) => (
        <ParamSlider
          key={name}
          label={name}
          value={values[name] ?? paramType.decode(128)} // Default to middle value
          paramType={paramType}
          onChange={(v) => handleChange(name, v)}
        />
      ))}
    </>
  );
}
