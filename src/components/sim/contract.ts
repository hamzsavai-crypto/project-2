import type { CellValue } from '@/lib/lab/analysis';
import type { ExperimentDefinition, VariableDef } from '@/features/experiments/types';

/** The contract every interactive workspace implements. */
export interface LabSimProps {
  def: ExperimentDefinition;
  params: Record<string, number>;
  setParam: (key: string, value: number) => void;
  /** Push a completed reading into the observation table. */
  recordReading: (values: Record<string, CellValue>) => void;
  /** True once the student has enough readings to move on. */
  ready: boolean;
  variable: (key: string) => VariableDef | undefined;
}

export function clampParam(value: number, def?: VariableDef): number {
  if (!def || !Number.isFinite(value)) return def?.default ?? 0;
  return Math.min(def.max, Math.max(def.min, value));
}
