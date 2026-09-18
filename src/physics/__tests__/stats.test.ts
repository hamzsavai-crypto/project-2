import { describe, expect, it } from 'vitest';
import { clamp, linearFit, mean, percentError, quantise, relativeSpread, roundTo, sampleStdDev } from '../common/stats';

describe('statistics used by every experiment', () => {
  it('computes means and sample standard deviation', () => {
    expect(mean([1, 2, 3])).toBeCloseTo(2, 10);
    expect(mean([])).toBeNull();
    // n-1 denominator, as a lab report requires.
    expect(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13808993, 6);
    expect(sampleStdDev([5])).toBeNull();
  });

  it('reports relative spread as a percentage of the mean', () => {
    expect(relativeSpread([10, 10, 10])).toBeCloseTo(0, 10);
    expect(relativeSpread([1])).toBeNull();
  });

  it('fits a straight line and recovers its slope', () => {
    const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: 2.5 * x + 0.2 }));
    const fit = linearFit(pts);
    expect(fit).not.toBeNull();
    expect(fit?.slope).toBeCloseTo(2.5, 9);
    expect(fit?.intercept).toBeCloseTo(0.2, 9);
    expect(fit?.r2).toBeCloseTo(1, 9);
  });

  it('refuses to fit fewer than two distinct x values', () => {
    expect(linearFit([{ x: 1, y: 1 }])).toBeNull();
    expect(linearFit([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
    expect(linearFit([{ x: 1, y: 1 }, { x: 2, y: Number.NaN }])).toBeNull();
  });

  it('keeps the sign convention for percentage error as an absolute deviation', () => {
    expect(percentError(9.31, 9.8)).toBeCloseTo(5, 2);
    expect(percentError(9.8, 9.8)).toBeCloseTo(0, 10);
    expect(percentError(null, 9.8)).toBeNull();
    expect(percentError(1, 0)).toBeNull();
  });

  it('quantises to an instrument division', () => {
    expect(quantise(0.433, 0.05)).toBeCloseTo(0.45, 10);
    expect(quantise(2.71828, 0)).toBeCloseTo(2.71828, 10);
    expect(roundTo(1.23456, 2)).toBeCloseTo(1.23, 10);
    expect(clamp(9, 0, 5)).toBe(5);
  });
});
