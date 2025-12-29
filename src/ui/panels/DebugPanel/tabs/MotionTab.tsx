import React from 'react';
import { Section, Checkbox, Tooltip, Subsection, EvolverCard, Hint, colors } from '../../../design';
import { useEvolverStore, type PositionEvolverState } from '../../../../storeReact';
import { getAllMovers, getMover, schemaToRichParamDefs } from '../../../../core';

const positionEvolverNames = getAllMovers().map(m => m.name);

const positionTooltips: Record<string, string> = {
  rotate: 'Rotate line endpoints around the perimeter',
  rotateBreathing: 'Rotation with speed that pulses in and out',
  rotateReversing: 'Rotation that periodically reverses direction',
  breathe: 'Lines expand and contract rhythmically',
  breatheWavePattern: 'Breathing with wave offset between lines',
  oscillate: 'Lines swing back and forth',
  oscillateWave: 'Oscillation with wave pattern across lines',
  drift: 'Slow random wandering movement',
  driftWander: 'Drift with occasional direction changes',
  pulse: 'Sharp periodic bursts of movement',
  spiral: 'Endpoints trace spiral paths',
  vortex: 'Swirling vortex-like motion',
  waveInterference: 'Complex interference of multiple wave patterns',
  lissajous: 'Complex orbital patterns from frequency ratios',
  coupled: 'Coupled oscillators that synchronize',
  elastic: 'Spring-connected network of lines',
  rose: 'Mathematical rose curve patterns',
  pendulum: 'Physical pendulum motion',
  flocking: 'Bird-like flocking behavior',
  attractor: 'Lines drawn toward/repelled from attractors',
  chaotic: 'Lorenz attractor chaos',
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
    padding: '8px 0',
  } as React.CSSProperties,
  activeSection: {
    marginTop: '12px',
  } as React.CSSProperties,
  empty: {
    color: colors.borderMedium,
    fontStyle: 'italic',
    fontSize: '10px',
    padding: '8px 0',
  } as React.CSSProperties,
};

export function MotionTab() {
  const positionEvolversSelected = useEvolverStore((state) => state.positionEvolvers);
  const setPositionEvolvers = useEvolverStore((state) => state.setPositionEvolvers);

  // Get the type names from the current selection
  const selectedTypes = positionEvolversSelected.map(e => e.type);

  const handleToggle = (name: string, checked: boolean) => {
    if (checked) {
      // Add with default params (middle-range values)
      const def = getMover(name);
      const params: Record<string, number> = {};
      if (def) {
        const richParamDefs = schemaToRichParamDefs(def.params);
        for (const { name: paramName, paramType } of richParamDefs) {
          params[paramName] = paramType.decode(128);
        }
      }
      const newEvolver: PositionEvolverState = { type: name, params };
      setPositionEvolvers([...positionEvolversSelected, newEvolver]);
    } else {
      const filtered = positionEvolversSelected.filter(e => e.type !== name);
      setPositionEvolvers(filtered);
    }
  };

  const handleParamsChange = (index: number, newParams: Record<string, number>) => {
    const updated = [...positionEvolversSelected];
    updated[index] = { ...updated[index], params: newParams };
    setPositionEvolvers(updated);
  };

  const handleRemove = (index: number) => {
    const filtered = positionEvolversSelected.filter((_, i) => i !== index);
    setPositionEvolvers(filtered);
  };

  return (
    <>
      <Section title="Motions">
        <Hint>Multiple motions can be active simultaneously</Hint>
        <div style={styles.grid}>
          {positionEvolverNames.map((name) => (
            <Tooltip key={name} content={positionTooltips[name] || name}>
              <Checkbox
                label={name}
                checked={selectedTypes.includes(name)}
                onChange={(checked) => handleToggle(name, checked)}
              />
            </Tooltip>
          ))}
        </div>
      </Section>

      <div style={styles.activeSection}>
        <Subsection title="Active Motions">
          {positionEvolversSelected.length === 0 ? (
            <div style={styles.empty}>No evolvers selected</div>
          ) : (
            positionEvolversSelected.map((evolver, index) => {
              const def = getMover(evolver.type);
              const paramDefs = def ? schemaToRichParamDefs(def.params) : [];
              return (
                <EvolverCard
                  key={`${evolver.type}-${index}`}
                  name={evolver.type}
                  tooltip={positionTooltips[evolver.type]}
                  paramDefs={paramDefs}
                  params={evolver.params}
                  onParamsChange={(params) => handleParamsChange(index, params)}
                  onRemove={() => handleRemove(index)}
                />
              );
            })
          )}
        </Subsection>
      </div>
    </>
  );
}
