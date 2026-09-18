import type { CellValue } from '@/lib/lab/analysis';
import { analysePendulum, G_ACCEPTED, type PendulumReading } from '@/physics/mechanics/pendulum';
import type { ExperimentDefinition, ReadingRow } from '../types';

function toReadings(rows: ReadingRow[]): PendulumReading[] {
  return rows.map((row) => ({
    lengthM: typeof row.values.lengthM === 'number' ? row.values.lengthM : null,
    totalTimeS: typeof row.values.totalTimeS === 'number' ? row.values.totalTimeS : null,
    oscillations: typeof row.values.oscillations === 'number' ? row.values.oscillations : 20,
  }));
}

/**
 * Experiment 2 - simple pendulum.
 * Deliberately different in kind from Ohm's law: nothing is read off an
 * instrument, the student operates a stopwatch, and the answer comes from a
 * squared quantity so the analysis has to linearise.
 */
export const pendulumExperiment: ExperimentDefinition = {
  slug: 'simple-pendulum',
  title: 'Determining g with a Simple Pendulum',
  subtitle: 'Time many oscillations at several lengths, then take g from the T²-L gradient',
  category: 'mechanics',
  level: 'secondary',
  minutes: 40,
  aim: 'Use the dependence of period on length to determine the acceleration due to gravity.',
  objectives: [
    'Measure the period by timing many oscillations rather than one.',
    'Show that T ∝ √L and that T² is proportional to L.',
    'Obtain g from the gradient of T² against L, and compare it with 9.80 m/s².',
    'Explain why amplitude and bob mass barely matter, and where the timing error comes from.',
  ],
  theory: {
    lead: 'For small swings the restoring torque is proportional to the angular displacement, so a pendulum executes simple harmonic motion with a period that depends only on its length and on g.',
    paragraphs: [
      'The exact equation of motion is θ̈ = −(g/L) sin θ. Replacing sin θ by θ is what makes the motion simple-harmonic and the period independent of amplitude. The simulation integrates the exact equation, which is why a release angle of 40° gives a period a couple of percent longer than the formula predicts - a genuine effect, not a measurement mistake.',
      'Squaring turns the square-root law into a straight line: T² = (4π²/g)L. Plotting T² against L therefore gives a gradient of 4π²/g, and g = 4π²/gradient. Using the gradient rather than a single trial is what makes the result robust, because timing errors at short lengths - the largest fractional errors - no longer dominate.',
      'Human reaction time is roughly 0.2 s whether you time one swing or twenty. Timing N oscillations divides that fixed error by N, which is why the procedure counts 20. The stopwatch here starts on the bob’s return to the centre, where it is moving fastest and the crossing is easiest to call.',
    ],
    equations: [
      { text: 'T = 2π √(L / g)', caption: 'Small-angle period of a simple pendulum' },
      { text: 'T² = (4π²/g) · L', caption: 'The linearised form the graph uses' },
      { text: 'g = 4π² / gradient', caption: 'The experimental value, taken from the fit' },
      { text: 'T ≈ T₀ (1 + sin²(θ₀/2) / 4)', caption: 'First-order amplitude correction' },
    ],
    keyIdeas: [
      'Keep the release angle small (≤ 15°) or the formula and the graph disagree for a real reason.',
      'Start and stop the clock at the centre of the swing, never at the extremes.',
      'Spread your lengths across the whole clamp range; a gradient needs lever arm.',
    ],
  },
  apparatus: [
    { name: 'Retort stand with clamp', note: 'Suspension point fixed at the top of the bench' },
    { name: 'Inextensible thread', note: 'Length adjustable 0.20–1.50 m, measured to the bob centre' },
    { name: 'Metal bob', note: 'Compact, dense; its mass does not enter the period' },
    { name: 'Stopwatch', note: '0.01 s resolution; reaction time dominates the uncertainty' },
    { name: 'Protractor or angle scale', note: 'For the release angle' },
  ],
  procedure: [
    { title: 'Set the length', detail: 'Choose a thread length. The length is measured from the clamp to the centre of the bob.' },
    { title: 'Release and settle', detail: 'Pull the bob to a small angle - 8° is a good default - release it without spinning, and let two or three swings settle the motion.' },
    { title: 'Time N oscillations', detail: 'Press Start timing at a centre crossing. The rig counts oscillations for you and stops itself at N, recording the elapsed time.' },
    { title: 'Change only the length', detail: 'Repeat for at least five lengths spanning the clamp range. Leave the release angle and bob mass alone.' },
    { title: 'Graph and conclude', detail: 'In Analysis, read g from the T²-L gradient, quote the percentage error against 9.80 m/s², and identify the dominant source of error.' },
  ],
  variables: [
    { key: 'lengthM', label: 'Thread length L', unit: 'm', min: 0.2, max: 1.5, step: 0.05, default: 0.8, hint: 'Clamp to bob centre - this is the independent variable' },
    { key: 'massKg', label: 'Bob mass', unit: 'kg', min: 0.02, max: 1, step: 0.01, default: 0.2, hint: 'Cannot be verified on this rig: it does not change T' },
    {
      key: 'releaseAngleDeg',
      label: 'Release angle θ₀',
      unit: '°',
      min: 2,
      max: 60,
      step: 1,
      default: 8,
      hint: 'Above ~15° the small-angle formula starts to drift',
    },
    {
      key: 'oscillations',
      label: 'Oscillations per trial N',
      unit: '',
      min: 5,
      max: 50,
      step: 5,
      default: 20,
      kind: 'stepper',
      hint: 'Timing N swings divides reaction error by N',
    },
    { key: 'gravity', label: 'Gravity (hidden)', unit: 'm/s²', min: 9.8, max: 9.8, step: 0, default: G_ACCEPTED, readOnly: true, hint: 'What you are measuring' },
  ],
  readingFields: [
    { key: 'lengthM', label: 'L', unit: 'm', precision: 2, role: 'independent', readOnly: true, min: 0.05, max: 2 },
    { key: 'oscillations', label: 'N', unit: '', precision: 0, role: 'counted', readOnly: true, min: 1, max: 100 },
    { key: 'totalTimeS', label: 't for N', unit: 's', precision: 2, role: 'measured', min: 0.5, max: 300 },
  ],
  minReadings: 3,
  tolerancePercent: 5,
  sim: 'pendulum',
  sample: {
    label: 'Worked example: six lengths, 20 oscillations each',
    params: { lengthM: 1.0, massKg: 0.2, releaseAngleDeg: 8, oscillations: 20, gravity: G_ACCEPTED },
    readings: [
      { lengthM: 0.2, oscillations: 20, totalTimeS: 18.1 },
      { lengthM: 0.4, oscillations: 20, totalTimeS: 25.3 },
      { lengthM: 0.6, oscillations: 20, totalTimeS: 31.2 },
      { lengthM: 0.8, oscillations: 20, totalTimeS: 35.8 },
      { lengthM: 1.0, oscillations: 20, totalTimeS: 40.3 },
      { lengthM: 1.2, oscillations: 20, totalTimeS: 44.0 },
    ] as Record<string, CellValue>[],
  },
  analyse: ({ readings }) => analysePendulum({ readings: toReadings(readings), gravityAccepted: G_ACCEPTED }),
};
