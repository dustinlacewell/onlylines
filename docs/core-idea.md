# Core Idea: Edge-Constrained Line Art Animation

## The Fundamental Constraint

All lines in this system connect two points on the **perimeter** of the canvas. Lines cannot be placed arbitrarily in space—they must span from one edge to another. This constraint creates a unique visual language where every line is anchored to the boundary.

The perimeter is represented as a continuous value from 0 to 4:
- `0-1`: Top edge (left to right)
- `1-2`: Right edge (top to bottom)
- `2-3`: Bottom edge (right to left)
- `3-4`: Left edge (bottom to top)

A line is defined by two perimeter positions (`perim0`, `perim1`), plus speed, direction, and width.

## The Distributor's Dual Role

Distributors are the foundation of the visual system. They determine **two things simultaneously**:

### 1. Spatial Layout
Where each line physically appears—its start and end points on the perimeter. A `spiral` distributor creates lines that visually form a spiral pattern. A `vertical` distributor creates parallel vertical lines.

### 2. Array Ordering
The sequence in which lines appear in the array (indices 0, 1, 2, ... count-1). This ordering is **invisible spatially** but **crucial for animation**.

```
Example: 50 vertical lines

Spatial layout: ||||||||||||||||||||||||||||||||||||||||||||||||||
                (evenly spaced left to right)

Array order:    Line[0] is leftmost, Line[49] is rightmost
                (indices increase left to right)
```

The same spatial layout could have different array orderings:
- Sequential (left→right): indices follow spatial position
- Random: indices scattered across positions
- Center-out: index 0 at center, higher indices toward edges

## How Animation Flows Through the Array

Draw property evolvers (color, alpha, dash, lineWidth) animate by computing a `t` value (0-1) for each line based on its **array index**, not its spatial position.

### Motion Modes

**Field Mode**: `t` progresses linearly across array indices
```
Index:  0    10   20   30   40   49
    t:  0   0.2  0.4  0.6  0.8  1.0
```

**Focal Mode**: `t` represents distance from a focal index
```
Focal index = 25
Index:  0    10   20   25   30   40   49
    t:  1   0.6  0.2   0   0.2  0.6  1.0
```

**Spread Mode**: All lines receive the same `t` (synchronized)

### The Mapper Transform

Once `t` is computed, a **mapper** transforms it into an output value (0-1). For example:
- `sine` mapper: `t=0.25` → `1.0` (peak of sine wave)
- `threshold` mapper: `t < 0.5` → `0`, `t >= 0.5` → `1`
- `pulse` mapper: gaussian peak centered at configurable position

The mapper output then drives the visual property (color position in palette, alpha value, dash length, etc.).

## The Magic: Array Order Defines Animation Path

The visual effect emerges from the **intersection** of spatial layout and array ordering:

### Example 1: Vertical Lines, Sequential Order
```
Distributor: vertical (lines ordered left→right in array)
Evolver: color with field mode + sine mapper

Result: Colors wave horizontally across the canvas
        (because array indices = spatial left→right position)
```

### Example 2: Spiral Lines, Spiral Order
```
Distributor: spiral (lines ordered along spiral path in array)
Evolver: color with field mode + sine mapper

Result: Colors flow along the spiral
        (animation follows the spiral's natural progression)
```

### Example 3: Concentric Rings, Inside-Out Order
```
Distributor: concentricRings (inner rings = lower indices)
Evolver: alpha with focal mode centered at index 0

Result: Alpha pulses radiate outward from center
        (focal point at index 0 = innermost ring)
```

### Example 4: Random Spatial, Sequential Array
```
Distributor: random positions but sequential indices
Evolver: color with field mode

Result: Colors appear to "jump around" spatially
        (smooth array progression, chaotic spatial distribution)
```

## Implications for Distributor Design

When creating a new distributor, consider:

1. **What spatial pattern do you want?** (the visible geometry)
2. **What animation path do you want?** (how effects flow)

These can align (spiral lines with spiral-order animation) or diverge (grid lines with diagonal-sweep animation).

The array ordering is the "hidden dimension" that controls temporal flow through spatial form.

## The Full Pipeline

```
Distributor                    Evolver
    │                             │
    ▼                             ▼
┌─────────────────┐      ┌─────────────────┐
│ Spatial Layout  │      │  Motion Config  │
│ (perim0, perim1)│      │ (mode, speed)   │
│                 │      │                 │
│ Array Ordering  │─────▶│  Compute t      │
│ (index 0..n-1)  │      │  per index      │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Mapper      │
                         │  (sine, pulse,  │
                         │   threshold...) │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Output Adapter  │
                         │ (color, alpha,  │
                         │  dash, width)   │
                         └─────────────────┘
```

The distributor sets the stage. The evolver animates across that stage. The array ordering defines the path the animation takes through space.
