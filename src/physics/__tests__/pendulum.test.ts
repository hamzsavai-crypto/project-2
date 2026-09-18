import { describe, expect, it } from 'vitest';
import {
  advance,
  analysePendulum,
  amplitudeCorrectedPeriod,
  energyJ,
  G_ACCEPTED,
  releaseAngleRad,
  smallAnglePeriod,
  stepPendulum,
  stringTension,
  type PendulumReading,
} from '../mechanics/pendulum';

/** Readings generated from the exact small-angle law, as a perfect student would produce. */
function idealReadings(lengths: number[], oscillations = 20, g = G_ACCEPTED): PendulumReading[] {
  return lengths.map((L) => ({
    lengthM: L,
    oscillations,
    totalTimeS: oscillations * smallAnglePeriod(L, g),
  }));
}

describe('pendulum kinematics (adapted from PhysicsSims)', () => {
  it('gives the textbook small-angle period', () => {
    expect(smallAnglePeriod(1)).toBeCloseTo(2.0071, 4);
    expect(smallAnglePeriod(0.25)).toBeCloseTo(1.0035, 4);
    expect(smallAnglePeriod(0)).toBe(0);
  });

  it('conserves energy while integrating theta double dot = -(g/L) sin theta', () => {
    let state = { theta: releaseAngleRad(10), omega: 0, time: 0 };
    const start = energyJ(1, 0.2, state.theta, state.omega).total;
    for (let i = 0; i < 4000; i++) state = stepPendulum(state, { lengthM: 1, gravity: 9.8 }, 1 / 480);
    const end = energyJ(1, 0.2, state.theta, state.omega).total;
    // Velocity-Verlet drifts a little over long runs; it must not drift badly.
    expect(Math.abs(end - start) / start).toBeLessThan(2e-3);
  });

  it('counts exactly one centre crossing per complete oscillation', () => {
    // The stopwatch in the rig depends on this: arming at a downward crossing
    // and stopping N crossings later must measure exactly N periods.
    const L = 0.5;
    const period = smallAnglePeriod(L, 9.8);
    let state = { theta: releaseAngleRad(6), omega: 0, time: 0 };
    let cycles = 0;
    while (state.time < period * 4) {
      const next = advance(state, { lengthM: L, gravity: 9.8 }, period / 200);
      state = next.state;
      cycles += next.cycles;
    }
    expect(cycles).toBe(4);
  });

  it('predicts a longer period at large amplitude', () => {
    const small = amplitudeCorrectedPeriod(1, releaseAngleRad(3));
    const big = amplitudeCorrectedPeriod(1, releaseAngleRad(50));
    expect(big).toBeGreaterThan(small * 1.04);
  });

  it('has a tension that exceeds weight at the bottom of the swing', () => {
    const atBottom = stringTension(1, 0.2, 0, 2);
    const atRest = stringTension(1, 0.2, 0, 0);
    expect(atBottom).toBeGreaterThan(atRest);
    expect(atRest).toBeCloseTo(0.2 * 9.8, 10);
  });
});

describe('pendulum laboratory analysis', () => {
  it('recovers g = 9.80 from ideal timing data via the graph gradient', () => {
    const out = analysePendulum({ readings: idealReadings([0.2, 0.4, 0.6, 0.8, 1.0, 1.2]) });
    expect(out.result.verdict).toBe('pass');
    expect(out.result.measured.value).toBeCloseTo(9.8, 6);
    expect(out.result.percentError).toBeCloseTo(0, 6);
    expect(out.graph).not.toBeNull();
    expect(out.graph?.series.some((s) => s.kind === 'scatter')).toBe(true);
    expect(out.rows[0]?.period).toBeCloseTo(0.8976, 3);
  });

  it('recovers g from a single trial too, showing why one point is not enough', () => {
    const out = analysePendulum({ readings: idealReadings([0.9]) });
    expect(out.rows[0]?.gRow).toBeCloseTo(9.8, 4);
    // One trial: no gradient, and the method gate has not been passed.
    expect(out.result.measured.value).toBeNull();
    expect(out.result.verdict).toBe('insufficient');
    expect(out.warnings.length).toBeGreaterThan(0);
  });

  it('flags constant-length trials, the classic way this experiment goes wrong', () => {
    const readings: PendulumReading[] = [0, 1, 2, 3].map((i) => ({
      lengthM: 0.8,
      oscillations: 20,
      totalTimeS: 35.9 + i * 0.05,
    }));
    const out = analysePendulum({ readings });
    expect(out.warnings.join(' ')).toMatch(/spread along L|vary the length/i);
  });

  it('handles missing or impossible entries without throwing', () => {
    const out = analysePendulum({
      readings: [
        { lengthM: null, totalTimeS: null, oscillations: 20 },
        { lengthM: 0.5, totalTimeS: 0, oscillations: 20 },
        { lengthM: 0.5, totalTimeS: 14.2, oscillations: 0 },
      ],
    });
    expect(out.rows).toHaveLength(3);
    expect(out.rows[0]?.period).toBeNull();
    expect(out.result.verdict).toBe('insufficient');
    expect(out.graph).toBeNull();
  });

  it('computes the stopwatch improvement the procedure claims', () => {
    // Timing 20 swings instead of 1 divides a fixed reaction error by 20.
    const reactionS = 0.2;
    const L = 0.6;
    const truePeriod = smallAnglePeriod(L);
    const single = analysePendulum({ readings: [{ lengthM: L, oscillations: 1, totalTimeS: truePeriod + reactionS }] });
    const many = analysePendulum({ readings: idealReadings([0.3, 0.45, 0.6, 0.75, 0.9]) });
    const periodFromSingle = (single.rows[0]?.period as number) ?? Number.NaN;
    // Table values carry the display rounding (4 dp), so compare at that scale.
    expect(periodFromSingle - truePeriod).toBeCloseTo(reactionS, 4);
    expect(many.result.measured.value).toBeCloseTo(G_ACCEPTED, 6);
  });
});
