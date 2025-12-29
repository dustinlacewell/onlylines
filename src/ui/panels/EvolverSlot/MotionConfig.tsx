import React from 'react';
import { Slider, Select, Checkbox, Row, Subsection, Tooltip } from '../../design';
import type { MotionConfig as MotionConfigType, MotionMode, EdgeBehavior } from '../../../core/evolvers/system';

export interface MotionConfigProps {
  motion: Partial<MotionConfigType>;
  onChange: (updates: Partial<MotionConfigType>) => void;
}

const modeOptions = ['field', 'focal', 'spread'];
const edgeOptions = ['wrap', 'bounce'];

const modeTooltips: Record<string, string> = {
  field: 'Field: Pattern scrolls across lines from first to last, like a wave moving through water',
  focal: 'Focal: Ripple radiates outward from center line, creating expanding/contracting rings',
  spread: 'Spread: All lines animate together in perfect sync, no spatial variation',
};

const edgeTooltips: Record<string, string> = {
  wrap: 'Wrap: Loop seamlessly when animation reaches boundaries, creating continuous motion',
  bounce: 'Bounce: Reverse direction at boundaries like a pendulum, smooth back-and-forth',
};

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginTop: '4px',
};

export function MotionConfig({ motion, onChange }: MotionConfigProps) {
  const currentMode = motion.mode ?? 'field';
  const currentEdge = motion.edge ?? 'wrap';

  return (
    <Subsection title="Motion">
      <Tooltip content={modeTooltips[currentMode]}>
        <Row label="Mode">
          <Select
            value={currentMode}
            options={modeOptions}
            onChange={(v) => onChange({ mode: v as MotionMode })}
          />
        </Row>
      </Tooltip>

      <Tooltip content="Speed: How fast the animation cycles. Higher = faster movement">
        <Slider
          label="Speed"
          min={0}
          max={1}
          step={0.02}
          value={motion.speed ?? 0.2}
          onChange={(v) => onChange({ speed: v })}
        />
      </Tooltip>

      <Tooltip content={edgeTooltips[currentEdge]}>
        <Row label="Edge">
          <Select
            value={currentEdge}
            options={edgeOptions}
            onChange={(v) => onChange({ edge: v as EdgeBehavior })}
          />
        </Row>
      </Tooltip>

      <Tooltip content="Phase Spread: Staggers each line's animation phase. 0 = all in sync, 1 = each line offset by full cycle">
        <Slider
          label="Phase Spread"
          min={0}
          max={2}
          step={0.1}
          value={motion.phaseSpread ?? 0}
          onChange={(v) => onChange({ phaseSpread: v })}
        />
      </Tooltip>

      <Tooltip content="Waves: How many complete wave cycles fit across all lines. Higher = more repetitions. No effect in spread mode.">
        <Slider
          label="Waves"
          min={0.5}
          max={5}
          step={0.25}
          value={motion.waves ?? 1}
          onChange={(v) => onChange({ waves: v })}
        />
      </Tooltip>

      <Tooltip content="Reversed: Animation scrolls backward in time. Alternate: Odd-numbered lines animate in opposite direction, creating zigzag patterns.">
        <div style={checkboxRowStyle}>
          <Checkbox
            label="Reversed"
            checked={motion.reversed ?? false}
            onChange={(v) => onChange({ reversed: v })}
          />
          <Checkbox
            label="Alternate"
            checked={motion.alternate ?? false}
            onChange={(v) => onChange({ alternate: v })}
          />
        </div>
      </Tooltip>
    </Subsection>
  );
}
