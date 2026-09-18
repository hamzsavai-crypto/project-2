import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisOutput, CellValue } from '@/lib/lab/analysis';
import { parseCell } from '@/lib/calculations/format';
import { loadAttempts, saveAttempt, type AttemptRecord } from './attempts';
import { emptyReading, initialParams, type ExperimentDefinition, type ReadingRow } from './types';

export type RunPhase = 'setup' | 'collecting' | 'ready' | 'saved';

export interface UseExperimentRun {
  def: ExperimentDefinition;
  params: Record<string, number>;
  setParam: (key: string, value: number) => void;
  isDirty: boolean;

  readings: ReadingRow[];
  addReading: (values: Record<string, CellValue>, source?: ReadingRow['source']) => void;
  setReadingValue: (id: string, key: string, raw: string) => void;
  removeReading: (id: string) => void;
  clearReadings: () => void;
  fillSample: () => void;

  analysis: AnalysisOutput;
  usableCount: number;
  phase: RunPhase;
  startedAt: number;
  elapsedS: number;
  attempts: AttemptRecord[];
  lastSaved: AttemptRecord | null;
  save: (title?: string) => AttemptRecord | null;
  reset: () => void;
}

/**
 * All mutable laboratory state in one place, so every experiment gets the same
 * behaviour for recording, editing, validating and saving.
 */
/** Rehydrate a bench from a previously saved attempt (?attempt=<id>). */
export interface RunBootstrap {
  key: string;
  params?: Record<string, number>;
  readings?: Record<string, CellValue>[];
}

export function useExperimentRun(def: ExperimentDefinition, bootstrap?: RunBootstrap): UseExperimentRun {
  const [params, setParams] = useState<Record<string, number>>(() => initialParams(def));
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadAttempts().filter((a) => a.slug === def.slug));
  const [lastSaved, setLastSaved] = useState<AttemptRecord | null>(null);
  const defaultsRef = useRef(params);

  // A different experiment (or a different saved attempt) means a different
  // bench: rebuild from scratch rather than leaking the previous run's readings.
  const bootstrapKey = bootstrap?.key;
  useEffect(() => {
    const fresh = { ...initialParams(def), ...(bootstrap?.params ?? {}) };
    defaultsRef.current = initialParams(def);
    setParams(fresh);
    const fields = def.readingFields.map((f) => f.key);
    setReadings(
      (bootstrap?.readings ?? []).map((values) => {
        const picked: Record<string, CellValue> = {};
        for (const key of fields) picked[key] = values[key] ?? null;
        return { ...emptyReading(def), values: picked, source: 'manual' as const };
      }),
    );
    setStartedAt(Date.now());
    setLastSaved(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def, bootstrapKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const setParam = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addReading = useCallback<UseExperimentRun['addReading']>((values, source = 'manual') => {
    setReadings((prev) => [...prev, { ...emptyReading(def), values, source }]);
  }, [def]);

  const setReadingValue = useCallback((id: string, key: string, raw: string) => {
    const parsed = parseCell(raw);
    setReadings((prev) => prev.map((row) => (row.id === id ? { ...row, values: { ...row.values, [key]: parsed } } : row)));
  }, []);

  const removeReading = useCallback((id: string) => {
    setReadings((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const clearReadings = useCallback(() => {
    setReadings([]);
    setStartedAt(Date.now());
  }, []);

  const fillSample = useCallback(() => {
    if (!def.sample) return;
    setParams({ ...initialParams(def), ...def.sample.params });
    const fields = def.readingFields.map((f) => f.key);
    setReadings(
      def.sample.readings.map((values) => {
        const picked: Record<string, CellValue> = {};
        for (const key of fields) picked[key] = values[key] ?? null;
        return { ...emptyReading(def), values: picked, source: 'manual' as const };
      }),
    );
  }, [def]);

  const reset = useCallback(() => {
    setParams(defaultsRef.current);
    setReadings([]);
    setStartedAt(Date.now());
  }, []);

  const analysis = useMemo(() => def.analyse({ params, readings }), [def, params, readings]);

  const usableCount = useMemo(() => {
    const required = def.readingFields.filter((f) => !f.readOnly || f.role === 'measured').map((f) => f.key);
    return readings.filter((row) => required.every((key) => typeof row.values[key] === 'number')).length;
  }, [readings, def]);

  const isDirty = useMemo(() => {
    if (readings.length > 0) return true;
    return def.variables.some((v) => params[v.key] !== v.default);
  }, [params, readings.length, def]);

  const phase: RunPhase = lastSaved ? 'saved' : usableCount >= Math.max(def.minReadings, 3) ? 'ready' : readings.length > 0 ? 'collecting' : 'setup';

  const save = useCallback(
    (title?: string) => {
      const record: AttemptRecord = {
        id: lastSaved?.id ?? crypto.randomUUID(),
        slug: def.slug,
        experimentTitle: def.title,
        title: title?.trim() || `${def.title} — attempt ${new Date(startedAt).toLocaleString()}`,
        startedAt,
        savedAt: Date.now(),
        params,
        readings: analysis.rows,
        headline: analysis.result.headline,
        measured: analysis.result.measured,
        expected: analysis.result.expected,
        percentError: analysis.result.percentError,
        verdict: analysis.result.verdict,
        warnings: analysis.warnings,
      };
      const next = saveAttempt(record);
      setAttempts(next.filter((a) => a.slug === def.slug));
      window.dispatchEvent(new Event('vpl:attempts-changed'));
      setLastSaved(record);
      return record;
    },
    [analysis, def, lastSaved?.id, params, startedAt],
  );

  const saveRef = useRef(save);
  saveRef.current = save;

  const elapsedS = Math.max(0, Math.round((now - startedAt) / 1000));

  return {
    def,
    params,
    setParam,
    isDirty,
    readings,
    addReading,
    setReadingValue,
    removeReading,
    clearReadings,
    fillSample,
    analysis,
    usableCount,
    phase,
    startedAt,
    elapsedS,
    attempts,
    lastSaved,
    save: (title) => saveRef.current(title),
    reset: () => {
      reset();
      setLastSaved(null);
    },
  };
}
