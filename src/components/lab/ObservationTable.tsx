import { useState } from 'react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/calculations/format';
import type { CellValue } from '@/lib/lab/analysis';
import type { ExperimentDefinition } from '@/features/experiments/types';
import type { UseExperimentRun } from '@/features/experiments/useExperimentRun';

/**
 * The record book. Raw columns are editable; derived columns are computed by
 * the physics layer and shown read-only underneath, exactly like a printed
 * results table with the working in the margin.
 */
export function ObservationTable({ def, run, dense = false }: { def: ExperimentDefinition; run: UseExperimentRun; dense?: boolean }) {
  const [focus, setFocus] = useState<string | null>(null);
  const columns = def.readingFields;
  const derived = run.analysis.derivedColumns;
  const warnings = run.analysis.warnings;

  const flagFor = (rowId: string, key: string): string | null => {
    const field = columns.find((f) => f.key === key);
    const value = run.readings.find((r) => r.id === rowId)?.values[key];
    if (!field || value === null || value === undefined) return field?.role === 'measured' ? 'missing' : null;
    if (typeof field.min === 'number' && value < field.min) return 'below range';
    if (typeof field.max === 'number' && value > field.max) return 'above range';
    return null;
  };

  return (
    <div className={cn('overflow-hidden rounded-lg border border-lab-line/25', dense && 'text-[12px]')}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-lab-void/60 text-left">
              <th className="w-10 border-b border-lab-line/25 px-2 py-2 text-[11px] font-semibold text-lab-mute">#</th>
              {columns.map((c) => (
                <th key={c.key} className="border-b border-lab-line/25 px-2 py-2 text-right text-[11px] font-semibold text-lab-mute whitespace-nowrap">
                  {c.label}
                  {c.unit ? <span className="ml-1 text-lab-mute/70">/ {c.unit}</span> : null}
                </th>
              ))}
              {derived.map((c) => (
                <th
                  key={c.key}
                  className="border-b border-lab-line/25 border-l px-2 py-2 text-right text-[11px] font-semibold text-lab-accent/80 whitespace-nowrap"
                  title="calculated"
                >
                  {c.label}
                  {c.unit ? <span className="ml-1 opacity-70">/ {c.unit}</span> : null}
                </th>
              ))}
              <th className="w-10 border-b border-lab-line/25 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {run.readings.length === 0 ? (
              <tr>
                <td colSpan={columns.length + derived.length + 2} className="px-3 py-8 text-center text-[12px] text-lab-mute">
                  No readings yet. Take one from the bench, or load the worked example.
                </td>
              </tr>
            ) : (
              run.readings.map((row, i) => (
                <tr key={row.id} className={cn('transition-colors', focus === row.id ? 'bg-lab-accent/5' : 'hover:bg-lab-raise/40')}>
                  <td className="border-b border-lab-line/15 px-2 py-1 font-mono text-[11px] text-lab-mute">{i + 1}</td>
                  {columns.map((c) => {
                    const flag = flagFor(row.id, c.key);
                    return (
                      <td key={c.key} className="border-b border-lab-line/15 px-1 py-0.5 text-right">
                        {c.readOnly ? (
                          <span className="readout px-1 text-lab-ink/80">{fmt(row.values[c.key], c.precision)}</span>
                        ) : (
                          <input
                            className={cn('cell-input', flag === 'missing' && 'text-lab-mute', flag?.includes('range') && 'text-lab-fail')}
                            inputMode="decimal"
                            value={display(row.values[c.key], c.precision)}
                            onChange={(e) => run.setReadingValue(row.id, c.key, e.target.value)}
                            onFocus={() => setFocus(row.id)}
                            onBlur={() => setFocus(null)}
                            aria-label={`${c.label} for reading ${i + 1}`}
                          />
                        )}
                      </td>
                    );
                  })}
                  {derived.map((c) => (
                    <td key={c.key} className="border-b border-l border-lab-line/15 px-2 py-0.5 text-right font-mono text-[12px] tabular-nums text-lab-accent/90">
                      {fmt(run.analysis.rows[i]?.[c.key], c.precision)}
                    </td>
                  ))}
                  <td className="border-b border-lab-line/15 px-1 py-0.5 text-right">
                    <button
                      type="button"
                      onClick={() => run.removeReading(row.id)}
                      className="rounded p-1 text-lab-mute/70 transition hover:bg-lab-fail/10 hover:text-lab-fail"
                      title="Discard this reading"
                      aria-label={`Discard reading ${i + 1}`}
                    >
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-lab-line/25 bg-lab-void/40 px-3 py-2 text-[11px] text-lab-mute">
        <span>
          {run.usableCount} of {def.minReadings} usable readings
          {run.usableCount < def.minReadings ? ' needed to unlock analysis' : ''}
        </span>
        <span className="flex items-center gap-3">
          {warnings.length > 0 ? <span className="text-lab-measure">{warnings[0]}</span> : null}
          {run.readings.length > 0 ? (
            <button type="button" onClick={run.clearReadings} className="underline decoration-dotted hover:text-lab-fail">
              clear all
            </button>
          ) : null}
        </span>
      </footer>
    </div>
  );
}

function display(value: CellValue | undefined, precision: number): string {
  if (value === null || value === undefined) return '';
  const rounded = fmt(value, precision);
  // Keep what the student typed while they are typing it.
  return Number.isFinite(Number(value)) && Math.abs(Number(value) - Number(rounded)) < 10 ** -precision / 2 ? rounded : String(value);
}
