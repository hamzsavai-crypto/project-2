/** Statistics every experiment needs: means, spread, least-squares fits, error %. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** Sample standard deviation (n-1). Returns null when it is not defined. */
export function sampleStdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m === null) return null;
  let acc = 0;
  for (const v of values) acc += (v - m) ** 2;
  return Math.sqrt(acc / (values.length - 1));
}

export function relativeSpread(values: number[]): number | null {
  const m = mean(values);
  const sd = sampleStdDev(values);
  if (m === null || sd === null || Math.abs(m) < 1e-12) return null;
  return (sd / Math.abs(m)) * 100;
}

export interface FitResult {
  slope: number;
  intercept: number;
  /** Coefficient of determination. */
  r2: number;
  n: number;
}

/**
 * Ordinary least squares on (x, y) pairs.
 * Returns null unless there are >= 2 points with distinct x values - the
 * engine turns that into a "record more readings" state instead of a crash.
 */
export function linearFit(points: { x: number; y: number }[]): FitResult | null {
  const pts = points.filter((p) => isFiniteNumber(p.x) && isFiniteNumber(p.y));
  if (pts.length < 2) return null;

  const n = pts.length;
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  const mx = sx / n;
  const my = sy / n;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const p of pts) {
    const dx = p.x - mx;
    const dy = p.y - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx < 1e-15) return null;

  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy < 1e-15 ? 1 : clamp((sxy * sxy) / (sxx * syy), 0, 1);
  return { slope, intercept, r2, n };
}

/** Percentage error of an experimental value against the accepted one. */
export function percentError(experimental: number | null, expected: number | null): number | null {
  if (!isFiniteNumber(experimental) || !isFiniteNumber(expected)) return null;
  if (Math.abs(expected) < 1e-12) return null;
  return Math.abs((experimental - expected) / expected) * 100;
}

export function roundTo(value: number, precision = 2): number {
  const f = 10 ** precision;
  return Math.round(value * f) / f;
}

/** Quantise to the nearest step, e.g. a meter whose smallest division is 0.05 A. */
export function quantise(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}
