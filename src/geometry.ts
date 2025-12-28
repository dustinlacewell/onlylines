import { mod } from './utils';

export interface WallPos {
  wall: number;
  pos: number;
}

export const wallToXY = (
  wall: number,
  pos: number,
  W: number,
  H: number
): [number, number] => {
  switch (wall) {
    case 0:
      return [pos * W, 0];
    case 1:
      return [W, pos * H];
    case 2:
      return [(1 - pos) * W, H];
    case 3:
      return [0, (1 - pos) * H];
    default:
      return [0, 0];
  }
};

export const perimeterToWallPos = (t: number): WallPos => {
  const wall = Math.floor(t) % 4;
  const pos = t - Math.floor(t);
  return { wall, pos };
};

export const wallPosToPerimeter = (wall: number, pos: number): number => wall + pos;

export const advancePerimeter = (p: number, delta: number): number => mod(p + delta, 4);
