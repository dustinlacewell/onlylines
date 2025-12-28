// Billiards mover - elastic collision simulation between endpoints

import { registerMover } from '../../core/registry';
import { mod } from '../../utils';

interface Endpoint {
  offset: number;
  prevOffset: number;
  vel: number;
  basePos: number;
  lineIdx: number;
  isEnd1: boolean;
}

const COLLISION_RADIUS = 0.002;
const BUCKET_SIZE = 0.04;
const NUM_BUCKETS = Math.ceil(4 / BUCKET_SIZE);

export const billiards = registerMover({
  id: 7,
  name: 'billiards',
  category: 'physics',
  description: 'Elastic collision simulation between endpoints',

  params: {
    speed: {
      type: 'speed',
      default: 0.02,
      min: 0.005,
      max: 0.05,
      description: 'Movement speed',
    },
    speedVariation: {
      type: 'unit',
      default: 0.3,
      min: 0,
      max: 0.5,
      description: 'Speed variation (0.3 = 0.7x to 1.3x)',
    },
  },

  randomize: {
    speed: [0.01, 0.04],
    speedVariation: [0.1, 0.4],
  },

  create: ({ speed, speedVariation }) => {
    const effectiveSpeed = Math.max(speed, 0.005);
    const endpoints: Endpoint[] = [];
    const buckets: Map<number, Endpoint[]> = new Map();

    const getAbsolutePos = (ep: Endpoint): number => mod(ep.basePos + ep.offset, 4);
    const getBucket = (pos: number): number => Math.floor(mod(pos, 4) / BUCKET_SIZE);

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

    const getNeighborBuckets = (bucket: number): number[] => [
      mod(bucket - 1, NUM_BUCKETS),
      bucket,
      mod(bucket + 1, NUM_BUCKETS),
    ];

    const handleCollision = (a: Endpoint, b: Endpoint) => {
      const aPos = getAbsolutePos(a);
      const bPos = getAbsolutePos(b);
      const d1 = mod(bPos - aPos, 4);
      const d2 = mod(aPos - bPos, 4);
      const dist = Math.min(d1, d2);

      if (dist < COLLISION_RADIUS) {
        const tempVel = a.vel;
        a.vel = b.vel;
        b.vel = tempVel;

        const separation = (COLLISION_RADIUS - dist) / 2 + 0.001;
        if (d1 < d2) {
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
        const ep0Idx = ctx.index * 2;
        const ep1Idx = ctx.index * 2 + 1;

        if (!endpoints[ep0Idx]) {
          const speedMult0 = 1 + (Math.sin(ctx.index * 1.618) * speedVariation);
          const speedMult1 = 1 + (Math.cos(ctx.index * 2.718) * speedVariation);
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

        ep0.prevOffset = ep0.offset;
        ep1.prevOffset = ep1.offset;

        ep0.offset += ep0.vel * ctx.dt;
        ep1.offset += ep1.vel * ctx.dt;

        if (ctx.index === 0) {
          rebuildSpatialHash();
        }

        const bucket0 = getBucket(getAbsolutePos(ep0));
        const bucket1 = getBucket(getAbsolutePos(ep1));

        for (const neighborBucket of getNeighborBuckets(bucket0)) {
          const nearby = buckets.get(neighborBucket);
          if (nearby) {
            for (const other of nearby) {
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

        return { delta0: ep0.offset - ep0.prevOffset, delta1: ep1.offset - ep1.prevOffset };
      },
    };
  },
});
