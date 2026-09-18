import type { ComponentType, ReactElement } from 'react';
import type { LabSimProps } from '@/components/sim/contract';
import { OhmsLawSim } from '@/components/sim/OhmsLawSim';
import { PendulumSim } from '@/components/sim/PendulumSim';
import type { SimKey } from '@/features/experiments/types';

/**
 * The registry that keeps the shell experiment-agnostic: definitions name a
 * simulation by key, so the catalog stays declarative while the visual rigs
 * stay ordinary React components.
 */
export const SIMS: Record<SimKey, ComponentType<LabSimProps>> = {
  'ohms-law': OhmsLawSim,
  pendulum: PendulumSim,
};

export function AppparatePlaceholder(): ReactElement {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-lab-line/30 text-center">
      <p className="text-sm text-lab-mute">This apparatus has not been built yet.</p>
      <p className="max-w-sm text-[12px] text-lab-mute/70">
        The bench is registered per experiment; add a component to SIMS and point the definition at it.
      </p>
    </div>
  );
}
