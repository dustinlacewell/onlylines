import { Select, Row, Tooltip } from '../../design';
import type { SelectGroup } from '../../design';
import { getMapperNamesByCategory, getMapper } from '../../../core';

export interface MapperSelectProps {
  value: string;
  onChange: (mapper: string) => void;
}

export function MapperSelect({ value, onChange }: MapperSelectProps) {
  const mappersByCategory = getMapperNamesByCategory();
  const def = getMapper(value);

  const groups: SelectGroup[] = Object.entries(mappersByCategory).map(
    ([category, mappers]) => ({
      label: category,
      options: mappers.map((m) => ({ value: m, label: m })),
    })
  );

  const tooltip = def
    ? `${def.name}: ${def.description ?? ''}`
    : 'Select a mapper function';

  return (
    <Tooltip content={tooltip}>
      <Row label="Mapper">
        <Select value={value} groups={groups} onChange={onChange} />
      </Row>
    </Tooltip>
  );
}
