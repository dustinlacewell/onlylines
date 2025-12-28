import type { LineConfig } from '../types';

export interface DistributionOptions {
  speed?: number;
  lineWidth?: number;
}

export interface DistributionParams {
  [key: string]: number;
}

export type Distribution = (count: number, options?: DistributionOptions, params?: DistributionParams) => LineConfig[];
