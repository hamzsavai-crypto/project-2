import type { ExperimentDefinition } from './types';
import { ohmsLawExperiment } from './experiments/ohmsLaw';
import { pendulumExperiment } from './experiments/simplePendulum';

/**
 * The catalog. Adding an experiment means adding one definition here - the
 * shell, table, graph, result panel and persistence all follow from it.
 */
export const EXPERIMENTS: ExperimentDefinition[] = [ohmsLawExperiment, pendulumExperiment];

export interface PlannedExperiment {
  slug: string;
  title: string;
  category: ExperimentDefinition['category'];
  reason: string;
  phase: number;
}

/** Honest "coming soon" list rather than dead links. */
export const PLANNED_EXPERIMENTS: PlannedExperiment[] = [
  {
    slug: 'lens-focal-length',
    title: 'Focal length of a convex lens',
    category: 'optics',
    reason: 'Adds an optical bench and the 1/u + 1/v reciprocal treatment; reuses the same graph machinery.',
    phase: 4,
  },
  {
    slug: 'projectile-motion',
    title: 'Projectile motion',
    category: 'mechanics',
    reason: 'Measured-versus-predicted comparison rather than a straight-line fit - needs a residual view.',
    phase: 5,
  },
  {
    slug: 'series-parallel-resistance',
    title: 'Resistance in series and parallel',
    category: 'electricity',
    reason: 'Shares the Ohm’s-law rig; deferred until the circuit sandbox from source/physics-sims is lifted.',
    phase: 6,
  },
  {
    slug: 'youngs-modulus',
    title: "Young's modulus of a wire",
    category: 'thermodynamics',
    reason: 'Needs a dedicated apparatus and a stress-strain workflow; second-stage experiment.',
    phase: 7,
  },
];

export function getExperiment(slug: string | undefined): ExperimentDefinition | null {
  if (!slug) return null;
  return EXPERIMENTS.find((e) => e.slug === slug) ?? null;
}

export const CATEGORY_LABELS: Record<ExperimentDefinition['category'], string> = {
  electricity: 'Electricity & magnetism',
  mechanics: 'Mechanics',
  optics: 'Optics',
  waves: 'Waves',
  thermodynamics: 'Thermodynamics',
};
