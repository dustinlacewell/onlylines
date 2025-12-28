import React from 'react';
import { Slider, Subsection } from '../../design';
import { getMapperMeta } from '../../../evolvers/mapperCatalog';

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
  const meta = getMapperMeta(mapperName);

  if (!meta || meta.options.length === 0) {
    return (
      <Subsection title="Mapper Options">
        <div style={emptyStyle}>(no options)</div>
      </Subsection>
    );
  }

  return (
    <Subsection title="Mapper Options">
      {meta.options.map((opt) => {
        const currentValue = (options[opt.name] ?? opt.default) as number;

        if (opt.type === 'number') {
          return (
            <Slider
              key={opt.name}
              label={opt.name}
              min={opt.min ?? 0}
              max={opt.max ?? 1}
              step={opt.step ?? 0.1}
              value={currentValue}
              onChange={(v) => onChange({ ...options, [opt.name]: v })}
            />
          );
        }

        return null;
      })}
    </Subsection>
  );
}
