import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, FadeSwap, Panel, PanelHeader } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { VariableControl } from '@/components/ui/VariableControl';
import { cn } from '@/lib/cn';
import { useExperimentRun, type RunBootstrap, type UseExperimentRun } from '@/features/experiments/useExperimentRun';
import type { CellValue } from '@/lib/lab/analysis';
import type { ExperimentDefinition, SimKey } from '@/features/experiments/types';
import { AppparatePlaceholder, SIMS } from './sims';
import { AnalysisPanel } from './AnalysisPanel';
import { ApparatusPanel, ProcedurePanel, TheoryPanel } from './ContentPanels';
import { ObservationTable } from './ObservationTable';
import { ResultPanel } from './ResultPanel';

type StepId = 'theory' | 'apparatus' | 'procedure' | 'lab' | 'observations' | 'analysis' | 'result';

const STEP_ORDER: { id: StepId; label: string }[] = [
  { id: 'theory', label: 'Theory' },
  { id: 'apparatus', label: 'Apparatus' },
  { id: 'procedure', label: 'Procedure' },
  { id: 'lab', label: 'Lab bench' },
  { id: 'observations', label: 'Observations' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'result', label: 'Result' },
];

/**
 * One shell for every experiment. An experiment supplies a definition and a
 * simulation; the navigation, gating, table, analysis, result and saving all
 * come from here. This is the load-bearing abstraction of the project: new
 * experiments must not build their own laboratory UI.
 */
export function ExperimentShell({ def, bootstrap }: { def: ExperimentDefinition; bootstrap?: RunBootstrap }) {
  const run = useExperimentRun(def, bootstrap);
  const [step, setStep] = useState<StepId>('lab');

  const locked = run.usableCount < def.minReadings;
  const items: TabItem[] = useMemo(
    () =>
      STEP_ORDER.map((s) => ({
        id: s.id,
        label: s.label,
        locked: (s.id === 'analysis' || s.id === 'result') && locked,
        lockReason: `Record ${def.minReadings} usable readings first`,
        trailing: s.id === 'observations' ? String(run.readings.length) : undefined,
      })),
    [locked, def.minReadings, run.readings.length],
  );

  const go = useCallback(
    (id: string) => {
      const target = id as StepId;
      if ((target === 'analysis' || target === 'result') && locked) return;
      setStep(target);
    },
    [locked],
  );

  const Sim = SIMS[def.sim as SimKey] ?? AppparatePlaceholder;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-5 sm:px-6">
      <ShellHeader def={def} run={run} onStep={go} locked={locked} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
        <StepRail items={items} active={step} onSelect={go} />

        <div className="min-w-0">
          <div className="mb-3 lg:hidden">
            <Tabs items={items} active={step} onChange={go} className="panel px-1.5 py-1.5" />
          </div>
          <FadeSwap axisKey={step}>
            <StepBody def={def} run={run} step={step} Sim={Sim} />
          </FadeSwap>
        </div>
      </div>
    </div>
  );
}

function ShellHeader({
  def,
  run,
  onStep,
  locked,
}: {
  def: ExperimentDefinition;
  run: UseExperimentRun;
  onStep: (id: string) => void;
  locked: boolean;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-lab-line/25 pb-4">
      <div className="min-w-0">
        <Link to="/experiments" className="text-[11px] uppercase tracking-[0.14em] text-lab-mute hover:text-lab-accent">
          ← All experiments
        </Link>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-lab-ink sm:text-2xl">{def.title}</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-lab-mute">{def.aim}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge>{def.level === 'secondary' ? 'Secondary' : 'Undergraduate'}</Badge>
          <Badge>{def.minutes} min</Badge>
          <Badge tone="measure">{run.usableCount} readings</Badge>
          <Badge tone={locked ? 'neutral' : 'pass'}>
            {locked ? `needs ${def.minReadings} readings` : 'analysis unlocked'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden text-right sm:block">
          <p className="text-[10px] uppercase tracking-[0.14em] text-lab-mute">session</p>
          <p className="font-mono text-[13px] tabular-nums text-lab-ink">
            {String(Math.floor(run.elapsedS / 60)).padStart(2, '0')}:{String(run.elapsedS % 60).padStart(2, '0')}
          </p>
        </div>
        {def.sample ? (
          <Button size="sm" onClick={run.fillSample}>
            Load example
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={run.reset} disabled={!run.isDirty}>
          Reset
        </Button>
        <Button size="sm" variant="primary" onClick={() => onStep('lab')}>
          Go to bench
        </Button>
      </div>
    </header>
  );
}

function StepRail({ items, active, onSelect }: { items: TabItem[]; active: StepId; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Experiment steps" className="hidden lg:block">
      <ol className="sticky top-20 space-y-0.5">
        {items.map((item, i) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                disabled={item.locked}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                  isActive ? 'bg-lab-raise text-lab-ink shadow-[inset_0_0_0_1px_rgb(var(--lab-accent)/0.3)]' : 'text-lab-mute hover:bg-lab-raise/50 hover:text-lab-ink',
                  item.locked && 'cursor-not-allowed opacity-45 hover:bg-transparent',
                )}
                title={item.locked ? item.lockReason : undefined}
              >
                <span className={cn('font-mono text-[10px]', isActive ? 'text-lab-accent' : 'text-lab-mute/60')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.trailing ? <span className="readout text-[10px]">{item.trailing}</span> : null}
                {item.locked ? <span className="text-[10px]">🔒</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepBody({
  def,
  run,
  step,
  Sim,
}: {
  def: ExperimentDefinition;
  run: UseExperimentRun;
  step: StepId;
  Sim: (typeof SIMS)[SimKey];
}) {
  const recordReading = useCallback(
    (values: Record<string, CellValue>) => run.addReading(values, def.sim === 'pendulum' ? 'stopwatch' : 'meter'),
    [def.sim, run],
  );

  const variable = useCallback((key: string) => def.variables.find((v) => v.key === key), [def.variables]);

  if (step === 'theory') return <TheoryPanel def={def} />;
  if (step === 'apparatus') return <ApparatusPanel def={def} />;
  if (step === 'procedure') return <ProcedurePanel def={def} run={run} />;
  if (step === 'observations') return <ObservationTable def={def} run={run} />;
  if (step === 'analysis') return <AnalysisPanel def={def} run={run} />;
  if (step === 'result') return <ResultPanel def={def} run={run} />;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Panel className="min-h-[520px]">
        <PanelHeader
          eyebrow="Lab bench"
          title="Interactive apparatus"
          actions={<Badge tone="measure">readings record automatically</Badge>}
        />
        <div className="p-3 sm:p-4">
          <Sim def={def} params={run.params} setParam={run.setParam} recordReading={recordReading} ready={run.usableCount >= def.minReadings} variable={variable} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHeader eyebrow="Configure" title="Experimental variables" />
          <div className="space-y-2 px-3 py-3">
            {def.variables.map((v) => (
              <VariableControl key={v.key} def={v} value={run.params[v.key] ?? v.default} onChange={(next) => run.setParam(v.key, next)} />
            ))}
          </div>
        </Panel>

        <ObservationTable def={def} run={run} dense />
      </div>
    </div>
  );
}
