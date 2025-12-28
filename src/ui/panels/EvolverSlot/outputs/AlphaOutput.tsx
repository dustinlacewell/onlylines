import { Slider, Subsection } from '../../../design';
import type { RangeOutput } from '../../../../store';

export interface AlphaOutputProps {
  output: RangeOutput;
  onChange: (updates: Partial<RangeOutput>) => void;
}

export function AlphaOutput({ output, onChange }: AlphaOutputProps) {
  return (
    <Subsection title="Output">
      <Slider
        label="Min"
        min={0}
        max={1}
        step={0.05}
        value={output.min}
        onChange={(v) => onChange({ min: v })}
      />
      <Slider
        label="Max"
        min={0}
        max={1}
        step={0.05}
        value={output.max}
        onChange={(v) => onChange({ max: v })}
      />
    </Subsection>
  );
}
