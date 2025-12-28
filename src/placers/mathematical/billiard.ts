// Billiard placer - Simulates a ball bouncing inside a square
// Each line connects consecutive bounce points on the perimeter
//
// Mathematical basis: In a square billiard, a trajectory with rational slope p/q
// (coprime integers) produces a closed periodic orbit. The ball returns to its
// starting point after bouncing exactly 2(p+q) times off the walls.

import { registerPlacer } from '../../core/registry';
import { rand, pick, mod } from '../../utils';

// Rational slopes that produce closed orbits, ordered by visual interest
// Each [p, q] gives slope p/q, closing after 2(p+q) bounces
const RATIONAL_SLOPES: [number, number][] = [
  [1, 1],  // 0: 45°, 4 bounces (diamond)
  [1, 2],  // 1: ~26.6°, 6 bounces
  [2, 1],  // 2: ~63.4°, 6 bounces
  [1, 3],  // 3: ~18.4°, 8 bounces
  [3, 1],  // 4: ~71.6°, 8 bounces
  [2, 3],  // 5: ~33.7°, 10 bounces
  [3, 2],  // 6: ~56.3°, 10 bounces
  [1, 4],  // 7: ~14.0°, 10 bounces
  [4, 1],  // 8: ~76.0°, 10 bounces
  [3, 4],  // 9: ~36.9°, 14 bounces
  [4, 3],  // 10: ~53.1°, 14 bounces
];

// Convert (x, y) on boundary back to perimeter position
// Perimeter layout: 0-1 top, 1-2 right, 2-3 bottom, 3-4 left
function xyToPerim(x: number, y: number): number {
  const eps = 1e-9;
  if (Math.abs(y) < eps) return x; // top edge
  if (Math.abs(x - 1) < eps) return 1 + y; // right edge
  if (Math.abs(y - 1) < eps) return 2 + (1 - x); // bottom edge
  if (Math.abs(x) < eps) return 3 + (1 - y); // left edge
  return 0;
}

// Compute next bounce point given current position and velocity
function nextBounce(
  x: number,
  y: number,
  vx: number,
  vy: number
): { x: number; y: number; vx: number; vy: number } {
  // Time to hit each wall (must be positive, so we move forward)
  const eps = 1e-9;
  const tRight = vx > eps ? (1 - x) / vx : Infinity;
  const tLeft = vx < -eps ? -x / vx : Infinity;
  const tBottom = vy > eps ? (1 - y) / vy : Infinity;
  const tTop = vy < -eps ? -y / vy : Infinity;

  const tMin = Math.min(tRight, tLeft, tBottom, tTop);

  const newX = x + vx * tMin;
  const newY = y + vy * tMin;

  // Reflect velocity based on which wall was hit
  let newVx = vx;
  let newVy = vy;

  if (tMin === tRight || tMin === tLeft) {
    newVx = -vx;
  }
  if (tMin === tBottom || tMin === tTop) {
    newVy = -vy;
  }

  // Clamp to boundary
  return {
    x: Math.max(0, Math.min(1, newX)),
    y: Math.max(0, Math.min(1, newY)),
    vx: newVx,
    vy: newVy,
  };
}

// Compute bounce points analytically for a rational slope p/q starting from center
// Returns array of perimeter positions for one complete orbit
function computeAnalyticOrbit(p: number, q: number): number[] {
  const points: number[] = [];
  const numBounces = 2 * (p + q);

  // Starting from center (0.5, 0.5), going toward bottom-right with slope p/q
  // The ball hits walls at predictable intervals
  //
  // Key insight: In a square billiard, we can "unfold" the reflections.
  // The ball travels in a straight line on an infinite grid of reflected squares.
  // For slope p/q, it crosses q horizontal lines and p vertical lines per period.

  // From center going +x, +y with slope p/q:
  // Time to right wall: 0.5/1 = 0.5 (in x units)
  // Time to bottom wall: 0.5/(p/q) = 0.5*q/p (in x units)

  // Simulate once to get exact points, then store them
  let x = 0.5;
  let y = 0.5;
  let vx = q; // Use integer velocity components for exact arithmetic
  let vy = p;

  for (let i = 0; i < numBounces; i++) {
    // Time to hit each wall (using rationals effectively)
    const tRight = vx > 0 ? (1 - x) / vx : Infinity;
    const tLeft = vx < 0 ? -x / -vx : Infinity;
    const tBottom = vy > 0 ? (1 - y) / vy : Infinity;
    const tTop = vy < 0 ? -y / -vy : Infinity;

    const tMin = Math.min(tRight, tLeft, tBottom, tTop);

    x = x + vx * tMin;
    y = y + vy * tMin;

    // Snap to exact boundary to avoid floating point drift
    if (Math.abs(x) < 1e-9) x = 0;
    if (Math.abs(x - 1) < 1e-9) x = 1;
    if (Math.abs(y) < 1e-9) y = 0;
    if (Math.abs(y - 1) < 1e-9) y = 1;

    points.push(xyToPerim(x, y));

    // Reflect
    if (tMin === tRight || tMin === tLeft) vx = -vx;
    if (tMin === tBottom || tMin === tTop) vy = -vy;
  }

  return points;
}

export const billiard = registerPlacer({
  id: 21,
  name: 'billiard',
  category: 'mathematical',
  description: 'Ball bouncing inside a square (closed polygonal orbits)',

  params: {
    ratio: {
      type: 'smallInt',
      default: 1,
      min: 1,
      max: 11,
      description: 'Rational slope index (1=diamond, 2-3=hexagon, etc.)',
    },
    drift: {
      type: 'signedUnit',
      default: 0,
      min: -1,
      max: 1,
      description: 'Deviation from perfect rational angle (0=closed loop)',
    },
  },

  randomize: {
    ratio: [1, 2, 3, 4, 5, 6, 7] as const,
    drift: [-0.1, 0.1],
  },

  create: (count, options, { ratio, drift }) => {
    const speed = options.speed ?? rand(0.06, 0.12);
    const width = options.lineWidth ?? 1;
    const dir = pick([-1, 1]);

    // Get the rational slope p/q for closed orbit
    const [p, q] = RATIONAL_SLOPES[Math.min(ratio - 1, RATIONAL_SLOPES.length - 1)];

    const lines: Array<{
      perim0: number;
      perim1: number;
      speed0: number;
      speed1: number;
      dir0: number;
      dir1: number;
      lineWidth: number;
    }> = [];

    // When drift is ~0, use analytic orbit to avoid floating point errors
    // This gives perfect closed loops that repeat exactly
    const usePerfectLoop = Math.abs(drift) < 0.01;

    if (usePerfectLoop) {
      // Compute the exact orbit points once, then cycle through them
      const orbitPoints = computeAnalyticOrbit(p, q);
      const orbitLen = orbitPoints.length;

      for (let i = 0; i < count; i++) {
        const p0 = orbitPoints[i % orbitLen];
        const p1 = orbitPoints[(i + 1) % orbitLen];

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
    } else {
      // With drift, use simulation - floating point errors are fine
      // since we're intentionally breaking the perfect loop
      const baseTheta = Math.atan2(p, q);
      const driftRadians = drift * 0.1 * 0.15;
      const theta = baseTheta + driftRadians;

      const vxBase = Math.cos(theta);
      const vyBase = Math.sin(theta);

      let vx = Math.abs(vxBase);
      let vy = Math.abs(vyBase);

      // First, trace from center to the first wall hit
      const firstBounce = nextBounce(0.5, 0.5, vx, vy);
      let x = firstBounce.x;
      let y = firstBounce.y;
      let currentVx = firstBounce.vx;
      let currentVy = firstBounce.vy;

      for (let i = 0; i < count; i++) {
        const p0 = xyToPerim(x, y);
        const bounce = nextBounce(x, y, currentVx, currentVy);
        const p1 = xyToPerim(bounce.x, bounce.y);

        lines.push({
          perim0: mod(p0, 4),
          perim1: mod(p1, 4),
          speed0: speed,
          speed1: speed,
          dir0: dir,
          dir1: dir,
          lineWidth: width,
        });

        x = bounce.x;
        y = bounce.y;
        currentVx = bounce.vx;
        currentVy = bounce.vy;
      }
    }

    return lines;
  },
});