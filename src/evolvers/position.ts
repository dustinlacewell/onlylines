// Position evolvers - animate endpoint positions using wave functions
import type { PositionEvolver } from './types';
import type { PositionEvolverState } from '../serialize';
import { breathe as breatheWave, pulse as pulseWave, sine } from './waves';
import { TAU } from '../utils';

// === BASIC POSITION EVOLVERS ===

// Constant rotation - endpoints travel around perimeter
export const rotate = (speed = 0.1): PositionEvolver => ({
  name: 'rotate',
  getValue: (ctx) => {
    const delta = speed * ctx.line.dir0 * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// Rotation with breathing speed variation
export const rotateBreathing = (
  baseSpeed = 0.08,
  speedVariation = 0.05,
  breatheSpeed = 0.3
): PositionEvolver => {
  const wave = breatheWave(breatheSpeed, 1);
  return {
    name: 'rotateBreathing',
    getValue: (ctx) => {
      const speedMod = wave(ctx);
      const speed = baseSpeed + speedVariation * speedMod;
      const delta = speed * ctx.line.dir0 * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Rotation that periodically reverses
export const rotateReversing = (speed = 0.1, reversePeriod = 5): PositionEvolver => ({
  name: 'rotateReversing',
  getValue: (ctx) => {
    const phase = Math.floor(ctx.time / reversePeriod) % 2;
    const dir = phase === 0 ? 1 : -1;
    const delta = speed * dir * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === BREATHING EVOLVERS ===

// Endpoints move toward/away from each other (line length changes)
// Uses derivative of sine for smooth oscillation
export const breathe = (amplitude = 0.2, speed = 0.3): PositionEvolver => {
  return {
    name: 'breathe',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * 0.3;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  };
};

// Breathing with wave pattern across lines
export const breatheWavePattern = (
  amplitude = 0.15,
  speed = 0.2,
  phaseSpread = 0.5
): PositionEvolver => {
  return {
    name: 'breatheWave',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * phaseSpread;
      // Derivative of sin(t) is cos(t), scaled by speed and 2*PI
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt / 2;
      return { delta0: -delta, delta1: delta };
    },
  };
};

// === OSCILLATION EVOLVERS ===

// Oscillate both endpoints together (line slides back and forth)
export const oscillate = (amplitude = 0.3, speed = 0.25): PositionEvolver => {
  return {
    name: 'oscillate',
    getValue: (ctx) => {
      const phase = (ctx.index / ctx.total) * 0.5;
      // Derivative of sin(t) is cos(t)
      const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
      const delta = velocity * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Oscillate with wave pattern
export const oscillateWave = (
  amplitude = 0.2,
  speed = 0.2,
  waves = 2
): PositionEvolver => ({
  name: 'oscillateWave',
  getValue: (ctx) => {
    const phase = (ctx.index / ctx.total) * waves;
    // Derivative of sin(t) is cos(t)
    const velocity = Math.cos((ctx.time * speed + phase) * TAU) * speed * TAU * amplitude;
    const delta = velocity * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === DRIFT EVOLVERS ===

// Slow random-ish drift
export const drift = (speed = 0.04): PositionEvolver => ({
  name: 'drift',
  getValue: (ctx) => {
    const delta = ctx.line.speed0 * ctx.line.dir0 * speed * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// Drift with wandering direction changes
export const driftWander = (speed = 0.05, wanderSpeed = 0.1): PositionEvolver => {
  const wave = sine(wanderSpeed, 1);
  return {
    name: 'driftWander',
    getValue: (ctx) => {
      const wander = wave(ctx) * 0.5;
      const baseSpeed = ctx.line.speed0 * speed;
      const delta0 = (ctx.line.dir0 + wander) * baseSpeed * ctx.dt;
      const delta1 = (ctx.line.dir1 - wander) * baseSpeed * ctx.dt;
      return { delta0, delta1 };
    },
  };
};

// === PULSE EVOLVERS ===

// Periodic pulses that move endpoints
export const pulse = (strength = 0.03, speed = 0.2, phaseSpread = 0.5): PositionEvolver => {
  const wave = pulseWave(speed, 4, phaseSpread);
  return {
    name: 'pulse',
    getValue: (ctx) => {
      // Use the wave value directly as a velocity multiplier
      const v = wave(ctx) * strength;
      const delta = v * ctx.dt;
      return { delta0: delta * ctx.line.dir0, delta1: delta * ctx.line.dir1 };
    },
  };
};

// === SPIRAL/VORTEX EVOLVERS ===

// Spiral - rotation that speeds up toward center
export const spiral = (rotationSpeed = 0.1, contractionSpeed = 0.05): PositionEvolver => ({
  name: 'spiral',
  getValue: (ctx) => {
    // Rotation
    const rotDelta = rotationSpeed * ctx.dt;

    // Contract/expand based on position
    const breatheDelta = Math.sin(ctx.time * 0.5) * contractionSpeed * ctx.dt;

    return {
      delta0: rotDelta + breatheDelta,
      delta1: rotDelta - breatheDelta,
    };
  },
});

// Vortex - endpoints orbit around line center
export const vortex = (orbitSpeed = 0.15, wobble = 0.05): PositionEvolver => ({
  name: 'vortex',
  getValue: (ctx) => {
    const phase = ctx.index * 0.1;
    const orbit0 = Math.sin(ctx.time * orbitSpeed + phase) * wobble;
    const orbit1 = Math.cos(ctx.time * orbitSpeed + phase) * wobble;
    return { delta0: orbit0 * ctx.dt, delta1: orbit1 * ctx.dt };
  },
});

// === PHYSICS EVOLVERS ===

// Wave interference pattern
export const waveInterference = (freq1 = 0.2, freq2 = 0.3, amp = 0.3): PositionEvolver => ({
  name: 'waveInterference',
  getValue: (ctx) => {
    const pos = ctx.index / ctx.total;
    // Derivatives: d/dt sin(t) = cos(t)
    const vel1 = Math.cos(ctx.time * freq1 * TAU + pos * TAU * 2) * freq1 * TAU;
    const vel2 = Math.cos(ctx.time * freq2 * TAU + pos * TAU * 3) * freq2 * TAU;
    const velocity = (vel1 + vel2) / 2 * amp;
    const delta = velocity * ctx.dt;
    return { delta0: delta, delta1: delta };
  },
});

// === NEW FANCY EVOLVERS ===

// Lissajous - complex orbital patterns from frequency ratios
export const lissajous = (
  freqX = 3,
  freqY = 2,
  amplitude = 0.15,
  speed = 0.1,
  phase = 0
): PositionEvolver => ({
  name: 'lissajous',
  getValue: (ctx) => {
    const t = ctx.time * speed;
    const linePhase = (ctx.index / ctx.total) * TAU;
    // Derivatives of sin/cos for velocity
    const velX = Math.cos(t * freqX + linePhase + phase) * freqX * speed * amplitude;
    const velY = -Math.sin(t * freqY + linePhase) * freqY * speed * amplitude;
    return { delta0: velX * ctx.dt, delta1: velY * ctx.dt };
  },
});

// Coupled oscillators - Kuramoto model for synchronization
export const coupled = (
  coupling = 0.1,
  naturalFreq = 0.2,
  damping = 0.02
): PositionEvolver => {
  // Per-line phase state (initialized lazily)
  const phases: number[] = [];
  return {
    name: 'coupled',
    getValue: (ctx) => {
      // Initialize phase if needed
      if (phases[ctx.index] === undefined) {
        phases[ctx.index] = (ctx.index / ctx.total) * TAU;
      }

      // Kuramoto coupling: phase tends toward neighbors
      const myPhase = phases[ctx.index];
      const leftIdx = (ctx.index - 1 + ctx.total) % ctx.total;
      const rightIdx = (ctx.index + 1) % ctx.total;
      const leftPhase = phases[leftIdx] ?? myPhase;
      const rightPhase = phases[rightIdx] ?? myPhase;

      // Coupling force
      const coupleForce = coupling * (
        Math.sin(leftPhase - myPhase) +
        Math.sin(rightPhase - myPhase)
      );

      // Update phase
      const phaseVel = naturalFreq + coupleForce;
      phases[ctx.index] += phaseVel * ctx.dt;

      // Damped oscillation based on phase
      const velocity = Math.cos(phases[ctx.index]) * (1 - damping);
      const delta = velocity * ctx.dt * 0.1;
      return { delta0: delta, delta1: -delta };
    },
  };
};

// Elastic network - spring connections to neighbors
export const elastic = (
  stiffness = 0.5,
  damping = 0.1,
  radius = 3
): PositionEvolver => {
  // Per-line velocity state
  const velocities: number[] = [];
  return {
    name: 'elastic',
    getValue: (ctx) => {
      if (velocities[ctx.index] === undefined) {
        velocities[ctx.index] = 0;
      }

      // Spring force from neighbors within radius
      let force = 0;
      for (let offset = -radius; offset <= radius; offset++) {
        if (offset === 0) continue;
        const neighborIdx = (ctx.index + offset + ctx.total) % ctx.total;
        // Displacement approximated by position difference
        const displacement = Math.sin((neighborIdx - ctx.index) / ctx.total * TAU + ctx.time * 0.2);
        force += displacement * stiffness / Math.abs(offset);
      }

      // Update velocity with damping
      velocities[ctx.index] += force * ctx.dt;
      velocities[ctx.index] *= (1 - damping);

      const delta = velocities[ctx.index] * ctx.dt;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Rose curve - mathematical rose patterns
export const rose = (
  n = 5,
  d = 3,
  amplitude = 0.15,
  speed = 0.1
): PositionEvolver => ({
  name: 'rose',
  getValue: (ctx) => {
    const k = n / d;
    const t = ctx.time * speed + (ctx.index / ctx.total) * TAU;
    // Rose curve: r = cos(k*theta), we animate theta
    // Velocity is derivative of position
    const rVel = -Math.sin(k * t) * k * speed;
    const thetaVel = speed;
    // Convert polar velocity to delta
    const delta = (rVel + Math.cos(t) * thetaVel) * amplitude * ctx.dt;
    return { delta0: delta, delta1: -delta * 0.5 };
  },
});

// Pendulum - physical pendulum motion with gravity
export const pendulum = (
  length = 0.5,
  gravity = 0.3,
  damping = 0.02
): PositionEvolver => {
  const angles: number[] = [];
  const angularVels: number[] = [];
  return {
    name: 'pendulum',
    getValue: (ctx) => {
      if (angles[ctx.index] === undefined) {
        // Start at different angles based on position
        angles[ctx.index] = ((ctx.index / ctx.total) - 0.5) * Math.PI * 0.8;
        angularVels[ctx.index] = 0;
      }

      // Pendulum physics: d²θ/dt² = -g/L * sin(θ) - damping * dθ/dt
      const angularAccel = -gravity / length * Math.sin(angles[ctx.index]) - damping * angularVels[ctx.index];
      angularVels[ctx.index] += angularAccel * ctx.dt;
      angles[ctx.index] += angularVels[ctx.index] * ctx.dt;

      // Convert angular motion to position delta
      const delta = angularVels[ctx.index] * length * ctx.dt * 0.3;
      return { delta0: delta, delta1: delta };
    },
  };
};

// Flocking - boids-like behavior
export const flocking = (
  separation = 0.8,
  alignment = 0.5,
  cohesion = 0.3,
  maxSpeed = 0.2
): PositionEvolver => {
  const velocities: Array<{ vx: number; vy: number }> = [];
  return {
    name: 'flocking',
    getValue: (ctx) => {
      if (!velocities[ctx.index]) {
        velocities[ctx.index] = { vx: 0, vy: 0 };
      }

      const vel = velocities[ctx.index];
      const pos = ctx.index / ctx.total;

      // Simple flocking forces (neighbors are adjacent indices)
      const leftIdx = (ctx.index - 1 + ctx.total) % ctx.total;
      const rightIdx = (ctx.index + 1) % ctx.total;
      const leftPos = leftIdx / ctx.total;
      const rightPos = rightIdx / ctx.total;

      // Separation: avoid crowding
      const sepX = (pos - leftPos) * separation + (pos - rightPos) * separation;

      // Alignment: match neighbor velocities
      const leftVel = velocities[leftIdx] ?? { vx: 0, vy: 0 };
      const rightVel = velocities[rightIdx] ?? { vx: 0, vy: 0 };
      const alignX = ((leftVel.vx + rightVel.vx) / 2 - vel.vx) * alignment;

      // Cohesion: move toward center
      const centerPos = (leftPos + rightPos) / 2;
      const cohX = (centerPos - pos) * cohesion;

      // Update velocity
      vel.vx += (sepX + alignX + cohX) * ctx.dt;

      // Limit speed
      const speed = Math.abs(vel.vx);
      if (speed > maxSpeed) {
        vel.vx = (vel.vx / speed) * maxSpeed;
      }

      return { delta0: vel.vx * ctx.dt, delta1: vel.vx * ctx.dt * 0.8 };
    },
  };
};

// Attractor - lines drawn toward/repelled from moving point
export const attractor = (
  strength = 0.5,
  falloff = 0.3,
  orbitSpeed = 0.1
): PositionEvolver => ({
  name: 'attractor',
  getValue: (ctx) => {
    // Attractor position orbits the center
    const attractorPos = 0.5 + Math.sin(ctx.time * orbitSpeed) * 0.3;
    const linePos = ctx.index / ctx.total;

    // Distance from attractor
    const dist = Math.abs(linePos - attractorPos);
    const force = strength / (dist + falloff);

    // Direction toward/away from attractor
    const dir = linePos < attractorPos ? 1 : -1;
    const delta = force * dir * ctx.dt * 0.05;

    return { delta0: delta, delta1: delta };
  },
});

// Chaotic - Lorenz attractor inspired chaos
export const chaotic = (
  sigma = 0.3,
  rho = 0.5,
  beta = 0.1,
  scale = 0.2
): PositionEvolver => {
  // Per-line state
  const states: Array<{ x: number; y: number; z: number }> = [];
  return {
    name: 'chaotic',
    getValue: (ctx) => {
      if (!states[ctx.index]) {
        // Initialize with slight variation per line
        states[ctx.index] = {
          x: 0.1 + (ctx.index / ctx.total) * 0.1,
          y: 0,
          z: 0,
        };
      }

      const s = states[ctx.index];

      // Lorenz equations (scaled down for stability)
      const dx = sigma * (s.y - s.x);
      const dy = s.x * (rho - s.z) - s.y;
      const dz = s.x * s.y - beta * s.z;

      // Update state with small timestep
      const dt = ctx.dt * 0.5;
      s.x += dx * dt;
      s.y += dy * dt;
      s.z += dz * dt;

      // Keep bounded
      const mag = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
      if (mag > 5) {
        s.x /= mag;
        s.y /= mag;
        s.z /= mag;
      }

      return {
        delta0: s.x * scale * ctx.dt,
        delta1: s.y * scale * ctx.dt,
      };
    },
  };
};

// === FACTORY ===
// Create a position evolver from serialized state

export function createPositionEvolver(state: PositionEvolverState): PositionEvolver | null {
  const { type, params } = state;

  switch (type) {
    case 'rotate':
      return rotate(params.speed);
    case 'rotateBreathing':
      return rotateBreathing(params.baseSpeed, params.speedVariation, params.breatheSpeed);
    case 'rotateReversing':
      return rotateReversing(params.speed, params.reversePeriod);
    case 'breathe':
      return breathe(params.amplitude, params.speed);
    case 'breatheWavePattern':
      return breatheWavePattern(params.amplitude, params.speed, params.phaseSpread);
    case 'oscillate':
      return oscillate(params.amplitude, params.speed);
    case 'oscillateWave':
      return oscillateWave(params.amplitude, params.speed, params.waves);
    case 'drift':
      return drift(params.speed);
    case 'driftWander':
      return driftWander(params.speed, params.wanderSpeed);
    case 'pulse':
      return pulse(params.strength, params.speed, params.phaseSpread);
    case 'spiral':
      return spiral(params.rotationSpeed, params.contractionSpeed);
    case 'vortex':
      return vortex(params.orbitSpeed, params.wobble);
    case 'waveInterference':
      return waveInterference(params.freq1, params.freq2, params.amplitude);
    case 'lissajous':
      return lissajous(params.freqX, params.freqY, params.amplitude, params.speed, params.phase);
    case 'coupled':
      return coupled(params.coupling, params.naturalFreq, params.damping);
    case 'elastic':
      return elastic(params.stiffness, params.damping, params.radius);
    case 'rose':
      return rose(params.n, params.d, params.amplitude, params.speed);
    case 'pendulum':
      return pendulum(params.length, params.gravity, params.damping);
    case 'flocking':
      return flocking(params.separation, params.alignment, params.cohesion, params.maxSpeed);
    case 'attractor':
      return attractor(params.strength, params.falloff, params.orbitSpeed);
    case 'chaotic':
      return chaotic(params.sigma, params.rho, params.beta, params.scale);
    default:
      console.warn(`Unknown position evolver type: ${type}`);
      return null;
  }
}
