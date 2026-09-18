import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lab-mute">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-lab-ink">That bench does not exist</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-lab-mute">
        The page you asked for is not part of the laboratory. It may be an experiment that is still in the backlog.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="rounded-lg bg-lab-accent px-4 py-2 text-[13px] font-medium text-lab-void hover:bg-lab-accent/90">
          Home
        </Link>
        <Link to="/experiments" className="rounded-lg border border-lab-line/40 px-4 py-2 text-[13px] text-lab-ink hover:border-lab-accent/60">
          Experiments
        </Link>
      </div>
    </div>
  );
}
