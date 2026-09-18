import { Link } from 'react-router-dom';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import { EXPERIMENTS } from '@/features/experiments/registry';

type SimStatus = 'embedded' | 'next' | 'link';

interface SimEntry {
  id: string;
  title: string;
  area: string;
  status: SimStatus;
  note: string;
  href?: string;
}

/**
 * The open-exploration layer. `source/physics-sims` already ships 73 simulation
 * pages; per the architecture notes we do not fork that application in here.
 * Instead: rigs a lab needs are re-implemented against the shared measurement
 * contract (embedded), the rest link to the hosted PhysicsSims app until they
 * are adapted, and "next" marks the queue.
 */
export const SIMULATIONS: SimEntry[] = [
  { id: 'pendulum', title: 'Simple pendulum', area: 'Oscillations', status: 'embedded', note: 'Released bob, self-stopping stopwatch, live θ, v, T and E.' },
  { id: 'ohms', title: 'DC circuit with real meters', area: 'Electricity', note: 'Battery, resistor colour code, meters that quantise at instrument resolution.', status: 'embedded' },
  { id: 'builder', title: 'Universal circuit builder', area: 'Electricity', status: 'next', note: 'Lifts the MNA solver from source/physics-sims as an open sandbox.' },
  { id: 'optics', title: 'Lens and optical bench', area: 'Optics', status: 'next', note: 'Shared by the focal-length experiment.' },
  { id: 'kinematics', title: 'Projectile motion', area: 'Mechanics', status: 'next', note: 'Measured versus predicted trajectory with residuals.' },
  { id: 'oscillations', title: 'Springs, waves, frequency generator', area: 'Oscillations', status: 'link', href: 'https://physicssims.illiniopenedu.org', note: 'Hosted in PhysicsSims for now.' },
  { id: 'orbits', title: 'Orbital motion and Kepler', area: 'Mechanics', status: 'link', href: 'https://physicssims.illiniopenedu.org', note: 'Hosted in PhysicsSims for now.' },
  { id: 'truss', title: 'Truss solver', area: 'Statics', status: 'link', href: 'https://physicssims.illiniopenedu.org', note: 'Validated solver with textbook checks.' },
  { id: 'thermo', title: 'Heat engines and Carnot cycle', area: 'Thermodynamics', status: 'link', href: 'https://physicssims.illiniopenedu.org', note: 'Hosted in PhysicsSims for now.' },
];

export function Simulations() {
  const embeddedSlugs = new Set(EXPERIMENTS.map((e) => e.slug));
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <header>
        <p className="rule-label">Simulations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-lab-ink">Open exploration, no worksheet</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-lab-mute">
          Rig-based play without a required result. The two embedded here are the same components the laboratory uses, so intuition built in one place
          transfers exactly.
        </p>
      </header>

      <Panel className="mt-7">
        <PanelHeader eyebrow="Catalog" title={`${SIMULATIONS.length} rigs`} actions={<Badge tone="pass">{SIMULATIONS.filter((s) => s.status === 'embedded').length} embedded</Badge>} />
        <ul className="divide-y divide-lab-line/15">
          {SIMULATIONS.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
              <span className="min-w-40">
                <span className="block text-[13px] font-medium text-lab-ink">{s.title}</span>
                <span className="block text-[11px] text-lab-mute">{s.area}</span>
              </span>
              <span className="flex-1 text-[12px] text-lab-mute">{s.note}</span>
              {s.status === 'embedded' ? (
                <Link
                  to={`/experiments/${embeddedSlugs.has('simple-pendulum') && s.id === 'pendulum' ? 'simple-pendulum' : 'ohms-law'}`}
                  className="rounded-lg border border-lab-accent/40 px-2.5 py-1 text-[12px] text-lab-accent hover:bg-lab-accent/10"
                >
                  Open rig
                </Link>
              ) : s.status === 'next' ? (
                <Badge tone="measure">queued</Badge>
              ) : (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-lab-line/40 px-2.5 py-1 text-[12px] text-lab-mute hover:text-lab-ink"
                >
                  PhysicsSims ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mt-4 text-[12px] leading-relaxed text-lab-mute/80">
        Simulations marked <span className="text-lab-mute">PhysicsSims</span> run in the upstream application rather than being re-hosted here. Keeping
        one application shell and one design system is an explicit constraint of this project - see{' '}
        <Link to="/about" className="text-lab-accent hover:underline">
          architecture notes
        </Link>
        .
      </p>
    </div>
  );
}
