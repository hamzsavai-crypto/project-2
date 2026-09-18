/**
 * Simple pendulum - integrator plus the timing analysis a student performs.
 *
 * The velocity-Verlet step below is adapted from the pendulum integration in
 * `source/physics-sims/src/pages/mechanics/PendulumExplorer.tsx` (MIT,
 * IlliniOpenEdu / UIUC PhysicsSims). There the same maths is embedded in that
 * 1000-line page next to its SVG code; it is re-declared here as pure
 * functions so it can be unit-tested and driven by a stopwatch, exactly the
 * "simulation page -> controls -> physics logic -> renderer" split the source
 * project documents in its CLAUDE.md.
 */

import type { AnalysisOutput, CellValue, ColumnDef, GraphSeries } from '@/lib/lab/analysis';
import { clamp, linearFit, mean, percentError, roundTo, sampleStdDev } from '../common/stats';

export const G_ACCEPTED = 9.8;
export const MAX_ANGLE_DEG = 60;

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function degToRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

export function radToDeg(rad: number): number {
  return (rad * RAD_TO_DEG);
}

export interface PendulumState {
  /** Angular displacement from vertical, rad. */
  theta: number;
  /** Angular velocity, rad/s. */
  omega: number;
  /** Elapsed sim time, s. */
  time: number;
}

export interface PendulumParams {
  lengthM: number;
  gravity: number;
  /** Optional light damping so a long lab session still looks alive. */
  damping?: number;
}

/**
 * One velocity-Verlet step of theta'' = -(g/L) sin(theta).
 * Adapted from PhysicsSims' `stepPendulum`; the large-angle `sin(theta)`
 * (rather than the small-angle approximation) is what lets the lab show that
 * measured T is slightly longer than 2*pi*sqrt(L/g) at big amplitudes.
 */
export function stepPendulum(
  state: PendulumState,
  params: PendulumParams,
  dt: number,
): PendulumState {
  const L = params.lengthM;
  const g = params.gravity;
  if (L <= 0 || dt <= 0 || g <= 0) return state;

  const damping = params.damping ?? 0;
  const accel = (theta: number, omega: number) => -(g / L) * Math.sin(theta) - damping * omega;

  const alpha = accel(state.theta, state.omega);
  const theta = state.theta + state.omega * dt + 0.5 * alpha * dt * dt;
  const alphaNew = accel(theta, state.omega + alpha * dt);
  const omega = state.omega + 0.5 * (alpha + alphaNew) * dt;

  return { theta, omega, time: state.time + dt };
}

/**
 * Advance by wall-clock `elapsed` seconds using fixed sub-steps, so the
 * simulation is frame-rate independent.
 *
 * Also returns how many complete oscillations finished in that interval,
 * counted as downward centre crossings: one crossing per period. Timing from
 * one downward crossing to the Nth after it therefore measures exactly N
 * periods, which is what the laboratory stopwatch relies on.
 */
export function advance(
  state: PendulumState,
  params: PendulumParams,
  elapsed: number,
  fixedDt = 1 / 240,
): { state: PendulumState; cycles: number } {
  let current = state;
  let cycles = 0;
  const steps = Math.min(4000, Math.max(1, Math.round(elapsed / fixedDt)));
  for (let i = 0; i < steps; i++) {
    const before = current.theta;
    current = stepPendulum(current, params, fixedDt);
    if (before > 0 && current.theta <= 0) cycles += 1;
  }
  return { state: current, cycles };
}

export function smallAnglePeriod(lengthM: number, gravity = G_ACCEPTED): number {
  if (lengthM <= 0 || gravity <= 0) return 0;
  return 2 * Math.PI * Math.sqrt(lengthM / gravity);
}

/** First-order large-amplitude correction, for the "why is my T bigger" note. */
export function amplitudeCorrectedPeriod(lengthM: number, amplitudeRad: number, gravity = G_ACCEPTED): number {
  const t0 = smallAnglePeriod(lengthM, gravity);
  const s = Math.sin(amplitudeRad / 2);
  return t0 * (1 + s * s / 4);
}

export function bobHeight(lengthM: number, theta: number): number {
  return lengthM * (1 - Math.cos(theta));
}

export function bobSpeed(lengthM: number, omega: number): number {
  return Math.abs(lengthM * omega);
}

export function stringTension(lengthM: number, massKg: number, theta: number, omega: number, gravity = G_ACCEPTED): number {
  return massKg * (lengthM * omega * omega + gravity * Math.cos(theta));
}

export function energyJ(lengthM: number, massKg: number, theta: number, omega: number, gravity = G_ACCEPTED) {
  const kinetic = 0.5 * massKg * (lengthM * omega) ** 2;
  const potential = massKg * gravity * bobHeight(lengthM, theta);
  return { kinetic, potential, total: kinetic + potential };
}

export interface PendulumReading {
  /** Pendulum length for the trial, m. */
  lengthM: CellValue;
  /** Wall time for N complete oscillations, s. */
  totalTimeS: CellValue;
  /** Number of oscillations timed (20 in the classic procedure). */
  oscillations: number;
}

export const PENDULUM_LIMITS = {
  lengthM: { min: 0.2, max: 1.5, step: 0.05 },
  massKg: { min: 0.02, max: 1, step: 0.01 },
  releaseAngleDeg: { min: 2, max: MAX_ANGLE_DEG, step: 1 },
  oscillations: { min: 5, max: 50, step: 5 },
  gravity: { min: 1.62, max: 24.79, step: 0.01 },
} as const;

export const PENDULUM_COLUMNS: ColumnDef[] = [
  { key: 'period', label: 'T = t/N', unit: 's', precision: 3, tone: 'derived' },
  { key: 'periodSq', label: 'T²', unit: 's²', precision: 4, tone: 'derived' },
  { key: 'gRow', label: 'g = 4π²L/T²', unit: 'm/s²', precision: 2, tone: 'derived' },
];

export interface PendulumAnalysisInput {
  readings: PendulumReading[];
  /** Accepted value used for the percentage error. */
  gravityAccepted?: number;
}

/**
 * The heart of the experiment: T from the stopwatch, T², the T²-vs-L graph and
 * g from its gradient (T² = 4π²L/g, so gradient = 4π²/g).
 */
export function analysePendulum({ readings, gravityAccepted = G_ACCEPTED }: PendulumAnalysisInput): AnalysisOutput {
  const computed = readings.map((r) => {
    const ok =
      typeof r.lengthM === 'number' &&
      typeof r.totalTimeS === 'number' &&
      r.lengthM > 0 &&
      r.totalTimeS > 0 &&
      r.oscillations > 0;
    if (!ok) {
      return { raw: r, period: null as CellValue, periodSq: null as CellValue, gRow: null as CellValue };
    }
    const period = (r.totalTimeS as number) / r.oscillations;
    const lengthM = r.lengthM as number;
    return {
      raw: r,
      period,
      periodSq: period * period,
      gRow: 4 * Math.PI * Math.PI * lengthM / (period * period),
    };
  });

  const rows: Record<string, CellValue>[] = computed.map((c) => ({
    lengthM: c.raw.lengthM,
    totalTimeS: c.raw.totalTimeS,
    oscillations: c.raw.oscillations,
    period: c.period === null ? null : roundTo(c.period, 4),
    periodSq: c.periodSq === null ? null : roundTo(c.periodSq, 4),
    gRow: c.gRow === null ? null : roundTo(c.gRow, 2),
  }));

  const usable = computed.filter((c) => c.period !== null && c.gRow !== null);
  const gValues = usable.map((c) => c.gRow as number);
  const meanG = mean(gValues);
  const sdG = sampleStdDev(gValues);

  const points = usable.map((c, idx) => ({
    x: c.raw.lengthM as number,
    y: c.periodSq as number,
    label: `L = ${(c.raw.lengthM as number).toFixed(2)} m`,
  }));
  const fit = linearFit(points);
  const gFromGraph = fit && fit.slope > 1e-9 ? (4 * Math.PI * Math.PI) / fit.slope : null;
  const pErr = percentError(gFromGraph, gravityAccepted);

  const warnings: string[] = [];
  if (usable.length < 3) warnings.push('Take at least 3 trials at different lengths before trusting the graph.');
  if (fit && fit.r2 < 0.97) warnings.push(`T²-vs-L linearity R² = ${fit.r2.toFixed(3)} - check your timing or length settings.`);
  const distinctLengths = new Set(usable.map((c) => c.raw.lengthM)).size;
  if (usable.length >= 3 && distinctLengths < 3) warnings.push('Vary the length between trials; a gradient needs spread along L.');

  const maxL = points.reduce((acc, p) => Math.max(acc, p.x), 0);
  const series: GraphSeries[] = [];
  if (points.length > 0) {
    series.push({ label: 'T² from readings', points, kind: 'scatter', tone: 'measure' });
  }
  if (fit && points.length >= 2) {
    series.push({
      label: `Least-squares fit (g = ${(gFromGraph ?? 0).toFixed(2)} m/s²)`,
      points: [
        { x: 0, y: fit.intercept },
        { x: maxL * 1.08, y: fit.intercept + fit.slope * maxL * 1.08 },
      ],
      kind: 'line',
      tone: 'expect',
    });
  }
  series.push({
    label: `Theory T² = 4π²L/${gravityAccepted.toFixed(2)}`,
    points: [
      { x: 0, y: 0 },
      { x: maxL * 1.08, y: ((4 * Math.PI * Math.PI) / gravityAccepted) * maxL * 1.08 },
    ],
    kind: 'line',
    tone: 'expect',
  });

  return {
    derivedColumns: PENDULUM_COLUMNS,
    rows,
    stats: [
      { key: 'n', label: 'Trials', value: usable.length, precision: 0 },
      { key: 'meanG', label: 'Mean g from trials', value: meanG === null ? null : roundTo(meanG, 3), unit: 'm/s²', precision: 3 },
      { key: 'sdG', label: 'Std. dev. of g', value: sdG === null ? null : roundTo(sdG, 3), unit: 'm/s²', precision: 3, note: 'trial-to-trial scatter' },
      { key: 'slope', label: 'Gradient of T² vs L', value: fit ? roundTo(fit.slope, 4) : null, unit: 's²/m', precision: 4, note: 'equals 4π²/g' },
      { key: 'gGraph', label: 'g from graph', value: gFromGraph === null ? null : roundTo(gFromGraph, 3), unit: 'm/s²', precision: 3, note: 'the preferred method' },
      { key: 'r2', label: 'Linearity R²', value: fit ? roundTo(fit.r2, 4) : null, precision: 4 },
      { key: 'accepted', label: 'Accepted g', value: gravityAccepted, unit: 'm/s²', precision: 2 },
    ],
    graph: points.length >= 2
      ? {
          xLabel: 'Length L',
          yLabel: 'T² (square of period)',
          xUnit: 'm',
          yUnit: 's²',
          series,
          caption: 'T² = (4π²/g)·L, so the graph is a straight line through the origin and g = 4π² ÷ gradient.',
        }
      : null,
    result: {
      headline:
        gFromGraph === null
          ? 'g from the graph gradient: take at least two trials at different lengths.'
          : `Acceleration due to gravity (from graph) = ${gFromGraph.toFixed(2)} m/s²`,
      verdict: usable.length < 3 ? 'insufficient' : pErr !== null && pErr <= 5 ? 'pass' : 'review',
      measured: { label: 'g from T²-L gradient', value: gFromGraph, unit: 'm/s²', precision: 2 },
      expected: { label: 'Accepted value', value: gravityAccepted, unit: 'm/s²', precision: 2 },
      percentError: pErr,
      notes: [
        `Timing N = ${usable[0]?.raw.oscillations ?? 20} oscillations per trial divides stopwatch error by N - that is why the procedure counts 20, not 1.`,
        ...amplitudeNotes(usable),
      ],
    },
    warnings,
  };
}

/**
 * Separate a genuine large-amplitude effect from a measurement mistake:
 * the exact integrator used here is slow for a real reason at big angles.
 */
function amplitudeNotes(computed: { raw: PendulumReading }[]): string[] {
  const lengths = computed.map((c) => c.raw.lengthM).filter((l): l is number => typeof l === 'number');
  if (lengths.length === 0) return [];
  return [
    `Compare the mean trial value (${(computed.length ? 'mean' : 'mean')} g) with the graph value: agreement within ~2% usually means the timing was consistent, whatever the amplitude.`,
    'At amplitudes above ~15° the true period exceeds 2π√(L/g) for a real physical reason - amplitudeCorrectedPeriod() quantifies it - so a long T is not automatically a mistake.',
  ];
}

/** Amplitude in radians from a release angle in degrees, clamped to the rig. */
export function releaseAngleRad(releaseAngleDeg: number): number {
  return degToRad(clamp(releaseAngleDeg, 0, MAX_ANGLE_DEG));
}
