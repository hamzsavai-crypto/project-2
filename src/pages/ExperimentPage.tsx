import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ExperimentShell } from '@/components/lab/ExperimentShell';
import { getExperiment } from '@/features/experiments/registry';
import { loadAttempts } from '@/features/experiments/attempts';
import type { RunBootstrap } from '@/features/experiments/useExperimentRun';

/**
 * Thin route wrapper. Everything that makes an experiment behave like a
 * laboratory lives in the shell and the definition, not here.
 */
export function ExperimentPage() {
  const { slug } = useParams();
  const [search] = useSearchParams();
  const def = getExperiment(slug);

  if (!def) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-lab-ink">No such experiment</h1>
        <p className="mt-2 text-[13px] text-lab-mute">
          {slug ? `“${slug}” is not in the catalog` : 'Pick an experiment from the catalog'} - it may still be in the backlog.
        </p>
        <Link to="/experiments" className="mt-4 inline-block rounded-lg bg-lab-accent px-4 py-2 text-[13px] font-medium text-lab-void">
          Browse experiments
        </Link>
      </div>
    );
  }

  const attemptId = search.get('attempt');
  let bootstrap: RunBootstrap | undefined;
  if (attemptId) {
    const found = loadAttempts().find((a) => a.id === attemptId && a.slug === def.slug);
    if (found) {
      bootstrap = { key: found.id, params: found.params, readings: found.readings };
    }
  }

  // Remount per experiment/attempt so all run state starts clean.
  return <ExperimentShell key={`${def.slug}:${attemptId ?? 'fresh'}`} def={def} bootstrap={bootstrap} />;
}
