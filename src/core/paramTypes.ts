// Maps ParamEncoding strings to actual ParamType encoder/decoders
// This bridges the schema definition with the serialization system

import * as P from '../paramTypes';
import type { ParamType } from '../paramTypes';
import type { ParamEncoding, ParamSchema } from './registry';

// Map from schema type string to actual ParamType
export const paramTypeMap: Record<ParamEncoding, ParamType> = {
  unit: P.unit,
  smallUnit: P.smallUnit,
  speed: P.speed,
  smallInt: P.smallInt,
  int: P.int,
  byte: P.byte,
  bool: P.bool,
  signedUnit: P.signedUnit,
  angle: P.angle,
  frequency: P.frequency,
  scale5: P.scale5,
  ratio3: P.ratio3,
  sharpness8: P.sharpness8,
};

export function getParamType(encoding: ParamEncoding): ParamType {
  return paramTypeMap[encoding];
}

// Convert a params schema to ParamDef array for serialization
// Returns entries in deterministic order (sorted by key)
export function schemaToParamDefs(
  params: Record<string, ParamSchema>
): Array<[string, ParamType]> {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, schema]) => [name, getParamType(schema.type)]);
}
