import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Panel';
import { CONCEPT_AREAS, findConcept } from '@/features/concepts/content';
import { getExperiment } from '@/features/experiments/registry';

export function Concepts() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <header>
        <p className="rule-label">Concepts</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-lab-ink">The physics, before the bench</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-lab-mute">
          Each note explains what the experiment is actually testing, including the approximations it relies on. Notes with a lab attached open the
          experiment directly.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {CONCEPT_AREAS.map((area) => (
          <section key={area.slug}>
            <div className="flex items-baseline gap-3 border-b border-lab-line/25 pb-2">
              <h2 className="text-[15px] font-semibold text-lab-ink">{area.title}</h2>
              <p className="text-[12px] text-lab-mute">{area.blurb}</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {area.pages.map((page) => {
                const experiment = getExperiment(page.experimentSlug);
                return (
                  <article key={page.slug} className="panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[14px] font-semibold text-lab-ink">
                        <Link to={`/concepts/${page.slug}`} className="hover:text-lab-accent">
                          {page.title}
                        </Link>
                      </h3>
                      {experiment ? <Badge tone="pass">lab ready</Badge> : <Badge>no lab yet</Badge>}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-lab-mute">{page.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {page.categories.map((c) => (
                        <span key={c} className="rounded bg-lab-raise px-1.5 py-0.5 font-mono text-[10px] text-lab-mute">
                          {c}
                        </span>
                      ))}
                      <Link to={`/concepts/${page.slug}`} className="ml-auto text-[12px] text-lab-accent hover:underline">
                        Read →
                      </Link>
                      {experiment ? (
                        <Link to={`/experiments/${experiment.slug}`} className="text-[12px] text-lab-measure hover:underline">
                          Open lab →
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ConceptDetail() {
  const { slug } = useParams();
  const found = findConcept(slug);
  if (!found) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-lab-mute">That concept note does not exist yet.</p>
        <Link to="/concepts" className="mt-3 inline-block text-[13px] text-lab-accent hover:underline">
          ← All concepts
        </Link>
      </div>
    );
  }
  const { area, page } = found;
  const experiment = getExperiment(page.experimentSlug);

  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6">
      <Link to="/concepts" className="text-[11px] uppercase tracking-[0.14em] text-lab-mute hover:text-lab-accent">
        ← {area.title}
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-lab-ink">{page.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-lab-mute">{page.summary}</p>

      <ul className="mt-7 space-y-3">
        {page.points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-lab-ink/90">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lab-accent" aria-hidden />
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2">
        <p className="rule-label">Formulae</p>
        {page.formulae.map((f) => (
          <div key={f.text} className="flex flex-wrap items-baseline gap-3 rounded-lg border border-lab-line/25 bg-lab-panel/60 px-4 py-2.5">
            <code className="font-mono text-[15px] text-lab-accent">{f.text}</code>
            <span className="text-[11px] text-lab-mute">{f.note}</span>
          </div>
        ))}
      </div>

      {experiment ? (
        <div className="mt-9 flex flex-wrap items-center gap-3 rounded-lg border border-lab-accent/30 bg-lab-accent/5 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-lab-accent">Attached experiment</p>
            <p className="mt-1 text-[14px] font-medium text-lab-ink">{experiment.title}</p>
            <p className="text-[12px] text-lab-mute">{experiment.minutes} minutes · needs ≥ {experiment.minReadings} usable readings</p>
          </div>
          <Link to={`/experiments/${experiment.slug}`} className="ml-auto rounded-lg bg-lab-accent px-4 py-2 text-[13px] font-medium text-lab-void hover:bg-lab-accent/90">
            Enter the lab
          </Link>
        </div>
      ) : null}
    </article>
  );
}
