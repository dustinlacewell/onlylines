import { Section, Select, Row, Tooltip, Subsection, ParamEditor, Hint } from '../../../design';
import { useEvolverStore, type DistributionState } from '../../../../storeReact';
import { getAllPlacers, getPlacer, schemaToParamDefs } from '../../../../core';

const distributionNames = getAllPlacers().map(p => p.name);

const distributionTooltips: Record<string, string> = {
  // Radial
  star: 'Lines radiate from center to edges like a starburst',
  starBurst: 'Star pattern with varied line lengths',
  symmetricSpokes: 'Evenly spaced radial spokes with n-fold symmetry',
  // Concentric
  concentricRings: 'Circular rings emanating from center',
  nestedPolygons: 'Geometric shapes nested inside each other',
  // Spiral
  spiral: 'Single spiral from center outward',
  doubleSpiral: 'Two intertwined spirals',
  goldenSpiral: 'Spiral following golden ratio proportions',
  sunflower: 'Phyllotactic pattern like sunflower seeds',
  // Wave
  sineWave: 'Smooth sine wave pattern with configurable waves and amplitude',
  standingWave: 'Stationary wave with nodes',
  interference: 'Overlapping wave interference pattern',
  // Symmetry
  bilateral: 'Mirror symmetry across center',
  rotationalSymmetry: 'Rotationally symmetric pattern',
  kaleidoscope: 'Kaleidoscopic reflection pattern',
  // Grid
  grid: 'Regular grid of lines',
  woven: 'Interlaced woven pattern',
  // Mathematical
  lissajous: 'Lissajous curve pattern with frequency ratios',
  roseCurve: 'Mathematical rose/rhodonea pattern',
  modularPattern: 'Modular arithmetic pattern',
  // Special
  opposing: 'Lines connect opposing edges',
  vortex: 'Swirling vortex pattern',
  web: 'Spider web-like radial and circular lines',
};

export function ShapeTab() {
  const distribution = useEvolverStore((state) => state.distribution);
  const setDistribution = useEvolverStore((state) => state.setDistribution);
  const setDistributionParams = useEvolverStore((state) => state.setDistributionParams);

  const tooltip = distributionTooltips[distribution.type] || 'Select a distribution pattern';
  const def = getPlacer(distribution.type);
  const paramDefs = def ? schemaToParamDefs(def.params) : [];
  const hasParams = paramDefs.length > 0;

  const handleTypeChange = (newType: string) => {
    // When changing type, initialize with default params
    const placerDef = getPlacer(newType);
    const params: Record<string, number> = {};
    if (placerDef) {
      const placerParamDefs = schemaToParamDefs(placerDef.params);
      for (const [paramName, paramType] of placerParamDefs) {
        params[paramName] = paramType.decode(128); // Middle value
      }
    }
    const newState: DistributionState = { type: newType, params };
    setDistribution(newState);
  };

  return (
    <Section title="Shape">
      <Tooltip content={tooltip}>
        <Row label="Pattern">
          <Select
            value={distribution.type}
            options={distributionNames}
            onChange={handleTypeChange}
          />
        </Row>
      </Tooltip>

      {hasParams && (
        <Subsection title="Parameters">
          <ParamEditor
            paramDefs={paramDefs}
            values={distribution.params}
            onChange={setDistributionParams}
          />
        </Subsection>
      )}

      <Hint>
        {hasParams
          ? 'Adjust parameters to customize the pattern'
          : 'This distribution has no adjustable parameters'}
      </Hint>
    </Section>
  );
}
