/**
 * Concept notes: the short theory spine that connects a curriculum topic to a
 * bench experiment. Deliberately data, so a missing experiment shows up as a
 * "no lab yet" note rather than a broken page.
 */

export interface ConceptPage {
  slug: string;
  title: string;
  summary: string;
  categories: string[];
  points: string[];
  formulae: { text: string; note: string }[];
  experimentSlug?: string;
}

export interface ConceptArea {
  slug: string;
  title: string;
  blurb: string;
  pages: ConceptPage[];
}

export const CONCEPT_AREAS: ConceptArea[] = [
  {
    slug: 'mechanics',
    title: 'Mechanics',
    blurb: 'Motion, forces, energy and oscillations - the part of physics you can time with a stopwatch.',
    pages: [
      {
        slug: 'simple-pendulum',
        title: 'The simple pendulum',
        summary: 'Why a swinging bob measures gravity, and why length matters more than mass or amplitude.',
        categories: ['oscillations', 'shm'],
        points: [
          'The restoring torque comes from the tangential component of weight, so the exact equation of motion is θ̈ = −(g/L) sin θ.',
          'Only for small angles is sin θ ≈ θ, which is what makes the motion simple-harmonic and the period independent of amplitude.',
          'The period scales with √L, so plotting T² against L linearises the relationship; the gradient then carries g.',
          'Bob mass never appears: greater inertia and greater gravitational force cancel exactly.',
          'Timing N oscillations divides human reaction time by N, which is why lab procedure counts twenty swings.',
        ],
        formulae: [
          { text: 'T = 2π √(L/g)', note: 'small-angle period' },
          { text: 'T² = (4π²/g) L', note: 'linear form used for the graph' },
          { text: 'θ̈ = −(g/L) sin θ', note: 'exact equation of motion' },
        ],
        experimentSlug: 'simple-pendulum',
      },
      {
        slug: 'energy-conservation',
        title: 'Energy conservation on a swing',
        summary: 'The pendulum as a continuous exchange between kinetic and gravitational potential energy.',
        categories: ['energy'],
        points: [
          'At the extremes the speed is zero and the height - and therefore potential energy - is greatest.',
          'At the centre the height is minimal and the speed is maximal; the totals match to within damping.',
          'Tension does no work because it is always perpendicular to the motion.',
        ],
        formulae: [
          { text: 'h = L (1 − cos θ)', note: 'height above the lowest point' },
          { text: 'E = ½ m L² ω² + m g h', note: 'total mechanical energy' },
        ],
      },
    ],
  },
  {
    slug: 'electricity',
    title: 'Electricity & magnetism',
    blurb: 'Circuits, fields and the meter-level reality of what a reading actually means.',
    pages: [
      {
        slug: 'ohms-law',
        title: "Ohm's law and what a meter reads",
        summary: 'Proportionality between V and I, why the slope is the resistance, and where instrument error enters.',
        categories: ['circuits', 'measurement'],
        points: [
          "Ohm's law is a statement about proportionality at constant temperature, not a definition of resistance.",
          'Internal source resistance lowers the terminal voltage for every reading equally, so it shifts the data but not the slope.',
          'A voltmeter is placed in parallel and an ammeter in series; their resolutions set how many digits any reading can honestly have.',
          'A filament lamp is deliberately non-ohmic: its resistance rises as it heats, which bends the V-I curve.',
        ],
        formulae: [
          { text: 'V = I R', note: 'the conductor under test' },
          { text: 'E = I (R + r)', note: 'loop including source resistance' },
          { text: 'P = V I = I² R', note: 'power dissipated in the resistor' },
        ],
        experimentSlug: 'ohms-law',
      },
      {
        slug: 'series-and-parallel',
        title: 'Resistors in series and parallel',
        summary: 'How combinations add, and why the reciprocal rule appears.',
        categories: ['circuits'],
        points: [
          'Series: the same current flows through each element, so voltages add and R_total = ΣR.',
          'Parallel: the same voltage appears across each branch, so currents add and 1/R_total = Σ1/R.',
          'Ammeter and voltmeter placements change which combination you are actually measuring.',
        ],
        formulae: [
          { text: 'R = R₁ + R₂', note: 'series' },
          { text: '1/R = 1/R₁ + 1/R₂', note: 'parallel' },
        ],
      },
    ],
  },
  {
    slug: 'optics',
    title: 'Optics',
    blurb: 'Images, lenses and the thin-lens convention that trips everyone up.',
    pages: [
      {
        slug: 'thin-lens',
        title: 'The thin lens equation',
        summary: 'Real images, sign conventions, and the reciprocal graph used to find focal length.',
        categories: ['optics'],
        points: [
          'With the real-is-positive convention, 1/v + 1/u = 1/f for a real object and real image.',
          'Plotting 1/v against 1/u gives a straight line of gradient −1 with intercepts 1/f on both axes.',
          'Near the focal length the image distance explodes, so spread u well beyond f for a usable graph.',
        ],
        formulae: [{ text: '1/v + 1/u = 1/f', note: 'thin lens equation' }],
      },
    ],
  },
  {
    slug: 'waves',
    title: 'Waves',
    blurb: 'Superposition, standing waves and frequency.',
    pages: [
      {
        slug: 'standing-waves',
        title: 'Standing waves on a string',
        summary: 'Nodes, antinodes and the relationship between length, tension and frequency.',
        categories: ['waves'],
        points: [
          'Only particular frequencies fit an integer number of half-wavelengths between the ends - those are the harmonics.',
          'Wave speed depends on tension and linear density: v = √(T/μ).',
        ],
        formulae: [
          { text: 'L = n λ / 2', note: 'n loops on a string of length L' },
          { text: 'v = √(T/μ)', note: 'speed on a stretched string' },
        ],
      },
    ],
  },
];

export function findConcept(slug: string | undefined): { area: ConceptArea; page: ConceptPage } | null {
  if (!slug) return null;
  for (const area of CONCEPT_AREAS) {
    const page = area.pages.find((p) => p.slug === slug);
    if (page) return { area, page };
  }
  return null;
}
