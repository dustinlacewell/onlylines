import { mod } from '../utils';
import type { LineConfig } from '../types';

export function makeLine(
  perim0: number,
  perim1: number,
  speed: number,
  dir: number,
  lineWidth: number
): LineConfig {
  return {
    perim0: mod(perim0, 4),
    perim1: mod(perim1, 4),
    speed0: speed,
    speed1: speed,
    dir0: dir,
    dir1: dir,
    lineWidth,
  };
}
