// Billiards - elastic collision simulation between endpoints
// Each endpoint has an offset and velocity, colliding elastically with others
// Works in offset-space so it composes with other position evolvers

import type { PositionEvolver } from '../types';
import { mod } from '../../utils';

interface Endpoint {
  offset: number;      // Accumulated offset from base position (for collision detection)
  prevOffset: number;  // Offset at start of frame (to compute delta)
  vel: number;         // Velocity (perimeter units per second)
  basePos: number;     // Original position from distributor (for computing absolute pos)
  lineIdx: number;     // Which line this belongs to
  isEnd1: boolean;     // Is this endpoint 1 (vs endpoint 0)
}

// Fixed collision radius - small enough to feel like point collisions
const COLLISION_RADIUS = 0.002;

// Spatial hash bucket size - smaller = more precise but more buckets
const BUCKET_SIZE = 0.04;
const NUM_BUCKETS = Math.ceil(4 / BUCKET_SIZE);

/**
 * Billiards - Elastic collision simulation
 *
 * Endpoints move around the perimeter and bounce off each other
 * when they collide. Works in offset-space so it composes properly
 * with other position evolvers (rotate, breathe, etc).
 *
 * @param speed - Movement speed (default: 0.02, range ~0.005-0.05)
 * @param speedVariation - How much speeds vary (default: 0.3, meaning 0.7x to 1.3x)
 */
export const billiards = (
  speed = 0.02,
  speedVariation = 0.3
): PositionEvolver => {
  // Ensure minimum speed to avoid static simulation
  const effectiveSpeed = Math.max(speed, 0.005);
  // State arrays - indexed by line, then [endpoint0, endpoint1]
  const endpoints: Endpoint[] = [];

  // Spatial hash for O(n) collision detection
  const buckets: Map<number, Endpoint[]> = new Map();

  // Get absolute position (base + offset, wrapped to 0-4)
  const getAbsolutePos = (ep: Endpoint): number => {
    return mod(ep.basePos + ep.offset, 4);
  };

  const getBucket = (pos: number): number => {
    return Math.floor(mod(pos, 4) / BUCKET_SIZE);
  };

  const rebuildSpatialHash = () => {
    buckets.clear();
    for (const ep of endpoints) {
      if (ep) {
        const bucket = getBucket(getAbsolutePos(ep));
        if (!buckets.has(bucket)) buckets.set(bucket, []);
        buckets.get(bucket)!.push(ep);
      }
    }
  };

  const getNeighborBuckets = (bucket: number): number[] => {
    // Return this bucket and adjacent ones (wrapping around)
    return [
      mod(bucket - 1, NUM_BUCKETS),
      bucket,
      mod(bucket + 1, NUM_BUCKETS),
    ];
  };

  // Elastic collision in 1D with equal masses: velocities swap
  // We work with absolute positions for collision detection,
  // but adjust offsets to separate colliding endpoints
  const handleCollision = (a: Endpoint, b: Endpoint) => {
    const aPos = getAbsolutePos(a);
    const bPos = getAbsolutePos(b);

    // Distance on circular perimeter (shortest path)
    const d1 = mod(bPos - aPos, 4);
    const d2 = mod(aPos - bPos, 4);
    const dist = Math.min(d1, d2);

    if (dist < COLLISION_RADIUS) {
      // Elastic collision: swap velocities
      const tempVel = a.vel;
      a.vel = b.vel;
      b.vel = tempVel;

      // Separate them by adjusting offsets
      const separation = (COLLISION_RADIUS - dist) / 2 + 0.001;
      if (d1 < d2) {
        // b is "ahead" of a in the positive direction
        a.offset -= separation;
        b.offset += separation;
      } else {
        a.offset += separation;
        b.offset -= separation;
      }
    }
  };

  return {
    name: 'billiards',
    getValue: (ctx) => {
      // Lazy initialization for this specific line
      const ep0Idx = ctx.index * 2;
      const ep1Idx = ctx.index * 2 + 1;

      if (!endpoints[ep0Idx]) {
        // Initialize with varied velocities based on line index
        // Use golden ratio and e for pseudo-random but deterministic variation
        const speedMult0 = 1 + (Math.sin(ctx.index * 1.618) * speedVariation);
        const speedMult1 = 1 + (Math.cos(ctx.index * 2.718) * speedVariation);
        // Alternate directions for variety
        const dir0 = ctx.index % 2 === 0 ? 1 : -1;
        const dir1 = Math.floor(ctx.index / 2) % 2 === 0 ? 1 : -1;

        endpoints[ep0Idx] = {
          offset: 0,
          prevOffset: 0,
          vel: effectiveSpeed * 0.1 * speedMult0 * dir0,
          basePos: ctx.line.perim0,
          lineIdx: ctx.index,
          isEnd1: false,
        };
        endpoints[ep1Idx] = {
          offset: 0,
          prevOffset: 0,
          vel: effectiveSpeed * 0.1 * speedMult1 * dir1,
          basePos: ctx.line.perim1,
          lineIdx: ctx.index,
          isEnd1: true,
        };
      }

      const ep0 = endpoints[ep0Idx];
      const ep1 = endpoints[ep1Idx];

      // Save previous offsets to compute frame delta later
      ep0.prevOffset = ep0.offset;
      ep1.prevOffset = ep1.offset;

      // Update offsets based on velocity
      ep0.offset += ep0.vel * ctx.dt;
      ep1.offset += ep1.vel * ctx.dt;

      // Rebuild spatial hash once per frame (when processing first line)
      if (ctx.index === 0) {
        rebuildSpatialHash();
      }

      // Check collisions with nearby endpoints
      const pos0 = getAbsolutePos(ep0);
      const pos1 = getAbsolutePos(ep1);
      const bucket0 = getBucket(pos0);
      const bucket1 = getBucket(pos1);

      for (const neighborBucket of getNeighborBuckets(bucket0)) {
        const nearby = buckets.get(neighborBucket);
        if (nearby) {
          for (const other of nearby) {
            // Don't collide with self or own other endpoint
            if (other.lineIdx !== ctx.index) {
              handleCollision(ep0, other);
            }
          }
        }
      }

      for (const neighborBucket of getNeighborBuckets(bucket1)) {
        const nearby = buckets.get(neighborBucket);
        if (nearby) {
          for (const other of nearby) {
            if (other.lineIdx !== ctx.index) {
              handleCollision(ep1, other);
            }
          }
        }
      }

      // Return frame delta (change in offset this frame) - stacks with other evolvers
      return { delta0: ep0.offset - ep0.prevOffset, delta1: ep1.offset - ep1.prevOffset };
    },
  };
};
