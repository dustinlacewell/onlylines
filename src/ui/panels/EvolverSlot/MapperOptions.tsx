import React from 'react';
import { Slider, Subsection } from '../../design';
import { getMapper, schemaToRichParamDefs } from '../../../core';

export interface MapperOptionsProps {
  mapperName: string;
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
}

const emptyStyle: React.CSSProperties = {
  color: '#444',
  fontStyle: 'italic',
};

export function MapperOptions({ mapperName, options, onChange }: MapperOptionsProps) {
  const def = getMapper(mapperName);
  const paramDefs = def ? schemaToRichParamDefs(def.params) : [];

  if (!def || paramDefs.length === 0) {
    return (
      <Subsection title="Mapper Options">
        <div style={emptyStyle}>(no options)</div>
      </Subsection>
    );
  }

  return (
    <Subsection title="Mapper Options">
      {paramDefs.map((param) => {
        const schema = def.params[param.name];
        const currentValue = (options[param.name] ?? schema.default) as number;

        return (
          <Slider
            key={param.name}
            label={param.name}
            min={param.min ?? 0}
            max={param.max ?? 1}
            step={param.step ?? 0.1}
            value={currentValue}
            onChange={(v) => onChange({ ...options, [param.name]: v })}
          />
        );
      })}
    </Subsection>
  );
}
