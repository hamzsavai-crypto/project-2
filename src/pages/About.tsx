import { Link } from 'react-router-dom';
import { Panel, PanelHeader } from '@/components/ui/Panel';

const LAYERS = [
  {
    name: 'src/physics/**',
    role: 'Pure physics and measurement models. No React, no DOM.',
    detail: 'Every formula the laboratory quotes lives here and is unit-tested, so a number on screen can be traced to an assertion.',
  },
  {
    name: 'src/lib/lab/analysis.ts',
    role: 'The contract between physics and UI.',
    detail: 'Physics returns columns, statistics, a graph and a result; the engine only knows how to render those.',
  },
  {
    name: 'src/features/experiments/**',
    role: 'Experiment definitions, catalog and run state.',
    detail: 'A definition is data: theory, apparatus, procedure, variables, reading columns, tolerance, plus one analyse function.',
  },
  {
    name: 'src/components/lab/**',
    role: 'The reusable laboratory engine.',
    detail: 'Shell, step rail, bench frame, observation table, analysis and result panels. New experiments do not build UI here.',
  },
  {
    name: 'src/components/sim/**',
    role: 'Interactive apparatus.',
    detail: 'The only place with animation loops. Each rig implements the LabSimProps contract and pushes readings upward.',
  },
  {
    name: 'source/**',
    role: 'Pinned upstream sources, read-only.',
    detail: 'Submodules used as reference material for adaptation, never imported by the app build.',
  },
];

export function About() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-6">
      <header>
        <p className="rule-label">Architecture & attribution</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-lab-ink">How this is put together</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-lab-mute">
          VPL is one application shell with one design system. External repositories contribute ingredients - physics maths, integrators, interaction
          patterns - and are never merged wholesale.
        </p>
      </header>

      <Panel className="mt-7">
        <PanelHeader eyebrow="Layers" title="Dependency direction: pages → engine → contract → physics" />
        <ul className="divide-y divide-lab-line/15">
          {LAYERS.map((l) => (
            <li key={l.name} className="px-4 py-3">
              <code className="font-mono text-[12px] text-lab-accent">{l.name}</code>
              <p className="mt-1 text-[13px] font-medium text-lab-ink">{l.role}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-lab-mute">{l.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-5">
        <PanelHeader eyebrow="Source material" title="What was taken, and on what terms" />
        <div className="space-y-4 px-4 py-4 text-[13px] leading-relaxed text-lab-mute">
          <p>
            <span className="font-medium text-lab-ink">IlliniOpenEdu/PhysicsSims</span> (MIT) - pinned at{' '}
            <code className="font-mono text-[12px] text-lab-ink">source/physics-sims</code> @ <code className="font-mono text-[12px]">bd7144d</code>. The
            pendulum integrator in <code className="font-mono text-[12px]">src/physics/mechanics/pendulum.ts</code> is adapted from the velocity-Verlet step in its{' '}
            <code className="font-mono text-[12px]">PendulumExplorer.tsx</code>; the large-angle equation of motion, the energy expressions and the
            tension formula are theirs, re-declared as pure functions so they can be tested. Its modified-nodal-analysis circuit solver is deliberately
            <span className="text-lab-ink"> not</span> re-implemented here: the laboratory needs a meter model, not a second solver, and the general
            solver should be lifted intact when the open circuit sandbox is built.
          </p>
          <p>
            <span className="font-medium text-lab-ink">lgarczyn/AnimateUIMaterials</span> (MIT) - pinned at{' '}
            <code className="font-mono text-[12px]">source/animate-ui-materials</code> @ <code className="font-mono text-[12px]">c7537f7</code>. This is a{' '}
            <span className="text-lab-ink">Unity C#/ShaderLab</span> package for animating UI materials. Nothing in it is reusable by a React app; it is
            kept as a reference for animation feel and for any Unity deliverable, and no code was taken from it.
          </p>
          <p>
            <span className="font-medium text-lab-ink">imskyleen/animate-ui</span> (MIT + Commons Clause) - not vendored. Its component patterns (tabs
            with a shared layout indicator, press feedback on instruments, animated counters, step transitions) were re-implemented against this
            project’s Tailwind v3 setup rather than installed, because the upstream distribution targets Tailwind v4 and the Commons Clause forbids
            redistributing its components in original form. Attribution here is by courtesy, not legal requirement.
          </p>
          <p className="border-t border-lab-line/20 pt-3 text-[12px]">
            PhysicsSims is © University of Illinois Illinois Physics, released under the MIT licence; retain this notice in any redistribution of adapted
            source. Upstream notes that its ESLint config is legacy and its typecheck is the gate - VPL follows the same rule:{' '}
            <code className="font-mono text-[12px] text-lab-ink">npm run build</code> runs <code className="font-mono text-[12px] text-lab-ink">tsc --noEmit</code>{' '}
            before bundling.
          </p>
        </div>
      </Panel>

      <Panel className="mt-5">
        <PanelHeader eyebrow="Deferred" title="Deliberately not built yet" />
        <ul className="space-y-2 px-4 py-4 text-[13px] leading-relaxed text-lab-mute">
          <li>· Accounts and server-side history: the save path is local storage behind a typed seam, so an API can replace it without touching the engine.</li>
          <li>· Lens and projectile experiments: registered in the catalog backlog with the reason they wait.</li>
          <li>· Light theme: the palette is already semantic CSS variables, so this is a token file rather than a refactor.</li>
          <li>· LaTeX typesetting: equations are rendered as styled text. KaTeX should arrive with the concepts library, not before.</li>
        </ul>
      </Panel>

      <p className="mt-6 text-[12px] text-lab-mute">
        Read the plan: <Link to="/about" className="text-lab-accent hover:underline">docs/PLAN.md</Link> in the repository, or{' '}
        <Link to="/experiments" className="text-lab-accent hover:underline">go to the bench</Link>.
      </p>
    </div>
  );
}
