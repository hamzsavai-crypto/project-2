/**
 * Render smoke tests. These do not replace component tests for behaviour; they
 * guard the wiring: every route and both experiment benches must render, the
 * catalog must stay consistent with the simulation registry, and analysis must
 * reach the DOM once readings exist.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/app/Layout';
import { ExperimentShell } from '@/components/lab/ExperimentShell';
import { SIMS } from '@/components/lab/sims';
import { Concepts, ConceptDetail } from '@/pages/Concepts';
import { Experiments } from '@/pages/Experiments';
import { Home } from '@/pages/Home';
import { Laboratory } from '@/pages/Laboratory';
import { Simulations } from '@/pages/Simulations';
import { About } from '@/pages/About';
import { NotFound } from '@/pages/NotFound';
import { CONCEPT_AREAS } from '@/features/concepts/content';
import { EXPERIMENTS, PLANNED_EXPERIMENTS } from '@/features/experiments/registry';

/** renderToStaticMarkup escapes apostrophes; unescape before substring checks. */
function unescape(html: string): string {
  return html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

function render(path: string): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/concepts/:slug" element={<ConceptDetail />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/laboratory/history" element={<Laboratory />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('catalog integrity', () => {
  it('has a registered simulation rig for every experiment', () => {
    for (const def of EXPERIMENTS) {
      expect(SIMS[def.sim], `${def.slug} -> SIMS.${def.sim}`).toBeTruthy();
    }
  });

  it('keeps slugs unique across built and planned experiments', () => {
    const slugs = [...EXPERIMENTS.map((e) => e.slug), ...PLANNED_EXPERIMENTS.map((p) => p.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only declares reading fields and variables the analysis can consume', () => {
    for (const def of EXPERIMENTS) {
      expect(def.readingFields.length).toBeGreaterThan(0);
      expect(def.variables.length).toBeGreaterThan(0);
      expect(def.minReadings).toBeGreaterThanOrEqual(2);
      // Every derived column must be produced for each row, or the table shows dashes.
      const out = def.analyse({
        params: Object.fromEntries(def.variables.map((v) => [v.key, v.default])),
        readings: (def.sample?.readings ?? []).map((values) => ({ id: 'x', values, recordedAt: 0, source: 'manual' as const })),
      });
      expect(out.rows.length).toBe(def.sample?.readings.length ?? 0);
      for (const row of out.rows) {
        for (const col of out.derivedColumns) expect(col.key in row).toBe(true);
      }
    }
  });

  it('links every concept note with an experiment to one that exists', () => {
    const slugs = new Set(EXPERIMENTS.map((e) => e.slug));
    for (const area of CONCEPT_AREAS) {
      for (const page of area.pages) {
        if (page.experimentSlug) expect(slugs.has(page.experimentSlug), page.slug).toBe(true);
      }
    }
  });
});

describe('routes', () => {
  const paths = ['/', '/concepts', '/simulations', '/experiments', '/laboratory/history', '/about', '/nope'];
  for (const path of paths) {
    it(`renders ${path}`, () => {
      const html = render(path);
      expect(html).toContain('Virtual Physics Laboratory');
    });
  }

  it('renders a concept detail page and its attached lab link', () => {
    const html = render('/concepts/simple-pendulum');
    expect(html).toContain('simple pendulum');
    expect(html).toContain('Enter the lab');
  });
});

describe('laboratory shell', () => {
  it('renders each experiment with its bench and gates the result step', () => {
    for (const def of EXPERIMENTS) {
      // Wrapped in a router because the result panel links to My Laboratory.
      const html = unescape(
        renderToStaticMarkup(
          <MemoryRouter>
            <ExperimentShell def={def} />
          </MemoryRouter>,
        ),
      );
      expect(html).toContain(def.title);
      expect(html).toContain('Lab bench');
      expect(html).toContain('needs'); // locked-state hint: "needs N readings"
    }
  });

  it('surfaces the saved worked example as a real result', () => {
    const def = EXPERIMENTS.find((e) => e.slug === 'ohms-law')!;
    const out = def.analyse({
      params: Object.fromEntries(def.variables.map((v) => [v.key, def.sample?.params?.[v.key] ?? v.default])),
      readings: (def.sample?.readings ?? []).map((values) => ({ id: 'x', values, recordedAt: 0, source: 'manual' as const })),
    });
    // The example carries meter error on purpose, so the graded claim is
    // "inside tolerance", not "exactly 100".
    expect(out.result.verdict).toBe('pass');
    expect(out.result.percentError).not.toBeNull();
    expect(out.result.percentError!).toBeLessThanOrEqual(def.tolerancePercent);
    expect(out.result.measured.value).toBeCloseTo(101.48, 1);
    expect(out.graph?.series.length).toBeGreaterThan(1);
  });
});
