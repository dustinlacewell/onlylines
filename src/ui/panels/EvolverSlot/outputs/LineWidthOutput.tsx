import { Slider, Subsection } from '../../../design';
import type { RangeOutput } from '../../../../store';

export interface LineWidthOutputProps {
  output: RangeOutput;
  onChange: (updates: Partial<RangeOutput>) => void;
}

export function LineWidthOutput({ output, onChange }: LineWidthOutputProps) {
  return (
    <Subsection title="Output">
      <Slider
        label="Min"
        min={0.1}
        max={3}
        step={0.1}
        value={output.min}
        onChange={(v) => onChange({ min: v })}
      />
      <Slider
        label="Max"
        min={0.1}
        max={5}
        step={0.1}
        value={output.max}
        onChange={(v) => onChange({ max: v })}
      />
    </Subsection>
  );
}
