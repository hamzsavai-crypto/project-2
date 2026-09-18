import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Badge, Panel, PanelHeader } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { deleteAttempt, loadAttempts, type AttemptRecord } from '@/features/experiments/attempts';
import { fmt } from '@/lib/calculations/format';
import { getExperiment } from '@/features/experiments/registry';

/** My Laboratory: everything the student has saved, on this device. */
export function Laboratory() {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  const refresh = () => setAttempts(loadAttempts());
  useEffect(() => {
    refresh();
    window.addEventListener('vpl:attempts-changed', refresh);
    return () => window.removeEventListener('vpl:attempts-changed', refresh);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, AttemptRecord[]>();
    for (const a of attempts) {
      const list = map.get(a.slug) ?? [];
      list.push(a);
      map.set(a.slug, list);
    }
    return [...map.entries()].map(([slug, list]) => ({ slug, def: getExperiment(slug), list })).sort((a, b) => b.list.length - a.list.length);
  }, [attempts]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rule-label">My laboratory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-lab-ink">Experiment history</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-lab-mute">
            Attempts are stored in this browser only. Reopening one restores its settings and readings onto the bench, so you can add trials or re-check
            the arithmetic. Syncing them to an account is the next phase of this project.
          </p>
        </div>
        <Badge tone="measure">{attempts.length} saved</Badge>
      </header>

      {grouped.length === 0 ? (
        <Panel className="mt-8">
          <div className="px-6 py-16 text-center">
            <p className="text-[14px] text-lab-ink">No saved experiments yet.</p>
            <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-lab-mute">
              Finish an experiment and press Save on the Result step - it will appear here with its readings, result and percentage error.
            </p>
            <Link to="/experiments" className="mt-5 inline-block rounded-lg bg-lab-accent px-4 py-2 text-[13px] font-medium text-lab-void hover:bg-lab-accent/90">
              Start an experiment
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="mt-8 space-y-6">
          {grouped.map(({ slug, def, list }) => (
            <section key={slug}>
              <div className="flex items-baseline gap-3 border-b border-lab-line/25 pb-2">
                <h2 className="text-[14px] font-semibold text-lab-ink">{def?.title ?? slug}</h2>
                <span className="text-[11px] text-lab-mute">{list.length} attempts</span>
                {def ? (
                  <Link to={`/experiments/${def.slug}`} className="ml-auto text-[12px] text-lab-accent hover:underline">
                    New run →
                  </Link>
                ) : null}
              </div>

              <ul className="mt-3 space-y-2">
                {list.map((a) => (
                  <motion.li key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="panel px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Badge tone={a.verdict === 'pass' ? 'pass' : a.verdict === 'review' ? 'measure' : 'neutral'}>
                        {a.verdict === 'pass' ? 'within tolerance' : a.verdict === 'review' ? 'check method' : 'incomplete'}
                      </Badge>
                      <span className="text-[13px] font-medium text-lab-ink">{a.title}</span>
                      <span className="ml-auto font-mono text-[11px] text-lab-mute">
                        {new Date(a.savedAt).toLocaleString()} · {a.readings.length} readings
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-lab-mute">{a.headline}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                      <span className="text-lab-measure">
                        measured {fmt(a.measured.value, 2)} {a.measured.unit ?? ''}
                      </span>
                      <span className="text-lab-expect">
                        accepted {fmt(a.expected.value, 2)} {a.expected.unit ?? ''}
                      </span>
                      <span className="text-lab-mute">error {fmt(a.percentError, 2)}%</span>
                      <span className="ml-auto flex items-center gap-2">
                        <Link to={`/experiments/${a.slug}?attempt=${a.id}`} className="text-lab-accent hover:underline">
                          Reopen
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            deleteAttempt(a.id);
                            refresh();
                          }}
                        >
                          Delete
                        </Button>
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
