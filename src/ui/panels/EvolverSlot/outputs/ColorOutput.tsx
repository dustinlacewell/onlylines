import { Select, Row, Subsection } from '../../../design';
import { palettes } from '../../../../evolvers/palettes';
import type { ColorOutput as ColorOutputType } from '../../../../store';

export interface ColorOutputProps {
  output: ColorOutputType;
  onChange: (updates: Partial<ColorOutputType>) => void;
}

const paletteNames = Object.keys(palettes);

export function ColorOutput({ output, onChange }: ColorOutputProps) {
  return (
    <Subsection title="Output">
      <Row label="Palette">
        <Select
          value={output.palette}
          options={paletteNames}
          onChange={(v) => onChange({ palette: v })}
        />
      </Row>
    </Subsection>
  );
}
