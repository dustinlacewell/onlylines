import { mod } from './utils';
import { perimeterToWallPos, wallToXY } from './geometry';
import type { LineConfig } from './types';
import type { World } from './world';

export class Line {
  index: number;
  perim0: number;
  perim1: number;
  speed0: number;
  speed1: number;
  baseSpeed: number;
  dir0: number;
  dir1: number;
  lineWidth: number;
  alpha: number;
  brightness: number;

  constructor(config: LineConfig, index: number) {
    this.index = index;
    this.perim0 = mod(config.perim0, 4);
    this.perim1 = mod(config.perim1, 4);
    this.speed0 = config.speed0 ?? 0.1;
    this.speed1 = config.speed1 ?? 0.1;
    this.baseSpeed = (this.speed0 + this.speed1) / 2;
    this.dir0 = config.dir0 ?? 1;
    this.dir1 = config.dir1 ?? 1;
    this.lineWidth = config.lineWidth ?? 1;
    this.alpha = config.alpha ?? 1;
    this.brightness = config.brightness ?? 0.5;
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, world: World): void {
    const wp0 = perimeterToWallPos(this.perim0);
    const wp1 = perimeterToWallPos(this.perim1);
    const [x0, y0] = wallToXY(wp0.wall, wp0.pos, W, H);
    const [x1, y1] = wallToXY(wp1.wall, wp1.pos, W, H);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    // Use world methods to get computed values (supports both legacy and evolvers)
    ctx.strokeStyle = world.getLineColor(this, this.index);
    ctx.globalAlpha = world.getLineAlpha(this, this.index);
    ctx.lineWidth = world.getLineWidth(this, this.index);

    // Apply dash pattern
    const dash = world.getLineDash(this, this.index);
    ctx.setLineDash(dash.pattern);
    ctx.lineDashOffset = dash.offset;

    ctx.stroke();

    // Reset for next line
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }
}
