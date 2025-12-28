// ChordProgression placer - Lines with mathematically related chord lengths
// Creates patterns based on fixed angular relationships between endpoints

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

export const chordProgression = registerPlacer({
  id: 22,
  name: 'chordProgression',
  category: 'mathematical',
  description: 'Chords with fixed angular span (creates nested star patterns)',

  params: {
    span: {
      type: 'smallInt',
      default: 3,
      min: 1,
      max: 7,
      description: 'Chord span as fraction of perimeter (n/8)',
    },
    layers: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 3,
      description: 'Number of nested layers',
    },
  },

  randomize: {
    span: [1, 2, 3, 4, 5, 6, 7] as const,
    layers: [1, 2, 3] as const,
  },

  create: (count, options, { span, layers }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);
    const offset = rand(0, 4);

    // Chord span: span/8 * 4 = span/2 of the perimeter
    // span=1 → 0.5 (small chords), span=4 → 2.0 (diameters), span=7 → 3.5 (long chords)
    const chordLength = span / 2;

    const linesPerLayer = Math.floor(count / layers);
    const lines: Array<{
      perim0: number;
      perim1: number;
      speed0: number;
      speed1: number;
      dir0: number;
      dir1: number;
      lineWidth: number;
    }> = [];

    for (let layer = 0; layer < layers; layer++) {
      const layerOffset = (layer / layers) * (4 / linesPerLayer);

      for (let i = 0; i < linesPerLayer && lines.length < count; i++) {
        const p0 = (i / linesPerLayer) * 4 + offset + layerOffset;
        const p1 = p0 + chordLength;

        lines.push({
          perim0: mod(p0, 4),
          perim1: mod(p1, 4),
          speed0: speed,
          speed1: speed,
          dir0: dir,
          dir1: dir,
          lineWidth: width,
        });
      }
    }

    return lines;
  },
});