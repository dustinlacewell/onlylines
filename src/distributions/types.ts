import type { LineConfig } from '../types';

export interface DistributionOptions {
  speed?: number;
  lineWidth?: number;
}

export type Distribution = (count: number, options?: DistributionOptions) => LineConfig[];
