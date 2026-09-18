import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/Panel';
import { BlurText, CountUp, GlareHover, GradientText, Magnet, ShinyText } from '@/components/bits';
import { CATEGORY_LABELS, EXPERIMENTS, PLANNED_EXPERIMENTS } from '@/features/experiments/registry';

const LOOP = ['Learn', 'Set up', 'Experiment', 'Measure', 'Calculate', 'Graph', 'Conclude', 'Save'];

const MODES = [
  {
    to: '/concepts',
    kicker: 'Learn',
    title: 'Concepts',
    body: 'The physics behind each experiment, written to be read the day before the lab and the day after.',
  },
  {
    to: '/simulations',
    kicker: 'Simulate',
    title: 'Simulations',
    body: 'Open-ended exploration. Move parameters, watch the system respond, build intuition before you measure.',
  },
  {
    to: '/experiments',
    kicker: 'Lab',
    title: 'Experiments',
    body: 'A structured investigation: apparatus, readings, calculations, a graph, and a result you can defend.',
  },
];

/** One-shot count-up on the marketing numbers only; live bench values stay instant. */
function HeroStat({ to, label }: { to: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="font-mono text-2xl tabular-nums text-lab-ink">
          <CountUp to={to} duration={1.2} />
        </span>
        <span className="ml-2 text-[11px] text-lab-mute">{label}</span>
      </dd>
    </div>
  );
}

export function Home() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
      <section className="grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <Badge tone="accent">Interactive laboratory · no install</Badge>
          {/* A real h1 carries the semantics; BlurText renders the words. Its output
              is a <p>, so nesting it inside a heading would be invalid markup. */}
          <h1 className="sr-only">Don’t read about the experiment. Perform it.</h1>
          <div aria-hidden="true" className="mt-4">
            <BlurText
              text="Don’t read about the experiment."
              animateBy="words"
              direction="top"
              stepDuration={0.42}
              className="text-4xl font-semibold leading-[1.08] tracking-tight text-lab-ink sm:text-5xl"
            />
            <GradientText
              colors={['#22d3ee', '#818cf8', '#fbbf24', '#22d3ee']}
              animationSpeed={7}
              className="vpl-flat text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
            >
              Perform it.
            </GradientText>
          </div>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-lab-mute">
            VPL is a web laboratory where you set up apparatus, take your own readings with real instrument resolution, let the physics layer do the
            arithmetic, and finish with a graph and a result - the way a laboratory record is supposed to look.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Magnet padding={90} magnetStrength={2.2}>
              <Link
                to="/experiments/simple-pendulum"
                className="rounded-lg bg-lab-accent px-4 py-2.5 text-sm font-medium text-lab-void transition hover:bg-lab-accent/90"
              >
                Start: determine g with a pendulum
              </Link>
            </Magnet>
            <Magnet padding={90} magnetStrength={1.5}>
              <Link
                to="/experiments"
                className="rounded-lg border border-lab-line/40 px-4 py-2.5 text-sm font-medium text-lab-ink transition hover:border-lab-accent/60 hover:text-lab-accent"
              >
                Browse all experiments
              </Link>
            </Magnet>
          </div>

          <p className="mt-3 text-[12px]">
            <ShinyText
              text="Works without an account. Saved attempts live in your browser."
              color="rgb(142 160 184)"
              shineColor="rgb(226 236 248)"
              speed={3.4}
              className="vpl-shine"
            />
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-9 gap-y-3 border-t border-lab-line/20 pt-4">
            <HeroStat to={EXPERIMENTS.length} label="experiments on the bench" />
            <HeroStat to={LOOP.length} label="stages in every experiment" />
            <HeroStat to={PLANNED_EXPERIMENTS.length} label="more in the backlog" />
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
        >
          <GlareHover
            width="100%"
            height="100%"
            background="rgb(15 21 32 / 0.55)"
            borderRadius="12px"
            borderColor="rgb(64 78 100 / 0.35)"
            glareColor="#22d3ee"
            glareOpacity={0.16}
            glareSize={260}
            className="vpl-surface"
          >
          <div className="p-4">
          <p className="rule-label">Today’s bench</p>
          <div className="mt-3 space-y-2.5">
            {EXPERIMENTS.map((e) => (
              <Link
                key={e.slug}
                to={`/experiments/${e.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-lab-line/25 bg-lab-void/40 px-3 py-2.5 transition hover:border-lab-accent/50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-lab-raise text-[11px] font-mono text-lab-accent">
                  {e.category === 'electricity' ? 'Ω' : 'T'}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-lab-ink group-hover:text-lab-accent">{e.title}</span>
                  <span className="block text-[11px] text-lab-mute">
                    {CATEGORY_LABELS[e.category]} · {e.minutes} min · {e.objectives.length} objectives
                  </span>
                </span>
                <span className="ml-auto text-lab-mute transition group-hover:translate-x-0.5">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-lab-line/20 pt-3">
            <p className="rule-label">On the way</p>
            <ul className="mt-2 space-y-1">
              {PLANNED_EXPERIMENTS.map((p) => (
                <li key={p.slug} className="flex items-baseline gap-2 text-[12px] text-lab-mute">
                  <span className="text-lab-mute/50">·</span>
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-lab-mute/60">phase {p.phase}</span>
                </li>
              ))}
            </ul>
              </div>
            </div>
          </GlareHover>
        </motion.div>
      </section>

      <section aria-label="The laboratory loop" className="border-y border-lab-line/25 py-5">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {LOOP.map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.045, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="rounded-full border border-lab-line/30 bg-lab-panel/70 px-3 py-1 text-[12px] text-lab-ink/90">
                <span className="mr-1.5 font-mono text-[10px] text-lab-accent">{i + 1}</span>
                {step}
              </span>
              {i < LOOP.length - 1 ? <span className="text-lab-mute/40">→</span> : null}
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 py-12 md:grid-cols-3">
        {MODES.map((m) => (
          <Link key={m.to} to={m.to} className="panel group p-5 transition hover:border-lab-accent/50">
            <p className="rule-label">{m.kicker}</p>
            <h2 className="mt-1.5 text-lg font-semibold text-lab-ink group-hover:text-lab-accent">{m.title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-lab-mute">{m.body}</p>
            <span className="mt-4 inline-block text-[12px] text-lab-accent">Enter →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
