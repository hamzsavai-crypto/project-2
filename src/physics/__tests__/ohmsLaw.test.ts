import { describe, expect, it } from 'vitest';
import {
  analyseOhms,
  currentFor,
  meterReading,
  powerDissipated,
  readingFor,
  resistorBands,
  validateSetup,
  voltageAcrossResistor,
  METERS,
  type OhmsReading,
} from '../electricity/ohmsLaw';

const ohmic = (R: number, currents: number[]): OhmsReading[] =>
  currents.map((i) => ({ voltageVolts: i * R, currentAmps: i }));

describe("Ohm's law circuit model", () => {
  it('solves the single-loop current including source resistance', () => {
    expect(currentFor({ emfVolts: 6, externalOhms: 100, internalOhms: 0 })).toBeCloseTo(0.06, 10);
    expect(currentFor({ emfVolts: 6, externalOhms: 100, internalOhms: 20 })).toBeCloseTo(0.05, 10);
    expect(voltageAcrossResistor({ emfVolts: 6, externalOhms: 100, internalOhms: 20 })).toBeCloseTo(5, 10);
    expect(powerDissipated({ emfVolts: 6, externalOhms: 100, internalOhms: 0 })).toBeCloseTo(0.36, 10);
  });

  it('rejects a setup the instruments cannot survive', () => {
    expect(validateSetup({ emfVolts: 0, externalOhms: 10, internalOhms: 0 })).not.toBeNull();
    expect(validateSetup({ emfVolts: 6, externalOhms: 0.2, internalOhms: 0 })).not.toBeNull();
    expect(validateSetup({ emfVolts: 6, externalOhms: 100, internalOhms: 1 })).toBeNull();
  });

  it('quantises a meter to its smallest division', () => {
    expect(meterReading(2.037, METERS.voltmeterStep, 0)).toBeCloseTo(2.05, 10);
    expect(meterReading(0.0209, METERS.ammeterStep, 0)).toBeCloseTo(0.02, 10);
    // Zero noise and zero tolerance must return the exact division multiple.
    expect(meterReading(5, 0.05, 0, 0)).toBe(5);
  });

  it('produces readings that are within instrument accuracy of the truth', () => {
    const setup = { emfVolts: 8, externalOhms: 220, internalOhms: 2 };
    const truthV = voltageAcrossResistor(setup);
    const truthI = currentFor(setup);
    for (let n = 0; n < 200; n++) {
      const r = readingFor(setup, n / 100 - 1, 1 - n / 100);
      expect(Math.abs((r.voltageVolts as number) - truthV)).toBeLessThanOrEqual(truthV * METERS.accuracyFraction + METERS.voltmeterStep);
      expect(Math.abs((r.currentAmps as number) - truthI)).toBeLessThanOrEqual(truthI * METERS.accuracyFraction + METERS.ammeterStep);
    }
  });

  it('encodes the resistor value in a 4-band colour code', () => {
    const bands = resistorBands(220);
    expect(bands.digits).toEqual(['red', 'red']);
    expect(bands.multiplier).toBe('brown');
    expect(bands.tolerance).toBe('gold');
    expect(resistorBands(47).digits).toEqual(['yellow', 'violet']);
  });
});

describe("Ohm's law laboratory analysis", () => {
  it('recovers the resistance from the V-I gradient', () => {
    const out = analyseOhms({ readings: ohmic(100, [0.02, 0.04, 0.06, 0.08, 0.1]), setup: { emfVolts: 10, externalOhms: 100, internalOhms: 0 } });
    expect(out.result.measured.value).toBeCloseTo(100, 6);
    expect(out.result.percentError).toBeCloseTo(0, 6);
    expect(out.result.verdict).toBe('pass');
    expect(out.graph?.xLabel).toBe('Current I');
  });

  it('is unaffected in its slope by source resistance, which is the point of the graph method', () => {
    const ideal = analyseOhms({ readings: ohmic(150, [0.02, 0.04, 0.06]), setup: { emfVolts: 9, externalOhms: 150, internalOhms: 0 } });
    const loaded = analyseOhms({ readings: ohmic(150, [0.02, 0.04, 0.06]), setup: { emfVolts: 9, externalOhms: 150, internalOhms: 25 } });
    expect(ideal.result.measured.value).toBeCloseTo(loaded.result.measured.value ?? 0, 8);
  });

  it('flags a non-ohmic set of readings instead of reporting a tidy answer', () => {
    const curved: OhmsReading[] = [0.01, 0.02, 0.03, 0.04, 0.05].map((i, k) => ({
      voltageVolts: i * (100 + k * 200),
      currentAmps: i,
    }));
    const out = analyseOhms({ readings: curved, setup: { emfVolts: 6, externalOhms: 100, internalOhms: 0 } });
    expect(out.result.verdict).toBe('review');
    expect(out.warnings.join(' ')).toMatch(/Linearity/i);
  });

  it('marks an incomplete table as insufficient rather than inventing a result', () => {
    const out = analyseOhms({
      readings: [
        { voltageVolts: 2, currentAmps: null },
        { voltageVolts: null, currentAmps: 0.02 },
      ],
      setup: { emfVolts: 6, externalOhms: 100, internalOhms: 0 },
    });
    expect(out.result.verdict).toBe('insufficient');
    expect(out.graph).toBeNull();
    expect(out.warnings.join(' ')).toMatch(/missing a current|3 readings/i);
  });

  it('computes the derived columns a record book expects', () => {
    const out = analyseOhms({ readings: ohmic(120, [0.025, 0.05]), setup: { emfVolts: 6, externalOhms: 120, internalOhms: 0 } });
    expect(out.derivedColumns.map((c) => c.key)).toEqual(['resistance', 'power', 'deviation']);
    expect(out.rows[0]?.resistance).toBeCloseTo(120, 1);
    expect(out.rows[0]?.power).toBeCloseTo(0.025 * 3, 2);
    expect(out.rows[0]?.deviation).toBeCloseTo(0, 1);
  });
});
