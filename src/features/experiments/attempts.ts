/**
 * Saved laboratory work. Anonymous-first (plan §16): everything a student does
 * is usable without an account, and this module is the seam where a real
 * backend gets swapped in during Phase 7. The shape mirrors the
 * `ExperimentAttempt` record proposed there so the API can adopt it as-is.
 */

import type { CellValue } from '@/lib/lab/analysis';

export const ATTEMPTS_KEY = 'vpl.attempts.v1';

export interface AttemptRecord {
  id: string;
  slug: string;
  experimentTitle: string;
  title: string;
  startedAt: number;
  savedAt: number;
  params: Record<string, number>;
  readings: Record<string, CellValue>[];
  /** Flattened snapshot of the analysis at save time - history must not recompute. */
  headline: string;
  measured: { label: string; value: CellValue; unit?: string };
  expected: { label: string; value: CellValue; unit?: string };
  percentError: number | null;
  verdict: 'pass' | 'review' | 'insufficient';
  warnings: string[];
}

function isSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadAttempts(): AttemptRecord[] {
  if (!isSupported()) return [];
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AttemptRecord => {
      return typeof item === 'object' && item !== null && 'id' in item && 'slug' in item;
    });
  } catch {
    // Corrupt or quota-truncated storage should degrade to "no history", not a crash.
    return [];
  }
}

export function saveAttempt(attempt: AttemptRecord): AttemptRecord[] {
  if (!isSupported()) return [];
  const next = [attempt, ...loadAttempts().filter((a) => a.id !== attempt.id)].slice(0, 100);
  try {
    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
  } catch {
    return loadAttempts();
  }
  return next;
}

export function deleteAttempt(id: string): AttemptRecord[] {
  const next = loadAttempts().filter((a) => a.id !== id);
  if (isSupported()) {
    try {
      window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}
