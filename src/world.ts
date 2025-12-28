import type { WorldConfig, World as IWorld, EvolverSet } from './types';
import type { Line } from './line';
import { makeLineContext, type DashValue } from './evolvers/types';
import { mod } from './utils';

export class World implements IWorld {
  time = 0;
  lines: Line[] = [];
  config: Partial<WorldConfig> = {};

  evolvers: EvolverSet = {
    position: [],
    color: null,
    alpha: null,
    lineWidth: null,
    dash: null,
  };

  update(dt: number): void {
    this.time += dt;

    // Apply per-line position evolvers
    if (this.evolvers.position.length > 0) {
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        const ctx = makeLineContext(line, i, this, dt);

        let totalDelta0 = 0;
        let totalDelta1 = 0;

        for (const evolver of this.evolvers.position) {
          const { delta0, delta1 } = evolver.getValue(ctx);
          totalDelta0 += delta0;
          totalDelta1 += delta1;
        }

        line.perim0 = mod(line.perim0 + totalDelta0, 4);
        line.perim1 = mod(line.perim1 + totalDelta1, 4);
      }
    }
  }

  getLineColor(line: Line, index: number): string {
    if (this.evolvers.color) {
      const ctx = makeLineContext(line, index, this, 0);
      return this.evolvers.color.getValue(ctx);
    }
    return 'white';
  }

  getLineAlpha(line: Line, index: number): number {
    if (this.evolvers.alpha) {
      const ctx = makeLineContext(line, index, this, 0);
      return this.evolvers.alpha.getValue(ctx);
    }
    return line.alpha;
  }

  getLineWidth(line: Line, index: number): number {
    if (this.evolvers.lineWidth) {
      const ctx = makeLineContext(line, index, this, 0);
      return this.evolvers.lineWidth.getValue(ctx);
    }
    return line.lineWidth;
  }

  getLineDash(line: Line, index: number): DashValue {
    if (this.evolvers.dash) {
      const ctx = makeLineContext(line, index, this, 0);
      return this.evolvers.dash.getValue(ctx);
    }
    return { pattern: [], offset: 0 };
  }
}
