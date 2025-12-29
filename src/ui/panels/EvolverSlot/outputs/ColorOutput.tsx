import { Select, Row, Subsection } from '../../../design';
import { getAllPalettes } from '../../../../core/palette';
import type { ColorOutput as ColorOutputType } from '../../../../store';

export interface ColorOutputProps {
  output: ColorOutputType;
  onChange: (updates: Partial<ColorOutputType>) => void;
}

const paletteNames = getAllPalettes();

export function ColorOutput({ output, onChange }: ColorOutputProps) {
  return (
    <Subsection title="Output">
      <Row label="Palette">
        <Select
          value={output.palette}
          options={paletteNames.map(p => p.name)}
          onChange={(v) => onChange({ palette: v })}
        />
      </Row>
    </Subsection>
  );
}
