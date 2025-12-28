import { Slider, Subsection } from '../../../design';
import type { DashOutput as DashOutputType } from '../../../../store';

export interface DashOutputProps {
  output: DashOutputType;
  onChange: (updates: Partial<DashOutputType>) => void;
}

export function DashOutput({ output, onChange }: DashOutputProps) {
  return (
    <Subsection title="Output">
      <Slider
        label="Max Gap"
        min={5}
        max={50}
        step={1}
        value={output.maxGap}
        onChange={(v) => onChange({ maxGap: v })}
      />
      <Slider
        label="Dash Len"
        min={2}
        max={30}
        step={1}
        value={output.dashLen}
        onChange={(v) => onChange({ dashLen: v })}
      />
      <Slider
        label="March"
        min={0}
        max={100}
        step={5}
        value={output.marching}
        onChange={(v) => onChange({ marching: v })}
      />
    </Subsection>
  );
}
