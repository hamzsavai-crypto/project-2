/** Display formatting. Deliberately tiny - the numbers come from the physics layer. */

export function fmt(value: number | null | undefined, precision = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value !== 0 && Math.abs(value) < 10 ** -precision) return (0).toFixed(precision);
  return value.toFixed(precision);
}

/** Fixed-point for ordinary magnitudes, scientific for very large/small ones. */
export function fmtCompact(value: number | null | undefined, digits = 3): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e5)) return value.toExponential(digits - 1);
  return Number(value.toPrecision(digits)).toString();
}

/** Parse a table cell. Empty string means "no reading", not zero. */
export function parseCell(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}
