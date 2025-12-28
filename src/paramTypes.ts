// Param types for hex serialization
// Each type maps values to/from a single byte (0-255)

export interface ParamType {
  encode: (v: number) => number;
  decode: (b: number) => number;
}

// Linear 0-1, good for percentages, ratios
export const unit: ParamType = {
  encode: v => Math.round(v * 255),
  decode: b => b / 255,
};

// Quadratic 0-1, better resolution for small values (0.01-0.3 range)
export const smallUnit: ParamType = {
  encode: v => Math.round(Math.sqrt(v) * 255),
  decode: b => (b / 255) ** 2,
};

// Log scale 0.01-1.0, good for speeds/frequencies
export const speed: ParamType = {
  encode: v => Math.round(Math.log(v * 100 + 1) / Math.log(101) * 255),
  decode: b => (101 ** (b / 255) - 1) / 100,
};

// Integer 1-16
export const smallInt: ParamType = {
  encode: v => Math.min(255, Math.max(0, Math.round((v - 1) * 16))),
  decode: b => Math.round(b / 16) + 1,
};

// Integer 1-256
export const int: ParamType = {
  encode: v => Math.min(255, Math.max(0, Math.round(v - 1))),
  decode: b => b + 1,
};

// Raw byte 0-255
export const byte: ParamType = {
  encode: v => v & 0xff,
  decode: b => b,
};

// Boolean (decode returns 0/1 for consistency, convert to bool at usage site if needed)
export const bool: ParamType = {
  encode: v => v ? 1 : 0,
  decode: b => b !== 0 ? 1 : 0,  // Returns number, not boolean - see decodeMotion for conversion
};

// Enum with n options (0 to n-1)
export function enumType(n: number): ParamType {
  return {
    encode: v => Math.floor(v) % n,
    decode: b => b % n,
  };
}

// Signed unit (-1 to 1)
export const signedUnit: ParamType = {
  encode: v => Math.round((v + 1) * 127.5),
  decode: b => (b / 127.5) - 1,
};

// Angle in radians (0 to 2π)
export const angle: ParamType = {
  encode: v => Math.round((v / (2 * Math.PI)) * 255),
  decode: b => (b / 255) * 2 * Math.PI,
};

// Shorthand export for catalog definitions
export const P = {
  unit,
  smallUnit,
  speed,
  smallInt,
  int,
  byte,
  bool,
  enum: enumType,
  signedUnit,
  angle,
};
