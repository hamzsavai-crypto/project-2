import { Link } from 'react-router-dom';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import { SpotlightCard } from '@/components/bits';
import { EXPERIMENTS, PLANNED_EXPERIMENTS, CATEGORY_LABELS } from '@/features/experiments/registry';

export function Experiments() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rule-label">Experiments</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-lab-ink">Structured laboratory activities</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-lab-mute">
            Every experiment runs through the same shell: theory, apparatus, bench, observations, analysis, graph, result, save. Four were listed as MVP
            candidates; the two below are built first because they exercise different interaction models.
          </p>
        </div>
        <Badge tone="accent">{EXPERIMENTS.length} available</Badge>
      </header>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {EXPERIMENTS.map((e) => (
          <SpotlightCard key={e.slug} className="vpl-card" spotlightColor="rgba(34, 211, 238, 0.18)">
          <Link to={`/experiments/${e.slug}`} className="group flex h-full flex-col p-5">
            <div className="flex items-center gap-2">
              <Badge>{CATEGORY_LABELS[e.category]}</Badge>
              <Badge tone="measure">{e.minutes} min</Badge>
              <Badge>{e.level === 'secondary' ? 'Secondary' : 'Undergraduate'}</Badge>
            </div>
            <h2 className="mt-3 text-[17px] font-semibold text-lab-ink group-hover:text-lab-accent">{e.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-lab-mute">{e.subtitle}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-lab-line/20 pt-3 text-[11px]">
              <Field label="Apparatus" value={`${e.apparatus.length} items`} />
              <Field label="Steps" value={`${e.procedure.length}`} />
              <Field label="Readings" value={`≥ ${e.minReadings}`} />
              <Field label="Tolerance" value={`± ${e.tolerancePercent}%`} />
            </dl>
            <span className="mt-4 text-[12px] text-lab-accent">Enter laboratory →</span>
          </Link>
          </SpotlightCard>
        ))}
      </div>

      <section className="mt-10">
        <Panel>
          <PanelHeader eyebrow="Backlog" title="Chosen but not built yet" />
          <ul className="divide-y divide-lab-line/15">
            {PLANNED_EXPERIMENTS.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                <span className="text-[13px] font-medium text-lab-ink/80">{p.title}</span>
                <Badge>{CATEGORY_LABELS[p.category]}</Badge>
                <span className="text-[12px] text-lab-mute">{p.reason}</span>
                <span className="ml-auto font-mono text-[10px] text-lab-mute/70">phase {p.phase}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-lab-mute">{label}</dt>
      <dd className="font-mono text-lab-ink">{value}</dd>
    </div>
  );
}
