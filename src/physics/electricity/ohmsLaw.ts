/**
 * Ohm's law - experiment model.
 *
 * This is a *measurement* model, not a circuit simulator. The general
 * modified-nodal-analysis solver lives in
 * `source/physics-sims/src/lib/circuit/solver.ts` (MIT, IlliniOpenEdu) and
 * should be lifted wholesale for the open "Circuit Builder" sandbox; for the
 * graded lab we only need what a student can actually read off a DC circuit
 * plus what their meters can actually resolve. Re-deriving an MNA solver here
 * would be the kind of duplication the architecture notes warn about.
 */

import type { AnalysisOutput, CellValue, ColumnDef, GraphSeries } from '@/lib/lab/analysis';
import { clamp, linearFit, mean, percentError, quantise, relativeSpread, roundTo, sampleStdDev } from '../common/stats';

export interface OhmsSetup {
  /** Source EMF, V. */
  emfVolts: number;
  /** Nominal resistance under test, Ω. */
  externalOhms: number;
  /** Source + lead resistance, Ω. */
  internalOhms: number;
}

export interface OhmsReading {
  /** Voltmeter across the resistor, V. */
  voltageVolts: CellValue;
  /** Ammeter in series, A. */
  currentAmps: CellValue;
}

/** Meter resolution, in the units a real school bench instrument offers. */
export const METERS = {
  voltmeterStep: 0.05,
  ammeterStep: 0.002,
  /** Fraction of the reading added as instrumental error before quantising. */
  accuracyFraction: 0.01,
} as const;

export const OHMS_LIMITS = {
  emfVolts: { min: 0.5, max: 12, step: 0.1 },
  externalOhms: { min: 5, max: 1000, step: 1 },
  internalOhms: { min: 0, max: 50, step: 0.5 },
} as const;

export function validateSetup(setup: OhmsSetup): string | null {
  if (!Number.isFinite(setup.emfVolts) || setup.emfVolts <= 0) return 'Set a source voltage above 0 V.';
  if (!Number.isFinite(setup.externalOhms) || setup.externalOhms <= 0) return 'Resistance must be above 0 Ω.';
  if (currentFor(setup) > 10) return 'Current exceeds 10 A - raise the resistance.';
  return null;
}

/** Total series current for the loop. */
export function currentFor(setup: OhmsSetup): number {
  const total = setup.externalOhms + Math.max(0, setup.internalOhms);
  if (total <= 0) return 0;
  return setup.emfVolts / total;
}

/** Potential difference across the resistor under test. */
export function voltageAcrossResistor(setup: OhmsSetup): number {
  return currentFor(setup) * setup.externalOhms;
}

export function powerDissipated(setup: OhmsSetup): number {
  const i = currentFor(setup);
  return i * i * setup.externalOhms;
}

export function powerWastedInternally(setup: OhmsSetup): number {
  const i = currentFor(setup);
  return i * i * Math.max(0, setup.internalOhms);
}

/**
 * What an analogue meter shows for a true value: instrumental error, then the
 * smallest division. `noise` is in [-1, 1] and supplied by a seeded RNG so a
 * given setup always "reads" the same way.
 */
export function meterReading(trueValue: number, step: number, noise: number, accuracy: number = METERS.accuracyFraction): number {
  const withError = trueValue * (1 + noise * accuracy);
  return roundTo(quantise(withError, step), 6);
}

export function readingFor(setup: OhmsSetup, noiseV: number, noiseI: number): OhmsReading {
  return {
    voltageVolts: meterReading(voltageAcrossResistor(setup), METERS.voltmeterStep, noiseV),
    currentAmps: meterReading(currentFor(setup), METERS.ammeterStep, noiseI),
  };
}

const BAND_COLORS = [
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'grey',
  'white',
  'gold',
] as const;

export type BandColor = (typeof BAND_COLORS)[number];

export interface ResistorBands {
  digits: [BandColor, BandColor];
  multiplier: BandColor;
  tolerance: BandColor;
}

/** 4-band colour code for the nominal resistance, so the bench looks honest. */
export function resistorBands(ohms: number): ResistorBands {
  const e24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 33, 39, 47, 56, 68, 82];
  let value = clamp(ohms, 10, 990);
  let exponent = 0;
  while (value >= 100) {
    value /= 10;
    exponent++;
  }
  let chosen = e24[0] as number;
  for (const candidate of e24) {
    if (Math.abs(candidate - value) < Math.abs(chosen - value)) chosen = candidate;
  }
  const tens = Math.floor(chosen / 10);
  const ones = chosen % 10;
  return {
    digits: [BAND_COLORS[tens] as BandColor, BAND_COLORS[ones] as BandColor],
    multiplier: BAND_COLORS[clamp(exponent, 0, 9) as number] as BandColor,
    tolerance: 'gold',
  };
}

export interface OhmsAnalysisInput {
  readings: OhmsReading[];
  setup: OhmsSetup;
}

export const OHMS_COLUMNS: ColumnDef[] = [
  { key: 'resistance', label: 'R = V/I', unit: 'Ω', precision: 1, tone: 'derived' },
  { key: 'power', label: 'P = VI', unit: 'W', precision: 3, tone: 'derived' },
  { key: 'deviation', label: 'Δ from nominal', unit: '%', precision: 2, tone: 'derived' },
];

/**
 * Turn a set of (V, I) readings into the full analysis chain:
 * derived columns -> statistics -> graph -> result.
 */
export function analyseOhms({ readings, setup }: OhmsAnalysisInput): AnalysisOutput {
  const nominal = setup.externalOhms;
  const usable = readings.filter(
    (r) => typeof r.voltageVolts === 'number' && typeof r.currentAmps === 'number' && (r.currentAmps as number) > 0,
  );

  const rows: Record<string, CellValue>[] = readings.map((r) => {
    const v = r.voltageVolts;
    const i = r.currentAmps;
    const okV = typeof v === 'number';
    const okI = typeof i === 'number' && i > 0;
    const resistance = okV && okI ? (v as number) / (i as number) : null;
    return {
      voltageVolts: v,
      currentAmps: i,
      resistance: resistance === null ? null : roundTo(resistance, 1),
      power: okV && okI ? roundTo((v as number) * (i as number), 4) : null,
      deviation: resistance === null || nominal <= 0 ? null : roundTo(((resistance - nominal) / nominal) * 100, 2),
    };
  });

  const resistances = usable.map((r) => (r.voltageVolts as number) / (r.currentAmps as number));
  const meanR = mean(resistances);
  const sdR = sampleStdDev(resistances);
  const spread = relativeSpread(resistances);

  const points = usable.map((r, idx) => ({ x: r.currentAmps as number, y: r.voltageVolts as number, label: `R${idx + 1}` }));
  const fit = linearFit(points);

  const warnings: string[] = [];
  if (usable.length === 0 && readings.length > 0) warnings.push('Some readings are missing a current value - fill both meters.');
  if (usable.length < 3) warnings.push('At least 3 readings are needed for a reliable V-I graph.');
  if (fit && fit.r2 < 0.98) warnings.push(`Linearity R² = ${fit.r2.toFixed(3)} - check for a heating resistor or a loose lead.`);

  const rFromSlope = fit ? fit.slope : null;
  const pErr = percentError(rFromSlope, nominal);

  const measuredMaxI = points.reduce((acc, p) => Math.max(acc, p.x), 0);
  const series: GraphSeries[] = [];
  if (points.length > 0) {
    series.push({ label: 'Readings', points, kind: 'scatter', tone: 'measure' });
  }
  if (fit && points.length >= 2) {
    series.push({
      label: `Least-squares fit (R = ${rFromSlope?.toFixed(1)} Ω)`,
      points: [
        { x: 0, y: fit.intercept },
        { x: measuredMaxI * 1.08, y: fit.intercept + fit.slope * measuredMaxI * 1.08 },
      ],
      kind: 'line',
      tone: 'expect',
    });
    series.push({
      label: `Nominal ${nominal.toFixed(0)} Ω`,
      points: [
        { x: 0, y: 0 },
        { x: measuredMaxI * 1.08, y: nominal * measuredMaxI * 1.08 },
      ],
      kind: 'line',
      tone: 'expect',
    });
  }

  return {
    derivedColumns: OHMS_COLUMNS,
    rows,
    stats: [
      { key: 'n', label: 'Readings taken', value: usable.length, precision: 0 },
      { key: 'meanR', label: 'Mean R from V/I', value: meanR === null ? null : roundTo(meanR, 2), unit: 'Ω', precision: 2 },
      { key: 'sdR', label: 'Std. dev. of R', value: sdR === null ? null : roundTo(sdR, 2), unit: 'Ω', precision: 2, note: 'scatter of individual readings' },
      { key: 'spread', label: 'Relative spread', value: spread === null ? null : roundTo(spread, 2), unit: '%', precision: 2 },
      { key: 'slopeR', label: 'R from graph slope', value: rFromSlope === null ? null : roundTo(rFromSlope, 2), unit: 'Ω', precision: 2, note: 'the preferred method' },
      { key: 'r2', label: 'Linearity R²', value: fit ? roundTo(fit.r2, 4) : null, precision: 4, note: '1.000 for an ideal ohmic conductor' },
      { key: 'intercept', label: 'V-axis intercept', value: fit ? roundTo(fit.intercept, 3) : null, unit: 'V', precision: 3, note: 'should be ~0 V' },
      { key: 'nominal', label: 'Nominal resistance', value: nominal, unit: 'Ω', precision: 1 },
    ],
    graph: points.length >= 2
      ? {
          xLabel: 'Current I',
          yLabel: 'Potential difference V',
          xUnit: 'A',
          yUnit: 'V',
          series,
          caption: 'For an ohmic conductor the V-I graph is a straight line through the origin; its slope is the resistance.',
        }
      : null,
    result: {
      headline:
        rFromSlope === null
          ? 'Resistance from the V-I graph: not enough usable readings yet.'
          : `Resistance of the conductor (from graph slope) = ${rFromSlope.toFixed(1)} Ω`,
      verdict: usable.length < 3 ? 'insufficient' : pErr !== null && pErr <= 5 ? 'pass' : 'review',
      measured: { label: 'Resistance from V-I slope', value: rFromSlope, unit: 'Ω', precision: 1 },
      expected: { label: 'Nominal (colour-code) resistance', value: nominal, unit: 'Ω', precision: 1 },
      percentError: pErr,
      notes: [
        ...(fit && Math.abs(fit.intercept) > METERS.voltmeterStep * 2
          ? [`Fit does not pass through the origin (intercept ${fit.intercept.toFixed(2)} V) - zero the meters or subtract lead voltage.`]
          : []),
        ...(spread !== null && spread > 4 ? ['Spread between readings is above 4% - repeat the trial with a settled circuit.'] : []),
        ...(setup.internalOhms > 0
          ? [`Source internal resistance of ${setup.internalOhms.toFixed(1)} Ω lowers the terminal voltage, not the slope of V vs I.`]
          : []),
      ],
    },
    warnings,
  };
}
