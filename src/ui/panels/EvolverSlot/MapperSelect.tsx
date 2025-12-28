import { Select, Row, Tooltip } from '../../design';
import type { SelectGroup } from '../../design';
import { getMappersByCategory, getMapperMeta } from '../../../evolvers/mapperCatalog';

export interface MapperSelectProps {
  value: string;
  onChange: (mapper: string) => void;
}

export function MapperSelect({ value, onChange }: MapperSelectProps) {
  const mappersByCategory = getMappersByCategory();
  const meta = getMapperMeta(value);

  const groups: SelectGroup[] = Object.entries(mappersByCategory).map(
    ([category, mappers]) => ({
      label: category,
      options: mappers.map((m) => ({ value: m, label: m })),
    })
  );

  const tooltip = meta
    ? `${meta.name}: ${meta.description}`
    : 'Select a mapper function';

  return (
    <Tooltip content={tooltip}>
      <Row label="Mapper">
        <Select value={value} groups={groups} onChange={onChange} />
      </Row>
    </Tooltip>
  );
}
