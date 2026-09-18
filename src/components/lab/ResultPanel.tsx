import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { CountUp, DecryptedText, StarBorder } from '@/components/bits';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import { fmt } from '@/lib/calculations/format';
import type { ExperimentDefinition } from '@/features/experiments/types';
import type { UseExperimentRun } from '@/features/experiments/useExperimentRun';

/**
 * The result box, plus the first version of persistence: attempts are stored
 * locally today and this is the seam a real account system plugs into later.
 */
export function ResultPanel({ def, run }: { def: ExperimentDefinition; run: UseExperimentRun }) {
  const [title, setTitle] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const result = run.analysis.result;
  const history = run.attempts;

  const tone = result.verdict === 'pass' ? 'pass' : result.verdict === 'review' ? 'measure' : 'neutral';

  const onSave = () => {
    run.save(title);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Panel className={result.verdict === 'pass' ? 'border-lab-pass/40' : undefined}>
          <PanelHeader
            eyebrow="Result"
            title="Record this line in your notebook"
            actions={
              <Badge tone={tone}>
                {result.verdict === 'pass' ? 'within tolerance' : result.verdict === 'review' ? 'check your method' : 'not enough data'}
              </Badge>
            }
          />
          <div className="px-4 py-4">
            {/* DecryptedText renders the plain string to assistive tech and starts
                already-decrypted for "view", so this is garnish, never a gate. */}
            <p className="text-[17px] leading-snug text-lab-ink">
              <DecryptedText text={result.headline} animateOn="view" speed={26} maxIterations={7} parentClassName="text-lab-ink" className="text-lab-ink" encryptedClassName="text-lab-accent/80" />
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Value label={result.measured.label} value={fmt(result.measured.value, result.measured.precision)} unit={result.measured.unit} tone="text-lab-measure" />
              <Value label={result.expected.label} value={fmt(result.expected.value, result.expected.precision)} unit={result.expected.unit} tone="text-lab-expect" />
              <div className="rounded-lg border border-lab-line/25 bg-lab-void/40 px-3 py-2.5">
                <p className="text-[11px] text-lab-mute">Percentage error</p>
                <p className={`mt-1 font-mono text-xl tabular-nums ${result.percentError !== null && result.percentError <= def.tolerancePercent ? 'text-lab-pass' : 'text-lab-fail'}`}>
                  {result.percentError === null ? '—' : <CountUp to={Number(result.percentError.toFixed(2))} duration={1} />}
                  <span className="ml-1 text-[11px] text-lab-mute">%</span>
                </p>
              </div>
            </div>

            {result.notes.length > 0 ? (
              <ul className="mt-4 space-y-1.5 border-t border-lab-line/20 pt-3">
                {result.notes.map((n) => (
                  <li key={n} className="text-[12px] leading-relaxed text-lab-mute">
                    {n}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>
      </motion.div>

      <Panel>
        <PanelHeader eyebrow="My Laboratory" title="Save this attempt" />
        <div className="space-y-3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={def.sample ? def.sample.label : 'Untitled attempt'}
              className="h-10 min-w-52 flex-1 rounded-lg border border-lab-line/30 bg-lab-void/60 px-3 text-sm text-lab-ink placeholder:text-lab-mute/60 focus:border-lab-accent/60"
            />
            <StarBorder as="div" color="#22d3ee" speed="5s" thickness={1} className="vpl-sweep">
              <Button variant="primary" onClick={onSave}>
                {run.lastSaved ? 'Update saved attempt' : 'Save experiment'}
              </Button>
            </StarBorder>
            {justSaved ? <Badge tone="pass">saved to this browser</Badge> : null}
          </div>

          <p className="text-[11px] leading-relaxed text-lab-mute">
            Saved locally without an account - accounts and synced history arrive with the backend in a later phase.
          </p>

          {history.length > 0 ? (
            <ul className="space-y-1.5 border-t border-lab-line/20 pt-3">
              {history.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-baseline gap-3 text-[12px]">
                  <span className={a.verdict === 'pass' ? 'text-lab-pass' : 'text-lab-mute'}>●</span>
                  <span className="truncate text-lab-ink">{a.title}</span>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-lab-mute">
                    {fmt(a.percentError, 2)}% · {new Date(a.savedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <Link to="/laboratory/history" className="inline-block text-[12px] text-lab-accent hover:underline">
            Open My Laboratory →
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function Value({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone: string }) {
  return (
    <div className="rounded-lg border border-lab-line/25 bg-lab-void/40 px-3 py-2.5">
      <p className="text-[11px] text-lab-mute">{label}</p>
      <p className={`mt-1 font-mono text-xl tabular-nums ${tone}`}>
        {value}
        {unit ? <span className="ml-1 text-[11px] text-lab-mute">{unit}</span> : null}
      </p>
    </div>
  );
}
