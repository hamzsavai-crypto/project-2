import type { AnalysisOutput, CellValue } from '@/lib/lab/analysis';

/** Which interactive workspace renders behind the lab. */
export type SimKey = 'ohms-law' | 'pendulum';

export type ParamKind = 'slider' | 'stepper';

export interface VariableDef {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  default: number;
  kind?: ParamKind;
  hint?: string;
  /** Locked variables are fixed by the apparatus rather than the student. */
  readOnly?: boolean;
}

export type ReadingRole = 'independent' | 'measured' | 'counted';

/** One column of the observation table. */
export interface ReadingFieldDef {
  key: string;
  label: string;
  unit?: string;
  precision: number;
  role: ReadingRole;
  /** Plausibility bounds; out-of-range entries are flagged, not rejected. */
  min?: number;
  max?: number;
  /** `readOnly` columns are filled by the instrument/stopwatch, never typed. */
  readOnly?: boolean;
}

export interface Equation {
  /** Rendered as typeset-looking monospace; no KaTeX dependency for now. */
  text: string;
  caption: string;
}

export interface TheoryContent {
  lead: string;
  paragraphs: string[];
  equations: Equation[];
  keyIdeas: string[];
}

export interface ExperimentDefinition {
  slug: string;
  title: string;
  subtitle: string;
  category: 'electricity' | 'mechanics' | 'optics' | 'waves' | 'thermodynamics';
  level: 'secondary' | 'undergraduate';
  minutes: number;
  /** One-line "why this experiment" for the catalog card. */
  aim: string;
  objectives: string[];
  theory: TheoryContent;
  apparatus: { name: string; note: string }[];
  procedure: { title: string; detail: string }[];
  variables: VariableDef[];
  readingFields: ReadingFieldDef[];
  minReadings: number;
  /** Percentage error at or below which the result is marked as passed. */
  tolerancePercent: number;
  sim: SimKey;
  /** A completed worked example, for the empty state and for demos. */
  sample?: { label: string; params: Record<string, number>; readings: Record<string, CellValue>[] };
  /** Pure analysis: readings + settings -> derived values, graph, result. */
  analyse: (input: { params: Record<string, number>; readings: ReadingRow[] }) => AnalysisOutput;
}

export interface ReadingRow {
  id: string;
  values: Record<string, CellValue>;
  recordedAt: number;
  source: 'manual' | 'meter' | 'stopwatch';
}

export function initialParams(def: ExperimentDefinition): Record<string, number> {
  const params: Record<string, number> = {};
  for (const v of def.variables) params[v.key] = v.default;
  return params;
}

export function emptyReading(def: ExperimentDefinition): ReadingRow {
  const values: Record<string, CellValue> = {};
  for (const field of def.readingFields) values[field.key] = null;
  return { id: crypto.randomUUID(), values, recordedAt: Date.now(), source: 'manual' };
}
