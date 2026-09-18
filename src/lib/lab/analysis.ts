/**
 * The shared contract between the physics layer and the laboratory engine.
 *
 * It lives here (not in `features/`) so that `src/physics/**` can implement it
 * without importing UI-layer code: physics stays pure and testable, and the
 * engine stays experiment-agnostic.
 */

export type CellValue = number | null;

export interface ColumnDef {
  key: string;
  label: string;
  unit?: string;
  /** Decimal places for display. */
  precision: number;
  /** `measured` = student input, `derived` = computed from input. */
  tone?: 'measured' | 'derived';
}

export interface StatDef {
  key: string;
  label: string;
  value: CellValue;
  unit?: string;
  precision: number;
  note?: string;
}

export interface GraphPoint {
  x: number;
  y: number;
  /** Shown in the hover tooltip; usually the reading number. */
  label?: string;
}

export interface GraphSeries {
  label: string;
  points: GraphPoint[];
  kind: 'scatter' | 'line';
  tone: 'measure' | 'expect';
}

export interface GraphDef {
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  series: GraphSeries[];
  /** e.g. "least-squares fit: slope = 40.2 Ω" — rendered as the caption. */
  caption?: string;
}

export type Verdict = 'pass' | 'review' | 'insufficient';

export interface ResultDef {
  /** The sentence a student would write in the "Result" box of a record book. */
  headline: string;
  verdict: Verdict;
  measured: { label: string; value: CellValue; unit?: string; precision: number };
  expected: { label: string; value: CellValue; unit?: string; precision: number };
  percentError: number | null;
  notes: string[];
}

export interface AnalysisOutput {
  /** Extra columns appended after the raw readings (e.g. T, T², R = V/I). */
  derivedColumns: ColumnDef[];
  /** One row per reading: raw values merged with derived values. */
  rows: Record<string, CellValue>[];
  stats: StatDef[];
  graph: GraphDef | null;
  result: ResultDef;
  warnings: string[];
}
