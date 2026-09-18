import { LabGraph } from '@/components/charts/LabGraph';
import { BorderGlow } from '@/components/bits';
import { Stat } from '@/components/ui/Stat';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import type { ExperimentDefinition } from '@/features/experiments/types';
import type { UseExperimentRun } from '@/features/experiments/useExperimentRun';

/**
 * Everything derived, in one place: statistics, the graph, and the caveats.
 * The panel never computes - it renders `run.analysis`, which came from
 * `src/physics/**`.
 */
export function AnalysisPanel({ def, run }: { def: ExperimentDefinition; run: UseExperimentRun }) {
  const { analysis } = run;
  const preferred = analysis.stats.filter((s) => s.note === 'the preferred method').map((s) => s.key);
  const rest = analysis.stats.filter((s) => !preferred.includes(s.key));
  const highlighted = analysis.stats.filter((s) => preferred.includes(s.key));

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          eyebrow="Analysis"
          title="Derived quantities"
          actions={<Badge tone="measure">{run.usableCount} usable readings</Badge>}
        />
        <div className="grid gap-2 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((s) => (
            <Stat key={s.key} stat={s} />
          ))}
        </div>
        {highlighted.length > 0 ? (
          <div className="grid gap-2 border-t border-lab-line/20 px-4 py-4 sm:grid-cols-2">
            {highlighted.map((s) => (
              <Stat key={s.key} stat={s} emphasis />
            ))}
          </div>
        ) : null}
      </Panel>

      <BorderGlow
        className="vpl-instrument"
        backgroundColor="#0f1520"
        borderRadius={12}
        edgeSensitivity={26}
        glowIntensity={0.9}
        coneSpread={30}
        colors={['#22d3ee', '#818cf8', '#fbbf24']}
      >
      <Panel className="border-0 bg-transparent shadow-none">
        <PanelHeader eyebrow="Graph" title={analysis.graph ? `${analysis.graph.yLabel} against ${analysis.graph.xLabel}` : 'Graph'} />
        <div className="px-4 py-4">
          {analysis.graph ? (
            <LabGraph def={analysis.graph} />
          ) : (
            <p className="rounded-lg border border-dashed border-lab-line/30 px-4 py-10 text-center text-[13px] text-lab-mute">
              A graph needs at least two complete readings. Record more trials and this fills in.
            </p>
          )}
        </div>
      </Panel>
      </BorderGlow>

      {analysis.warnings.length > 0 ? (
        <Panel>
          <PanelHeader eyebrow="Method check" title="Points to resolve before you conclude" />
          <ul className="space-y-2 px-4 py-4">
            {analysis.warnings.map((w) => (
              <li key={w} className="flex gap-2.5 rounded-lg border border-lab-measure/25 bg-lab-measure/5 px-3 py-2 text-[12px] leading-snug text-lab-measure">
                <span aria-hidden>!</span>
                {w}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
