import { motion } from 'framer-motion';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import type { ExperimentDefinition } from '@/features/experiments/types';
import type { UseExperimentRun } from '@/features/experiments/useExperimentRun';

export function TheoryPanel({ def }: { def: ExperimentDefinition }) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader eyebrow="Theory" title="What the experiment is about" />
        <div className="space-y-3 px-4 py-4">
          <p className="text-[15px] leading-relaxed text-lab-ink">{def.theory.lead}</p>
          {def.theory.paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-lab-mute">
              {p}
            </p>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        {def.theory.equations.map((eq) => (
          <div key={eq.text} className="rounded-lg border border-lab-line/25 bg-lab-panel/60 px-4 py-3">
            <p className="font-mono text-[15px] text-lab-accent">{eq.text}</p>
            <p className="mt-1 text-[11px] text-lab-mute">{eq.caption}</p>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHeader eyebrow="Objectives" title="By the end of this laboratory session" />
        <ul className="space-y-2 px-4 py-4">
          {def.objectives.map((o, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-lab-ink/90">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lab-accent" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Watch out" title="Things that separate a good result from a lucky one" />
        <ul className="grid gap-2 px-4 py-4 sm:grid-cols-3">
          {def.theory.keyIdeas.map((k) => (
            <li key={k} className="rounded-lg border border-lab-line/20 bg-lab-void/40 px-3 py-2 text-[12px] leading-snug text-lab-mute">
              {k}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function ApparatusPanel({ def }: { def: ExperimentDefinition }) {
  return (
    <Panel>
      <PanelHeader eyebrow="Apparatus" title="On the bench" actions={<Badge>{def.apparatus.length} items</Badge>} />
      <ul className="divide-y divide-lab-line/15">
        {def.apparatus.map((a, i) => (
          <motion.li
            key={a.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex items-baseline gap-3 px-4 py-2.5"
          >
            <span className="font-mono text-[11px] text-lab-mute/70">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[13px] font-medium text-lab-ink">{a.name}</span>
            <span className="ml-auto text-right text-[12px] text-lab-mute">{a.note}</span>
          </motion.li>
        ))}
      </ul>
    </Panel>
  );
}

export function ProcedurePanel({ def, run }: { def: ExperimentDefinition; run: UseExperimentRun }) {
  // Progress is inferred from what the student has actually done, not faked.
  const done = [
    run.isDirty,
    run.readings.length > 0,
    run.readings.length >= 3,
    run.usableCount >= def.minReadings,
    run.lastSaved !== null,
  ];

  return (
    <Panel>
      <PanelHeader eyebrow="Procedure" title="Step by step" />
      <ol className="space-y-1 px-4 py-4">
        {def.procedure.map((step, i) => {
          const complete = done[i] ?? false;
          return (
            <li key={step.title} className="flex gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-lab-raise/40">
              <span
                className={
                  complete
                    ? 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lab-pass/20 text-[10px] text-lab-pass'
                    : 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-lab-line/40 text-[10px] text-lab-mute'
                }
              >
                {complete ? '✓' : i + 1}
              </span>
              <div>
                <p className="text-[13px] font-medium text-lab-ink">{step.title}</p>
                <p className="text-[12px] leading-relaxed text-lab-mute">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
