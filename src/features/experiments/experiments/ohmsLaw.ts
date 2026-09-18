import type { CellValue } from '@/lib/lab/analysis';
import { analyseOhms, type OhmsReading } from '@/physics/electricity/ohmsLaw';
import type { ExperimentDefinition, ReadingRow } from '../types';

function num(value: CellValue): number {
  return typeof value === 'number' ? value : NaN;
}

function toReadings(rows: ReadingRow[]): OhmsReading[] {
  return rows.map((row) => {
    const v = row.values.voltageVolts ?? null;
    const i = row.values.currentAmps ?? null;
    return {
      voltageVolts: v === null || Number.isNaN(num(v)) ? null : num(v),
      currentAmps: i === null || Number.isNaN(num(i)) ? null : num(i),
    };
  });
}

/**
 * Experiment 1 - Ohm's law.
 * Chosen first because it exercises every part of the loop: an instrument that
 * returns a value, a linear graph, and a slope that is itself the answer.
 */
export const ohmsLawExperiment: ExperimentDefinition = {
  slug: 'ohms-law',
  title: "Verification of Ohm's Law",
  subtitle: 'Sweep the potential difference, read the current, extract the resistance from the graph',
  category: 'electricity',
  level: 'secondary',
  minutes: 35,
  aim: 'Establish that V is proportional to I for an ohmic conductor and determine its resistance from the gradient.',
  objectives: [
    'Set up a DC circuit and read a voltmeter and ammeter correctly, including their resolution.',
    'Show that V ∝ I for a fixed resistor at constant temperature.',
    'Obtain R from the gradient of the V-I graph and compare it with the colour-code value.',
    'Quantify how the source resistance and meter resolution affect the answer.',
  ],
  theory: {
    lead: 'Ohm’s law states that the current through a conductor is proportional to the potential difference across it, provided physical conditions such as temperature remain constant.',
    paragraphs: [
      'For a metal at steady temperature, electrons are accelerated by the field between collisions with the lattice. The drift velocity - and therefore the current - settles at a value proportional to the field, which is why V and I are linearly related. The constant of proportionality is the resistance R.',
      'A real bench source is not ideal: its internal resistance r drops some of the EMF, so the terminal voltage you measure across the resistor is E − Ir. Changing r moves the whole set of readings down together; it does not change the slope of V against I, which is why the graph method is more robust than dividing one reading by another.',
      'Every meter also quantises what it shows. A voltmeter whose smallest division is 0.05 V cannot resolve differences below that, and the last digit is a guess. Recording readings at the meter’s resolution - not more - is part of honest practice, and it is what the Record button enforces here.',
    ],
    equations: [
      { text: 'V = I R', caption: "Ohm's law for the conductor under test" },
      { text: 'E = I (R + r)', caption: 'Loop equation including the source resistance r' },
      { text: 'R = slope of V vs I', caption: 'The quantity the graph actually gives you' },
      { text: '% error = |R_measured − R_nominal| / R_nominal × 100', caption: 'Against the colour-code value' },
    ],
    keyIdeas: [
      'Plot V against I: the slope is R. Do not average individual V/I quotients and call it done.',
      'A straight line must pass through the origin. A non-zero intercept means offset meters or lead resistance.',
      'A filament lamp curves; if your resistor heats up and the line bends, that is physics, not error.',
    ],
  },
  apparatus: [
    { name: 'Low-voltage DC supply', note: 'Adjustable 0.5–12 V, with a series internal resistance r' },
    { name: 'Resistor under test', note: '4-band through-hole, 5% tolerance, value shown by the colour code' },
    { name: 'Moving-coil voltmeter', note: 'Range 0–15 V, smallest division 0.05 V, connected in parallel' },
    { name: 'Moving-coil ammeter', note: 'Range 0–1 A, smallest division 2 mA, connected in series' },
    { name: 'Switch and leads', note: 'Assumed negligible resistance' },
  ],
  procedure: [
    { title: 'Set up the circuit', detail: 'Choose the resistor under test and the source resistance. Check the current estimate stays well inside the 1 A ammeter range.' },
    { title: 'Take the first reading', detail: 'Raise the supply until the voltmeter shows a clear deflection, wait for the needle to settle, then press Record. The meters capture their own resolution for you.' },
    { title: 'Sweep the voltage', detail: 'Increase the supply in even steps and record at least five more readings, spanning as much of the scale as the resistor can take.' },
    { title: 'Analyse', detail: 'Open Analysis: the mean of V/I gives a quick estimate, while the fit of V against I gives the accepted one. Note R² and the intercept.' },
    { title: 'State the result', detail: 'Report R from the gradient with its percentage error against the colour-code value, then save the attempt to My Laboratory.' },
  ],
  variables: [
    { key: 'emfVolts', label: 'Supply EMF', unit: 'V', min: 0.5, max: 12, step: 0.1, default: 3.0, hint: 'Sweep this to take readings' },
    { key: 'externalOhms', label: 'Resistor under test', unit: 'Ω', min: 5, max: 1000, step: 5, default: 100, hint: 'Sets the colour code and the expected answer' },
    { key: 'internalOhms', label: 'Source resistance r', unit: 'Ω', min: 0, max: 50, step: 0.5, default: 0.5, hint: 'Drops terminal voltage; leaves the V-I slope unchanged' },
  ],
  readingFields: [
    { key: 'voltageVolts', label: 'V', unit: 'V', precision: 2, role: 'measured', min: 0, max: 15 },
    { key: 'currentAmps', label: 'I', unit: 'A', precision: 3, role: 'measured', min: 0, max: 1 },
  ],
  minReadings: 3,
  tolerancePercent: 5,
  sim: 'ohms-law',
  sample: {
    label: 'Worked example: 100 Ω resistor, 5% tolerance',
    params: { emfVolts: 10, externalOhms: 100, internalOhms: 0.5 },
    readings: [
      { voltageVolts: 1.95, currentAmps: 0.02 },
      { voltageVolts: 3.9, currentAmps: 0.04 },
      { voltageVolts: 5.95, currentAmps: 0.061 },
      { voltageVolts: 7.9, currentAmps: 0.079 },
      { voltageVolts: 9.95, currentAmps: 0.099 },
    ] as Record<string, CellValue>[],
  },
  analyse: ({ params, readings }) =>
    analyseOhms({
      readings: toReadings(readings),
      setup: {
        emfVolts: params.emfVolts ?? 0,
        externalOhms: params.externalOhms ?? 100,
        internalOhms: params.internalOhms ?? 0,
      },
    }),
};
