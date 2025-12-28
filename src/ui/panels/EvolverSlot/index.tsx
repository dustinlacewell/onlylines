import { Section } from '../../design';
import { MapperSelect } from './MapperSelect';
import { MapperOptions } from './MapperOptions';
import { MotionConfig } from './MotionConfig';
import { DashOutput, AlphaOutput, ColorOutput, LineWidthOutput } from './outputs';
import { useEvolverStore } from '../../../storeReact';
import type { MotionConfig as MotionConfigType } from '../../../evolvers/system';

type SlotKey = 'dash' | 'alpha' | 'color' | 'lineWidth';

export interface EvolverSlotProps {
  slot: SlotKey;
  title: string;
}

export function EvolverSlot({ slot, title }: EvolverSlotProps) {
  const slotState = useEvolverStore((state) => state[slot]);
  const setSlotEnabled = useEvolverStore((state) => state.setSlotEnabled);
  const setSlotMapper = useEvolverStore((state) => state.setSlotMapper);
  const setSlotMapperOptions = useEvolverStore((state) => state.setSlotMapperOptions);
  const updateSlotMotion = useEvolverStore((state) => state.updateSlotMotion);

  // Output setters
  const setDashOutput = useEvolverStore((state) => state.setDashOutput);
  const setAlphaOutput = useEvolverStore((state) => state.setAlphaOutput);
  const setColorOutput = useEvolverStore((state) => state.setColorOutput);
  const setLineWidthOutput = useEvolverStore((state) => state.setLineWidthOutput);

  const handleMotionChange = (updates: Partial<MotionConfigType>) => {
    updateSlotMotion(slot, updates);
  };

  const handleMapperOptionsChange = (options: Record<string, unknown>) => {
    setSlotMapperOptions(slot, options);
  };

  const renderOutput = () => {
    switch (slot) {
      case 'dash':
        return (
          <DashOutput
            output={slotState.output as { dashLen: number; maxGap: number; marching: number }}
            onChange={setDashOutput}
          />
        );
      case 'alpha':
        return (
          <AlphaOutput
            output={slotState.output as { min: number; max: number }}
            onChange={setAlphaOutput}
          />
        );
      case 'color':
        return (
          <ColorOutput
            output={slotState.output as { palette: string }}
            onChange={setColorOutput}
          />
        );
      case 'lineWidth':
        return (
          <LineWidthOutput
            output={slotState.output as { min: number; max: number }}
            onChange={setLineWidthOutput}
          />
        );
    }
  };

  return (
    <Section
      title={title}
      enabled={slotState.enabled}
      onToggle={(enabled) => setSlotEnabled(slot, enabled)}
    >
      <MapperSelect
        value={slotState.mapper}
        onChange={(mapper) => setSlotMapper(slot, mapper)}
      />
      <MapperOptions
        mapperName={slotState.mapper}
        options={slotState.mapperOptions}
        onChange={handleMapperOptionsChange}
      />
      <MotionConfig
        motion={slotState.motion}
        onChange={handleMotionChange}
      />
      {renderOutput()}
    </Section>
  );
}

// Re-export sub-components for direct use if needed
export { MapperSelect } from './MapperSelect';
export { MapperOptions } from './MapperOptions';
export { MotionConfig } from './MotionConfig';
export * from './outputs';
